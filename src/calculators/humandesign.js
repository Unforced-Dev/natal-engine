/**
 * Human Design Calculator
 *
 * Human Design synthesizes:
 * - I Ching (64 hexagrams/gates)
 * - Kabbalah (Tree of Life - 9 centers)
 * - Astrology (planetary positions)
 * - Hindu Chakra system
 * - Quantum physics concepts
 *
 * Calculates: Type, Strategy, Authority, Profile, Centers, Gates, Channels
 *
 * Uses Meeus Astronomical Algorithms for Sun/Moon/Earth positions.
 */

import { calculateBirthPositions } from './astronomy.js';
import { parseDateComponents } from './utils.js';

// The 9 Centers in Human Design
const CENTERS = {
  head: { name: 'Head', theme: 'Inspiration', biological: 'Pineal gland', pressure: 'Mental pressure to answer questions' },
  ajna: { name: 'Ajna', theme: 'Conceptualization', biological: 'Pituitary', pressure: 'Mental awareness and processing' },
  throat: { name: 'Throat', theme: 'Manifestation', biological: 'Thyroid', pressure: 'Communication and action' },
  g: { name: 'G Center', theme: 'Identity', biological: 'Liver/Blood', pressure: 'Love, direction, identity' },
  heart: { name: 'Heart/Ego', theme: 'Willpower', biological: 'Heart/Stomach', pressure: 'Material world, ego, willpower' },
  sacral: { name: 'Sacral', theme: 'Life Force', biological: 'Ovaries/Testes', pressure: 'Vital energy, sexuality, work' },
  spleen: { name: 'Spleen', theme: 'Intuition', biological: 'Spleen/Lymph', pressure: 'Survival, health, intuition' },
  solar: { name: 'Solar Plexus', theme: 'Emotion', biological: 'Kidneys/Pancreas', pressure: 'Emotional wave, feelings' },
  root: { name: 'Root', theme: 'Pressure', biological: 'Adrenals', pressure: 'Stress, adrenaline, drive' }
};

