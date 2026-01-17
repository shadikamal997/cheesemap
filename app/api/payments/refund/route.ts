import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth/middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const refundSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireRole(request, 'ADMIN');
    if (adminCheck instanceof NextResponse) return adminCheck;

    const body = await request.json();
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { paymentId, amount, reason } = validation.data;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
        booking: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed, cannot refund' },
        { status: 400 }
      );
    }

    // Create Stripe refund
    const refundAmount = amount ? Math.round(amount * 100) : undefined;

    const refund = await stripe.refunds.create({
      payment_intent: payment.providerPaymentId || undefined,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        adminReason: reason || 'Admin refund',
      },
    });

    // Update payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        metadata: {
          refundId: refund.id,
          refundAmount: refund.amount / 100,
        },
      },
    });

    // Update order/booking
    if (payment.orderId) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          refundStatus: 'COMPLETED',
          paymentStatus: 'REFUNDED',
        },
      });
    }

    if (payment.bookingId) {
      await prisma.tourBooking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CANCELLED',
        },
      });
    }

    return NextResponse.json({
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while processing refund' },
      { status: 500 }
    );
  }
}
