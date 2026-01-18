'use client';

import { PlanStatusCard } from '@/components/dashboard/PlanStatusCard';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BillingPage() {
  const params = useParams();
  const businessId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/dashboard/${businessId}/settings`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Plan</h1>
          <p className="text-gray-600 mt-1">
            Manage your subscription, view usage, and upgrade anytime
          </p>
        </div>
      </div>

      {/* Plan Status */}
      <PlanStatusCard businessId={businessId} />

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            📧 Email: <span className="font-mono">support@cheesemap.fr</span>
          </li>
          <li>
            📞 Phone: <span className="font-mono">+33 1 23 45 67 89</span>
          </li>
          <li>
            💬 Chat: Available during business hours (Mon-Fri, 9-18 CET)
          </li>
        </ul>
      </div>

      {/* Invoice History (Placeholder) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Billing History</h3>
        <p className="text-gray-600 text-sm">
          Your invoices will appear here. Coming soon!
        </p>
      </div>
    </div>
  );
}