// The 64 Gates mapped to their positions on the zodiac wheel
// Each gate occupies 5.625 degrees (360/64)
// Format: gate number -> { degrees start, center, line meanings }
const GATES = {
  1: { center: 'g', name: 'The Creative', iching: 'The Creative', theme: 'Self-expression' },
  2: { center: 'g', name: 'The Receptive', iching: 'The Receptive', theme: 'Higher knowing' },
  3: { center: 'sacral', name: 'Ordering', iching: 'Difficulty at the Beginning', theme: 'Innovation' },
  4: { center: 'ajna', name: 'Formulization', iching: 'Youthful Folly', theme: 'Mental solutions' },
  5: { center: 'sacral', name: 'Fixed Rhythms', iching: 'Waiting', theme: 'Natural rhythms' },
  6: { center: 'solar', name: 'Friction', iching: 'Conflict', theme: 'Emotional clarity' },
  7: { center: 'g', name: 'The Role of Self', iching: 'The Army', theme: 'Leadership' },
  8: { center: 'throat', name: 'Contribution', iching: 'Holding Together', theme: 'Making a contribution' },
  9: { center: 'sacral', name: 'Focus', iching: 'The Taming Power of the Small', theme: 'Determination' },
  10: { center: 'g', name: 'Behavior of Self', iching: 'Treading', theme: 'Self-love' },
  11: { center: 'ajna', name: 'Ideas', iching: 'Peace', theme: 'New ideas' },
  12: { center: 'throat', name: 'Caution', iching: 'Standstill', theme: 'Social caution' },
  13: { center: 'g', name: 'The Listener', iching: 'Fellowship with Men', theme: 'Listening' },
  14: { center: 'sacral', name: 'Power Skills', iching: 'Possession in Great Measure', theme: 'Wealth' },
  15: { center: 'g', name: 'Extremes', iching: 'Modesty', theme: 'Humanity' },
  16: { center: 'throat', name: 'Skills', iching: 'Enthusiasm', theme: 'Mastery' },
  17: { center: 'ajna', name: 'Opinions', iching: 'Following', theme: 'Opinions' },
  18: { center: 'spleen', name: 'Correction', iching: 'Work on What Has Been Spoiled', theme: 'Correction' },
  19: { center: 'root', name: 'Wanting', iching: 'Approach', theme: 'Sensitivity' },
  20: { center: 'throat', name: 'The Now', iching: 'Contemplation', theme: 'Presence' },
  21: { center: 'heart', name: 'The Hunter', iching: 'Biting Through', theme: 'Control' },
  22: { center: 'solar', name: 'Openness', iching: 'Grace', theme: 'Social grace' },
  23: { center: 'throat', name: 'Assimilation', iching: 'Splitting Apart', theme: 'Expression' },
  24: { center: 'ajna', name: 'Rationalization', iching: 'Return', theme: 'Returning' },
  25: { center: 'g', name: 'Innocence', iching: 'Innocence', theme: 'Universal love' },
  26: { center: 'heart', name: 'The Trickster', iching: 'The Taming Power of the Great', theme: 'Influence' },
  27: { center: 'sacral', name: 'Caring', iching: 'The Corners of the Mouth', theme: 'Nourishment' },
  28: { center: 'spleen', name: 'The Player', iching: 'Preponderance of the Great', theme: 'Struggle' },
  29: { center: 'sacral', name: 'Perseverance', iching: 'The Abysmal', theme: 'Commitment' },
  30: { center: 'solar', name: 'Recognition of Feelings', iching: 'The Clinging', theme: 'Desire' },
  31: { center: 'throat', name: 'Leading', iching: 'Influence', theme: 'Leadership' },
  32: { center: 'spleen', name: 'Continuity', iching: 'Duration', theme: 'Endurance' },
  33: { center: 'throat', name: 'Privacy', iching: 'Retreat', theme: 'Remembering' },
  34: { center: 'sacral', name: 'Power', iching: 'The Power of the Great', theme: 'Pure power' },
  35: { center: 'throat', name: 'Change', iching: 'Progress', theme: 'Experience' },
  36: { center: 'solar', name: 'Crisis', iching: 'Darkening of the Light', theme: 'Exploration' },
  37: { center: 'solar', name: 'Friendship', iching: 'The Family', theme: 'Family' },
  38: { center: 'root', name: 'The Fighter', iching: 'Opposition', theme: 'Struggle' },
  39: { center: 'root', name: 'Provocation', iching: 'Obstruction', theme: 'Provocation' },
  40: { center: 'heart', name: 'Aloneness', iching: 'Deliverance', theme: 'Delivery' },
  41: { center: 'root', name: 'Contraction', iching: 'Decrease', theme: 'Fantasy' },
  42: { center: 'sacral', name: 'Growth', iching: 'Increase', theme: 'Completion' },
  43: { center: 'ajna', name: 'Insight', iching: 'Break-through', theme: 'Insight' },
  44: { center: 'spleen', name: 'Coming to Meet', iching: 'Coming to Meet', theme: 'Alertness' },
  45: { center: 'throat', name: 'Gathering', iching: 'Gathering Together', theme: 'Gathering' },
  46: { center: 'g', name: 'Love of Body', iching: 'Pushing Upward', theme: 'Serendipity' },
  47: { center: 'ajna', name: 'Realization', iching: 'Oppression', theme: 'Realization' },
  48: { center: 'spleen', name: 'Depth', iching: 'The Well', theme: 'Depth' },
  49: { center: 'solar', name: 'Principles', iching: 'Revolution', theme: 'Revolution' },
  50: { center: 'spleen', name: 'Values', iching: 'The Cauldron', theme: 'Values' },
  51: { center: 'heart', name: 'Shock', iching: 'The Arousing', theme: 'Initiation' },
  52: { center: 'root', name: 'Stillness', iching: 'Keeping Still', theme: 'Inaction' },
  53: { center: 'root', name: 'Beginnings', iching: 'Development', theme: 'Starting' },
  54: { center: 'root', name: 'Ambition', iching: 'The Marrying Maiden', theme: 'Ambition' },
  55: { center: 'solar', name: 'Spirit', iching: 'Abundance', theme: 'Abundance' },
  56: { center: 'throat', name: 'Stimulation', iching: 'The Wanderer', theme: 'Stimulation' },
  57: { center: 'spleen', name: 'Intuition', iching: 'The Gentle', theme: 'Intuitive clarity' },
  58: { center: 'root', name: 'Vitality', iching: 'The Joyous', theme: 'Vitality' },
  59: { center: 'sacral', name: 'Sexuality', iching: 'Dispersion', theme: 'Intimacy' },
  60: { center: 'root', name: 'Limitation', iching: 'Limitation', theme: 'Acceptance' },
  61: { center: 'head', name: 'Mystery', iching: 'Inner Truth', theme: 'Inner truth' },
  62: { center: 'throat', name: 'Details', iching: 'Preponderance of the Small', theme: 'Details' },
  63: { center: 'head', name: 'Doubt', iching: 'After Completion', theme: 'Doubt' },
  64: { center: 'head', name: 'Confusion', iching: 'Before Completion', theme: 'Confusion' }
};

