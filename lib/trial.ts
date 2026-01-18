/**
 * Trial System - 30-day free trial for all businesses
 * 
 * Rules:
 * - Exactly 30 days free trial
 * - No charges during trial
 * - Payment method required upfront
 * - One trial per business (enforcement at DB level via businessId uniqueness)
 * - After trial: auto-converts to paid or requires cancellation
 * - Server-side enforcement only
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class TrialError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 402
  ) {
    super(message);
    this.name = 'TrialError';
  }
}

/**
 * Exactly 30 days in milliseconds
 */
export const TRIAL_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Check if a trial is currently active
 */
export function isTrialActive(
  trialStartAt: Date | null,
  trialEndAt: Date | null,
  trialActive: boolean,
  now: Date = new Date()
): boolean {
  if (!trialActive || !trialStartAt || !trialEndAt) {
    return false;
  }

  // Trial is active if current time is before trial end
  return now < trialEndAt;
}

/**
 * Calculate trial expiration date (exactly 30 days from start)
 */
export function calculateTrialEndDate(trialStartAt: Date): Date {
  const endDate = new Date(trialStartAt.getTime() + TRIAL_DURATION_MS);
  return endDate;
}

/**
 * Get days remaining in trial (0 if expired)
 */
export function getDaysRemaining(trialEndAt: Date | null, now: Date = new Date()): number {
  if (!trialEndAt) return 0;

  const remaining = trialEndAt.getTime() - now.getTime();
  const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));

  return Math.max(0, days);
}

/**
 * Initialize a trial for a new business subscription
 * Called during signup after business creates account
 */
export async function initializeTrial(
  businessId: string,
  planId: string,
  now: Date = new Date()
): Promise<{
  subscriptionId: string;
  trialStartAt: Date;
  trialEndAt: Date;
}> {
  // Check if business already has a subscription (one trial per business)
  const existing = await prisma.businessSubscription.findUnique({
    where: { businessId },
  });

  if (existing) {
    throw new TrialError(
      'TRIAL_ALREADY_EXISTS',
      'Cette entreprise possède déjà un abonnement. Un seul essai par entreprise.',
      400
    );
  }

  const trialStartAt = now;
  const trialEndAt = calculateTrialEndDate(trialStartAt);

  // Create subscription in TRIAL status
  const subscription = await prisma.businessSubscription.create({
    data: {
      businessId,
      planId,
      status: 'TRIAL',
      trialStartAt,
      trialEndAt,
      trialActive: true,
      // Set billing dates to trial end (auto-convert after trial)
      currentPeriodStart: trialStartAt,
      currentPeriodEnd: trialEndAt,
      nextBillingDate: trialEndAt,
      autoRenew: true,
      usage: {
        create: {
          productsCount: 0,
          ordersThisPeriod: 0,
          activeToursCount: 0,
          promotionsUsed: 0,
        },
      },
    },
  });

  return {
    subscriptionId: subscription.id,
    trialStartAt,
    trialEndAt,
  };
}

/**
 * Check if a trial has expired
 * If expired and no active subscription, deny access
 */
export async function checkTrialStatus(
  businessId: string,
  now: Date = new Date()
): Promise<{
  isInTrial: boolean;
  daysRemaining: number;
  mustRenew: boolean;
  message?: string;
}> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: { plan: true },
  });

  if (!subscription) {
    throw new TrialError(
      'NO_SUBSCRIPTION',
      'Aucun abonnement trouvé pour cette entreprise',
      404
    );
  }

  // Check if still in trial
  const isInTrial = isTrialActive(
    subscription.trialStartAt,
    subscription.trialEndAt,
    subscription.trialActive,
    now
  );

  if (isInTrial) {
    const daysRemaining = getDaysRemaining(subscription.trialEndAt, now);
    return {
      isInTrial: true,
      daysRemaining,
      mustRenew: false,
    };
  }

  // Trial has expired
  if (subscription.status === 'TRIAL') {
    // Trial expired and no active payment
    return {
      isInTrial: false,
      daysRemaining: 0,
      mustRenew: true,
      message: `Votre période d'essai est terminée (${subscription.plan.name} - €${subscription.plan.priceEur}/mois). Veuillez activer votre abonnement.`,
    };
  }

  // Trial expired but has active subscription
  return {
    isInTrial: false,
    daysRemaining: 0,
    mustRenew: false,
  };
}

