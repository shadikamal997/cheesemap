"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/nav/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from authentication context
    const signupData = sessionStorage.getItem('signupData');
    if (signupData) {
      const data = JSON.parse(signupData);
      setUserRole(data.role || 'visitor');
    } else {
      setUserRole('visitor'); // Default role
    }
  }, []);

  useEffect(() => {
    if (userRole && window.location.pathname === '/dashboard') {
      // Redirect to role-specific dashboard
      router.push(`/dashboard/${userRole}`);
    }
  }, [userRole, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar userRole={userRole || 'visitor'} />
      <div className="flex-1 ml-64">
        <header className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900">
                Notifications
              </button>
              <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold">
                U
              </div>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
