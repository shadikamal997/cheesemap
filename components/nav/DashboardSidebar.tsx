"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  BarChart3,
  Tag,
  Settings,
  Factory,
  Compass,
  MapPin,
  Calendar,
  Award,
  Heart,
  Milk,
  Shield,
  Building2,
} from "lucide-react";

interface DashboardSidebarProps {
  userRole: string;
}

export default function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();

  // Role-specific navigation
  const navigationByRole = {
    shop: [
      { name: "Overview", href: "/dashboard/shop", icon: LayoutDashboard },
      { name: "Inventory", href: "/dashboard/shop/inventory", icon: Package },
      { name: "Orders", href: "/dashboard/shop/orders", icon: ShoppingCart },
      { name: "Map Visibility", href: "/dashboard/shop/map", icon: MapPin },
      { name: "Tastings", href: "/dashboard/shop/tastings", icon: Users },
      { name: "Reviews", href: "/dashboard/shop/reviews", icon: Star },
      { name: "Analytics", href: "/dashboard/shop/analytics", icon: BarChart3 },
      { name: "Settings", href: "/dashboard/shop/settings", icon: Settings },
    ],
    farm: [
      { name: "Overview", href: "/dashboard/farm", icon: LayoutDashboard },
      { name: "Batches", href: "/dashboard/farm/batches", icon: Milk },
      { name: "Production", href: "/dashboard/farm/production", icon: Factory },
      { name: "Inventory", href: "/dashboard/farm/inventory", icon: Package },
      { name: "Farm Tours", href: "/dashboard/farm/tours", icon: Users },
      { name: "Reviews", href: "/dashboard/farm/reviews", icon: Star },
      { name: "Analytics", href: "/dashboard/farm/analytics", icon: BarChart3 },
      { name: "Settings", href: "/dashboard/farm/settings", icon: Settings },
    ],
    visitor: [
      { name: "My Journey", href: "/dashboard/visitor", icon: LayoutDashboard },
      { name: "Cheese Map", href: "/map", icon: MapPin },
      { name: "My Bookings", href: "/dashboard/visitor/bookings", icon: Calendar },
      { name: "Saved Places", href: "/dashboard/visitor/saved", icon: Heart },
      { name: "My Passport", href: "/dashboard/visitor/passport", icon: Award },
      { name: "Reviews", href: "/dashboard/visitor/reviews", icon: Star },
      { name: "Settings", href: "/dashboard/visitor/settings", icon: Settings },
    ],
    admin: [
      { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
      { name: "Businesses", href: "/dashboard/admin/businesses", icon: Building2 },
      { name: "Tours", href: "/dashboard/admin/tours", icon: MapPin },
    ],
  };

  const navigation = navigationByRole[userRole as keyof typeof navigationByRole] || navigationByRole.visitor;

  const roleLabels = {
    shop: "Cheese Shop",
    farm: "Farm & Producer",
    visitor: "Cheese Explorer",
    admin: "Admin Dashboard",
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="px-6 py-4 border-b">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-orange-600">🧀 CheeseMap</span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            {roleLabels[userRole as keyof typeof roleLabels] || "Dashboard"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Banner - Only for shop/farm */}
        {(userRole === 'shop' || userRole === 'farm') && (
          <div className="p-4 border-t">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
              <p className="text-xs mb-3 opacity-90">Unlock tours and analytics</p>
              <button className="w-full bg-white text-orange-600 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Admin Badge */}
        {userRole === 'admin' && (
          <div className="p-4 border-t">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <div>
                  <p className="text-xs font-semibold">Administrator</p>
                  <p className="text-xs opacity-90">Full platform access</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
