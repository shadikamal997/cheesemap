// France bounding box coordinates
export const FRANCE_BOUNDS = {
  north: 51.5,
  south: 41.0,
  east: 10.0,
  west: -5.0,
};

// France center coordinates (approximate)
export const FRANCE_CENTER = {
  latitude: 46.603354,
  longitude: 1.888334,
};

// Check if coordinates are within France
export function isInFrance(latitude: number, longitude: number): boolean {
  return (
    latitude >= FRANCE_BOUNDS.south &&
    latitude <= FRANCE_BOUNDS.north &&
    longitude >= FRANCE_BOUNDS.west &&
    longitude <= FRANCE_BOUNDS.east
  );
}

// Validate French postal code
export function isValidFrenchPostalCode(postalCode: string): boolean {
  return /^[0-9]{5}$/.test(postalCode);
}

// Get region from postal code (simplified)
export function getRegionFromPostalCode(postalCode: string): string | null {
  const code = parseInt(postalCode.substring(0, 2));
  
  // Simplified mapping - in production, use a complete database
  if ([14, 27, 50, 61, 76].includes(code)) return "Normandie";
  if ([1, 3, 7, 15, 26, 38, 42, 43, 63, 69, 73, 74].includes(code)) return "Auvergne-Rhône-Alpes";
  if ([21, 25, 39, 58, 70, 71, 89, 90].includes(code)) return "Bourgogne-Franche-Comté";
  if ([22, 29, 35, 56].includes(code)) return "Bretagne";
  if ([16, 17, 19, 23, 24, 33, 40, 47, 64, 79, 86, 87].includes(code)) return "Nouvelle-Aquitaine";
  
  return null;
}

// Validate business is in France
export function validateFranceOnly(data: {
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}): { valid: boolean; error?: string } {
  if (data.country && data.country !== "FR") {
    return { valid: false, error: "Only French businesses are allowed" };
  }

  if (data.postalCode && !isValidFrenchPostalCode(data.postalCode)) {
    return { valid: false, error: "Invalid French postal code" };
  }

  if (data.latitude !== undefined && data.longitude !== undefined) {
    if (!isInFrance(data.latitude, data.longitude)) {
      return { valid: false, error: "Location must be within France" };
    }
  }

  return { valid: true };
}
