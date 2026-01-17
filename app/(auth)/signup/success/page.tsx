"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Store, Tractor, User } from "lucide-react";
import Link from "next/link";

function SignupSuccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "visitor";

  useEffect(() => {
    // Clean up any remaining signup data
    sessionStorage.removeItem("signupData");
  }, []);

  const roleInfo = {
    shop: {
      icon: Store,
      title: "Cheese Shop / Fromagerie",
      features: ["Inventory Management", "Order Processing", "Customer Reviews"],
      nextSteps: ["Log in to your account", "Complete your business profile", "Add business hours and images", "Submit for admin verification"]
    },
    farm: {
      icon: Tractor,
      title: "Farm / Producer",
      features: ["Production Tracking", "Batch Management", "Direct Sales"],
      nextSteps: ["Log in to your account", "Complete your farm profile", "Add production details", "Submit for admin verification"]
    },
    visitor: {
      icon: User,
      title: "Visitor / Tourist",
      features: ["Cheese Discovery", "Tour Bookings", "Cheese Passport"],
      nextSteps: ["Log in to your account", "Start exploring cheese shops", "Book your first tour", "Build your cheese passport"]
    },
  };

  const currentRole = roleInfo[role as keyof typeof roleInfo] || roleInfo.visitor;
  const Icon = currentRole.icon;
  const isBusiness = role === "shop" || role === "farm";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome to CheeseMap!</h1>
          <p className="text-xl text-gray-600">Your account has been created successfully</p>
        </div>

        {/* Account Summary */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">{currentRole.title}</h2>
              <p className="text-gray-600">Account created successfully</p>
            </div>
          </div>

          {isBusiness && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-amber-900 mb-2">⏳ Pending Verification</h3>
              <p className="text-sm text-amber-800">
                Your business has been created in draft status. An admin will review your information before your business becomes visible on the platform.
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">What You Can Do:</h3>
            <div className="space-y-2 mb-4">
              {currentRole.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <h3 className="font-semibold mb-3 mt-6">Next Steps:</h3>
            <ol className="space-y-2">
              {currentRole.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="font-semibold text-orange-600 min-w-[20px]">{index + 1}.</span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full px-6 py-3 bg-orange-600 text-white text-center rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Log In to Your Account
          </Link>
          <Link
            href="/"
            className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Back to Home
          </Link>
        </div>

        {/* Help */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Need help?{" "}
          <a href="mailto:support@cheesemap.fr" className="text-orange-600 hover:text-orange-700 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignupSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupSuccessForm />
    </Suspense>
  );
}
