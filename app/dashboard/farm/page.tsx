"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Milk, Factory, Calendar, TrendingUp, Package, Users } from "lucide-react";
import { api } from "@/lib/auth/apiClient";

interface Batch {
  id: string;
  batchNumber: string;
  cheeseName: string;
  milkType: string;
  initialQuantityKg: number;
  status: string;
  productionDate: string;
  minimumAgeDays: number;
  targetAgeDays: number;
}

interface Tour {
  id: string;
  title: string;
  status: string;
  schedules: Array<{
    date: string;
    startTime: string;
    bookedSpots: number;
    maxCapacity: number;
  }>;
}

export default function FarmDashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [batchesRes, toursRes] = await Promise.all([
        api.get('/api/batches'),
        api.get('/api/tours?owner=true')
      ]);

      if (batchesRes.ok) {
        const batchData = await batchesRes.json();
        setBatches(batchData.batches || []);
      }

      if (toursRes.ok) {
        const tourData = await toursRes.json();
        setTours(tourData.tours || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const activeBatchesCount = batches.filter(b => 
    ['AGING', 'PRODUCTION'].includes(b.status)
  ).length;
  
  const agingCheesesKg = batches
    .filter(b => b.status === 'AGING')
    .reduce((sum, b) => sum + b.initialQuantityKg, 0);

  const upcomingToursCount = tours
    .filter(t => t.status === 'LIVE')
    .flatMap(t => t.schedules || [])
    .filter(s => new Date(s.date) >= new Date()).length;

  const activeBatches = batches
    .filter(b => ['AGING', 'PRODUCTION'].includes(b.status))
    .slice(0, 3)
    .map(batch => {
      const daysSinceProduction = Math.floor(
        (new Date().getTime() - new Date(batch.productionDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const targetDays = batch.targetAgeDays || batch.minimumAgeDays;
      const progress = Math.min((daysSinceProduction / targetDays) * 100, 100);
      
      return {
        id: batch.batchNumber,
        cheese: batch.cheeseName,
        milk: batch.milkType,
        quantity: `${batch.initialQuantityKg}kg`,
        started: new Date(batch.productionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        ready: new Date(new Date(batch.productionDate).getTime() + targetDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        stage: `${batch.status} (Day ${daysSinceProduction}/${targetDays})`,
        progress: Math.round(progress)
      };
    });

  const upcomingTours = tours
    .filter(t => t.status === 'LIVE')
    .flatMap(t => t.schedules?.map(s => ({ ...s, title: t.title })) || [])
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map(schedule => ({
      name: schedule.title,
      date: new Date(schedule.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      guests: schedule.bookedSpots,
      time: schedule.startTime
    }));

  const stats = [
    { label: "Active Batches", value: activeBatchesCount.toString(), icon: Factory, color: "bg-green-100 text-green-600" },
    { label: "Aging Cheeses", value: `${Math.round(agingCheesesKg)}kg`, icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "Upcoming Tours", value: upcomingToursCount.toString(), icon: Calendar, color: "bg-orange-100 text-orange-600" },
    { label: "Total Batches", value: batches.length.toString(), icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Dashboard</h1>
          <p className="text-gray-600 mt-1">Track production, aging, and farm experiences</p>
        </div>
        <Link
          href="/dashboard/farm/batches"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
        >
          <Milk className="w-5 h-5" />
          New Batch
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Batches */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Batches</h3>
            <Link
              href="/dashboard/farm/batches"
              className="text-sm font-semibold text-green-600 hover:text-green-700"
            >
              View All
            </Link>
          </div>
          {activeBatches.length > 0 ? (
            <div className="space-y-4">
              {activeBatches.map((batch) => (
                <div key={batch.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{batch.id}</p>
                      <p className="text-sm text-gray-600">{batch.cheese} • {batch.milk} milk • {batch.quantity}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>{batch.stage}</span>
                      <span>{batch.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${batch.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Started: {batch.started}</span>
                    <span>Ready: {batch.ready}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Factory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No active batches</p>
              <Link
                href="/dashboard/farm/batches"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Start New Batch
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Tours */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tours</h3>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          {upcomingTours.length > 0 ? (
            <div className="space-y-3">
              {upcomingTours.map((tour, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm mb-1">{tour.name}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{tour.date} • {tour.time}</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{tour.guests}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No upcoming tours</p>
            </div>
          )}
          <Link
            href="/dashboard/farm/tours"
            className="block mt-4 text-center text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Manage Tours →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/farm/batches"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Factory className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Batch Tracking</h3>
          <p className="text-green-100 text-sm">Track cheese from milk to market</p>
        </Link>

        <Link
          href="/dashboard/farm/production"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Package className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Production Tools</h3>
          <p className="text-blue-100 text-sm">Timelines, yield estimates, inventory</p>
        </Link>

        <Link
          href="/dashboard/farm/tours"
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Users className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Farm Tours</h3>
          <p className="text-orange-100 text-sm">Visits, tastings, workshops, bookings</p>
        </Link>
      </div>

      {/* Production Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Timeline</h3>
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, idx) => (
            <div key={idx} className="flex-shrink-0 text-center">
              <div className="w-24 h-32 bg-gradient-to-b from-green-100 to-green-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-600 mb-1">{month}</p>
                <p className="text-2xl font-bold text-green-700">{Math.floor(Math.random() * 20) + 15}</p>
                <p className="text-xs text-gray-600">batches</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
