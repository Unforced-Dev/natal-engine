/**
 * Vedic (Jyotish) Astrology Calculator
 *
 * Implements Sidereal zodiac calculations using Lahiri Ayanamsa,
 * the official ayanamsa adopted by the Indian government.
 *
 * Features:
 * - Lahiri Ayanamsa calculation (Chitrapaksha)
 * - Sidereal planetary positions
 * - 27 Nakshatras with padas and lords
 * - Vimshottari Dasha system (120-year cycle)
 * - Whole sign house system (Rashi-based)
 *
 * References:
 * - Indian Calendar Reform Committee (1955)
 * - Lahiri ephemeris standards
 */

import { calculateBirthPositions, dateToJulianDay, formatDegree } from './astronomy.js';

// ============================================================================
// AYANAMSA CALCULATION
// ============================================================================

/**
 * Calculate Lahiri (Chitrapaksha) Ayanamsa
 *
 * Based on Spica (Chitra) at exactly 0° Libra
 * Reference: Indian Calendar Reform Committee, 1955
 *
 * The official Lahiri ayanamsa was fixed at 23°15'00" on March 21, 1956
 *
 * Formula derived from:
 * - Base value: 23°51'25" at J2000.0 (Jan 1, 2000)
 * - Precession rate: 50.291" per year + 1.11161" per century (second order)
 *
 * @param {number} jd - Julian Day number
 * @returns {number} Ayanamsa in degrees
 */
export function calculateLahiriAyanamsa(jd) {
  // Julian centuries from J2000.0 (Jan 1, 2000, 12:00 TT)
  const T = (jd - 2451545.0) / 36525;

  // Lahiri ayanamsa at J2000.0: 23°51'25" = 23.856944°
  // This is computed backwards from the 1956 reference point
  const ayanamsaJ2000 = 23.856944;

  // Annual precession in degrees (50.291 arcseconds = 0.01397° per year)
  // Plus second-order term (1.11161 arcseconds per century squared)
  const precessionPerYear = 50.291 / 3600; // Convert arcseconds to degrees
  const secondOrderTerm = 1.11161 / 3600 / 100; // Per century squared

  // Years since J2000.0
  const years = T * 100;

  // Calculate ayanamsa with linear and second-order terms
  const ayanamsa = ayanamsaJ2000 + (precessionPerYear * years) + (secondOrderTerm * T * T);

  return ayanamsa;
}

/**
 * Get ayanamsa for a specific date
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {number} hour
 * @returns {number} Ayanamsa in degrees
 */
export function getAyanamsaForDate(year, month, day, hour = 12) {
  const jd = dateToJulianDay(year, month, day, hour);
  return calculateLahiriAyanamsa(jd);
}

// ============================================================================
// SIDEREAL POSITION CONVERSION
// ============================================================================

/**
 * Convert tropical longitude to sidereal longitude
 * @param {number} tropicalLongitude - Tropical (Western) longitude in degrees
 * @param {number} ayanamsa - Ayanamsa value in degrees
 * @returns {number} Sidereal longitude (0-360)
 */
export function tropicalToSidereal(tropicalLongitude, ayanamsa) {
  let siderealLong = tropicalLongitude - ayanamsa;
  // Normalize to 0-360
  if (siderealLong < 0) siderealLong += 360;
  if (siderealLong >= 360) siderealLong -= 360;
  return siderealLong;
}

// ============================================================================
// RASHIS (VEDIC ZODIAC SIGNS)
// ============================================================================

/**
 * The 12 Rashis (Vedic zodiac signs)
 * Same as Western signs but use sidereal positions
 */