// The 36 Channels (connecting two gates)
const CHANNELS = [
  { gates: [1, 8], name: 'Inspiration', centers: ['g', 'throat'], theme: 'Creative role model' },
  { gates: [2, 14], name: 'The Beat', centers: ['g', 'sacral'], theme: 'Keeper of keys' },
  { gates: [3, 60], name: 'Mutation', centers: ['sacral', 'root'], theme: 'Energy for mutation' },
  { gates: [4, 63], name: 'Logic', centers: ['ajna', 'head'], theme: 'Mental ease in doubt' },
  { gates: [5, 15], name: 'Rhythm', centers: ['sacral', 'g'], theme: 'Being in flow' },
  { gates: [6, 59], name: 'Intimacy', centers: ['solar', 'sacral'], theme: 'Focused on reproduction' },
  { gates: [7, 31], name: 'Alpha', centers: ['g', 'throat'], theme: 'Leadership' },
  { gates: [9, 52], name: 'Concentration', centers: ['sacral', 'root'], theme: 'Focused determination' },
  { gates: [10, 20], name: 'Awakening', centers: ['g', 'throat'], theme: 'Commitment to self' },
  { gates: [10, 34], name: 'Exploration', centers: ['g', 'sacral'], theme: 'Following convictions' },
  { gates: [10, 57], name: 'Perfected Form', centers: ['g', 'spleen'], theme: 'Survival' },
  { gates: [11, 56], name: 'Curiosity', centers: ['ajna', 'throat'], theme: 'A searcher' },
  { gates: [12, 22], name: 'Openness', centers: ['throat', 'solar'], theme: 'Social being' },
  { gates: [13, 33], name: 'The Prodigal', centers: ['g', 'throat'], theme: 'A witness' },
  { gates: [16, 48], name: 'The Wavelength', centers: ['throat', 'spleen'], theme: 'Talent' },
  { gates: [17, 62], name: 'Acceptance', centers: ['ajna', 'throat'], theme: 'An organizational being' },
  { gates: [18, 58], name: 'Judgement', centers: ['spleen', 'root'], theme: 'Insatiability' },
  { gates: [19, 49], name: 'Synthesis', centers: ['root', 'solar'], theme: 'Sensitivity' },
  { gates: [20, 34], name: 'Charisma', centers: ['throat', 'sacral'], theme: 'Busy-ness' },
  { gates: [20, 57], name: 'The Brainwave', centers: ['throat', 'spleen'], theme: 'Penetrating awareness' },
  { gates: [21, 45], name: 'Money', centers: ['heart', 'throat'], theme: 'A materialist' },
  { gates: [23, 43], name: 'Structuring', centers: ['throat', 'ajna'], theme: 'Individuality' },
  { gates: [24, 61], name: 'Awareness', centers: ['ajna', 'head'], theme: 'A thinker' },
  { gates: [25, 51], name: 'Initiation', centers: ['g', 'heart'], theme: 'Needing to be first' },
  { gates: [26, 44], name: 'Surrender', centers: ['heart', 'spleen'], theme: 'A transmitter' },
  { gates: [27, 50], name: 'Preservation', centers: ['sacral', 'spleen'], theme: 'Custodianship' },
  { gates: [28, 38], name: 'Struggle', centers: ['spleen', 'root'], theme: 'Stubbornness' },
  { gates: [29, 46], name: 'Discovery', centers: ['sacral', 'g'], theme: 'Succeeding where others fail' },
  { gates: [30, 41], name: 'Recognition', centers: ['solar', 'root'], theme: 'Focused energy' },
  { gates: [32, 54], name: 'Transformation', centers: ['spleen', 'root'], theme: 'Being driven' },
  { gates: [34, 57], name: 'Power', centers: ['sacral', 'spleen'], theme: 'An archetype' },
  { gates: [35, 36], name: 'Transitoriness', centers: ['throat', 'solar'], theme: 'A jack of all trades' },
  { gates: [37, 40], name: 'Community', centers: ['solar', 'heart'], theme: 'Part of a bargain' },
  { gates: [39, 55], name: 'Emoting', centers: ['root', 'solar'], theme: 'Moodiness' },
  { gates: [42, 53], name: 'Maturation', centers: ['sacral', 'root'], theme: 'Balanced development' },
  { gates: [47, 64], name: 'Abstraction', centers: ['ajna', 'head'], theme: 'Mental activity/clarity' }
];

// The 5 Human Design Types
const TYPES = {
  manifestor: {
    name: 'Manifestor',
    strategy: 'Inform',
    notSelf: 'Anger',
    signature: 'Peace',
    description: 'Independent initiators who can make things happen',
    percentage: '9%'
  },
  generator: {
    name: 'Generator',
    strategy: 'Wait to Respond',
    notSelf: 'Frustration',
    signature: 'Satisfaction',
    description: 'Life force beings who respond to what life brings',
    percentage: '37%'
  },
  manifestingGenerator: {
    name: 'Manifesting Generator',
    strategy: 'Wait to Respond, then Inform',
    notSelf: 'Frustration/Anger',
    signature: 'Satisfaction',
    description: 'Multi-passionate beings who can move quickly',
    percentage: '33%'
  },
  projector: {
    name: 'Projector',
    strategy: 'Wait for the Invitation',
    notSelf: 'Bitterness',
    signature: 'Success',
    description: 'Guides and managers who see others deeply',
    percentage: '20%'
  },
  reflector: {
    name: 'Reflector',
    strategy: 'Wait a Lunar Cycle',
    notSelf: 'Disappointment',
    signature: 'Surprise',
    description: 'Mirrors of community health and wisdom',
    percentage: '1%'
  }
};

// Line names for profile building
const LINE_NAMES = {
  1: 'Investigator',
  2: 'Hermit',
  3: 'Martyr',
  4: 'Opportunist',
  5: 'Heretic',
  6: 'Role Model'
};

