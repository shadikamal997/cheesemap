"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingCart, MapPin, TrendingUp, AlertCircle, Plus } from "lucide-react";
import { api } from "@/lib/auth/apiClient";
import { useAuth } from "@/lib/auth/AuthContext";

interface InventoryItem {
  id: string;
  cheeseName: string;
  stockQuantity: number;
  lowStockThreshold: number;
  pricePerUnit: number;
  isAvailable: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function ShopDashboard() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventoryRes, ordersRes] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/orders')
      ]);

      if (inventoryRes.ok) {
        const invData = await inventoryRes.json();
        setInventory(invData.inventory || []);
      }

      if (ordersRes.ok) {
        const ordData = await ordersRes.json();
        setOrders(ordData.orders || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const totalCheeses = inventory.length;
  const activeOrders = orders.filter(o => 
    ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
  ).length;
  
  const thisMonthTotal = orders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear() &&
             ['COMPLETED', 'PAID', 'DELIVERED'].includes(o.status);
    })
    .reduce((sum, o) => sum + o.total, 0);

  const lowStock = inventory
    .filter(item => item.stockQuantity < item.lowStockThreshold && item.isAvailable)
    .map(item => ({
      name: item.cheeseName,
      current: item.stockQuantity,
      minimum: item.lowStockThreshold,
      status: item.stockQuantity === 0 ? 'critical' : 
              item.stockQuantity < item.lowStockThreshold * 0.5 ? 'critical' : 'warning'
    }))
    .slice(0, 3);

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map(order => ({
      id: order.orderNumber,
      customer: order.customerName,
      total: `€${order.total.toFixed(2)}`,
      status: order.status.toLowerCase(),
      time: formatTimeAgo(order.createdAt)
    }));

  const stats = [
    { label: "Total Cheeses", value: totalCheeses.toString(), icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "Active Orders", value: activeOrders.toString(), icon: ShoppingCart, color: "bg-green-100 text-green-600" },
    { label: "Map Views", value: "N/A", icon: MapPin, color: "bg-orange-100 text-orange-600" },
    { label: "This Month", value: `€${thisMonthTotal.toFixed(0)}`, icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
  ];

  function formatTimeAgo(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage inventory, orders, and shop visibility</p>
        </div>
        <Link
          href="/dashboard/shop/inventory/add"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Cheese
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
        {/* Inventory Alerts */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          {lowStock.length > 0 ? (
            <div className="space-y-3">
              {lowStock.map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        item.status === "critical"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === "critical" ? "bg-red-500" : "bg-yellow-500"
                        }`}
                        style={{ width: `${Math.min((item.current / item.minimum) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{item.current}/{item.minimum}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">All stock levels are good!</p>
            </div>
          )}
          <Link
            href="/dashboard/shop/inventory"
            className="block mt-4 text-center text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            View All Inventory →
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link
              href="/dashboard/shop/orders"
              className="text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              View All
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "pending" || order.status === "confirmed"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "preparing"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "ready"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.time}</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{order.total}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/shop/inventory"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Package className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Inventory System</h3>
          <p className="text-blue-100 text-sm">Manage all cheeses, track stock, set prices</p>
        </Link>

        <Link
          href="/dashboard/shop/orders"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <ShoppingCart className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Order Processing</h3>
          <p className="text-green-100 text-sm">View orders, click & collect, delivery</p>
        </Link>

        <Link
          href="/dashboard/shop/map"
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <MapPin className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">Map Visibility</h3>
          <p className="text-orange-100 text-sm">Update hours, promote events, track views</p>
        </Link>
      </div>
    </div>
  );
}
