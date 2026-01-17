"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/auth/apiClient';

interface AdminStats {
  pendingBusinesses: number;
  pendingTours: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    pendingBusinesses: 0,
    pendingTours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [businessesRes, toursRes] = await Promise.all([
          api.get('/api/admin/businesses?status=PENDING'),
          api.get('/api/admin/tours'),
        ]);

        const businessesData = businessesRes.ok ? await businessesRes.json() : { businesses: [] };
        const toursData = toursRes.ok ? await toursRes.json() : { tours: [] };

        setStats({
          pendingBusinesses: businessesData.businesses?.length || 0,
          pendingTours: toursData.tours?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pending Businesses */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Businesses</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{stats.pendingBusinesses}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <Link 
              href="/dashboard/admin/businesses"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Review businesses →
            </Link>
          </div>

          {/* Pending Tours */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tours</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.pendingTours}</p>
              </div>
              <div className="bg-green-100 rounded-full p-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <Link 
              href="/dashboard/admin/tours"
              className="mt-4 inline-block text-sm font-medium text-green-600 hover:text-green-700"
            >
              Review tours →
            </Link>
          </div>
        </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link 
              href="/dashboard/admin/businesses"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <div>
                <h3 className="font-medium text-gray-900">Business Verification</h3>
                <p className="text-sm text-gray-600">Review and verify business applications</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link 
              href="/dashboard/admin/tours"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <div>
                <h3 className="font-medium text-gray-900">Tour Approval</h3>
                <p className="text-sm text-gray-600">Approve or reject tour listings</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