// The 12 Profiles (combinations of two line numbers)
const PROFILES = {
  '1/3': { name: 'Investigator/Martyr', theme: 'Learning through trial and error' },
  '1/4': { name: 'Investigator/Opportunist', theme: 'Foundation through relationships' },
  '2/4': { name: 'Hermit/Opportunist', theme: 'Natural talent shared with others' },
  '2/5': { name: 'Hermit/Heretic', theme: 'Called out for natural gifts' },
  '3/5': { name: 'Martyr/Heretic', theme: 'Learning through experience to save others' },
  '3/6': { name: 'Martyr/Role Model', theme: 'Trial and error becoming wisdom' },
  '4/6': { name: 'Opportunist/Role Model', theme: 'Networking toward role modeling' },
  '4/1': { name: 'Opportunist/Investigator', theme: 'Influencing through research' },
  '5/1': { name: 'Heretic/Investigator', theme: 'Practical solutions from study' },
  '5/2': { name: 'Heretic/Hermit', theme: 'Called out but needs alone time' },
  '6/2': { name: 'Role Model/Hermit', theme: 'Wise but needs solitude' },
  '6/3': { name: 'Role Model/Martyr', theme: 'Wisdom from life experience' }
};

// Get profile info with fallback for unlisted combinations
function getProfileInfo(line1, line2) {
  const key = `${line1}/${line2}`;
  if (PROFILES[key]) return PROFILES[key];
  // Fallback: construct name from line names
  const name1 = LINE_NAMES[line1] || `Line ${line1}`;
  const name2 = LINE_NAMES[line2] || `Line ${line2}`;
  return { name: `${name1}/${name2}`, theme: 'Unique combination of energies' };
}

// Authorities (decision-making process)
const AUTHORITIES = {
  emotional: { name: 'Emotional Authority', description: 'Wait for emotional clarity over time' },
  sacral: { name: 'Sacral Authority', description: 'Listen to gut response sounds' },
  splenic: { name: 'Splenic Authority', description: 'Trust instant intuitive knowing' },
  ego: { name: 'Ego/Heart Authority', description: 'Follow what the heart wants' },
  self: { name: 'Self-Projected Authority', description: 'Hear truth in your own voice' },
  mental: { name: 'Mental/Environment', description: 'Process with trusted others' },
  lunar: { name: 'Lunar Authority', description: 'Wait 28 days for clarity' }
};

/**
 * Map zodiac longitude to gate number
 * The 64 gates are distributed around the zodiac wheel
 * Each gate occupies 5.625 degrees (360/64 = 5°37'30")
 *
 * Gate order verified from official Rave Mandala:
 * https://www.barneyandflow.com/gate-zodiac-degrees
 *
 * Gate 25 starts at 358°15' (28°15' Pisces) - this is the offset
 */
const GATE_WHEEL_OFFSET = 358.25; // 358°15' where Gate 25 starts

// Gates in order around the wheel starting from Gate 25
const GATE_ORDER = [
  25, 17, 21, 51, 42, 3,   // Aries
  27, 24, 2, 23, 8, 20,    // Taurus
  16, 35, 45, 12, 15, 52,  // Gemini
  39, 53, 62, 56, 31, 33,  // Cancer/Leo
  7, 4, 29, 59, 40, 64,    // Leo/Virgo
  47, 6, 46, 18, 48, 57,   // Virgo/Libra
  32, 50, 28, 44, 1, 43,   // Libra/Scorpio
  14, 34, 9, 5, 26, 11,    // Sagittarius
  10, 58, 38, 54, 61, 60,  // Capricorn
  41, 19, 13, 49, 30, 55,  // Aquarius
  37, 63, 22, 36           // Pisces (then back to 25)
];

/**
 * Convert zodiac longitude to gate
 * @param {number} longitude - Zodiac longitude (0-360, 0° = 0° Aries)
 */
function longitudeToGate(longitude) {
  // Normalize to 0-360
  const normalizedLong = ((longitude % 360) + 360) % 360;
  // Adjust for wheel offset (Gate 25 starts at 358.25°)
  const adjustedLong = ((normalizedLong - GATE_WHEEL_OFFSET + 360) % 360);
  // Each gate is 5.625 degrees
  const gateIndex = Math.floor(adjustedLong / 5.625);
  return GATE_ORDER[gateIndex % 64];
}

/**
 * Get line number from longitude (each gate has 6 lines)
 * Lines are numbered 1-6, each spanning 0.9375 degrees
 */
function longitudeToLine(longitude) {
  const normalizedLong = ((longitude % 360) + 360) % 360;
  // Adjust for wheel offset
  const adjustedLong = ((normalizedLong - GATE_WHEEL_OFFSET + 360) % 360);
  // Position within gate
  const withinGate = adjustedLong % 5.625;
  // Each line is 0.9375 degrees (5.625 / 6)
  const line = Math.floor(withinGate / 0.9375) + 1;
  return Math.min(line, 6); // Ensure max is 6
}

/**
 * Approximate planetary positions for a date
 * Fallback when Swiss Ephemeris is unavailable
 */
function approximateSunPosition(date) {
  const d = new Date(date);
  // March equinox (0° Aries) is around March 20
  const marchEquinox = new Date(d.getFullYear(), 2, 20);
  const daysSinceEquinox = (d - marchEquinox) / (24 * 60 * 60 * 1000);
  // Sun moves approximately 1 degree per day
  return (daysSinceEquinox + 360) % 360;
}

/**
 * Convert planet positions to gate activations
 */
function planetToGateActivation(planet, longitude) {
  if (!longitude && longitude !== 0) return null;
  const gate = longitudeToGate(longitude);
  const line = longitudeToLine(longitude);
  return {
    planet,
    gate,
    line,
    longitude,
    ...GATES[gate]
  };
}

