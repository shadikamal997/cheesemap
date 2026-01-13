import InventoryTable from "@/components/dashboard/InventoryTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function InventoryPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <Link
          href="/dashboard/inventory/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b px-6 py-4">
          <div className="flex gap-4">
            <Link
              href="/dashboard/inventory"
              className="pb-2 border-b-2 border-orange-600 font-medium text-orange-600"
            >
              All Products
            </Link>
            <Link
              href="/dashboard/inventory/batches"
              className="pb-2 text-gray-600 hover:text-gray-900"
            >
              Batches
            </Link>
            <Link
              href="/dashboard/inventory/stock"
              className="pb-2 text-gray-600 hover:text-gray-900"
            >
              Stock Alerts
            </Link>
          </div>
        </div>

        <InventoryTable />
      </div>
    </div>
  );
}
