"use client";

import { useEffect, useState } from "react";
import { Package, Plus, AlertCircle, TrendingDown, Check } from "lucide-react";
import { api } from "@/lib/auth/apiClient";

interface InventoryItem {
  id: string;
  cheeseName: string;
  cheeseType?: string;
  regionOfOrigin?: string;
  producerName?: string;
  isAop: boolean;
  isBio: boolean;
  milkType?: string;
  sku: string;
  pricePerUnit: number;
  unitType: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  isDeliveryAvailable: boolean;
  description?: string;
  tastingNotes?: string;
  pairingSuggestions?: string;
  imageUrl?: string;
  createdAt: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cheeseName: "",
    cheeseType: "",
    regionOfOrigin: "",
    producerName: "",
    isAop: false,
    isBio: false,
    milkType: "COW",
    sku: "",
    pricePerUnit: "",
    unitType: "KG",
    stockQuantity: "",
    lowStockThreshold: "",
    isAvailable: true,
    isDeliveryAvailable: false,
    description: "",
    tastingNotes: "",
    pairingSuggestions: "",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setItems(data.inventory || []);
      }
    } catch (error) {
      console.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/inventory', {
        cheeseName: formData.cheeseName,
        cheeseType: formData.cheeseType || undefined,
        regionOfOrigin: formData.regionOfOrigin || undefined,
        producerName: formData.producerName || undefined,
        isAop: formData.isAop,
        isBio: formData.isBio,
        milkType: formData.milkType,
        sku: formData.sku,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        unitType: formData.unitType,
        stockQuantity: parseFloat(formData.stockQuantity),
        lowStockThreshold: parseFloat(formData.lowStockThreshold) || 0,
        isAvailable: formData.isAvailable,
        isDeliveryAvailable: formData.isDeliveryAvailable,
        description: formData.description || undefined,
        tastingNotes: formData.tastingNotes || undefined,
        pairingSuggestions: formData.pairingSuggestions || undefined,
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          cheeseName: "",
          cheeseType: "",
          regionOfOrigin: "",
          producerName: "",
          isAop: false,
          isBio: false,
          milkType: "COW",
          sku: "",
          pricePerUnit: "",
          unitType: "KG",
          stockQuantity: "",
          lowStockThreshold: "",
          isAvailable: true,
          isDeliveryAvailable: false,
          description: "",
          tastingNotes: "",
          pairingSuggestions: "",
        });
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to add inventory item');
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/api/inventory/${id}`, {
        isAvailable: !currentStatus,
      });

      if (res.ok) {
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to update availability');
    }
  };

  const totalValue = items.reduce((sum, item) => sum + (item.stockQuantity * item.pricePerUnit), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.stockQuantity, 0);
  const availableItems = items.filter(item => item.isAvailable).length;
  const lowStock = items.filter(item => item.stockQuantity < item.lowStockThreshold).length;

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track your cheese stock and availability</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Items</span>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Stock</span>
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalQuantity.toFixed(1)}<span className="text-lg ml-1">kg</span></p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Inventory Value</span>
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">€{totalValue.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Low Stock</span>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{lowStock}</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Inventory Item</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cheese Name *</label>
              <input
                type="text"
                value={formData.cheeseName}
                onChange={(e) => setFormData({ ...formData, cheeseName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., COMTE-500G"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cheese Type</label>
              <input
                type="text"
                value={formData.cheeseType}
                onChange={(e) => setFormData({ ...formData, cheeseType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Hard, Soft, Blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Region of Origin</label>
              <input
                type="text"
                value={formData.regionOfOrigin}
                onChange={(e) => setFormData({ ...formData, regionOfOrigin: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Franche-Comté"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Producer Name</label>
              <input
                type="text"
                value={formData.producerName}
                onChange={(e) => setFormData({ ...formData, producerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Milk Type</label>
              <select
                value={formData.milkType}
                onChange={(e) => setFormData({ ...formData, milkType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="COW">Cow</option>
                <option value="GOAT">Goat</option>
                <option value="SHEEP">Sheep</option>
                <option value="BUFFALO">Buffalo</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price per Unit (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit Type *</label>
              <select
                value={formData.unitType}
                onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="KG">Kilogram (kg)</option>
                <option value="PIECE">Piece</option>
                <option value="GRAM_100">100g</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
              <input
                type="number"
                step="0.1"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Alert Threshold</label>
              <input
                type="number"
                step="0.1"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 5"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAop}
                  onChange={(e) => setFormData({ ...formData, isAop: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">AOP Certified</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isBio}
                  onChange={(e) => setFormData({ ...formData, isBio: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Organic (Bio)</span>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Available for Sale</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDeliveryAvailable}
                  onChange={(e) => setFormData({ ...formData, isDeliveryAvailable: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Delivery Available</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Product description..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Tasting Notes</label>
              <textarea
                value={formData.tastingNotes}
                onChange={(e) => setFormData({ ...formData, tastingNotes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Flavor profile, texture..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Pairing Suggestions</label>
              <textarea
                value={formData.pairingSuggestions}
                onChange={(e) => setFormData({ ...formData, pairingSuggestions: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Wine pairings, accompaniments..."
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Item
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheese</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Milk Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No inventory items yet. Add your first item to get started.</p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isLowStock = item.stockQuantity < item.lowStockThreshold;
                const unitLabel = item.unitType === 'KG' ? 'kg' : item.unitType === 'PIECE' ? 'pc' : '100g';
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.cheeseName}</p>
                        <div className="flex gap-2 mt-1">
                          {item.regionOfOrigin && (
                            <span className="text-xs text-gray-500">{item.regionOfOrigin}</span>
                          )}
                          {item.isAop && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">AOP</span>
                          )}
                          {item.isBio && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">BIO</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.sku}</td>
                    <td className="px-6 py-4 text-sm">{item.milkType || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.stockQuantity} {unitLabel}</span>
                        {isLowStock && (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">€{item.pricePerUnit.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium">€{(item.stockQuantity * item.pricePerUnit).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {item.isAvailable ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1 w-fit">
                            <Check className="w-3 h-3" />
                            Available
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium w-fit">
                            Unavailable
                          </span>
                        )}
                        {item.isDeliveryAvailable && (
                          <span className="text-xs text-blue-600">+ Delivery</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAvailability(item.id, item.isAvailable)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