export const RASHIS = [
  { name: 'Mesha', westernName: 'Aries', symbol: '♈', ruler: 'Mars', element: 'Fire', quality: 'Movable' },
  { name: 'Vrishabha', westernName: 'Taurus', symbol: '♉', ruler: 'Venus', element: 'Earth', quality: 'Fixed' },
  { name: 'Mithuna', westernName: 'Gemini', symbol: '♊', ruler: 'Mercury', element: 'Air', quality: 'Dual' },
  { name: 'Karka', westernName: 'Cancer', symbol: '♋', ruler: 'Moon', element: 'Water', quality: 'Movable' },
  { name: 'Simha', westernName: 'Leo', symbol: '♌', ruler: 'Sun', element: 'Fire', quality: 'Fixed' },
  { name: 'Kanya', westernName: 'Virgo', symbol: '♍', ruler: 'Mercury', element: 'Earth', quality: 'Dual' },
  { name: 'Tula', westernName: 'Libra', symbol: '♎', ruler: 'Venus', element: 'Air', quality: 'Movable' },
  { name: 'Vrishchika', westernName: 'Scorpio', symbol: '♏', ruler: 'Mars', element: 'Water', quality: 'Fixed' },
  { name: 'Dhanu', westernName: 'Sagittarius', symbol: '♐', ruler: 'Jupiter', element: 'Fire', quality: 'Dual' },
  { name: 'Makara', westernName: 'Capricorn', symbol: '♑', ruler: 'Saturn', element: 'Earth', quality: 'Movable' },
  { name: 'Kumbha', westernName: 'Aquarius', symbol: '♒', ruler: 'Saturn', element: 'Air', quality: 'Fixed' },
  { name: 'Meena', westernName: 'Pisces', symbol: '♓', ruler: 'Jupiter', element: 'Water', quality: 'Dual' }
];

/**
 * Get Rashi (Vedic sign) from sidereal longitude
 * @param {number} siderealLongitude - Sidereal longitude in degrees (0-360)
 * @returns {Object} Rashi information
 */
export function getRashi(siderealLongitude) {
  const index = Math.floor(siderealLongitude / 30) % 12;
  const degreeInSign = siderealLongitude % 30;
  return {
    ...RASHIS[index],
    index: index + 1, // 1-based house number
    degreeInSign
  };
}

// ============================================================================
// NAKSHATRAS (27 LUNAR MANSIONS)
// ============================================================================

/**
 * The 27 Nakshatras
 * Each nakshatra spans 13°20' (13.333...°)
 * Each nakshatra has 4 padas of 3°20' each
 */
