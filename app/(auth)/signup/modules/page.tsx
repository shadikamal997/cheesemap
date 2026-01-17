"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, Tractor, Calendar, Truck } from "lucide-react";

function SignupModulesForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "shop";

  const [modules, setModules] = useState({
    tours: false,
    delivery: false,
  });

  useEffect(() => {
    // Check if previous steps were completed
    const signupData = sessionStorage.getItem("signupData");
    if (!signupData) {
      router.push("/signup/role");
    }
  }, [router]);

  const Icon = role === "farm" ? Tractor : Store;
  const title = role === "farm" ? "Farm / Producer" : "Cheese Shop / Fromagerie";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get signup data from sessionStorage
      const signupData = sessionStorage.getItem("signupData");
      if (!signupData) {
        router.push("/signup/role");
        return;
      }

      const userData = JSON.parse(signupData);
      const role = userData.role || searchParams.get("role") || "shop";
      
      // Note: At this point, the business has already been created in step 3
      // and the user's role has been updated to SHOP or FARM by the backend.
      // Module preferences (tours/delivery) can be configured later in the dashboard
      // as they require additional setup (Stripe Connect for payments, etc.)

      // Navigate to success page (sessionStorage will be cleared there)
      router.push(`/signup/success?role=${role}`);
    } catch (error) {
      console.error('Signup completion error:', error);
      alert(error instanceof Error ? error.message : 'Failed to complete signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Icon className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">Choose optional features for your business</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-12 h-1 bg-green-600"></div>
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-12 h-1 bg-green-600"></div>
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-12 h-1 bg-orange-600"></div>
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-semibold">
              4
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-semibold mb-2">
            {role === 'farm' ? '🚜 Enhance Your Farm' : '🏪 Grow Your Business'}
          </h3>
          <p className="text-gray-600 mb-6">
            {role === 'farm'
              ? 'Add these features to welcome visitors and reach more customers'
              : 'Enable premium features to attract tourists and increase sales'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tours Module */}
            <div
              onClick={() => setModules({ ...modules, tours: !modules.tours })}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                modules.tours
                  ? "border-orange-600 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  modules.tours ? "bg-orange-600" : "bg-gray-100"
                }`}>
                  <Calendar className={`w-6 h-6 ${modules.tours ? "text-white" : "text-gray-600"}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">
                    {role === 'farm' ? '🌾 Farm Visits & Workshops' : '🧀 Tastings & Experiences'}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {role === 'farm'
                      ? 'Welcome visitors to your farm, show them your production process, and offer hands-on cheese-making workshops.'
                      : 'Host guided tastings, cheese platters, and educational sessions in your shop.'
                    }
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-700">• 15% commission</span>
                    <span className="text-gray-700">• Admin approval required</span>
                    <span className="text-gray-700">• Pro plan needed</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={modules.tours}
                    onChange={() => {}}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Module */}
            <div
              onClick={() => setModules({ ...modules, delivery: !modules.delivery })}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                modules.delivery
                  ? "border-orange-600 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  modules.delivery ? "bg-orange-600" : "bg-gray-100"
                }`}>
                  <Truck className={`w-6 h-6 ${modules.delivery ? "text-white" : "text-gray-600"}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">Enable Delivery</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Sell your products with delivery throughout France. Cold-chain partner logistics included.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-700">• 10% commission</span>
                    <span className="text-gray-700">• France only</span>
                    <span className="text-gray-700">• Starter plan needed</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={modules.delivery}
                    onChange={() => {}}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900">
                <strong>You can always enable these later.</strong> Start with inventory management and add tours or delivery when you're ready.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Completing...' : 'Complete Signup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignupModulesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupModulesForm />
    </Suspense>
  );
}
