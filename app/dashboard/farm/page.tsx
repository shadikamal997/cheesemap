"use client";

import Link from "next/link";
import { Milk, Factory, Calendar, TrendingUp, Package, Users } from "lucide-react";

export default function FarmDashboard() {
  const stats = [
    { label: "Active Batches", value: "24", icon: Factory, color: "bg-green-100 text-green-600" },
    { label: "Aging Cheeses", value: "156", icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "Upcoming Tours", value: "12", icon: Calendar, color: "bg-orange-100 text-orange-600" },
    { label: "This Month", value: "€12,340", icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
  ];

  const activeBatches = [
    { 
      id: "BTH-2024-045", 
      cheese: "Comté", 
      milk: "Cow", 
      quantity: "450L",
      started: "Jan 5, 2024",
      ready: "Jun 5, 2024",
      stage: "Aging (Day 45/180)",
      progress: 25
    },
    { 
      id: "BTH-2024-046", 
      cheese: "Beaufort", 
      milk: "Cow", 
      quantity: "380L",
      started: "Jan 8, 2024",
      ready: "Jul 8, 2024",
      stage: "Aging (Day 42/180)",
      progress: 23
    },
    { 
      id: "BTH-2024-047", 
      cheese: "Reblochon", 
      milk: "Cow", 
      quantity: "200L",
      started: "Jan 10, 2024",
      ready: "Feb 20, 2024",
      stage: "Aging (Day 40/45)",
      progress: 89
    },
  ];

  const upcomingTours = [
    { name: "Farm Visit & Tasting", date: "Jan 15", guests: 8, time: "10:00 AM" },
    { name: "Cheese Making Workshop", date: "Jan 17", guests: 6, time: "2:00 PM" },
    { name: "Aging Cave Tour", date: "Jan 20", guests: 12, time: "11:00 AM" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Dashboard</h1>
          <p className="text-gray-600 mt-1">Track production, aging, and farm experiences</p>
        </div>
        <Link
          href="/dashboard/farm/batches/new"
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
        </div>

        {/* Upcoming Tours */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tours</h3>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
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
