"use client";

import Link from "next/link";
import { MapPin, Calendar, Award, Heart, Star, ChevronRight } from "lucide-react";

export default function VisitorDashboard() {
  const stats = [
    { label: "Places Saved", value: "18", icon: Heart, color: "bg-red-100 text-red-600" },
    { label: "Regions Visited", value: "5", icon: MapPin, color: "bg-blue-100 text-blue-600" },
    { label: "Tours Booked", value: "3", icon: Calendar, color: "bg-green-100 text-green-600" },
    { label: "Passport Stamps", value: "12", icon: Award, color: "bg-orange-100 text-orange-600" },
  ];

  const savedPlaces = [
    { name: "Fromagerie Laurent Dubois", location: "Paris, Île-de-France", rating: "4.9", image: "🧀" },
    { name: "Ferme de la Brie", location: "Meaux, Île-de-France", rating: "4.8", image: "🚜" },
    { name: "Maison du Comté", location: "Poligny, Bourgogne", rating: "5.0", image: "🏠" },
  ];

  const upcomingBookings = [
    { tour: "Comté Aging Cave Tour", place: "Maison du Comté", date: "Jan 20, 2024", time: "2:00 PM", guests: 2 },
    { tour: "Farm Visit & Tasting", place: "Ferme Alpine", date: "Jan 25, 2024", time: "10:00 AM", guests: 4 },
  ];

  const achievements = [
    { title: "First Stamp", description: "Visited your first fromagerie", unlocked: true, icon: "🎯" },
    { title: "Regional Explorer", description: "Visited 5 different regions", unlocked: true, icon: "🗺️" },
    { title: "Cheese Connoisseur", description: "Completed 10 tastings", unlocked: false, icon: "🧀", progress: 7 },
    { title: "Farm Friend", description: "Visited 5 cheese farms", unlocked: false, icon: "🌾", progress: 3 },
  ];

  const recentStamps = [
    { region: "Île-de-France", place: "Fromagerie Dubois", date: "Jan 10", icon: "🏛️" },
    { region: "Normandie", place: "Ferme Camembert", date: "Jan 8", icon: "🐄" },
    { region: "Auvergne", place: "Maison du Bleu", date: "Jan 5", icon: "⛰️" },
  ];

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
            {recentStamps.map((stamp, idx) => (
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
