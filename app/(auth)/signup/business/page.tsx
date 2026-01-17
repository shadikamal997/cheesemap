"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, Tractor } from "lucide-react";
import { geocodeAddress } from "@/lib/geocoding";

function SignupBusinessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "shop";

  const [formData, setFormData] = useState({
    legalName: "",
    displayName: "",
    siret: "",
    businessType: role,
    address: "",
    city: "",
    postalCode: "",
    region: "",
    phone: "",
    email: "",
    website: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // Not logged in, redirect to login
      router.push("/login");
    }
  }, [router]);

  const regions = [
    "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Centre-Val de Loire",
    "Corse",
    "Grand Est",
    "Hauts-de-France",
    "Île-de-France",
    "Normandie",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Pays de la Loire",
    "Provence-Alpes-Côte d'Azur",
  ];

  const Icon = role === "farm" ? Tractor : Store;
  const title = role === "farm" ? "Farm / Producer" : "Cheese Shop / Fromagerie";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.legalName) newErrors.legalName = "Legal name is required";
    if (!formData.displayName) newErrors.displayName = "Display name is required";
    if (!formData.siret) newErrors.siret = "SIRET is required";
    if (!/^\d{14}$/.test(formData.siret)) {
      newErrors.siret = "SIRET must be 14 digits";
    }
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
    if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = "Invalid French postal code (5 digits)";
    }
    if (!formData.region) newErrors.region = "Region is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Geocode the address
      const geocodingResult = await geocodeAddress(
        formData.address,
        formData.city,
        formData.postalCode
      );

      if (!geocodingResult.success) {
        setErrors({ address: geocodingResult.error.message });
        setLoading(false);
        return;
      }

      // Get auth token from localStorage (user should be logged in)
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // Not logged in, redirect to login
        router.push("/login");
        return;
      }
      
      // Prepare business creation payload
      const payload = {
        type: role === 'farm' ? 'FARM' : 'SHOP',
        legalName: formData.legalName,
        displayName: formData.displayName,
        siret: formData.siret,
        addressLine1: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        region: formData.region,
        latitude: geocodingResult.data.latitude,
        longitude: geocodingResult.data.longitude,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
      };

      // Call business creation API
      const response = await fetch('/api/businesses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create business');
      }

      // Store business ID for next step
      sessionStorage.setItem("businessId", data.business.id);

      // Navigate to modules selection (or dashboard for now since modules page isn't complete)
      router.push(`/dashboard/${role}`);
    } catch (error) {
      console.error('Business creation error:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to create business. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Icon className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">Tell us about your business</p>
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
            <div className="w-12 h-1 bg-orange-600"></div>
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div className="w-12 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
              4
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-semibold mb-2">
            {role === 'farm' ? '🚜 Farm Information' : '🏪 Shop Information'}
          </h3>
          <p className="text-gray-600 mb-6">
            {role === 'farm' 
              ? 'Tell us about your farm and cheese production'
              : 'Share details about your fromagerie or cheese shop'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Legal Name */}
            <div>
              <label htmlFor="legalName" className="block text-sm font-medium text-gray-700 mb-1">
                Legal Business Name *
              </label>
              <input
                id="legalName"
                type="text"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Société Fromagère du Mont d'Or"
              />
              {errors.legalName && <p className="text-red-600 text-sm mt-1">{errors.legalName}</p>}
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name * <span className="text-gray-500 text-xs">(Shown to customers)</span>
              </label>
              <input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder={role === "farm" ? "Ferme du Mont d'Or" : "La Fromagerie Parisienne"}
              />
              {errors.displayName && <p className="text-red-600 text-sm mt-1">{errors.displayName}</p>}
            </div>

            {/* SIRET */}
            <div>
              <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-1">
                SIRET Number * <span className="text-gray-500 text-xs">(14 digits)</span>
              </label>
              <input
                id="siret"
                type="text"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="12345678901234"
                maxLength={14}
              />
              {errors.siret && <p className="text-red-600 text-sm mt-1">{errors.siret}</p>}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="15 Rue de Seine"
              />
              {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* City & Postal Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Paris"
                />
                {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="75006"
                  maxLength={5}
                />
                {errors.postalCode && <p className="text-red-600 text-sm mt-1">{errors.postalCode}</p>}
              </div>
            </div>

            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                French Region *
              </label>
              <select
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select a region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              {errors.region && <p className="text-red-600 text-sm mt-1">{errors.region}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="+33 1 42 22 50 45"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Business Email (Optional)
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="contact@example.com"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website (Optional)
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://example.com"
              />
            </div>

            {/* Role-specific sections */}
            {role === 'farm' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">🧀 Tell us about your production:</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                    <span className="text-green-900">We produce our own cheese on-site</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                    <span className="text-green-900">We have our own dairy animals</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                    <span className="text-green-900">We offer farm visits</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                    <span className="text-green-900">Traditional/artisan methods</span>
                  </label>
                </div>
              </div>
            )}

            {role === 'shop' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">🧀 What describes your shop best?</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-blue-900">Specialist cheese shop / fromagerie</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-blue-900">We offer cheese tastings</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-blue-900">We sell products from local producers</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-blue-900">We have a café/restaurant area</span>
                  </label>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Your business must be located in France. Our team will verify your information before activating your account.
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
                {loading ? 'Creating Business...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignupBusinessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupBusinessForm />
    </Suspense>
  );
}
