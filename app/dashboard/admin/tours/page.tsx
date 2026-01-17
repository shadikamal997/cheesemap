'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/auth/apiClient';

interface Tour {
  id: string;
  title: string;
  description: string;
  tourType: string;
  durationMinutes: number;
  pricePerPerson: number;
  approvalStatus: string;
  createdAt: string;
  business: {
    id: string;
    displayName: string;
    city: string;
    region: string;
    verificationStatus: string;
  };
  _count: {
    schedules: number;
  };
}

export default function TourApprovalPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/admin/tours', {
        cache: 'no-store' as RequestCache,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tours');
      }

      const data = await response.json();
      setTours(data.tours || []);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError('Failed to load tours. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleApprove = async (tourId: string, approve: boolean) => {
    if (processingId) return;

    const confirmed = confirm(
      approve 
        ? 'Are you sure you want to approve this tour?' 
        : 'Are you sure you want to reject this tour?'
    );

    if (!confirmed) return;

    setProcessingId(tourId);

    try {
      const response = await api.post(`/api/admin/tours/${tourId}/approve`, {
        approve,
        notes: approve ? 'Approved by admin' : 'Does not meet tour guidelines',
      });

      if (!response.ok) {
        throw new Error('Failed to update tour');
      }

      // Refresh the list
      await fetchTours();
    } catch (err) {
      console.error('Error updating tour:', err);
      alert('Failed to update tour. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tours...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Tour Approval</h1>
          <p className="text-gray-600 mt-2">Review and approve pending tour listings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tours List */}
        {tours.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending tours</h3>
            <p className="text-gray-600">All tours have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tours.map((tour) => (
              <div key={tour.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{tour.title}</h3>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {tour.tourType.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Business</p>
                        <p className="text-sm font-medium text-gray-900">{tour.business.displayName}</p>
                        <p className="text-xs text-gray-500">{tour.business.city}, {tour.business.region}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{tour.durationMinutes} minutes</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-sm font-medium text-gray-900">€{tour.pricePerPerson}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Schedules</p>
                        <p className="text-sm font-medium text-gray-900">{tour._count.schedules} created</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`inline-flex px-2 py-0.5 rounded-full ${
                        tour.business.verificationStatus === 'VERIFIED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Business: {tour.business.verificationStatus}
                      </span>
                      <span>•</span>
                      <span>Submitted {new Date(tour.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleApprove(tour.id, true)}
                      disabled={processingId === tour.id}
                      className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {processingId === tour.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApprove(tour.id, false)}
                      disabled={processingId === tour.id}
                      className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
