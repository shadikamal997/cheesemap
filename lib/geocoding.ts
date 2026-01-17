/**
 * Geocoding utilities for converting French addresses to coordinates
 * Uses the French government's free Address API (api-adresse.data.gouv.fr)
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  confidence: number;
}

export interface GeocodingError {
  message: string;
  code: 'NETWORK_ERROR' | 'NO_RESULTS' | 'INVALID_ADDRESS' | 'NOT_IN_FRANCE';
}

/**
 * Geocode a French address using the government's Address API
 */
export async function geocodeAddress(
  address: string,
  city: string,
  postalCode: string
): Promise<{ success: true; data: GeocodingResult } | { success: false; error: GeocodingError }> {
  try {
    // Build query string
    const query = `${address}, ${postalCode} ${city}, France`;
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`;

    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        success: false,
        error: {
          message: 'Failed to connect to geocoding service',
          code: 'NETWORK_ERROR'
        }
      };
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return {
        success: false,
        error: {
          message: 'Address not found. Please verify the address, city, and postal code.',
          code: 'NO_RESULTS'
        }
      };
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.geometry.coordinates;

    // Validate coordinates are in France (rough bounding box)
    if (latitude < 41 || latitude > 51 || longitude < -5 || longitude > 10) {
      return {
        success: false,
        error: {
          message: 'Address appears to be outside of France',
          code: 'NOT_IN_FRANCE'
        }
      };
    }

    return {
      success: true,
      data: {
        latitude,
        longitude,
        formattedAddress: feature.properties.label,
        confidence: feature.properties.score
      }
    };

  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred while geocoding the address',
        code: 'NETWORK_ERROR'
      }
    };
  }
}

/**
 * Validate that coordinates are within France
 */
export function isInFrance(latitude: number, longitude: number): boolean {
  return latitude >= 41 && latitude <= 51 && longitude >= -5 && longitude <= 10;
}
