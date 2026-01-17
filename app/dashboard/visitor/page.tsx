"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Award, Heart, Star, ChevronRight } from "lucide-react";
import { api } from "@/lib/auth/apiClient";

export default function VisitorDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, passportRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/passport')
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []);
      }

      if (passportRes.ok) {
        const data = await passportRes.json();
        setPassport(data.passport || {});
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings
    .filter(b => ['PENDING', 'PAID', 'CONFIRMED'].includes(b.status))
    .filter(b => new Date(b.schedule.date) >= new Date())
    .slice(0, 2)
    .map(b => ({
      id: b.id,
      tour: b.schedule.tour.title,
      place: b.schedule.tour.business.displayName,
      date: new Date(b.schedule.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: b.schedule.startTime,
      guests: b.participants
    }));

  const recentStamps = (passport?.stamps || []).slice(0, 3).map((s: any) => ({
    region: s.region,
    place: s.business.displayName,
    date: new Date(s.acquiredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    icon: '🧀'
  }));

  const stats = [
    { label: "Places Saved", value: "N/A", icon: Heart, color: "bg-red-100 text-red-600" },
    { label: "Regions Visited", value: passport?.regionsVisited?.toString() || "0", icon: MapPin, color: "bg-blue-100 text-blue-600" },
    { label: "Tours Booked", value: bookings.length.toString(), icon: Calendar, color: "bg-green-100 text-green-600" },
    { label: "Passport Stamps", value: passport?.totalStamps?.toString() || "0", icon: Award, color: "bg-orange-100 text-orange-600" },
  ];

  const savedPlaces: any[] = []; // TODO: Implement saved places feature

  const achievements: any[] = []; // TODO: Implement achievements feature

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Cheese Journey</h1>
          <p className="text-gray-600 mt-1">Discover, explore, and collect your cheese experiences</p>
        </div>
        <Link
          href="/map"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
        >
          <MapPin className="w-5 h-5" />
          Explore Map
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color} mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tours</h3>
            <Link
              href="/dashboard/visitor/bookings"
              className="text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              View All
            </Link>
          </div>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{booking.tour}</p>
                      <p className="text-sm text-gray-600">{booking.place}</p>
                    </div>
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    <span>📅 {booking.date}</span>
                    <span>🕐 {booking.time}</span>
                    <span>👥 {booking.guests} guests</span>
                  </div>
                  <Link
                    href={`/dashboard/visitor/bookings/${idx}`}
                    className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No upcoming tours yet</p>
              <Link
                href="/tours"
                className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
              >
                Browse Tours
              </Link>
            </div>
          )}
        </div>

        {/* Recent Stamps */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Stamps</h3>
            <Award className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            {recentStamps.map((stamp: { region: string; place: string; date: string; icon: string }, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{stamp.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{stamp.region}</p>
                    <p className="text-xs text-gray-600">{stamp.place}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stamp.date}</p>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/visitor/passport"
            className="block mt-4 text-center text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            View Passport →
          </Link>
        </div>
      </div>

      {/* Saved Places */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Saved Places</h3>
          <Link
            href="/dashboard/visitor/saved"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            View All
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {savedPlaces.map((place, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-3xl">{place.image}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{place.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{place.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-900">{place.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                achievement.unlocked
                  ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-3xl ${!achievement.unlocked && "opacity-40"}`}>
                  {achievement.icon}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{achievement.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  {!achievement.unlocked && achievement.progress && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(achievement.progress / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/map"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <MapPin className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Cheese Map</h3>
          <p className="text-blue-100 text-sm">Explore fromageries and farms across France</p>
        </Link>

        <Link
          href="/tours"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Calendar className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Book Tours</h3>
          <p className="text-green-100 text-sm">Tastings, farm visits, and workshops</p>
        </Link>

        <Link
          href="/dashboard/visitor/passport"
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Award className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">My Passport</h3>
          <p className="text-orange-100 text-sm">Collect stamps and achievements</p>
        </Link>
      </div>
    </div>
  );
}
