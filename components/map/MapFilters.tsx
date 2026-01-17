"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface MapFiltersProps {
  onFiltersChange?: (filters: { type?: string; region?: string }) => void;
  onSearchSelect?: (result: any) => void;
}

export default function MapFilters({ onFiltersChange, onSearchSelect }: MapFiltersProps) {
  const [filters, setFilters] = useState({
    region: "",
    type: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const regions = [
    "Normandie",
    "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Nouvelle-Aquitaine",
    "Île-de-France",
    "Provence-Alpes-Côte d'Azur",
    "Occitanie",
    "Grand Est",
    "Hauts-de-France",
    "Pays de la Loire",
    "Centre-Val de Loire",
    "Corse",
  ];

  // Notify parent of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        type: filters.type || undefined,
        region: filters.region || undefined,
      });
    }
  }, [filters, onFiltersChange]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=business&limit=10`);
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || []);
          setShowResults(true);
        }
      } catch (error) {
        // Search failed
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSelect = (result: any) => {
    setSearchQuery('');
    setShowResults(false);
    if (onSearchSelect) {
      onSearchSelect(result);
    }
  };

  const handleReset = () => {
    setFilters({ region: "", type: "" });
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Discover Cheese</h2>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Search shops, cities, regions..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          {searchLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSearchSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">
                    {result.type === 'SHOP' ? '🧀' : result.type === 'FARM' ? '🚜' : '📍'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {result.displayName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {result.city}, {result.region}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Business Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">All Types</option>
            <option value="SHOP">Cheese Shops</option>
            <option value="FARM">Farms & Producers</option>
          </select>
        </div>

        {/* Reset Button */}
        <button 
          onClick={handleReset}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
        >
          Reset Filters
        </button>

        {/* Results Count */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            Pan and zoom the map to discover cheese shops and farms across France
          </p>
        </div>
      </div>
    </div>
  );
}
