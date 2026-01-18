'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

interface PlanStatus {
  subscription: {
    tier: string;
    planName: string;
    status: string;
    priceEur: number;
    nextBillingDate: string;
  };
  plan: {
    maxProducts: number;
    maxOrdersPerMonth: number;
    maxActiveTours: number;
    hasAnalytics: boolean;
    hasPromotions: boolean;
    supportLevel: string;
  };
  usage: {
    productsCount: number;
    ordersThisPeriod: number;
    activeToursCount: number;
    promotionsUsed: number;
  };
}

interface PlanStatusProps {
  businessId: string;
}

export function PlanStatusCard({ businessId }: PlanStatusProps) {
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanStatus() {
      try {
        const response = await fetch(`/api/businesses/${businessId}/plan`);
        if (!response.ok) throw new Error('Failed to fetch plan');
        const data = await response.json();
        setPlanStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    }

    fetchPlanStatus();
  }, [businessId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!planStatus) {
    return null;
  }

  const { subscription, plan, usage } = planStatus;

  // Calculate usage percentages
  const productPercentage =
    plan.maxProducts === -1
      ? 0
      : Math.round((usage.productsCount / plan.maxProducts) * 100);
  const orderPercentage =
    plan.maxOrdersPerMonth === -1
      ? 0
      : Math.round((usage.ordersThisPeriod / plan.maxOrdersPerMonth) * 100);
  const tourPercentage =
    plan.maxActiveTours === -1
      ? 0
      : Math.round((usage.activeToursCount / plan.maxActiveTours) * 100);

  const nextBillingDate = new Date(subscription.nextBillingDate);
  const daysUntilBilling = Math.ceil(
    (nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{subscription.planName}</h3>
            <p className="text-sm text-gray-600 mt-1">
              €{subscription.priceEur}/month • {subscription.status} subscription
            </p>
          </div>
          <Link
            href={`/dashboard/settings/billing`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            Manage Plan
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Next Billing</p>
            <p className="font-semibold text-gray-900">
              {nextBillingDate.toLocaleDateString()} ({daysUntilBilling} days)
            </p>
          </div>
          <div>
            <p className="text-gray-600">Support Level</p>
            <p className="font-semibold text-gray-900">
              {subscription.tier === 'PROFESSIONAL'
                ? '🎯 Dedicated (Same-day)'
                : subscription.tier === 'GROWTH'
                ? '⚡ Priority (≤24h)'
                : '📞 Standard (≤72h)'}
            </p>
          </div>
        </div>

        {/* Plan Features */}
        <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            {plan.hasAnalytics ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Analytics Dashboard</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 border border-gray-400 rounded-full"></div>
                <span className="text-gray-500">Analytics Dashboard</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {plan.hasPromotions ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Promotions</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 border border-gray-400 rounded-full"></div>
                <span className="text-gray-500">Promotions</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Products */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Products</h4>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {usage.productsCount}
            {plan.maxProducts !== -1 && `/${plan.maxProducts}`}
          </p>

          {plan.maxProducts !== -1 && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    productPercentage > 90 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(productPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {productPercentage}% of limit used
              </p>
            </>
          )}

          {productPercentage > 80 && plan.maxProducts !== -1 && (
            <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Approaching limit. Consider upgrading.
            </p>
          )}
        </div>

        {/* Orders */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Orders (This Month)</h4>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {usage.ordersThisPeriod}
            {plan.maxOrdersPerMonth !== -1 && `/${plan.maxOrdersPerMonth}`}
          </p>

          {plan.maxOrdersPerMonth !== -1 && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    orderPercentage > 90 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(orderPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {orderPercentage}% of limit used
              </p>
            </>
          )}

          {plan.maxOrdersPerMonth === -1 && (
            <p className="text-xs text-green-600 mt-3">
              ✓ Unlimited orders available
            </p>
          )}
        </div>

        {/* Tours */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Active Tours</h4>
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {usage.activeToursCount}
            {plan.maxActiveTours !== -1 && `/${plan.maxActiveTours}`}
          </p>

          {plan.maxActiveTours === 0 && (
            <p className="text-xs text-gray-600 mt-4">
              Tours not available on {subscription.planName} plan
            </p>
          )}

          {plan.maxActiveTours > 0 && plan.maxActiveTours !== -1 && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    tourPercentage > 90 ? 'bg-red-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(tourPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {tourPercentage}% of limit used
              </p>
            </>
          )}

          {plan.maxActiveTours === -1 && (
            <p className="text-xs text-purple-600 mt-3">
              ✓ Unlimited tours available
            </p>
          )}
        </div>
      </div>

      {/* Upgrade Suggestion */}
      {subscription.tier !== 'PROFESSIONAL' && productPercentage > 70 && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Ready to grow?</h4>
              <p className="text-sm text-blue-800 mt-1">
                You're using over 70% of your {subscription.planName} plan limits. Upgrading
                gives you more products, orders, and features to scale your business.
              </p>
              <Link
                href={`/dashboard/settings/billing/upgrade`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-3 inline-block"
              >
                View upgrade options →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
