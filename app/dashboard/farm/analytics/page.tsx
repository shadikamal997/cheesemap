"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Package, Euro, Users, Calendar, BarChart3 } from "lucide-react";
import { api } from "@/lib/auth/apiClient";

interface AnalyticsData {
  production: {
    totalBatches: number;
    totalKg: number;
    readyForSale: number;
    monthlyProduction: { month: string; kg: number }[];
  };
  tours: {
    totalBookings: number;
    confirmedBookings: number;
    revenue: number;
    monthlyBookings: { month: string; count: number }[];
  };
  inventory: {
    totalItems: number;
    totalValue: number;
    availableItems: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch data from multiple endpoints to build analytics
      const [batchesRes, inventoryRes, bookingsRes] = await Promise.all([
        api.get('/api/batches'),
        api.get('/api/inventory'),
        api.get('/api/bookings?role=farm'),
      ]);

      const batches = batchesRes.ok ? (await batchesRes.json()).batches || [] : [];
      const inventory = inventoryRes.ok ? (await inventoryRes.json()).items || [] : [];
      const bookings = bookingsRes.ok ? (await bookingsRes.json()).bookings || [] : [];

      // Calculate production analytics
      const totalBatches = batches.length;
      const totalKg = batches.reduce((sum: number, b: any) => sum + (b.currentQuantityKg || b.initialQuantityKg), 0);
      const readyForSale = batches.filter((b: any) => b.status === 'READY').length;

      // Monthly production
      const monthlyProd: { [key: string]: number } = {};
      batches.forEach((b: any) => {
        const month = new Date(b.productionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyProd[month] = (monthlyProd[month] || 0) + (b.currentQuantityKg || b.initialQuantityKg);
      });
      const monthlyProduction = Object.entries(monthlyProd)
        .map(([month, kg]) => ({ month, kg }))
        .slice(-6);

      // Calculate tour analytics
      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;
      const revenue = bookings
        .filter((b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum: number, b: any) => sum + b.totalPrice, 0);

      // Monthly bookings
      const monthlyBook: { [key: string]: number } = {};
      bookings.forEach((b: any) => {
        const month = new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyBook[month] = (monthlyBook[month] || 0) + 1;
      });
      const monthlyBookings = Object.entries(monthlyBook)
        .map(([month, count]) => ({ month, count }))
        .slice(-6);

      // Calculate inventory analytics
      const totalItems = inventory.length;
      const totalValue = inventory.reduce((sum: number, i: any) => sum + (i.quantityKg * i.pricePerKg), 0);
      const availableItems = inventory.filter((i: any) => i.available).length;

      setData({
        production: { totalBatches, totalKg, readyForSale, monthlyProduction },
        tours: { totalBookings, confirmedBookings, revenue, monthlyBookings },
        inventory: { totalItems, totalValue, availableItems },
      });
    } catch (error) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!data) {
    return <div className="p-8">Failed to load analytics</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Insights into your farm's performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Total Production</span>
            <Package className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">{data.production.totalKg.toFixed(0)} kg</p>
          <p className="text-sm opacity-75 mt-1">{data.production.totalBatches} batches</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Tour Revenue</span>
            <Euro className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">€{data.tours.revenue.toFixed(0)}</p>
          <p className="text-sm opacity-75 mt-1">{data.tours.confirmedBookings} bookings</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Inventory Value</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">€{data.inventory.totalValue.toFixed(0)}</p>
          <p className="text-sm opacity-75 mt-1">{data.inventory.totalItems} items</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Ready for Sale</span>
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">{data.production.readyForSale}</p>
          <p className="text-sm opacity-75 mt-1">batches available</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Monthly Production Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Monthly Production (kg)
          </h2>
          
          {data.production.monthlyProduction.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No production data yet</p>
          ) : (
            <div className="space-y-3">
              {data.production.monthlyProduction.map((item) => {
                const maxKg = Math.max(...data.production.monthlyProduction.map(i => i.kg));
                const percentage = (item.kg / maxKg) * 100;
                
                return (
                  <div key={item.month}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{item.month}</span>
                      <span className="text-gray-600">{item.kg.toFixed(1)} kg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Bookings Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Monthly Tour Bookings
          </h2>
          
          {data.tours.monthlyBookings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No booking data yet</p>
          ) : (
            <div className="space-y-3">
              {data.tours.monthlyBookings.map((item) => {
                const maxCount = Math.max(...data.tours.monthlyBookings.map(i => i.count));
                const percentage = (item.count / maxCount) * 100;
                
                return (
                  <div key={item.month}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{item.month}</span>
                      <span className="text-gray-600">{item.count} bookings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Production Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Batches</span>
                <span className="font-medium">{data.production.totalBatches}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ready for Sale</span>
                <span className="font-medium text-green-600">{data.production.readyForSale}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Output</span>
                <span className="font-medium">{data.production.totalKg.toFixed(1)} kg</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Tour Performance</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Bookings</span>
                <span className="font-medium">{data.tours.totalBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Confirmed</span>
                <span className="font-medium text-green-600">{data.tours.confirmedBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Revenue</span>
                <span className="font-medium">€{data.tours.revenue.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Inventory Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Items</span>
                <span className="font-medium">{data.inventory.totalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Available</span>
                <span className="font-medium text-green-600">{data.inventory.availableItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Value</span>
                <span className="font-medium">€{data.inventory.totalValue.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
