"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Store, Tractor, User } from "lucide-react";
import Link from "next/link";

export default function SignupSuccessPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const signupData = sessionStorage.getItem("signupData");
    if (signupData) {
      const data = JSON.parse(signupData);
      setUserData(data);
      // Don't clear signup data yet - dashboard needs it for routing
    } else {
      // If no signup data, redirect to start
      router.push("/signup/role");
    }
  }, [router]);

  if (!userData) {
    return null;
  }

  const roleInfo = {
    shop: {
      icon: Store,
      title: "Cheese Shop / Fromagerie",
      features: ["Inventory Management", "Order Processing", "Customer Reviews"],
    },
    farm: {
      icon: Tractor,
      title: "Farm / Producer",
      features: ["Production Tracking", "Batch Management", "Direct Sales"],
    },
    visitor: {
      icon: User,
      title: "Visitor / Tourist",
      features: ["Cheese Discovery", "Tour Bookings", "Cheese Passport"],
    },
  };

  const currentRole = roleInfo[userData.role as keyof typeof roleInfo] || roleInfo.visitor;
  const Icon = currentRole.icon;
  const isBusiness = userData.role === "shop" || userData.role === "farm";

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
              <p className="text-gray-600">{userData.email}</p>
            </div>
          </div>

          {isBusiness && userData.business && (
            <div className="border-t pt-4 mb-4">
              <h3 className="font-semibold mb-2">Business Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Business:</span>
                  <span className="ml-2 font-medium">{userData.business.businessName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium">{userData.business.city}</span>
                </div>
                <div>
                  <span className="text-gray-600">Region:</span>
                  <span className="ml-2 font-medium">{userData.business.region}</span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">What You Can Do Now:</h3>
            <div className="space-y-2">
              {currentRole.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
              {userData.modules?.tours && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
                  <span className="text-gray-700">Tour Management (Pending Approval)</span>
                </div>
              )}
              {userData.modules?.delivery && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
                  <span className="text-gray-700">Delivery Management</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {isBusiness && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Next Steps</h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li>1. Our team will verify your business information (usually within 24 hours)</li>
              <li>2. You'll receive an email confirmation when your account is verified</li>
              <li>3. Complete your profile and add your first products</li>
              {userData.modules?.tours && <li>4. Create your first tour (requires admin approval)</li>}
            </ul>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href={`/dashboard/${userData.role}`}
            className="block w-full px-6 py-3 bg-orange-600 text-white text-center rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/map"
            className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Explore the Cheese Map
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
