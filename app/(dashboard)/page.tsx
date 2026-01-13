import StatsCards from "@/components/dashboard/StatsCards";
import ProgressChecklist from "@/components/dashboard/ProgressChecklist";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        <StatsCards />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
              <div className="flex-1">
                <p className="font-medium">New order received</p>
                <p className="text-sm text-gray-600">Order #CH-1234 • €45.50</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
              <div className="flex-1">
                <p className="font-medium">Tour booking confirmed</p>
                <p className="text-sm text-gray-600">Cheese Making Experience • 4 guests</p>
                <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-orange-600"></div>
              <div className="flex-1">
                <p className="font-medium">New review posted</p>
                <p className="text-sm text-gray-600">5 stars • "Amazing experience!"</p>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        <ProgressChecklist />
      </div>
    </div>
  );
}