/**
 * Calculate Human Design chart using Meeus astronomical algorithms
 */
export function calculateHumanDesign(birthDate, birthHour = 12, timezone = 0) {
  const { year, month, day } = parseDateComponents(birthDate);

  // Calculate personality positions (birth moment)
  const personalityPos = calculateBirthPositions(year, month, day, birthHour, timezone);

  // Calculate design positions (88 degrees of Sun before birth)
  // The Sun doesn't move exactly 1° per day - it varies from ~0.9856°/day on average
  // (faster in winter ~1.02°/day, slower in summer ~0.95°/day due to Earth's elliptical orbit)
  // We need to iterate backwards to find the exact moment when Sun was 88° before birth

  const personalitySunLong = personalityPos.sun.longitude;
  const designSunTarget = (personalitySunLong - 88 + 360) % 360;

  // Start with rough estimate: ~88-90 days before birth
  let designDate = new Date(year, month - 1, day - 89);
  let designYear = designDate.getFullYear();
  let designMonth = designDate.getMonth() + 1;
  let designDay = designDate.getDate();

  // Iteratively search for the exact date when Sun was at target longitude
  // Maximum 20 iterations to find the date within 0.01° accuracy
  let designPos = null;
  let bestDiff = 360;
  let bestDate = { year: designYear, month: designMonth, day: designDay };

  for (let iteration = 0; iteration < 20; iteration++) {
    designPos = calculateBirthPositions(designYear, designMonth, designDay, birthHour, timezone);
    const currentSunLong = designPos.sun.longitude;

    // Calculate angular difference
    // We want: currentSunLong = designSunTarget
    // If currentSunLong > designSunTarget, we're too far forward in time (need to go back)
    // If currentSunLong < designSunTarget, we're too far back in time (need to go forward)
    let diff = currentSunLong - designSunTarget;

    // Handle wraparound at 0°/360° boundary
    // For Design calculation, we're going backwards ~88 days, so we expect
    // the target to be less than birth position (unless we cross the 0° boundary)
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    // If we're within 0.01° (about 1 minute of arc), we're done
    if (Math.abs(diff) < 0.01) {
      break;
    }

    // Track best result in case we don't converge perfectly
    if (Math.abs(diff) < Math.abs(bestDiff)) {
      bestDiff = diff;
      bestDate = { year: designYear, month: designMonth, day: designDay };
    }

    // Adjust date based on how far off we are
    // Sun moves forward in time at ~0.9856°/day
    // If diff > 0, current sun is ahead of target, so we need to go BACK in time (subtract days)
    // If diff < 0, current sun is behind target, so we need to go FORWARD in time (add days)
    const daysToAdjust = -Math.round(diff / 0.9856);

    if (daysToAdjust === 0) {
      // We're very close but not quite there - try small adjustments
      if (diff > 0) {
        designDay -= 1; // Go back in time
      } else {
        designDay += 1; // Go forward in time
      }
    } else {
      designDay += daysToAdjust;
    }

    // Normalize the date
    designDate = new Date(designYear, designMonth - 1, designDay);
    designYear = designDate.getFullYear();
    designMonth = designDate.getMonth() + 1;
    designDay = designDate.getDate();
  }

  // Use the best result we found
  if (Math.abs(bestDiff) < Math.abs(designPos.sun.longitude - designSunTarget)) {
    designYear = bestDate.year;
    designMonth = bestDate.month;
    designDay = bestDate.day;
    designPos = calculateBirthPositions(designYear, designMonth, designDay, birthHour, timezone);
  }

  // Build gate activations for all planets
  const personalityGates = {
    sun: planetToGateActivation('sun', personalityPos.sun.longitude),
    earth: planetToGateActivation('earth', (personalityPos.sun.longitude + 180) % 360),
    moon: planetToGateActivation('moon', personalityPos.moon.longitude),
    northNode: planetToGateActivation('northNode', personalityPos.northNode.longitude),
    southNode: planetToGateActivation('southNode', personalityPos.southNode.longitude),
    mercury: planetToGateActivation('mercury', personalityPos.mercury.longitude),
    venus: planetToGateActivation('venus', personalityPos.venus.longitude),
    mars: planetToGateActivation('mars', personalityPos.mars.longitude),
    jupiter: planetToGateActivation('jupiter', personalityPos.jupiter.longitude),
    saturn: planetToGateActivation('saturn', personalityPos.saturn.longitude),
    uranus: planetToGateActivation('uranus', personalityPos.uranus.longitude),
    neptune: planetToGateActivation('neptune', personalityPos.neptune.longitude),
    pluto: planetToGateActivation('pluto', personalityPos.pluto.longitude)
  };

  const designGates = {
    sun: planetToGateActivation('sun', designPos.sun.longitude),
    earth: planetToGateActivation('earth', (designPos.sun.longitude + 180) % 360),
    moon: planetToGateActivation('moon', designPos.moon.longitude),
    northNode: planetToGateActivation('northNode', designPos.northNode.longitude),
    southNode: planetToGateActivation('southNode', designPos.southNode.longitude),
    mercury: planetToGateActivation('mercury', designPos.mercury.longitude),
    venus: planetToGateActivation('venus', designPos.venus.longitude),
    mars: planetToGateActivation('mars', designPos.mars.longitude),
    jupiter: planetToGateActivation('jupiter', designPos.jupiter.longitude),
    saturn: planetToGateActivation('saturn', designPos.saturn.longitude),
    uranus: planetToGateActivation('uranus', designPos.uranus.longitude),
    neptune: planetToGateActivation('neptune', designPos.neptune.longitude),
    pluto: planetToGateActivation('pluto', designPos.pluto.longitude)
  };

  // Collect all active gates from all planets
  const activeGates = new Set();
  Object.values(personalityGates).forEach(g => { if (g) activeGates.add(g.gate); });
  Object.values(designGates).forEach(g => { if (g) activeGates.add(g.gate); });

  // Profile from Sun lines
  const personalitySunLine = personalityGates.sun?.line || 1;
  const designSunLine = designGates.sun?.line || 1;
  const profile = `${personalitySunLine}/${designSunLine}`;
  const profileInfo = getProfileInfo(personalitySunLine, designSunLine);

  // Find active channels
  const activeChannels = CHANNELS.filter(channel =>
    activeGates.has(channel.gates[0]) && activeGates.has(channel.gates[1])
  );

  // Determine defined centers from active channels
  const definedCenters = new Set();
  activeChannels.forEach(channel => {
    channel.centers.forEach(center => definedCenters.add(center));
  });

  // Determine Type based on defined centers
  let type = 'projector'; // Default
  const hasSacral = definedCenters.has('sacral');
  const hasMotorToThroat = checkMotorToThroat(activeChannels);

  if (!hasSacral && hasMotorToThroat) {
    type = 'manifestor';
  } else if (hasSacral) {
    if (hasMotorToThroat) {
      type = 'manifestingGenerator';
    } else {
      type = 'generator';
    }
  } else if (definedCenters.size === 0) {
    type = 'reflector';
  }

  // Determine Authority
  const authority = determineAuthority(definedCenters, hasSacral);

  // Incarnation Cross (from Sun/Earth gates)
  const personalitySunGate = personalityGates.sun?.gate;
  const personalityEarthGate = personalityGates.earth?.gate;
  const designSunGate = designGates.sun?.gate;
  const designEarthGate = designGates.earth?.gate;

  const incarnationCross = {
    name: `${GATES[personalitySunGate]?.name || 'Unknown'} / ${GATES[personalityEarthGate]?.name || 'Unknown'}`,
    gates: [personalitySunGate, personalityEarthGate, designSunGate, designEarthGate],
    theme: 'Your life purpose and direction'
  };

  // Determine definition type based on channel count and center connectivity
  const channelCount = activeChannels.length;
  let definition = 'None';
  if (channelCount === 0) definition = 'None';
  else if (channelCount === 1) definition = 'Single Definition';
  else if (channelCount <= 3) definition = 'Split Definition';
  else if (channelCount <= 5) definition = 'Triple Split';
  else definition = 'Quadruple Split';

  return {
    type: TYPES[type],
    authority: AUTHORITIES[authority],
    profile: {
      numbers: profile,
      ...profileInfo
    },
    definition,
    incarnationCross,
    centers: {
      defined: Array.from(definedCenters).map(c => CENTERS[c]),
      undefined: Object.keys(CENTERS).filter(c => !definedCenters.has(c)).map(c => CENTERS[c]),
      definedNames: Array.from(definedCenters),
      undefinedNames: Object.keys(CENTERS).filter(c => !definedCenters.has(c))
    },
    gates: {
      personality: personalityGates,
      design: designGates,
      all: Array.from(activeGates)
    },
    channels: activeChannels,
    // Raw planetary positions for advanced users
    positions: {
      personality: {
        date: birthDate,
        sun: personalityPos.sun,
        earth: personalityPos.earth,
        moon: personalityPos.moon,
        northNode: personalityPos.northNode,
        southNode: personalityPos.southNode,
        mercury: personalityPos.mercury,
        venus: personalityPos.venus,
        mars: personalityPos.mars,
        jupiter: personalityPos.jupiter,
        saturn: personalityPos.saturn,
        uranus: personalityPos.uranus,
        neptune: personalityPos.neptune,
        pluto: personalityPos.pluto
      },
      design: {
        date: `${designYear}-${String(designMonth).padStart(2, '0')}-${String(designDay).padStart(2, '0')}`,
        sun: designPos.sun,
        earth: designPos.earth,
        moon: designPos.moon,
        northNode: designPos.northNode,
        southNode: designPos.southNode,
        mercury: designPos.mercury,
        venus: designPos.venus,
        mars: designPos.mars,
        jupiter: designPos.jupiter,
        saturn: designPos.saturn,
        uranus: designPos.uranus,
        neptune: designPos.neptune,
        pluto: designPos.pluto
      }
    },
    useEphemeris: true,
    summary: `${TYPES[type].name} with ${AUTHORITIES[authority].name}, ${profileInfo.name} Profile`,
    note: 'Calculated using Meeus algorithms (all 13 planetary positions)'
  };
}

