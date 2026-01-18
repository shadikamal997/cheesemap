"use client";

import { useEffect, useState } from "react";
import { Building2, MapPin, Phone, Mail, Globe, Save, Loader2 } from "lucide-react";
import { api } from "@/lib/auth/apiClient";

interface Business {
  id: string;
  displayName: string;
  type: string;
  description: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  verificationStatus: string;
}

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    description: "",
    addressLine1: "",
    city: "",
    region: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const res = await api.get('/api/businesses/me');
      if (res.ok) {
        const data = await res.json();
        setBusiness(data.business);
        setFormData({
          displayName: data.business.displayName || "",
          description: data.business.description || "",
          addressLine1: data.business.addressLine1 || "",
          city: data.business.city || "",
          region: data.business.region || "",
          postalCode: data.business.postalCode || "",
          phone: data.business.phone || "",
          email: data.business.email || "",
          website: data.business.website || "",
        });
      }
    } catch (error) {
      console.error('Failed to fetch business');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.patch(`/api/businesses/${business?.id}`, formData);
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        fetchBusiness();
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!business) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Business Profile</h3>
          <p className="text-yellow-800">
            You don't have a business profile yet. Please complete your business registration.
          </p>
        </div>
      </div>
    );
  }

  const frenchRegions = [
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Farm Settings</h1>
        <p className="text-gray-600 mt-1">Manage your farm business profile and information</p>
      </div>

      {/* Verification Status */}
      {business.verificationStatus !== 'VERIFIED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Verification Pending:</strong> Your farm is currently under review. Once verified, 
            you'll appear on the public map and be discoverable by customers.
          </p>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 mb-6 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Farm Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Tell customers about your farm, your cheese-making process, and what makes you unique..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Business Type</label>
              <input
                type="text"
                value={business.type}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                Verification Status
                {business.verificationStatus === 'VERIFIED' && <span className="text-green-600 text-xs">✓ Verified</span>}
              </label>
              <input
                type="text"
                value={business.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            Location
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Region</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select a region</option>
                {frenchRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="text"
                value={business.latitude}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="text"
                value={business.longitude}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-600" />
            Contact Information
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
