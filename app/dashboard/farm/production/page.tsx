"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar, Package, BarChart3 } from "lucide-react";
import { api } from "@/lib/auth/apiClient";

interface ProductionStats {
  totalBatches: number;
  activeBatches: number;
  totalProduction: number;
  readyForSale: number;
}

interface Batch {
  id: string;
  batchNumber: string;
  cheeseName: string;
  milkType: string;
  initialQuantityKg: number;
  currentQuantityKg: number;
  status: string;
  productionDate: string;
  targetAgeDays: number;
}

export default function ProductionPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState<ProductionStats>({
    totalBatches: 0,
    activeBatches: 0,
    totalProduction: 0,
    readyForSale: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/batches');
      if (res.ok) {
        const data = await res.json();
        const allBatches = data.batches || [];
        setBatches(allBatches);

        // Calculate stats
        const totalBatches = allBatches.length;
        const activeBatches = allBatches.filter((b: Batch) => 
          b.status === 'PRODUCTION' || b.status === 'AGING'
        ).length;
        const totalProduction = allBatches.reduce((sum: number, b: Batch) => 
          sum + (b.currentQuantityKg || b.initialQuantityKg), 0
        );
        const readyForSale = allBatches.filter((b: Batch) => 
          b.status === 'READY'
        ).reduce((sum: number, b: Batch) => sum + (b.currentQuantityKg || b.initialQuantityKg), 0);

        setStats({ totalBatches, activeBatches, totalProduction, readyForSale });
      }
    } catch (error) {
      console.error('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const groupByMonth = () => {
    const grouped: { [key: string]: Batch[] } = {};
    batches.forEach(batch => {
      const month = new Date(batch.productionDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(batch);
    });
    return grouped;
  };

  const groupedBatches = groupByMonth();
  const months = Object.keys(groupedBatches).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Production Overview</h1>
        <p className="text-gray-600 mt-1">Track your cheese production history and metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Batches</span>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalBatches}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active Batches</span>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeBatches}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Production</span>
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalProduction.toFixed(1)}<span className="text-lg ml-1">kg</span></p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Ready for Sale</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.readyForSale.toFixed(1)}<span className="text-lg ml-1">kg</span></p>
        </div>
      </div>

      {/* Production by Milk Type */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Production by Milk Type</h2>
        <div className="grid grid-cols-5 gap-4">
          {['COW', 'GOAT', 'SHEEP', 'BUFFALO', 'MIXED'].map(type => {
            const typeBatches = batches.filter(b => b.milkType === type);
            const totalKg = typeBatches.reduce((sum, b) => sum + (b.currentQuantityKg || b.initialQuantityKg), 0);
            return (
              <div key={type} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalKg.toFixed(1)}</p>
                <p className="text-sm text-gray-600">{type}</p>
                <p className="text-xs text-gray-500 mt-1">{typeBatches.length} batches</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Production Timeline</h2>
        
        {months.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No production history yet</p>
        ) : (
          <div className="space-y-6">
            {months.map(month => (
              <div key={month}>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  {month}
                </h3>
                <div className="grid gap-3">
                  {groupedBatches[month].map(batch => {
                    const age = Math.floor((Date.now() - new Date(batch.productionDate).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={batch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{batch.cheeseName}</p>
                          <p className="text-sm text-gray-600">
                            Batch #{batch.batchNumber} • {batch.milkType} • {new Date(batch.productionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{(batch.currentQuantityKg || batch.initialQuantityKg).toFixed(1)} kg</p>
                          <p className="text-sm text-gray-600">{age} days old • {batch.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