/**
 * Check if there's a motor center connected to throat
 */
function checkMotorToThroat(channels) {
  const motorCenters = ['sacral', 'heart', 'solar', 'root'];
  return channels.some(channel =>
    channel.centers.includes('throat') &&
    channel.centers.some(c => motorCenters.includes(c))
  );
}

/**
 * Determine authority based on defined centers
 */
function determineAuthority(definedCenters, hasSacral) {
  if (definedCenters.has('solar')) return 'emotional';
  if (hasSacral) return 'sacral';
  if (definedCenters.has('spleen')) return 'splenic';
  if (definedCenters.has('heart')) return 'ego';
  if (definedCenters.has('g')) return 'self';
  if (definedCenters.size === 0) return 'lunar';
  return 'mental';
}

/**
 * Complete Gene Keys Shadow/Gift/Siddhi spectrum for all 64 keys
 * Source: Gene Keys by Richard Rudd
 */
const GENE_KEY_SPECTRUM = {
  1: ['Entropy', 'Freshness', 'Beauty'],
  2: ['Dislocation', 'Orientation', 'Unity'],
  3: ['Chaos', 'Innovation', 'Innocence'],
  4: ['Intolerance', 'Understanding', 'Forgiveness'],
  5: ['Impatience', 'Patience', 'Timelessness'],
  6: ['Conflict', 'Diplomacy', 'Peace'],
  7: ['Division', 'Guidance', 'Virtue'],
  8: ['Mediocrity', 'Style', 'Exquisiteness'],
  9: ['Inertia', 'Determination', 'Invincibility'],
  10: ['Self-Obsession', 'Naturalness', 'Being'],
  11: ['Obscurity', 'Idealism', 'Light'],
  12: ['Vanity', 'Discrimination', 'Purity'],
  13: ['Discord', 'Discernment', 'Empathy'],
  14: ['Compromise', 'Competence', 'Bounteousness'],
  15: ['Dullness', 'Magnetism', 'Florescence'],
  16: ['Indifference', 'Versatility', 'Mastery'],
  17: ['Opinion', 'Far-Sightedness', 'Omniscience'],
  18: ['Judgement', 'Integrity', 'Perfection'],
  19: ['Co-Dependence', 'Sensitivity', 'Sacrifice'],
  20: ['Superficiality', 'Self-Assurance', 'Presence'],
  21: ['Control', 'Authority', 'Valour'],
  22: ['Dishonour', 'Graciousness', 'Grace'],
  23: ['Complexity', 'Simplicity', 'Quintessence'],
  24: ['Addiction', 'Invention', 'Silence'],
  25: ['Constriction', 'Acceptance', 'Universal Love'],
  26: ['Pride', 'Artfulness', 'Invisibility'],
  27: ['Selfishness', 'Altruism', 'Selflessness'],
  28: ['Purposelessness', 'Totality', 'Immortality'],
  29: ['Half-Heartedness', 'Commitment', 'Devotion'],
  30: ['Desire', 'Lightness', 'Rapture'],
  31: ['Arrogance', 'Leadership', 'Humility'],
  32: ['Failure', 'Preservation', 'Veneration'],
  33: ['Forgetting', 'Mindfulness', 'Revelation'],
  34: ['Force', 'Strength', 'Majesty'],
  35: ['Hunger', 'Adventure', 'Boundlessness'],
  36: ['Turbulence', 'Humanity', 'Compassion'],
  37: ['Weakness', 'Equality', 'Tenderness'],
  38: ['Struggle', 'Perseverance', 'Honour'],
  39: ['Provocation', 'Dynamism', 'Liberation'],
  40: ['Exhaustion', 'Resolve', 'Divine Will'],
  41: ['Fantasy', 'Anticipation', 'Emanation'],
  42: ['Expectation', 'Detachment', 'Celebration'],
  43: ['Deafness', 'Insight', 'Epiphany'],
  44: ['Interference', 'Teamwork', 'Synarchy'],
  45: ['Dominance', 'Synergy', 'Communion'],
  46: ['Seriousness', 'Delight', 'Ecstasy'],
  47: ['Oppression', 'Transmutation', 'Transfiguration'],
  48: ['Inadequacy', 'Resourcefulness', 'Wisdom'],
  49: ['Reaction', 'Revolution', 'Rebirth'],
  50: ['Corruption', 'Equilibrium', 'Harmony'],
  51: ['Agitation', 'Initiative', 'Awakening'],
  52: ['Stress', 'Restraint', 'Stillness'],
  53: ['Immaturity', 'Expansion', 'Superabundance'],
  54: ['Greed', 'Aspiration', 'Ascension'],
  55: ['Victimisation', 'Freedom', 'Freedom'],
  56: ['Distraction', 'Enrichment', 'Intoxication'],
  57: ['Unease', 'Intuition', 'Clarity'],
  58: ['Dissatisfaction', 'Vitality', 'Bliss'],
  59: ['Dishonesty', 'Intimacy', 'Transparency'],
  60: ['Limitation', 'Realism', 'Justice'],
  61: ['Psychosis', 'Inspiration', 'Sanctity'],
  62: ['Intellect', 'Precision', 'Impeccability'],
  63: ['Doubt', 'Inquiry', 'Truth'],
  64: ['Confusion', 'Imagination', 'Illumination']
};

