/**
 * Astrology Synastry Calculator
 *
 * Calculates compatibility between two natal charts:
 * - Cross-chart aspects (synastry)
 * - Element harmony
 * - Key romantic/relationship connections
 * - Overall compatibility scoring
 */

import { ZODIAC_SIGNS, ELEMENTS, ASPECTS, PLANET_SYMBOLS } from '../astrology.js';

// Element compatibility matrix (0-1 scale)
const ELEMENT_COMPATIBILITY = {
  Fire: { Fire: 0.85, Earth: 0.5, Air: 0.8, Water: 0.4 },
  Earth: { Fire: 0.5, Earth: 0.85, Air: 0.5, Water: 0.8 },
  Air: { Fire: 0.8, Air: 0.85, Earth: 0.5, Water: 0.5 },
  Water: { Fire: 0.4, Earth: 0.8, Air: 0.5, Water: 0.85 }
};

// Modality compatibility
const MODALITY_COMPATIBILITY = {
  Cardinal: { Cardinal: 0.6, Fixed: 0.7, Mutable: 0.8 },
  Fixed: { Cardinal: 0.7, Fixed: 0.6, Mutable: 0.8 },
  Mutable: { Cardinal: 0.8, Fixed: 0.8, Mutable: 0.7 }
};

// Aspect harmony scores (positive = harmonious, negative = challenging)
const ASPECT_HARMONY = {
  conjunction: 0.8,   // Powerful fusion
  trine: 1.0,         // Natural flow
  sextile: 0.7,       // Opportunity
  opposition: -0.3,   // Tension but awareness
  square: -0.5,       // Challenge
  quincunx: -0.2,     // Adjustment needed
  semisextile: 0.3,   // Mild positive
  semisquare: -0.3,   // Minor friction
  sesquiquadrate: -0.3,
  quintile: 0.5,      // Creative
  biquintile: 0.5
};

// Connection importance weights for scoring
const CONNECTION_WEIGHTS = {
  'sun-moon': 0.15,      // Core emotional connection
  'moon-moon': 0.10,     // Emotional harmony
  'venus-mars': 0.12,    // Physical/romantic attraction
  'venus-venus': 0.08,   // Shared values/aesthetics
  'sun-sun': 0.08,       // Identity compatibility
  'sun-ascendant': 0.06, // First impression/identity
  'moon-venus': 0.08,    // Emotional/romantic
  'mars-mars': 0.05,     // Energy/conflict style
  'mercury-mercury': 0.05, // Communication
  'jupiter-saturn': 0.03,  // Growth vs structure
  'other': 0.20          // All other aspects combined
};

/**
 * Calculate angular difference between two longitudes (0-180)
 */
