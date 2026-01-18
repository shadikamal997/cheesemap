"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Calendar, Users, Clock, Euro, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/auth/apiClient";

interface Tour {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  maxCapacity: number;
  maxParticipants: number;
  pricePerPerson: number;
  includedInPrice: string[];
  isActive: boolean;
  _count?: {
    bookings: number;
  };
}

interface Booking {
  id: string;
  tourDate: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  tour: {
    title: string;
  };
  user: {
    name: string;
    email: string;
  };
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'tours' | 'bookings'>('tours');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tourType: "GUIDED_TOUR" as const,
    durationMinutes: "",
    maxCapacity: "",
    maxParticipants: "",
    pricePerPerson: "",
    includesTasting: true,
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // First get the business ID
      const businessRes = await api.get('/api/businesses/me');
      if (!businessRes.ok) {
        console.error('Failed to fetch business');
        setLoading(false);
        return;
      }
      const businessData = await businessRes.json();
      const businessId = businessData.business.id;

      // Fetch tours for this business
      const toursRes = await api.get(`/api/tours?businessId=${businessId}`);
      if (toursRes.ok) {
        const toursData = await toursRes.json();
        setTours(toursData.tours || []);
      }

      // Fetch bookings
      const bookingsRes = await api.get('/api/bookings?role=farm');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
      }
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/tours', {
        title: formData.title,
        description: formData.description,
        tourType: formData.tourType,
        durationMinutes: parseInt(formData.durationMinutes),
        maxCapacity: parseInt(formData.maxCapacity),
        maxParticipants: parseInt(formData.maxParticipants),
        pricePerPerson: parseFloat(formData.pricePerPerson),
        includedInPrice: formData.includesTasting ? ['Cheese tasting'] : [],
        requiresBooking: true,
        languages: ['fr'],
        ageRestriction: 0,
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          title: "",
          description: "",
          tourType: "GUIDED_TOUR",
          durationMinutes: "",
          maxCapacity: "",
          maxParticipants: "",
          pricePerPerson: "",
          includesTasting: true,
          isActive: true,
        });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create tour');
    }
  };

  const toggleTourStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/api/tours/${id}`, {
        isActive: !currentStatus,
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update tour');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await api.patch(`/api/bookings/${bookingId}`, { status });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update booking');
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Tours</h1>
          <p className="text-gray-600 mt-1">Manage your farm tours and bookings</p>
        </div>
        {activeTab === 'tours' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Tour
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Tours</span>
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{tours.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Pending Bookings</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingBookings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Confirmed</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{confirmedBookings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Revenue</span>
            <Euro className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">€{totalRevenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('tours')}
          className={`pb-2 px-1 ${
            activeTab === 'tours'
              ? 'border-b-2 border-orange-600 text-orange-600 font-medium'
              : 'text-gray-600'
          }`}
        >
          Tours
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-2 px-1 ${
            activeTab === 'bookings'
              ? 'border-b-2 border-orange-600 text-orange-600 font-medium'
              : 'text-gray-600'
          }`}
        >
          Bookings {pendingBookings > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
              {pendingBookings}
            </span>
          )}
        </button>
      </div>

      {/* Create Tour Form */}
      {showForm && activeTab === 'tours' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Tour</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Capacity</label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Participants</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price per Person (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.pricePerPerson}
                onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.includesTasting}
                  onChange={(e) => setFormData({ ...formData, includesTasting: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Includes Tasting</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
            <div className="flex gap-2 col-span-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create Tour
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tours List */}
      {activeTab === 'tours' && (
        <div className="grid gap-4">
          {tours.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tours yet</h3>
              <p className="text-gray-600 mb-4">Create your first farm tour to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Create First Tour
              </button>
            </div>
          ) : (
            tours.map((tour) => (
              <div key={tour.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{tour.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tour.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tour.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tour.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{tour.durationMinutes} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Capacity</p>
                    <p className="font-medium">{tour.maxCapacity} people</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-medium">€{tour.pricePerPerson}/person</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Included</p>
                    <p className="font-medium">{tour.includedInPrice?.length > 0 ? tour.includedInPrice.join(', ') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bookings</p>
                    <p className="font-medium">{tour._count?.bookings || 0}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleTourStatus(tour.id, tour.isActive)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {tour.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bookings List */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">People</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-600">
                    No bookings yet
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{booking.tour.title}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{booking.user.name}</p>
                        <p className="text-sm text-gray-600">{booking.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(booking.tourDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">{booking.numberOfPeople}</td>
                    <td className="px-6 py-4 font-medium">€{booking.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