/**
 * Calculate Gene Keys Hologenetic Profile from Human Design data
 *
 * The Gene Keys profile uses the same planetary positions as Human Design
 * but interprets them through the Shadow/Gift/Siddhi spectrum.
 *
 * Activation Sequence (4 Prime Gifts):
 * - Life's Work: Natal Sun (conscious purpose)
 * - Evolution: Natal Earth (life's challenge)
 * - Radiance: Design Sun (health and wellbeing)
 * - Purpose: Design Earth (hidden gift)
 *
 * Venus Sequence (relationships):
 * - Attraction: Design Moon
 * - IQ: Natal Venus
 * - EQ: Natal Mars
 * - SQ: Design Venus
 *
 * Pearl Sequence (prosperity):
 * - Vocation: Design Mars
 * - Culture: Design Jupiter
 * - Pearl: Natal Jupiter
 *
 * Source: https://genekeys.com/docs/what-planets-does-each-sphere-of-the-golden-path-profile-correlate-to/
 */
export function calculateGeneKeys(humanDesignResult) {
  const { personality, design } = humanDesignResult.gates;

  // Helper to create sphere data (now includes line number)
  const createSphere = (gateData, sphereName) => {
    const gate = gateData?.gate || gateData;
    const line = gateData?.line || null;
    return {
      key: gate,
      line: line,
      keyLine: line ? `${gate}.${line}` : String(gate),
      name: GATES[gate]?.name || `Gate ${gate}`,
      sphere: sphereName,
      shadow: GENE_KEY_SPECTRUM[gate]?.[0] || 'Shadow',
      gift: GENE_KEY_SPECTRUM[gate]?.[1] || 'Gift',
      siddhi: GENE_KEY_SPECTRUM[gate]?.[2] || 'Siddhi',
      spectrum: GENE_KEY_SPECTRUM[gate] || ['Shadow', 'Gift', 'Siddhi']
    };
  };

  // ACTIVATION SEQUENCE - The 4 Prime Gifts
  const activationSequence = {
    lifeWork: createSphere(personality.sun, "Life's Work"),
    evolution: createSphere(personality.earth, "Evolution"),
    radiance: createSphere(design.sun, "Radiance"),
    purpose: createSphere(design.earth, "Purpose")
  };

  // VENUS SEQUENCE - Relationships
  const venusSequence = {
    attraction: createSphere(design.moon, "Attraction"),
    iq: createSphere(personality.venus, "IQ"),
    eq: createSphere(personality.mars, "EQ"),
    sq: createSphere(design.venus, "SQ")
  };

  // PEARL SEQUENCE - Prosperity
  const pearlSequence = {
    vocation: createSphere(design.mars, "Vocation"),
    culture: createSphere(design.jupiter, "Culture"),
    pearl: createSphere(personality.jupiter, "Pearl")
  };

  // Calculate the 3 Pathways of the Activation Sequence
  const pathways = {
    challenge: `${activationSequence.lifeWork.key} → ${activationSequence.evolution.key}`,
    breakthrough: `${activationSequence.evolution.key} → ${activationSequence.radiance.key}`,
    coreStability: `${activationSequence.radiance.key} → ${activationSequence.purpose.key}`
  };

  // Core is the same Gene Key as Vocation (Design Mars) - viewed through Venus Sequence lens
  const core = createSphere(design.mars, "Core");

  // Brand is the same Gene Key as Life's Work (Personality Sun) - viewed through Pearl Sequence lens
  const brand = createSphere(personality.sun, "Brand");

  // All unique Gene Keys in the profile (11 total, but some spheres share keys)
  const allKeys = [
    activationSequence.lifeWork,
    activationSequence.evolution,
    activationSequence.radiance,
    activationSequence.purpose,
    venusSequence.attraction,
    venusSequence.iq,
    venusSequence.eq,
    venusSequence.sq,
    pearlSequence.vocation, // Same as Core
    pearlSequence.culture,
    pearlSequence.pearl
  ];

  return {
    // Activation Sequence (primary)
    ...activationSequence,

    // Full sequences
    activationSequence,
    venusSequence,
    pearlSequence,

    // Shared spheres (same Gene Key, different lens)
    core, // Same as vocation
    brand, // Same as lifeWork

    // Pathways
    pathways,

    // All Gene Keys in profile
    allKeys,

    // Summary
    primeGifts: [
      activationSequence.lifeWork.gift,
      activationSequence.evolution.gift,
      activationSequence.radiance.gift,
      activationSequence.purpose.gift
    ],

    summary: `Life's Work: ${activationSequence.lifeWork.keyLine} (${activationSequence.lifeWork.gift}), ` +
             `Evolution: ${activationSequence.evolution.keyLine} (${activationSequence.evolution.gift}), ` +
             `Radiance: ${activationSequence.radiance.keyLine} (${activationSequence.radiance.gift}), ` +
             `Purpose: ${activationSequence.purpose.keyLine} (${activationSequence.purpose.gift})`,

    note: 'Gene Keys profile calculated from Human Design planetary positions'
  };
}

export { GATES, CHANNELS, CENTERS, TYPES, PROFILES, AUTHORITIES };
export default calculateHumanDesign;
