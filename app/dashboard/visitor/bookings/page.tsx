"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Clock, ChevronRight, Star, MessageSquare } from "lucide-react";
import { api } from "@/lib/auth/apiClient";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/bookings');
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings
    .filter(b => ['PENDING', 'PAID', 'CONFIRMED'].includes(b.status))
    .filter(b => new Date(b.schedule.date) >= new Date())
    .map(b => ({
      id: b.id,
      tour: b.schedule.tour.title,
      place: b.schedule.tour.business.displayName,
      location: `${b.schedule.tour.business.city}`,
      date: new Date(b.schedule.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: b.schedule.startTime,
      duration: `${Math.floor(b.schedule.tour.durationMinutes / 60)} hours`,
      guests: b.participants,
      price: `€${b.totalPrice.toFixed(2)}`,
      image: "🧀",
      status: b.status.toLowerCase(),
    }));

  const pastBookings = bookings
    .filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status) || new Date(b.schedule.date) < new Date())
    .map(b => ({
      id: b.id,
      tour: b.schedule.tour.title,
      place: b.schedule.tour.business.displayName,
      location: `${b.schedule.tour.business.city}`,
      date: new Date(b.schedule.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: b.schedule.startTime,
      guests: b.participants,
      price: `€${b.totalPrice.toFixed(2)}`,
      image: "🧀",
      rating: 0,
      reviewed: !!b.review,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <button onClick={fetchBookings} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your cheese tours and experiences</p>
        </div>
        <Link
          href="/tours"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
        >
          Browse Tours
        </Link>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Tours</h2>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl shadow-sm">
                      {booking.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{booking.tour}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium">{booking.place}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{booking.price}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="font-semibold">{booking.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">Time</p>
                      <p className="font-semibold">{booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">Guests</p>
                      <p className="font-semibold">{booking.guests} people</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="font-semibold">{booking.duration}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-orange-200 pt-4 mt-4">
                  <p className="text-sm text-gray-600 mb-2">Hosted by <span className="font-semibold text-gray-900">{booking.place}</span></p>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors">
                      Get Directions
                    </button>
                    <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors">
                      Contact Host
                    </button>
                    <button className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-colors ml-auto">
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No upcoming tours</p>
            <Link
              href="/tours"
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
            >
              Browse Available Tours
            </Link>
          </div>
        )}
      </div>

      {/* Past Bookings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Past Tours</h2>
        <div className="space-y-3">
          {pastBookings.map((booking) => (
            <div key={booking.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl">{booking.image}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{booking.tour}</h3>
                    <p className="text-sm text-gray-600">{booking.place}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>📅 {booking.date}</span>
                      <span>👥 {booking.guests} guests</span>
                      <span>💰 {booking.price}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {booking.reviewed ? (
                    <div className="flex items-center gap-1 px-3 py-2 bg-yellow-100 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                      <span className="font-semibold text-yellow-700">{booking.rating}.0</span>
                    </div>
                  ) : (
                    <Link
                      href={`/dashboard/visitor/bookings/${booking.id}/review`}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Leave Review
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/visitor/bookings/${booking.id}`}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
