import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createEmailVerification, sendVerificationEmail } from '@/lib/auth/email';

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = resendSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        message: 'If an account exists with this email, a verification link has been sent.',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: 'This email is already verified.',
      });
    }

    // Generate new verification token
    const verificationData = createEmailVerification(email, user.firstName || undefined);

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationData.token,
        emailVerificationExpiry: verificationData.expiresAt,
      },
    });

    // Send verification email
    await sendVerificationEmail(verificationData);

    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while sending verification email' },
      { status: 500 }
    );
  }
}