export const NAKSHATRAS = [
  { number: 1, name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse head' },
  { number: 2, name: 'Bharani', lord: 'Venus', deity: 'Yama', symbol: 'Yoni' },
  { number: 3, name: 'Krittika', lord: 'Sun', deity: 'Agni', symbol: 'Razor/flame' },
  { number: 4, name: 'Rohini', lord: 'Moon', deity: 'Brahma', symbol: 'Cart/chariot' },
  { number: 5, name: 'Mrigashira', lord: 'Mars', deity: 'Soma', symbol: 'Deer head' },
  { number: 6, name: 'Ardra', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop' },
  { number: 7, name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', symbol: 'Bow/quiver' },
  { number: 8, name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', symbol: 'Flower/circle' },
  { number: 9, name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas', symbol: 'Serpent' },
  { number: 10, name: 'Magha', lord: 'Ketu', deity: 'Pitris', symbol: 'Throne' },
  { number: 11, name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', symbol: 'Hammock' },
  { number: 12, name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', symbol: 'Bed' },
  { number: 13, name: 'Hasta', lord: 'Moon', deity: 'Savitar', symbol: 'Hand' },
  { number: 14, name: 'Chitra', lord: 'Mars', deity: 'Vishvakarma', symbol: 'Pearl' },
  { number: 15, name: 'Swati', lord: 'Rahu', deity: 'Vayu', symbol: 'Coral' },
  { number: 16, name: 'Vishakha', lord: 'Jupiter', deity: 'Indra-Agni', symbol: 'Archway' },
  { number: 17, name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', symbol: 'Lotus' },
  { number: 18, name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', symbol: 'Earring/umbrella' },
  { number: 19, name: 'Mula', lord: 'Ketu', deity: 'Nirriti', symbol: 'Roots' },
  { number: 20, name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', symbol: 'Fan' },
  { number: 21, name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvedevas', symbol: 'Elephant tusk' },
  { number: 22, name: 'Shravana', lord: 'Moon', deity: 'Vishnu', symbol: 'Ear/trident' },
  { number: 23, name: 'Dhanishtha', lord: 'Mars', deity: 'Vasus', symbol: 'Drum' },
  { number: 24, name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', symbol: 'Circle' },
  { number: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Sword' },
  { number: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhnya', symbol: 'Twins' },
  { number: 27, name: 'Revati', lord: 'Mercury', deity: 'Pushan', symbol: 'Fish/drum' }
];

/**
 * Calculate nakshatra from sidereal longitude
 * @param {number} siderealLongitude - Sidereal longitude (0-360)
 * @returns {Object} Nakshatra information with pada
 */
export function getNakshatra(siderealLongitude) {
  // Each nakshatra spans 13°20' = 13.33333...°
  const nakshatraSpan = 360 / 27; // 13.333...
  const padaSpan = nakshatraSpan / 4; // 3.333...

  const nakshatraIndex = Math.floor(siderealLongitude / nakshatraSpan);
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  // Calculate pada (1-4)
  const positionInNakshatra = siderealLongitude % nakshatraSpan;
  const pada = Math.floor(positionInNakshatra / padaSpan) + 1;

  // Calculate exact degree within nakshatra
  const degreeInNakshatra = positionInNakshatra;

  return {
    ...nakshatra,
    pada,
    degreeInNakshatra,
    startDegree: nakshatraIndex * nakshatraSpan,
    endDegree: (nakshatraIndex + 1) * nakshatraSpan
  };
}

// ============================================================================
// VIMSHOTTARI DASHA SYSTEM
// ============================================================================

/**
 * Vimshottari Dasha - 120 year planetary period system
 * Based on Moon's nakshatra at birth
 */
export const DASHA_YEARS = {
  'Ketu': 7,
  'Venus': 20,
  'Sun': 6,
  'Moon': 10,
  'Mars': 7,
  'Rahu': 18,
  'Jupiter': 16,
  'Saturn': 19,
  'Mercury': 17
};

// Order of Dasha lords (starting from Ketu)
export const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

/**
 * Calculate Vimshottari Maha Dasha periods
 * @param {Object} moonNakshatra - Moon's nakshatra info from getNakshatra()
 * @param {Date} birthDate - Date of birth
 * @returns {Object} Dasha information
 */
export function calculateVimshottariDasha(moonNakshatra, birthDate) {
  const birthLord = moonNakshatra.lord;

  // Find starting position in dasha order
  const startIndex = DASHA_ORDER.indexOf(birthLord);

  // Calculate how much of the first dasha has already elapsed
  // Based on Moon's position within the nakshatra
  const nakshatraSpan = 360 / 27;
  const proportionElapsed = moonNakshatra.degreeInNakshatra / nakshatraSpan;
  const firstDashaYears = DASHA_YEARS[birthLord];
  const yearsRemaining = firstDashaYears * (1 - proportionElapsed);

  // Build dasha timeline
  const dashas = [];
  let currentDate = new Date(birthDate);

  // First dasha (partial)
  const firstDashaEnd = new Date(currentDate);
  firstDashaEnd.setFullYear(firstDashaEnd.getFullYear() + Math.floor(yearsRemaining));
  firstDashaEnd.setMonth(firstDashaEnd.getMonth() + Math.round((yearsRemaining % 1) * 12));

  dashas.push({
    lord: birthLord,
    startDate: new Date(currentDate),
    endDate: firstDashaEnd,
    years: yearsRemaining,
    isPartial: true
  });

  currentDate = new Date(firstDashaEnd);

  // Subsequent full dashas (cycle through the order)
  for (let i = 1; i < 9; i++) {
    const lordIndex = (startIndex + i) % 9;
    const lord = DASHA_ORDER[lordIndex];
    const years = DASHA_YEARS[lord];

    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + years);

    dashas.push({
      lord,
      startDate: new Date(currentDate),
      endDate,
      years,
      isPartial: false
    });

    currentDate = new Date(endDate);
  }

  return {
    birthLord,
    proportionElapsed: proportionElapsed * 100, // Percentage
    yearsRemaining: Math.round(yearsRemaining * 100) / 100,
    dashas,
    totalCycleYears: 120
  };
}

/**
 * Find current dasha period for a given date
 * @param {Array} dashas - Dasha array from calculateVimshottariDasha
 * @param {Date} currentDate - Date to check
 * @returns {Object} Current maha dasha
 */
export function getCurrentDasha(dashas, currentDate = new Date()) {
  for (const dasha of dashas) {
    if (currentDate >= dasha.startDate && currentDate < dasha.endDate) {
      return dasha;
    }
  }
  return dashas[dashas.length - 1]; // Return last if beyond range
}

// ============================================================================
// MAIN VEDIC CHART CALCULATION
// ============================================================================

/**
 * Format sidereal degree as "DD°MM'" within sign
 * @param {number} siderealLongitude
 * @returns {string}
 */
export function formatSiderealDegree(siderealLongitude) {
  const withinSign = siderealLongitude % 30;
  const degrees = Math.floor(withinSign);
  const minutes = Math.round((withinSign - degrees) * 60);
  return `${degrees}°${String(minutes).padStart(2, '0')}'`;
}

/**
 * Calculate complete Vedic astrology chart
 *
 * @param {string} birthDate - ISO date string (YYYY-MM-DD)
 * @param {number} birthHour - Birth hour (0-24, decimal for minutes)
 * @param {number} timezone - Timezone offset from UTC
 * @param {number} latitude - Birth latitude (optional)
 * @param {number} longitude - Birth longitude (optional)
 * @returns {Object} Complete Vedic chart
 */
export function calculateVedic(birthDate, birthHour = 12, timezone = 0, latitude = null, longitude = null) {
  // Parse birth date
  const [year, month, day] = birthDate.split('-').map(Number);

  // Get tropical positions from existing calculator
  const tropicalPositions = calculateBirthPositions(year, month, day, birthHour, timezone, latitude, longitude);

  // Calculate ayanamsa for this date
  const ayanamsa = calculateLahiriAyanamsa(tropicalPositions.julianDay);

  // Convert all positions to sidereal
  const convertPosition = (planet, tropicalLong) => {
    const siderealLong = tropicalToSidereal(tropicalLong, ayanamsa);
    const rashi = getRashi(siderealLong);
    const nakshatra = getNakshatra(siderealLong);

    return {
      longitude: siderealLong,
      tropicalLongitude: tropicalLong,
      degree: formatSiderealDegree(siderealLong),
      rashi,
      nakshatra
    };
  };

  // Calculate sidereal positions for all planets
  const positions = {
    sun: convertPosition('sun', tropicalPositions.sun.longitude),
    moon: convertPosition('moon', tropicalPositions.moon.longitude),
    mercury: convertPosition('mercury', tropicalPositions.mercury.longitude),
    venus: convertPosition('venus', tropicalPositions.venus.longitude),
    mars: convertPosition('mars', tropicalPositions.mars.longitude),
    jupiter: convertPosition('jupiter', tropicalPositions.jupiter.longitude),
    saturn: convertPosition('saturn', tropicalPositions.saturn.longitude),
    rahu: convertPosition('rahu', tropicalPositions.northNode.longitude), // True North Node
    ketu: convertPosition('ketu', tropicalPositions.southNode.longitude)  // True South Node
  };

  // Add ascendant and midheaven if location provided
  if (tropicalPositions.ascendant) {
    positions.ascendant = convertPosition('ascendant', tropicalPositions.ascendant.longitude);
    positions.midheaven = convertPosition('midheaven', tropicalPositions.midheaven.longitude);
  }

  // Calculate Vimshottari Dasha based on Moon's nakshatra
  const birthDateObj = new Date(year, month - 1, day, Math.floor(birthHour), (birthHour % 1) * 60);
  const dasha = calculateVimshottariDasha(positions.moon.nakshatra, birthDateObj);

  // Calculate whole sign houses (based on Ascendant sign)
  let houses = null;
  if (positions.ascendant) {
    const ascendantSignIndex = positions.ascendant.rashi.index - 1;
    houses = {};
    for (let i = 0; i < 12; i++) {
      const houseNum = i + 1;
      const signIndex = (ascendantSignIndex + i) % 12;
      houses[houseNum] = {
        sign: RASHIS[signIndex],
        planets: []
      };
    }

    // Place planets in houses
    for (const [planet, data] of Object.entries(positions)) {
      if (planet !== 'ascendant' && planet !== 'midheaven') {
        const planetSignIndex = data.rashi.index - 1;
        const houseNum = ((planetSignIndex - ascendantSignIndex + 12) % 12) + 1;
        houses[houseNum].planets.push({
          name: planet,
          degree: data.degree,
          nakshatra: data.nakshatra.name
        });
      }
    }
  }

  // Find current dasha
  const currentDasha = getCurrentDasha(dasha.dashas);

  return {
    positions,
    ayanamsa: {
      value: Math.round(ayanamsa * 10000) / 10000,
      formatted: formatDegree(ayanamsa),
      system: 'Lahiri (Chitrapaksha)'
    },
    moonSign: {
      rashi: positions.moon.rashi,
      nakshatra: positions.moon.nakshatra,
      summary: `Moon in ${positions.moon.rashi.name} (${positions.moon.rashi.westernName}), ${positions.moon.nakshatra.name} Nakshatra`
    },
    dasha: {
      ...dasha,
      current: currentDasha
    },
    houses,
    julianDay: tropicalPositions.julianDay,
    hasLocation: latitude !== null && longitude !== null,
    system: 'Vedic (Jyotish)',
    note: 'Sidereal calculations using Lahiri Ayanamsa'
  };
}

export default calculateVedic;