/**
 * Enforce trial expiration on business actions
 * Called before ANY business action (create product, order, tour, etc.)
 */
export async function enforceTrialExpiration(
  businessId: string,
  action: string,
  now: Date = new Date()
): Promise<void> {
  const status = await checkTrialStatus(businessId, now);

  // If in trial, all actions are allowed
  if (status.isInTrial) {
    return;
  }

  // If trial expired and business never paid, block
  if (status.mustRenew) {
    throw new TrialError(
      'SUBSCRIPTION_REQUIRED',
      status.message || 'Votre période d\'essai est terminée. Veuillez activer votre abonnement.',
      402
    );
  }
}

/**
 * Cancel a trial (business can cancel anytime during trial)
 * Cancellation happens immediately but access continues until trial end
 */
export async function cancelTrial(
  businessId: string,
  now: Date = new Date()
): Promise<{
  canceledAt: Date;
  accessUntil: Date;
  message: string;
}> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
  });

  if (!subscription) {
    throw new TrialError(
      'NO_SUBSCRIPTION',
      'Aucun abonnement trouvé',
      404
    );
  }

  if (subscription.status !== 'TRIAL') {
    throw new TrialError(
      'NOT_IN_TRIAL',
      'Cette entreprise n\'est pas en période d\'essai',
      400
    );
  }

  // Update subscription to CANCELLED but keep trialEndAt for reference
  const updated = await prisma.businessSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELLED',
      trialActive: false,
    },
  });

  return {
    canceledAt: now,
    accessUntil: subscription.trialEndAt || now,
    message: `Essai annulé. Accès conservé jusqu'au ${(subscription.trialEndAt || now).toLocaleDateString('fr-FR')}.`,
  };
}

/**
 * Auto-convert trial to active subscription when trial ends
 * Called by a cron job or webhook at trial end date
 */
export async function convertTrialToSubscription(
  businessId: string,
  now: Date = new Date()
): Promise<{ converted: boolean; reason: string }> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
  });

  if (!subscription) {
    return {
      converted: false,
      reason: 'No subscription found',
    };
  }

  if (subscription.status !== 'TRIAL') {
    return {
      converted: false,
      reason: 'Not in trial status',
    };
  }

  // Check if trial has ended
  if (!subscription.trialEndAt || now < subscription.trialEndAt) {
    return {
      converted: false,
      reason: 'Trial has not ended yet',
    };
  }

  // If autoRenew is true and payment method exists, convert to ACTIVE
  if (subscription.autoRenew && subscription.stripeSubscriptionId) {
    const nextPeriodEnd = new Date(subscription.trialEndAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.businessSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        trialActive: false,
        currentPeriodStart: subscription.trialEndAt,
        currentPeriodEnd: nextPeriodEnd,
        nextBillingDate: nextPeriodEnd,
      },
    });

    return {
      converted: true,
      reason: 'Trial converted to active subscription',
    };
  }

  // Otherwise keep as CANCELLED (business didn't set up payment)
  return {
    converted: false,
    reason: 'No payment method set up - trial remains cancelled',
  };
}

/**
 * Get trial info for dashboard display
 */
export async function getTrialInfo(businessId: string, now: Date = new Date()) {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: { plan: true },
  });

  if (!subscription) return null;

  const isInTrial = isTrialActive(
    subscription.trialStartAt,
    subscription.trialEndAt,
    subscription.trialActive,
    now
  );

  const daysRemaining = getDaysRemaining(subscription.trialEndAt, now);

  return {
    isInTrial,
    trialStartAt: subscription.trialStartAt,
    trialEndAt: subscription.trialEndAt,
    daysRemaining,
    showReminder: daysRemaining <= 7 && isInTrial,
    planName: subscription.plan.name,
    planPrice: subscription.plan.priceEur,
    status: subscription.status,
  };
}
