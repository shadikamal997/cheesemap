import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const createPaymentIntentSchema = z.object({
  orderId: z.string(),
  returnUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const validation = createPaymentIntentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { orderId, returnUrl } = validation.data;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: {
          select: {
            displayName: true,
            stripeAccountId: true,
          },
        },
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.customerId !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    if (order.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      );
    }

    // Calculate platform fee (10%)
    const platformFee = Math.round(order.total * 0.10 * 100); // in cents
    const amount = Math.round(order.total * 100); // in cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        businessId: order.businessId,
        customerId: order.customerId,
      },
      description: `Order ${order.orderNumber} from ${order.business.displayName}`,
      receipt_email: order.customer?.email || undefined,
      ...(order.business.stripeAccountId && {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: order.business.stripeAccountId,
        },
      }),
    });

    // Store payment intent
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: 'EUR',
        provider: 'STRIPE',
        providerPaymentId: paymentIntent.id,
        status: 'PENDING',
        metadata: {
          clientSecret: paymentIntent.client_secret,
        },
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while creating payment intent' },
      { status: 500 }
    );
  }
}
