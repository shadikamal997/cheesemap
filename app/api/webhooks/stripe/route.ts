import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { orderId, bookingId } = paymentIntent.metadata;

  // Update payment record
  await prisma.payment.updateMany({
    where: { providerPaymentId: paymentIntent.id },
    data: {
      status: 'COMPLETED',
      paidAt: new Date(),
    },
  });

  if (orderId) {
    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
      },
    });

    // TODO: Send order confirmation email
  }

  if (bookingId) {
    // Update booking
    await prisma.tourBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
      },
    });

    // TODO: Send booking confirmation email
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  await prisma.payment.updateMany({
    where: { providerPaymentId: paymentIntent.id },
    data: {
      status: 'FAILED',
      metadata: {
        error: paymentIntent.last_payment_error?.message,
      },
    },
  });

  // TODO: Send payment failed email
}

async function handleRefund(charge: Stripe.Charge) {
  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: charge.payment_intent as string },
    include: {
      order: true,
      booking: true,
    },
  });

  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'REFUNDED',
      refundedAt: new Date(),
    },
  });

  if (payment.orderId) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'REFUNDED',
        refundStatus: 'COMPLETED',
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
}
