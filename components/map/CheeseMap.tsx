"use client";

import { useEffect, useRef } from "react";

export default function CheeseMap() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Initialize Mapbox map
    // This requires NEXT_PUBLIC_MAPBOX_TOKEN in .env
    // Example:
    // mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    // const map = new mapboxgl.Map({
    //   container: mapContainer.current!,
    //   style: 'mapbox://styles/mapbox/streets-v12',
    //   center: [2.3522, 48.8566], // Paris
    //   zoom: 5,
    //   maxBounds: [[-5.0, 41.0], [10.0, 51.5]], // France bounds
    // });
  }, []);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainer}
        className="w-full h-full bg-gray-100 flex items-center justify-center"
      >
        {/* Placeholder until Mapbox is configured */}
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold mb-2">🗺️ Cheese Map</p>
          <p className="text-sm">Configure NEXT_PUBLIC_MAPBOX_TOKEN to see the interactive map</p>
        </div>
      </div>
    </div>
  );
}