function angularDifference(long1, long2) {
  let diff = Math.abs(long1 - long2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Find aspect between two planets
 */
function findAspect(planet1Name, planet1Long, planet2Name, planet2Long, includeMinor = true) {
  const diff = angularDifference(planet1Long, planet2Long);

  for (const [aspectName, aspect] of Object.entries(ASPECTS)) {
    if (!includeMinor && aspect.nature === 'minor') continue;

    const orb = Math.abs(diff - aspect.angle);
    if (orb <= aspect.orb) {
      return {
        planetA: planet1Name,
        planetB: planet2Name,
        aspect: aspectName,
        symbol: aspect.symbol,
        angle: aspect.angle,
        orb: Math.round(orb * 100) / 100,
        nature: aspect.nature,
        meaning: aspect.meaning,
        harmony: ASPECT_HARMONY[aspectName] || 0
      };
    }
  }

  return null;
}

/**
 * Get all planet positions from a chart
 */
function extractPositions(chart) {
  const positions = {};

  // Main luminaries
  if (chart.sun?.longitude !== undefined) {
    positions.sun = { longitude: chart.sun.longitude, sign: chart.sun.sign?.name || chart.sun.sign };
  }
  if (chart.moon?.longitude !== undefined) {
    positions.moon = { longitude: chart.moon.longitude, sign: chart.moon.sign?.name || chart.moon.sign };
  }

  // Rising
  if (chart.rising?.longitude !== undefined) {
    positions.ascendant = { longitude: chart.rising.longitude, sign: chart.rising.sign?.name || chart.rising.sign };
  }

  // Planets
  if (chart.planets) {
    for (const [name, data] of Object.entries(chart.planets)) {
      if (data?.longitude !== undefined) {
        positions[name] = { longitude: data.longitude, sign: data.sign?.name || data.sign };
      }
    }
  }

  // Nodes
  if (chart.nodes?.north?.longitude !== undefined) {
    positions.northNode = { longitude: chart.nodes.north.longitude, sign: chart.nodes.north.sign?.name || chart.nodes.north.sign };
  }

  // Midheaven
  if (chart.midheaven?.longitude !== undefined) {
    positions.midheaven = { longitude: chart.midheaven.longitude, sign: chart.midheaven.sign?.name || chart.midheaven.sign };
  }

  return positions;
}

/**
 * Calculate all synastry aspects between two charts
 */
function calculateSynastryAspects(chartA, chartB, includeMinor = false) {
  const positionsA = extractPositions(chartA);
  const positionsB = extractPositions(chartB);
  const aspects = [];

  const planetOrder = ['sun', 'moon', 'ascendant', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'midheaven'];

  for (const planetA of planetOrder) {
    if (!positionsA[planetA]) continue;

    for (const planetB of planetOrder) {
      if (!positionsB[planetB]) continue;

      const aspect = findAspect(
        planetA,
        positionsA[planetA].longitude,
        planetB,
        positionsB[planetB].longitude,
        includeMinor
      );

      if (aspect) {
        aspect.personA = planetA;
        aspect.personB = planetB;
        aspect.signA = positionsA[planetA].sign;
        aspect.signB = positionsB[planetB].sign;
        aspect.symbolA = PLANET_SYMBOLS[planetA] || planetA;
        aspect.symbolB = PLANET_SYMBOLS[planetB] || planetB;
        aspects.push(aspect);
      }
    }
  }

  // Sort by importance (key aspects first, then by orb)
  const keyPairs = ['sun-moon', 'moon-sun', 'venus-mars', 'mars-venus', 'sun-sun', 'moon-moon', 'venus-venus'];
  aspects.sort((a, b) => {
    const pairA = `${a.personA}-${a.personB}`;
    const pairB = `${b.personA}-${b.personB}`;
    const isKeyA = keyPairs.includes(pairA);
    const isKeyB = keyPairs.includes(pairB);
    if (isKeyA && !isKeyB) return -1;
    if (!isKeyA && isKeyB) return 1;
    return a.orb - b.orb;
  });

  return aspects;
}

/**
 * Analyze element harmony between two charts
 */
function analyzeElementHarmony(chartA, chartB) {
  // Get dominant elements from each chart
  const elementsA = chartA.balance?.elements || {};
  const elementsB = chartB.balance?.elements || {};

  // Find dominant element for each person
  const getDominant = (elements) => {
    let max = 0;
    let dominant = 'Fire';
    for (const [el, count] of Object.entries(elements)) {
      if (count > max) {
        max = count;
        dominant = el;
      }
    }
    return dominant;
  };

  const dominantA = chartA.balance?.dominantElement?.name || getDominant(elementsA);
  const dominantB = chartB.balance?.dominantElement?.name || getDominant(elementsB);

  const compatibility = ELEMENT_COMPATIBILITY[dominantA]?.[dominantB] || 0.5;

  // Describe the combination
  let description;
  if (dominantA === dominantB) {
    description = `Both share ${dominantA} element - natural understanding but may lack balance`;
  } else if (compatibility >= 0.8) {
    description = `${dominantA} and ${dominantB} complement each other beautifully`;
  } else if (compatibility >= 0.5) {
    description = `${dominantA} and ${dominantB} have different priorities but can learn from each other`;
  } else {
    description = `${dominantA} and ${dominantB} are challenging but transformative together`;
  }

  return {
    personA: { dominant: dominantA, elements: elementsA },
    personB: { dominant: dominantB, elements: elementsB },
    compatibility,
    description
  };
}

/**
 * Identify key romantic/relationship connections
 */
function findKeyConnections(aspects) {
  const connections = {
    sunMoon: null,     // Person A's Sun to Person B's Moon or vice versa
    moonMoon: null,    // Moon-Moon aspect
    venusMars: null,   // Venus-Mars attraction
    venusVenus: null,  // Shared values
    sunSun: null,      // Identity connection
    moonVenus: null,   // Emotional-romantic
    mercuryMercury: null // Communication style
  };

  for (const aspect of aspects) {
    const pair = `${aspect.personA}-${aspect.personB}`;
    const reversePair = `${aspect.personB}-${aspect.personA}`;

    // Sun-Moon (either direction)
    if ((pair === 'sun-moon' || pair === 'moon-sun') && !connections.sunMoon) {
      connections.sunMoon = {
        ...aspect,
        meaning: aspect.harmony > 0
          ? 'Strong emotional-identity bond; you feel seen and understood'
          : 'Tension between core identity and emotional needs; growth opportunity'
      };
    }

    // Moon-Moon
    if (pair === 'moon-moon' && !connections.moonMoon) {
      connections.moonMoon = {
        ...aspect,
        meaning: aspect.harmony > 0
          ? 'Emotional wavelengths align; intuitive understanding'
          : 'Different emotional rhythms; need patience and communication'
      };
    }

    // Venus-Mars
    if ((pair === 'venus-mars' || pair === 'mars-venus') && !connections.venusMars) {
      connections.venusMars = {
        ...aspect,
        meaning: aspect.harmony > 0
          ? 'Strong romantic/physical attraction; magnetic pull'
          : 'Passionate but potentially volatile attraction; exciting friction'
      };
    }

    // Venus-Venus
    if (pair === 'venus-venus' && !connections.venusVenus) {
      connections.venusVenus = {
        ...aspect,
        meaning: aspect.harmony > 0
          ? 'Shared aesthetic sense and values; harmonious lifestyle'
          : 'Different love languages; requires compromise on preferences'
      };
    }

    // Sun-Sun
    if (pair === 'sun-sun' && !connections.sunSun) {
      connections.sunSun = {
        ...aspect,
        meaning: aspect.harmony > 0
          ? 'Core identities resonate; mutual respect and admiration'
          : 'Ego clashes possible; need to honor each other\'s individuality'
      };
    }

    // Moon-Venus (either direction)
    if ((pair === 'moon-venus' || pair === 'venus-moon') && !connections.moonVenus) {
      connections.moonVenus = {
        ...aspect,
        meaning: aspect.harmony > 0
          ? 'Tender emotional-romantic connection; nurturing love'
          : 'Emotional needs may clash with romantic expression'
      };
    }

    // Mercury-Mercury
    if (pair === 'mercury-mercury' && !connections.mercuryMercury) {
      connections.mercuryMercury = {
        ...aspect,
        meaning: aspect.harmony > 0
          ? 'Easy communication; understand each other\'s thought process'
          : 'Different communication styles; be mindful of misunderstandings'
      };
    }
  }

  return connections;
}

/**
 * Calculate overall compatibility score
 */
function calculateScore(aspects, elementHarmony, keyConnections) {
  let score = 50; // Start at neutral

  // Add element harmony contribution (15%)
  score += (elementHarmony.compatibility - 0.5) * 30;

  // Add key connection contributions
  for (const [key, connection] of Object.entries(keyConnections)) {
    if (connection) {
      const weight = CONNECTION_WEIGHTS[key.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()] || 0.03;
      score += connection.harmony * weight * 100;
    }
  }

  // Add general aspect contributions
  let aspectScore = 0;
  let aspectCount = 0;
  for (const aspect of aspects) {
    aspectScore += aspect.harmony;
    aspectCount++;
  }
  if (aspectCount > 0) {
    score += (aspectScore / aspectCount) * 20;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate summary text
 */
function generateSummary(score, elementHarmony, keyConnections, aspectCount) {
  const parts = [];

  // Overall rating
  if (score >= 80) {
    parts.push('Highly compatible connection with natural harmony.');
  } else if (score >= 65) {
    parts.push('Strong compatibility with good potential for growth together.');
  } else if (score >= 50) {
    parts.push('Moderate compatibility - balance of harmony and challenge.');
  } else if (score >= 35) {
    parts.push('Challenging but potentially transformative connection.');
  } else {
    parts.push('Significant differences - requires conscious effort and understanding.');
  }

  // Element dynamics
  parts.push(elementHarmony.description);

  // Key connections highlight
  if (keyConnections.sunMoon) {
    parts.push(`Sun-Moon ${keyConnections.sunMoon.aspect} creates ${keyConnections.sunMoon.harmony > 0 ? 'deep emotional bond' : 'dynamic tension'}.`);
  }
  if (keyConnections.venusMars) {
    parts.push(`Venus-Mars ${keyConnections.venusMars.aspect} indicates ${keyConnections.venusMars.harmony > 0 ? 'strong attraction' : 'passionate friction'}.`);
  }

  return parts.join(' ');
}

/**
 * Main comparison function
 * @param {Object} chartA - First person's astrology chart (from calculateAstrology)
 * @param {Object} chartB - Second person's astrology chart
 * @returns {Object} Compatibility analysis
 */
export function compareAstrology(chartA, chartB) {
  // Calculate synastry aspects
  const synastryAspects = calculateSynastryAspects(chartA, chartB, false);

  // Analyze element harmony
  const elementHarmony = analyzeElementHarmony(chartA, chartB);

  // Find key connections
  const keyConnections = findKeyConnections(synastryAspects);

  // Calculate overall score
  const overallScore = calculateScore(synastryAspects, elementHarmony, keyConnections);

  // Generate summary
  const summary = generateSummary(overallScore, elementHarmony, keyConnections, synastryAspects.length);

  // Count harmonious vs challenging aspects
  const harmonious = synastryAspects.filter(a => a.harmony > 0).length;
  const challenging = synastryAspects.filter(a => a.harmony < 0).length;
  const neutral = synastryAspects.filter(a => a.harmony === 0).length;

  return {
    synastryAspects,
    elementHarmony,
    keyConnections,
    aspectSummary: {
      total: synastryAspects.length,
      harmonious,
      challenging,
      neutral,
      ratio: harmonious > 0 ? `${harmonious}:${challenging}` : 'N/A'
    },
    overallScore,
    scoreLabel: overallScore >= 80 ? 'Excellent' :
                overallScore >= 65 ? 'Very Good' :
                overallScore >= 50 ? 'Good' :
                overallScore >= 35 ? 'Mixed' : 'Challenging',
    summary
  };
}

export default compareAstrology;
