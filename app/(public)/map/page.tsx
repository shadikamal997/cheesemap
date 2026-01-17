"use client";

import { useState, useRef } from "react";
import CheeseMap from "@/components/map/CheeseMap";
import MapFilters from "@/components/map/MapFilters";
import mapboxgl from "mapbox-gl";

export default function MapPage() {
  const [filters, setFilters] = useState<{ type?: string; region?: string }>({});
  const mapRef = useRef<any>(null);

  const handleSearchSelect = (result: any) => {
    // This will be called when a search result is selected
    // We'll need to fly to the location
    if (result.latitude && result.longitude) {
      // Create a custom event to notify the map component
      const event = new CustomEvent('flyToLocation', {
        detail: {
          lng: result.longitude,
          lat: result.latitude,
          zoom: 14,
        }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="h-screen pt-16">
      <div className="flex h-full">
        <aside className="w-80 bg-white border-r overflow-y-auto">
          <MapFilters 
            onFiltersChange={setFilters}
            onSearchSelect={handleSearchSelect}
          />
        </aside>
        <main className="flex-1">
          <CheeseMap filters={filters} />
        </main>
      </div>
    </div>
  );
}
