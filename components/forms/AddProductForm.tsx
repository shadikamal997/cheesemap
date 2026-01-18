'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';

interface PlanData {
  subscription: {
    tier: string;
    planName: string;
  };
  plan: {
    maxProducts: number;
  };
  usage: {
    productsCount: number;
  };
}

interface AddProductFormProps {
  businessId: string;
  onSuccess?: () => void;
}

export function AddProductForm({ businessId, onSuccess }: AddProductFormProps) {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    cheeseName: '',
    cheeseType: '',
    sku: '',
    pricePerUnit: '',
    unitType: 'KG' as const,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const response = await fetch(`/api/businesses/${businessId}/plan`);
        if (!response.ok) throw new Error('Failed to fetch plan');
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        console.error('Failed to load plan:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [businessId]);

  const canAddProduct =
    plan &&
    (plan.plan.maxProducts === -1 ||
      plan.usage.productsCount < plan.plan.maxProducts);

  const isAtLimit =
    plan &&
    plan.plan.maxProducts !== -1 &&
    plan.usage.productsCount >= plan.plan.maxProducts;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canAddProduct) {
      setError('You have reached your product limit');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'PLAN_LIMIT_REACHED') {
          setError(data.error);
        } else {
          setError(data.error || 'Failed to create product');
        }
        return;
      }

      // Reset form
      setFormData({
        cheeseName: '',
        cheeseType: '',
        sku: '',
        pricePerUnit: '',
        unitType: 'KG',
      });

      onSuccess?.();
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Limit Warning */}
      {isAtLimit && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Product limit reached</h3>
              <p className="text-sm text-red-800 mt-1">
                You've reached your plan limit of {plan.plan.maxProducts} products.
              </p>
              <Link
                href={`/dashboard/${businessId}/settings/billing`}
                className="text-sm font-semibold text-red-700 hover:text-red-800 mt-2 inline-block"
              >
                Upgrade your plan →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Usage Bar */}
      {plan && plan.plan.maxProducts !== -1 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">
              Products Used
            </label>
            <span className="text-sm text-gray-600">
              {plan.usage.productsCount} / {plan.plan.maxProducts}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                isAtLimit ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min(
                  (plan.usage.productsCount / plan.plan.maxProducts) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cheese Name *
          </label>
          <input
            type="text"
            required
            disabled={isAtLimit || false}
            value={formData.cheeseName}
            onChange={(e) =>
              setFormData({ ...formData, cheeseName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., Comté AOP"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <input
            type="text"
            disabled={isAtLimit || false}
            value={formData.cheeseType}
            onChange={(e) =>
              setFormData({ ...formData, cheeseType: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., Hard"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU *
          </label>
          <input
            type="text"
            required
            disabled={isAtLimit || false}
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., COMTE-2KG-001"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Unit *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              disabled={isAtLimit || false}
              value={formData.pricePerUnit}
              onChange={(e) =>
                setFormData({ ...formData, pricePerUnit: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Type *
            </label>
            <select
              disabled={isAtLimit || false}
              value={formData.unitType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unitType: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="KG">Kilogram</option>
              <option value="PIECE">Piece</option>
              <option value="GRAM_100">100 grams</option>
            </select>
          </div>
        </div>

        {/* Disabled State */}
        {isAtLimit && (
          <div className="relative">
            <button
              type="submit"
              disabled
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed opacity-50"
            >
              <Lock className="w-4 h-4" />
              Product limit reached
            </button>
          </div>
        )}

        {!isAtLimit && (
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Add Product'}
          </button>
        )}
      </form>

      {/* Info */}
      {plan && (
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
          <p>
            You're on the <strong>{plan.subscription.planName}</strong> plan with
            a limit of <strong>{plan.plan.maxProducts}</strong> products.
          </p>
          {plan.plan.maxProducts !== -1 && (
            <p className="mt-2">
              You have <strong>{plan.plan.maxProducts - plan.usage.productsCount}</strong> product slots
              remaining.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
