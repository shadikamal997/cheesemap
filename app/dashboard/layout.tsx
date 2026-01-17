"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Bell } from "lucide-react";
import DashboardSidebar from "@/components/nav/DashboardSidebar";
import { useAuth } from "@/lib/auth/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // If not authenticated, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user has access to current dashboard
    const userRole = user.role.toLowerCase();
    const dashboardPath = pathname.split('/')[2]; // Get role from /dashboard/{role}

    // Allow access to own dashboard or admin to all
    if (dashboardPath && dashboardPath !== userRole && user.role !== 'ADMIN') {
      // Redirect to user's proper dashboard
      router.push(`/dashboard/${userRole}`);
      return;
    }

    setIsChecking(false);
  }, [user, loading, pathname, router]);

  const handleLogout = () => {
    logout();
  };

  // Show loading state while checking auth
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  const userRole = user.role.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar userRole={userRole || 'visitor'} />
      <div className="flex-1 ml-64">
        <header className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="relative text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold">
                  U
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
