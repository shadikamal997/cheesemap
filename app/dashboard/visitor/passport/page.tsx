"use client";

import { useEffect, useState } from "react";
import { MapPin, Award, Trophy, Target, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/auth/apiClient";

export default function PassportPage() {
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPassport();
  }, []);

  const fetchPassport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/passport');
      
      if (response.ok) {
        const data = await response.json();
        setPassport(data.passport);
      }
    } catch (err) {
      console.error('Error fetching passport:', err);
      setError('Failed to load passport');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading passport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <button onClick={fetchPassport} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button>
      </div>
    );
  }

  const recentStamps = (passport?.stamps || []).slice(0, 8).map((s: any) => ({
    id: s.id,
    cheese: s.cheeseName || 'Visit',
    location: `${s.business.displayName} - ${s.business.city}`,
    region: s.region,
    date: new Date(s.acquiredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    icon: "🧀",
    badge: s.stampType.replace('_', ' '),
  }));

  const regions = [
    {
      name: "Île-de-France",
      stamps: passport?.stamps?.filter((s: any) => s.region === "Île-de-France").length || 0,
      total: 8,
      percentage: 0,
      cheeses: ["Brie de Meaux", "Brie de Melun", "Coulommiers"],
      color: "bg-blue-500",
    },
    {
      name: "Bourgogne-Franche-Comté",
      stamps: passport?.stamps?.filter((s: any) => s.region === "Bourgogne-Franche-Comté").length || 0,
      total: 12,
      percentage: 0,
      cheeses: ["Comté", "Morbier", "Époisses"],
      color: "bg-green-500",
    },
    {
      name: "Auvergne-Rhône-Alpes",
      stamps: passport?.stamps?.filter((s: any) => s.region === "Auvergne-Rhône-Alpes").length || 0,
      total: 15,
      percentage: 0,
      cheeses: ["Beaufort", "Reblochon", "Saint-Marcellin"],
      color: "bg-purple-500",
    },
    {
      name: "Normandie",
      stamps: passport?.stamps?.filter((s: any) => s.region === "Normandie").length || 0,
      total: 6,
      percentage: 0,
      cheeses: ["Camembert de Normandie", "Pont-l'Évêque"],
      color: "bg-yellow-500",
    },
  ].map(r => ({ ...r, percentage: Math.round((r.stamps / r.total) * 100) }));

  const achievements = [
    {
      title: "Region Explorer",
      description: "Visited all regions",
      progress: 6,
      total: 13,
      icon: "🗺️",
      unlocked: false,
    },
    {
      title: "AOP Collector",
      description: "Tasted 10 AOP cheeses",
      progress: 10,
      total: 10,
      icon: "🏆",
      unlocked: true,
    },
    {
      title: "Cave Enthusiast",
      description: "Visited 5 aging caves",
      progress: 4,
      total: 5,
      icon: "🏔️",
      unlocked: false,
    },
    {
      title: "Farm Friend",
      description: "Completed 3 farm tours",
      progress: 3,
      total: 3,
      icon: "🚜",
      unlocked: true,
    },
    {
      title: "Cheese Scholar",
      description: "Attended 5 tasting workshops",
      progress: 2,
      total: 5,
      icon: "📚",
      unlocked: false,
    },
    {
      title: "Social Taster",
      description: "Written 15 reviews",
      progress: 12,
      total: 15,
      icon: "✍️",
      unlocked: false,
    },
  ];

  const stats = [
    { label: "Total Stamps", value: "17", icon: MapPin, color: "text-orange-600" },
    { label: "Regions Visited", value: "6/13", icon: Award, color: "text-purple-600" },
    { label: "AOP Cheeses", value: "10", icon: Trophy, color: "text-yellow-600" },
    { label: "Achievements", value: "2/6", icon: Sparkles, color: "text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Cheese Passport</h1>
          <p className="text-gray-600 mt-1">Track your journey through France's cheese regions</p>
        </div>
        <Link
          href="/map"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
        >
          Explore More
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Regional Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Regional Discovery</h2>
            <p className="text-gray-600 text-sm">Collect stamps from all 13 cheese regions of France</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-600">17</p>
            <p className="text-sm text-gray-600">Total Stamps</p>
          </div>
        </div>

        <div className="space-y-4">
          {regions.map((region) => (
            <div key={region.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">{region.name}</h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                      {region.stamps}/{region.total} stamps
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {region.cheeses.map((cheese) => (
                      <span
                        key={cheese}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {cheese}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${region.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${region.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Stamps */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Stamps</h2>
        <div className="space-y-3">
          {recentStamps.map((stamp: { id: string; cheese: string; location: string; region: string; date: string; icon: string; badge: string }) => (
            <div
              key={stamp.id}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                {stamp.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{stamp.cheese}</h3>
                  <span className="text-xs text-gray-500">{stamp.date}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{stamp.location}</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    {stamp.region}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {stamp.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.title}
              className={`border-2 rounded-lg p-4 ${
                achievement.unlocked
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`text-3xl ${
                    achievement.unlocked ? "grayscale-0" : "grayscale opacity-50"
                  }`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                    {achievement.unlocked && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        ✓ UNLOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-gray-900">
                    {achievement.progress}/{achievement.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${
                      achievement.unlocked ? "bg-green-500" : "bg-orange-500"
                    } h-2 rounded-full transition-all duration-500`}
                    style={{
                      width: `${(achievement.progress / achievement.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-600 to-yellow-500 rounded-xl shadow-lg p-8 text-center text-white">
        <Target className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Continue Your Journey</h2>
        <p className="mb-6 opacity-90">
          Discover 7 more regions and unlock exclusive rewards
        </p>
        <Link
          href="/tours"
          className="inline-block px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
        >
          Book Your Next Tour
        </Link>
      </div>
    </div>
  );
}
