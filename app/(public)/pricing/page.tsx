'use client';

import { getAllPlans, formatPlanPrice, formatLimit, getVisitorPlan, PRICING_PLANS } from '@/lib/pricing';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const plans = getAllPlans();
  const visitorPlan = getVisitorPlan();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
          Grow your cheese business with CheeseMap. Choose the plan that fits your needs.
        </p>
        
        {/* Trial Messaging */}
        <div className="mt-8 inline-block bg-green-50 border border-green-200 rounded-lg px-6 py-4">
          <p className="text-green-900 font-semibold">
            🎁 <strong>Premier mois offert</strong> — Essai gratuit de 30 jours
          </p>
          <p className="text-green-700 text-sm mt-2">
            Aucun paiement pendant les 30 premiers jours • Carte bancaire requise • Annulation à tout moment
          </p>
        </div>
        
        <p className="text-sm text-gray-600 mt-8">
          Tous les commerces paient • Les visiteurs naviguent toujours gratuitement
        </p>
      </div>

      {/* Pricing Plans */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative rounded-2xl border-2 transition-all duration-300 ${
                plan.tier === 'GROWTH'
                  ? 'border-blue-500 shadow-2xl scale-105 bg-white'
                  : 'border-gray-200 shadow-lg hover:border-gray-300 bg-white'
              }`}
            >
              {/* Recommended Badge */}
              {plan.tier === 'GROWTH' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Recommended
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h2>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">
                    €{plan.priceEur}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/signup?plan=${plan.tier}`}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors mb-8 block text-center ${
                    plan.tier === 'GROWTH'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>

                {/* Features */}
                <div className="space-y-4">
                  {/* Products */}
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatLimit(plan.maxProducts)} Products
                      </p>
                      <p className="text-xs text-gray-600">
                        Sell up to {formatLimit(plan.maxProducts)} unique cheese products
                      </p>
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatLimit(plan.maxOrdersPerMonth)} Orders/Month
                      </p>
                      <p className="text-xs text-gray-600">
                        Accept {formatLimit(plan.maxOrdersPerMonth)} orders per month
                      </p>
                    </div>
                  </div>

                  {/* Tours */}
                  {plan.maxActiveTours > 0 && (
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Up to {formatLimit(plan.maxActiveTours)} Active Tours
                        </p>
                        <p className="text-xs text-gray-600">
                          Host farm tours, tastings, or workshops
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Analytics */}
                  <div className="flex items-start gap-3">
                    {plan.hasAnalytics ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded border border-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">Analytics Dashboard</p>
                      <p className="text-xs text-gray-600">
                        {plan.hasAnalytics
                          ? 'Track sales, customer trends, and performance'
                          : 'Available on Growth and Professional'}
                      </p>
                    </div>
                  </div>

                  {/* Promotions */}
                  <div className="flex items-start gap-3">
                    {plan.hasPromotions ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded border border-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        Promotions & Featured Placement
                      </p>
                      <p className="text-xs text-gray-600">
                        {plan.hasPromotions
                          ? 'Boost visibility with promotions'
                          : 'Available on Professional plan only'}
                      </p>
                    </div>
                  </div>

                  {/* Support */}
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {plan.supportLevel === 'STANDARD'
                          ? 'Standard Support (≤72h)'
                          : plan.supportLevel === 'PRIORITY'
                          ? 'Priority Support (≤24h)'
                          : 'Dedicated Support (Same-day)'}
                      </p>
                      <p className="text-xs text-gray-600">
                        Get help when you need it
                      </p>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <p className="text-xs text-gray-500 mt-8 pt-8 border-t border-gray-200">
                  Billed monthly. Cancel anytime. No hidden fees.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Visitor Info Card */}
        <div className="max-w-3xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-2xl font-bold text-blue-900">
              🌍 {visitorPlan.name} Access
            </h3>
          </div>
          <p className="text-blue-800 mb-6">
            {visitorPlan.description} — Always free, no plan required.
          </p>
          <ul className="grid md:grid-cols-2 gap-4">
            {visitorPlan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-blue-900">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-300">
                Yes! Upgrade anytime to access more features. Downgrades are allowed if your
                current usage fits the new plan limits.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What happens if I exceed my limit?</h3>
              <p className="text-gray-300">
                You won't be able to add more products, create tours, or accept orders until you
                upgrade. We'll show you a friendly message explaining what to do next.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Are there any setup fees?</h3>
              <p className="text-gray-300">
                No setup fees, no hidden charges. You pay only the monthly plan price. Billing
                happens automatically on your renewal date.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">How do I cancel my subscription?</h3>
              <p className="text-gray-300">
                You can cancel from your dashboard anytime. No questions asked. Your data remains
                accessible for 30 days.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a contract?</h3>
              <p className="text-gray-300">
                No contract. Month-to-month billing with no commitment. Upgrade or downgrade
                whenever you want.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to grow your cheese business?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of cheese businesses on CheeseMap today.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
