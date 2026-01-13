"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, Tractor, User } from "lucide-react";

export default function SignupAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "visitor";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    language: "fr",
    country: "FR",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleInfo = {
    shop: {
      icon: Store,
      title: "Cheese Shop / Fromagerie",
      description: "Manage inventory, take orders, offer tastings",
    },
    farm: {
      icon: Tractor,
      title: "Farm / Producer",
      description: "Track production, aging, and sell direct",
    },
    visitor: {
      icon: User,
      title: "Visitor / Tourist",
      description: "Discover cheese, book tours, build your passport",
    },
  };

  const currentRole = roleInfo[role as keyof typeof roleInfo] || roleInfo.visitor;
  const Icon = currentRole.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.name) newErrors.name = "Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Create user account
    // Store data in sessionStorage for next step
    sessionStorage.setItem("signupData", JSON.stringify({ ...formData, role }));

    // Navigate to next step
    if (role === "shop" || role === "farm") {
      router.push(`/signup/business?role=${role}`);
    } else {
      router.push("/signup/success");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Role Summary */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            role === 'shop' ? 'bg-blue-100' : role === 'farm' ? 'bg-green-100' : 'bg-purple-100'
          }`}>
            <Icon className={`w-8 h-8 ${
              role === 'shop' ? 'text-blue-600' : role === 'farm' ? 'text-green-600' : 'text-purple-600'
            }`} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{currentRole.title}</h2>
          <p className="mt-2 text-gray-600">{currentRole.description}</p>
          {role === 'shop' && (
            <p className="mt-3 text-sm text-blue-700 bg-blue-50 inline-block px-4 py-2 rounded-full">
              🏪 Perfect for fromageries and cheese retailers
            </p>
          )}
          {role === 'farm' && (
            <p className="mt-3 text-sm text-green-700 bg-green-50 inline-block px-4 py-2 rounded-full">
              🌾 Ideal for artisan cheese producers
            </p>
          )}
          {role === 'visitor' && (
            <p className="mt-3 text-sm text-purple-700 bg-purple-50 inline-block px-4 py-2 rounded-full">
              🎒 Start your cheese journey today!
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="w-12 h-1 bg-orange-600"></div>
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-semibold">
              2
            </div>
            {(role === "shop" || role === "farm") && (
              <>
                <div className="w-12 h-1 bg-gray-300"></div>
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div className="w-12 h-1 bg-gray-300"></div>
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-semibold mb-6">Create Your Account</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Jean Dupont"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="jean@example.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Language
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country {(role === 'shop' || role === 'farm') && <span className="text-red-600">*</span>}
              </label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="FR">France</option>
                <option value="BE">Belgium</option>
                <option value="DE">Germany</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
              </select>
              {(role === 'shop' || role === 'farm') && formData.country !== 'FR' && (
                <p className="text-amber-600 text-sm mt-1 flex items-center gap-1">
                  ⚠️ Businesses must be located in France
                </p>
              )}
            </div>

            {/* Role-specific fields */}
            {role === 'visitor' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">🎫 Free Cheese Passport Included!</h4>
                <p className="text-sm text-purple-800">
                  Collect stamps from each French region you visit and track your cheese discoveries.
                </p>
              </div>
            )}

            {role === 'shop' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🏪 What You'll Get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Inventory management system</li>
                  <li>✓ Customer order processing</li>
                  <li>✓ Map visibility for your shop</li>
                  <li>✓ Optional tour bookings</li>
                </ul>
              </div>
            )}

            {role === 'farm' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">🚜 Producer Features:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ Batch tracking & aging management</li>
                  <li>✓ Production timeline tools</li>
                  <li>✓ Direct-to-consumer sales</li>
                  <li>✓ Farm tour bookings</li>
                </ul>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full mt-6 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              {role === "shop" || role === "farm" ? "Continue to Business Info" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
