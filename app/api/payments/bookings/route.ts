import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const createPaymentIntentSchema = z.object({
  bookingId: z.string(),
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

    const { bookingId, returnUrl } = validation.data;

    // Get booking
    const booking = await prisma.tourBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        tour: {
          include: {
            business: {
              select: {
                displayName: true,
                stripeAccountId: true,
              },
            },
          },
        },
        schedule: {
          include: {
            tour: {
              include: {
                business: {
                  select: {
                    displayName: true,
                    stripeAccountId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.customerId !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking is cancelled' },
        { status: 400 }
      );
    }

    // Calculate platform fee (15% for tours)
    const platformFee = Math.round(booking.totalPrice * 0.15 * 100);
    const amount = Math.round(booking.totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        tourId: booking.tour.id,
        customerId: booking.customerId,
      },
      description: `Booking ${booking.bookingNumber} - ${booking.tour.title}`,
      receipt_email: booking.user.email,
      ...(booking.tour.business.stripeAccountId && {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: booking.tour.business.stripeAccountId,
        },
      }),
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
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
