/**
 * Geocoding utility for NatalEngine
 * Works in both browser and Node.js environments
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Check if a date falls within US Daylight Saving Time
 * US DST rules:
 * - 2007+: Second Sunday in March to First Sunday in November
 * - 1987-2006: First Sunday in April to Last Sunday in October
 * - 1967-1986: Last Sunday in April to Last Sunday in October
 * - Before 1967: Varied by state, generally no standard DST
 */
function isUSDST(year, month, day) {
  if (year < 1967) return false; // No standard DST before 1967

  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 = Sunday

  let dstStart, dstEnd;

  if (year >= 2007) {
    // Second Sunday in March
    dstStart = new Date(year, 2, 8 + (7 - new Date(year, 2, 8).getDay()) % 7);
    // First Sunday in November
    dstEnd = new Date(year, 10, 1 + (7 - new Date(year, 10, 1).getDay()) % 7);
  } else if (year >= 1987) {
    // First Sunday in April
    dstStart = new Date(year, 3, 1 + (7 - new Date(year, 3, 1).getDay()) % 7);
    // Last Sunday in October
    dstEnd = new Date(year, 9, 31 - new Date(year, 9, 31).getDay());
  } else {
    // 1967-1986: Last Sunday in April to Last Sunday in October
    dstStart = new Date(year, 3, 30 - new Date(year, 3, 30).getDay());
    dstEnd = new Date(year, 9, 31 - new Date(year, 9, 31).getDay());
  }

  return date >= dstStart && date < dstEnd;
}

/**
 * Check if a date falls within EU/UK Daylight Saving Time
 * EU DST: Last Sunday in March to Last Sunday in October (since 1981)
 */
function isEUDST(year, month, day) {
  if (year < 1981) return false;

  const date = new Date(year, month - 1, day);

  // Last Sunday in March
  const dstStart = new Date(year, 2, 31 - new Date(year, 2, 31).getDay());
  // Last Sunday in October
  const dstEnd = new Date(year, 9, 31 - new Date(year, 9, 31).getDay());

  return date >= dstStart && date < dstEnd;
}

/**
 * US states that don't observe DST
 */
const US_NO_DST_STATES = ['Arizona', 'Hawaii'];

/**
 * Determine if DST should be applied for a location and date
 * @param {string} country - Country name
 * @param {string} region - State/province name
 * @param {number} year - Birth year
 * @param {number} month - Birth month (1-12)
 * @param {number} day - Birth day
 * @returns {boolean} Whether DST is in effect
 */
export function isDSTForDate(country, region, year, month, day) {
  const countryLower = (country || '').toLowerCase();
  const regionLower = (region || '').toLowerCase();

  // United States
  if (countryLower.includes('united states') || countryLower === 'usa' || countryLower === 'us') {
    // Check for states that don't observe DST
    if (US_NO_DST_STATES.some(s => regionLower.includes(s.toLowerCase()))) {
      return false;
    }
    return isUSDST(year, month, day);
  }

  // Canada (most provinces follow US rules)
  if (countryLower.includes('canada')) {
    // Saskatchewan doesn't observe DST (mostly)
    if (regionLower.includes('saskatchewan')) {
      return false;
    }
    return isUSDST(year, month, day);
  }

  // European countries
  const euCountries = ['united kingdom', 'uk', 'england', 'scotland', 'wales', 'ireland',
    'france', 'germany', 'spain', 'italy', 'netherlands', 'belgium', 'portugal',
    'sweden', 'norway', 'denmark', 'finland', 'poland', 'austria', 'switzerland',
    'czech', 'greece', 'hungary', 'romania', 'bulgaria'];

  if (euCountries.some(c => countryLower.includes(c))) {
    return isEUDST(year, month, day);
  }

  // Australia (reverse seasons - October to April)
  if (countryLower.includes('australia')) {
    // Not all states observe DST
    const noDstStates = ['queensland', 'northern territory', 'western australia'];
    if (noDstStates.some(s => regionLower.includes(s))) {
      return false;
    }
    // Australian DST: First Sunday in October to First Sunday in April
    if (year >= 2008) {
      const date = new Date(year, month - 1, day);
      const dstStart = new Date(year, 9, 1 + (7 - new Date(year, 9, 1).getDay()) % 7);
      const dstEnd = new Date(year + 1, 3, 1 + (7 - new Date(year + 1, 3, 1).getDay()) % 7);
      const prevDstEnd = new Date(year, 3, 1 + (7 - new Date(year, 3, 1).getDay()) % 7);
      return date >= dstStart || date < prevDstEnd;
    }
  }

  // Default: no DST (conservative approach for unknown regions)
  return false;
}

/**
 * Geocode a location string to coordinates
 * @param {string} query - Location string (e.g., "Vida, OR" or "New York City")
 * @returns {Promise<{lat: number, lon: number, name: string, timezone: number}|null>}
 */
export async function geocode(query) {
  if (!query || query.trim().length < 2) {
    return null;
  }

  try {
    const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NatalEngine/1.0 (https://github.com/unforced/natalengine)'
      }
    });

    if (!response.ok) {
      console.error('Geocoding failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Estimate timezone from longitude (rough approximation)
    const timezone = Math.round(lon / 15);

    return {
      lat,
      lon,
      timezone,
      name: result.address?.city || result.address?.town || result.address?.village || result.name || query,
      region: result.address?.state || result.address?.region || '',
      country: result.address?.country || '',
      displayName: result.display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Search for location suggestions (for autocomplete)
 * @param {string} query - Partial location string
 * @returns {Promise<Array>}
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NatalEngine/1.0 (https://github.com/unforced/natalengine)'
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data.map(item => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      timezone: Math.round(parseFloat(item.lon) / 15),
      name: item.address?.city || item.address?.town || item.address?.village || item.name,
      region: item.address?.state || item.address?.region || '',
      country: item.address?.country || '',
      displayName: item.display_name
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

/**
 * Parse a location input that could be coordinates or a place name
 * @param {string|object} input - Either "lat,lon", {lat, lon}, or "City, State"
 * @returns {Promise<{lat: number, lon: number, timezone: number}|null>}
 */
export async function parseLocation(input) {
  // Already an object with lat/lon
  if (input && typeof input === 'object' && input.lat !== undefined && input.lon !== undefined) {
    return {
      lat: parseFloat(input.lat),
      lon: parseFloat(input.lon),
      timezone: input.timezone ?? Math.round(parseFloat(input.lon) / 15)
    };
  }

  // String input
  if (typeof input === 'string') {
    // Check if it's coordinates (e.g., "40.7128, -74.0060" or "40.7128,-74.0060")
    const coordMatch = input.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return {
          lat,
          lon,
          timezone: Math.round(lon / 15)
        };
      }
    }

    // Otherwise, geocode the string
    return await geocode(input);
  }

  return null;
}

export default { geocode, searchLocations, parseLocation, isDSTForDate };
