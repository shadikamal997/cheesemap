"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Bell } from "lucide-react";
import DashboardSidebar from "@/components/nav/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Get user role from session/auth
    // For demo, check signup session storage or default to visitor
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

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('signupData');
    // TODO: Call NextAuth signOut when implemented
    // signOut({ redirect: false });
    
    // Redirect to home page
    router.push('/');
  };

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
