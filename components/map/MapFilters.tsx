"use client";

import { useState } from "react";

export default function MapFilters() {
  const [filters, setFilters] = useState({
    region: "",
    type: "",
    milkType: "",
  });

  const regions = [
    "Normandie",
    "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Nouvelle-Aquitaine",
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Filter Cheese Map</h2>

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
            <option value="shop">Cheese Shops</option>
            <option value="farm">Farms & Producers</option>
            <option value="tour">Tours Available</option>
          </select>
        </div>

        {/* Milk Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Milk Type
          </label>
          <div className="space-y-2">
            {["Cow", "Goat", "Sheep", "Buffalo"].map((milk) => (
              <label key={milk} className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">{milk}</span>
              </label>
            ))}
          </div>
        </div>

        {/* AOC/PDO Filter */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-700">AOC/PDO Only</span>
          </label>
        </div>

        {/* Reset Button */}
        <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
          Reset Filters
        </button>
      </div>
    </div>
  );
}
