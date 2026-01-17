"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Business {
  id: string;
  displayName: string;
  type: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  avgRating?: number;
  reviewCount?: number;
  specialties?: Array<{ cheeseName: string; isSignature: boolean }>;
}

interface MapFilters {
  type?: string;
  region?: string;
}

export default function CheeseMap({ filters }: { filters?: MapFilters }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch businesses based on map bounds
  const fetchBusinesses = async () => {
    if (!map.current) return;

    try {
      setLoading(true);
      const bounds = map.current.getBounds();
      const center = map.current.getCenter();

      if (!bounds) return; // Map not fully loaded yet

      // Calculate approximate radius from bounds
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const lat1 = sw.lat;
      const lon1 = sw.lng;
      const lat2 = ne.lat;
      const lon2 = ne.lng;
      
      // Haversine formula for approximate radius
      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const radius = R * c / 2; // Divide by 2 to get radius instead of diameter

      // Build query params
      const params = new URLSearchParams({
        lat: center.lat.toString(),
        lng: center.lng.toString(),
        radius: Math.min(radius, 100).toString(), // Cap at 100km
        limit: '100',
      });

      if (filters?.type) {
        params.append('type', filters.type);
      }
      if (filters?.region) {
        params.append('region', filters.region);
      }

      const response = await fetch(`/api/businesses?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      // Failed to fetch businesses
    } finally {
      setLoading(false);
    }
  };

  // Update markers when businesses change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    businesses.forEach(business => {
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      
      // Different colors for shops vs farms
      const bgColor = business.type === 'SHOP' ? '#ea580c' : '#16a34a';
      const icon = business.type === 'SHOP' ? '🧀' : '🚜';
      
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${bgColor};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          ${icon}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([business.longitude, business.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${business.displayName}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${business.city}, ${business.region}</p>
              ${business.avgRating ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                  <span style="color: #f59e0b;">★</span>
                  <span style="font-size: 14px; font-weight: 600;">${business.avgRating.toFixed(1)}</span>
                  <span style="font-size: 12px; color: #666;">(${business.reviewCount} reviews)</span>
                </div>
              ` : ''}
              ${business.specialties && business.specialties.length > 0 ? `
                <div style="margin-top: 8px;">
                  <p style="font-size: 11px; color: #666; margin-bottom: 4px;">Specialties:</p>
                  ${business.specialties.map(s => `
                    <span style="display: inline-block; background: #fed7aa; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin: 2px;">
                      ${s.cheeseName}${s.isSignature ? ' ⭐' : ''}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
              <a href="/businesses/${business.id}" style="display: block; margin-top: 8px; color: #ea580c; font-size: 12px; font-weight: 600;">
                View Details →
              </a>
            </div>
          `)
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [businesses]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setMapError("NEXT_PUBLIC_MAPBOX_TOKEN is not configured");
      return;
    }

    if (map.current) return; // Initialize map only once

    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [2.3522, 48.8566], // Paris
        zoom: 5,
        maxBounds: [[-5.0, 41.0], [10.0, 51.5]], // France bounds
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocation control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'top-right'
      );

      // Fetch initial businesses
      map.current.on('load', () => {
        fetchBusinesses();
      });

      // Fetch businesses on map move (with debounce)
      let moveTimeout: NodeJS.Timeout;
      map.current.on('moveend', () => {
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
          fetchBusinesses();
        }, 500);
      });

    } catch (error) {
      setMapError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        markers.current.forEach(marker => marker.remove());
        markers.current = [];
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (map.current) {
      fetchBusinesses();
    }
  }, [filters]);

  if (mapError) {
    return (
      <div className="w-full h-full relative">
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-semibold mb-2">🗺️ Cheese Map</p>
            <p className="text-sm">{mapError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading businesses...</span>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
