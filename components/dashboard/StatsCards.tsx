import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default function StatsCards() {
  const stats = [
    {
      label: "Total Revenue",
      value: "€2,450",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Active Orders",
      value: "23",
      change: "+3 today",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Products in Stock",
      value: "45",
      change: "8 low stock",
      trend: "neutral",
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Upcoming Tours",
      value: "12",
      change: "Next: Tomorrow",
      trend: "neutral",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bg} rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
