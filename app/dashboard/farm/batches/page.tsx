"use client";

import { useEffect, useState } from "react";
import { Milk, Plus, Calendar, TrendingUp, Package, AlertCircle } from "lucide-react";
import { api } from "@/lib/auth/apiClient";

interface Batch {
  id: string;
  batchNumber: string;
  cheeseName: string;
  milkType: string;
  initialQuantityKg: number;
  currentQuantityKg: number;
  status: string;
  productionDate: string;
  minimumAgeDays: number;
  targetAgeDays: number;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    batchNumber: "",
    cheeseName: "",
    milkType: "COW",
    initialQuantityKg: "",
    pricePerKg: "",
    minimumAgeDays: "",
    targetAgeDays: "",
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/api/batches');
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const initialQty = parseFloat(formData.initialQuantityKg);
      const payload = {
        batchNumber: formData.batchNumber,
        cheeseName: formData.cheeseName,
        milkType: formData.milkType,
        initialQuantityKg: initialQty,
        currentQuantityKg: initialQty,
        pricePerKg: parseFloat(formData.pricePerKg),
        quantityProduced: initialQty,
        quantityRemaining: initialQty,
        unitType: 'KG',
        minimumAgeDays: parseInt(formData.minimumAgeDays),
        targetAgeDays: parseInt(formData.targetAgeDays),
        productionDate: new Date().toISOString(),
        status: 'DRAFT',
      };

      let res;
      if (editingBatch) {
        // Update existing batch
        res = await api.patch(`/api/batches/${editingBatch.id}`, payload);
      } else {
        // Create new batch
        res = await api.post('/api/batches', payload);
      }

      if (res.ok) {
        setShowForm(false);
        setEditingBatch(null);
        setFormData({ 
          batchNumber: "", 
          cheeseName: "", 
          milkType: "COW", 
          initialQuantityKg: "", 
          pricePerKg: "",
          minimumAgeDays: "", 
          targetAgeDays: "" 
        });
        fetchBatches();
      } else {
        const data = await res.json();
        setError(data.error || data.detail || 'Failed to save batch');
      }
    } catch (error) {
      console.error('Failed to save batch:', error);
      setError('An error occurred while saving the batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      batchNumber: batch.batchNumber,
      cheeseName: batch.cheeseName,
      milkType: batch.milkType || 'COW',
      initialQuantityKg: batch.initialQuantityKg.toString(),
      pricePerKg: '0', // Would need to fetch from API
      minimumAgeDays: '0',
      targetAgeDays: batch.targetAgeDays?.toString() || '',
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (batch: Batch) => {
    if (batch.status !== 'DRAFT') {
      setError('Only DRAFT batches can be deleted. Batches with production history must be preserved.');
      return;
    }

    if (!confirm(`Delete batch ${batch.batchNumber}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/api/batches/${batch.id}`);
      if (res.ok) {
        fetchBatches();
      } else {
        const data = await res.json();
        setError(data.error || data.detail || 'Failed to delete batch');
      }
    } catch (error) {
      console.error('Failed to delete batch:', error);
      setError('An error occurred while deleting the batch');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBatch(null);
    setError(null);
    setFormData({ 
      batchNumber: "", 
      cheeseName: "", 
      milkType: "COW", 
      initialQuantityKg: "", 
      pricePerKg: "",
      minimumAgeDays: "", 
      targetAgeDays: "" 
    });
  };

  const calculateAge = (productionDate: string) => {
    const days = Math.floor((Date.now() - new Date(productionDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: 'bg-blue-100 text-blue-700',
      PRODUCTION: 'bg-purple-100 text-purple-700',
      AGING: 'bg-yellow-100 text-yellow-700',
      READY: 'bg-green-100 text-green-700',
      FINISHED: 'bg-gray-100 text-gray-700',
      SOLD: 'bg-emerald-100 text-emerald-700',
      CONVERTED: 'bg-indigo-100 text-indigo-700',
      DEPLETED: 'bg-red-100 text-red-700',
      FAILED: 'bg-red-200 text-red-800',
      DISCARDED: 'bg-red-300 text-red-900'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Batches</h1>
          <p className="text-gray-600 mt-1">Manage your cheese production batches</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Batch
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingBatch ? 'Edit Batch' : 'Create New Batch'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Batch Number *</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., BATCH-2026-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cheese Name *</label>
              <input
                type="text"
                value={formData.cheeseName}
                onChange={(e) => setFormData({ ...formData, cheeseName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Comté"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Milk Type *</label>
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
              <label className="block text-sm font-medium mb-1">Initial Quantity (kg) *</label>
              <input
                type="number"
                step="0.1"
                value={formData.initialQuantityKg}
                onChange={(e) => setFormData({ ...formData, initialQuantityKg: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 50.0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price per kg (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.pricePerKg}
                onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 25.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimum Age (days) *</label>
              <input
                type="number"
                value={formData.minimumAgeDays}
                onChange={(e) => setFormData({ ...formData, minimumAgeDays: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Age (days) *</label>
              <input
                type="number"
                value={formData.targetAgeDays}
                onChange={(e) => setFormData({ ...formData, targetAgeDays: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 120"
                required
              />
            </div>
            <div className="col-span-2 flex items-end gap-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editingBatch ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  editingBatch ? 'Save Changes' : 'Create Batch'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batches List */}
      <div className="grid gap-4">
        {batches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Milk className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
            <p className="text-gray-600 mb-4">Create your first production batch to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Create First Batch
            </button>
          </div>
        ) : (
          batches.map((batch) => {
            const age = calculateAge(batch.productionDate);
            const progress = Math.min((age / batch.targetAgeDays) * 100, 100);

            return (
              <div key={batch.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{batch.cheeseName}</h3>
                    <p className="text-sm text-gray-600">Batch #{batch.batchNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(batch.status)}`}>
                    {batch.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Milk Type</p>
                    <p className="font-medium">{batch.milkType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium">{batch.currentQuantityKg || batch.initialQuantityKg} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{age} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target</p>
                    <p className="font-medium">{batch.targetAgeDays} days</p>
                  </div>
                </div>

                {batch.status === 'AGING' && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Aging Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons Based on Status */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  {batch.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => handleEdit(batch)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                      >
                        Edit Batch
                      </button>
                      <button
                        onClick={() => handleDelete(batch)}
                        className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {(batch.status === 'AGING' || batch.status === 'PRODUCTION' || batch.status === 'READY') && (
                    <>
                      <button
                        onClick={() => handleEdit(batch)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                      >
                        Edit Details
                      </button>
                      <button
                        className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                      >
                        Add Log
                      </button>
                    </>
                  )}
                  {(batch.status === 'FINISHED' || batch.status === 'SOLD') && (
                    <button
                      className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700"
                    >
                      View History
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
