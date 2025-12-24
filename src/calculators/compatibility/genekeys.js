/**
 * Gene Keys Compatibility Calculator
 *
 * Analyzes compatibility between two Gene Keys hologenetic profiles:
 * - Shared Gene Keys across spheres
 * - Complementary pairs (programming partners)
 * - Sequence alignment
 * - Venus sequence emotional resonance
 * - Pearl sequence vocational synergy
 */

// Programming Partner pairs (codon ring relationships that create attraction)
// These are Gene Keys that have a special resonance when combined
const PROGRAMMING_PARTNERS = {
  1: 2, 2: 1,     // Creative polarity
  3: 60, 60: 3,   // Mutation partners
  4: 49, 49: 4,   // Revolution of mind
  5: 35, 35: 5,   // Patience and adventure
  6: 37, 37: 6,   // Peace and family
  7: 13, 13: 7,   // Guidance and listening
  8: 14, 14: 8,   // Style and competence
  9: 16, 16: 9,   // Focus and mastery
  10: 15, 15: 10, // Self-love and magnetism
  11: 12, 12: 11, // Light and purity
  17: 18, 18: 17, // Far-sightedness and integrity
  19: 33, 33: 19, // Sensitivity and mindfulness
  20: 34, 34: 20, // Presence and power
  21: 54, 54: 21, // Authority and aspiration
  22: 47, 47: 22, // Grace and transmutation
  23: 43, 43: 23, // Simplicity and insight
  24: 27, 27: 24, // Invention and altruism
  25: 46, 46: 25, // Universal love and delight
  26: 45, 45: 26, // Artfulness and synergy
  28: 32, 32: 28, // Totality and preservation
  29: 30, 30: 29, // Commitment and lightness
  31: 41, 41: 31, // Leadership and anticipation
  36: 6, 6: 36,   // Humanity and diplomacy (override)
  38: 39, 39: 38, // Perseverance and dynamism
  40: 37, 37: 40, // Resolve and equality (override)
  42: 53, 53: 42, // Detachment and expansion
  44: 50, 50: 44, // Teamwork and equilibrium
  48: 57, 57: 48, // Wisdom and intuition
  51: 25, 25: 51, // Initiative and acceptance (override)
  52: 58, 58: 52, // Restraint and vitality
  55: 59, 59: 55, // Freedom and intimacy
  56: 62, 62: 56, // Enrichment and precision
  61: 62, 62: 61, // Inspiration and precision
  63: 64, 64: 63  // Truth and illumination
};

// Gene Key themes for understanding resonance
const KEY_THEMES = {
  1: 'Creativity', 2: 'Direction', 3: 'Innovation', 4: 'Understanding',
  5: 'Patience', 6: 'Peace', 7: 'Guidance', 8: 'Style',
  9: 'Focus', 10: 'Self-Love', 11: 'Light', 12: 'Purity',
  13: 'Listening', 14: 'Abundance', 15: 'Magnetism', 16: 'Mastery',
  17: 'Vision', 18: 'Integrity', 19: 'Sensitivity', 20: 'Presence',
  21: 'Authority', 22: 'Grace', 23: 'Simplicity', 24: 'Silence',
  25: 'Love', 26: 'Art', 27: 'Altruism', 28: 'Purpose',
  29: 'Devotion', 30: 'Lightness', 31: 'Leadership', 32: 'Preservation',
  33: 'Mindfulness', 34: 'Strength', 35: 'Adventure', 36: 'Humanity',
  37: 'Family', 38: 'Honor', 39: 'Liberation', 40: 'Will',
  41: 'Imagination', 42: 'Completion', 43: 'Breakthrough', 44: 'Synarchy',
  45: 'Communion', 46: 'Delight', 47: 'Transmutation', 48: 'Wisdom',
  49: 'Rebirth', 50: 'Harmony', 51: 'Awakening', 52: 'Stillness',
  53: 'Expansion', 54: 'Ascension', 55: 'Freedom', 56: 'Enrichment',
  57: 'Clarity', 58: 'Bliss', 59: 'Transparency', 60: 'Justice',
  61: 'Sanctity', 62: 'Precision', 63: 'Truth', 64: 'Illumination'
};

/**
 * Extract all Gene Keys from a profile as a simple set
 */
function extractAllKeys(profile) {
  const keys = new Set();

  // Activation Sequence
  if (profile.activationSequence) {
    keys.add(profile.activationSequence.lifeWork?.key);
    keys.add(profile.activationSequence.evolution?.key);
    keys.add(profile.activationSequence.radiance?.key);
    keys.add(profile.activationSequence.purpose?.key);
  }

  // Venus Sequence
  if (profile.venusSequence) {
    keys.add(profile.venusSequence.attraction?.key);
    keys.add(profile.venusSequence.iq?.key);
    keys.add(profile.venusSequence.eq?.key);
    keys.add(profile.venusSequence.sq?.key);
  }

  // Pearl Sequence
  if (profile.pearlSequence) {
    keys.add(profile.pearlSequence.vocation?.key);
    keys.add(profile.pearlSequence.culture?.key);
    keys.add(profile.pearlSequence.pearl?.key);
  }

  // Remove undefined
  keys.delete(undefined);

  return keys;
}

/**
 * Find shared Gene Keys between two profiles
 */
function findSharedKeys(profileA, profileB) {
  const keysA = extractAllKeys(profileA);
  const keysB = extractAllKeys(profileB);

  const shared = [];

  for (const key of keysA) {
    if (keysB.has(key)) {
      // Find which spheres this key appears in for each person
      const spheresA = findSpheresForKey(profileA, key);
      const spheresB = findSpheresForKey(profileB, key);

      shared.push({
        key,
        theme: KEY_THEMES[key] || `Key ${key}`,
        shadow: profileA.activationSequence?.lifeWork?.shadow || '',
        gift: profileA.activationSequence?.lifeWork?.gift || '',
        siddhi: profileA.activationSequence?.lifeWork?.siddhi || '',
        spheresA,
        spheresB,
        resonance: spheresA.some(s => spheresB.includes(s))
          ? 'Same sphere - deep recognition'
          : 'Different spheres - complementary expression'
      });
    }
  }

  return shared;
}

/**
 * Find which spheres a Gene Key appears in for a profile
 */
function findSpheresForKey(profile, key) {
  const spheres = [];

  // Check Activation Sequence
  if (profile.activationSequence?.lifeWork?.key === key) spheres.push("Life's Work");
  if (profile.activationSequence?.evolution?.key === key) spheres.push("Evolution");
  if (profile.activationSequence?.radiance?.key === key) spheres.push("Radiance");
  if (profile.activationSequence?.purpose?.key === key) spheres.push("Purpose");

  // Check Venus Sequence
  if (profile.venusSequence?.attraction?.key === key) spheres.push("Attraction");
  if (profile.venusSequence?.iq?.key === key) spheres.push("IQ");
  if (profile.venusSequence?.eq?.key === key) spheres.push("EQ");
  if (profile.venusSequence?.sq?.key === key) spheres.push("SQ");

  // Check Pearl Sequence
  if (profile.pearlSequence?.vocation?.key === key) spheres.push("Vocation");
  if (profile.pearlSequence?.culture?.key === key) spheres.push("Culture");
  if (profile.pearlSequence?.pearl?.key === key) spheres.push("Pearl");

  return spheres;
}

/**
 * Find complementary programming partner pairs
 */
function findComplementaryPairs(profileA, profileB) {
  const keysA = extractAllKeys(profileA);
  const keysB = extractAllKeys(profileB);
  const pairs = [];

  for (const keyA of keysA) {
    const partner = PROGRAMMING_PARTNERS[keyA];
    if (partner && keysB.has(partner)) {
      pairs.push({
        keyA,
        keyB: partner,
        themeA: KEY_THEMES[keyA] || `Key ${keyA}`,
        themeB: KEY_THEMES[partner] || `Key ${partner}`,
        relationship: 'Programming Partners',
        growthPath: `${KEY_THEMES[keyA]} and ${KEY_THEMES[partner]} create a powerful growth dynamic`
      });
    }
  }

  // Deduplicate (since pairs are bidirectional)
  const seen = new Set();
  return pairs.filter(pair => {
    const key = [pair.keyA, pair.keyB].sort().join('-');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Analyze Activation Sequence alignment
 */
function analyzeActivationAlignment(profileA, profileB) {
  const seqA = profileA.activationSequence;
  const seqB = profileB.activationSequence;

  if (!seqA || !seqB) {
    return { lifeWorkHarmony: 0.5, evolutionSync: 0.5, purposeConnection: 0.5, description: 'Incomplete data' };
  }

  // Check Life's Work connection
  const lifeWorkMatch = seqA.lifeWork?.key === seqB.lifeWork?.key;
  const lifeWorkPartner = PROGRAMMING_PARTNERS[seqA.lifeWork?.key] === seqB.lifeWork?.key;

  // Check Purpose connection
  const purposeMatch = seqA.purpose?.key === seqB.purpose?.key;
  const purposePartner = PROGRAMMING_PARTNERS[seqA.purpose?.key] === seqB.purpose?.key;

  // Check if one's Life's Work supports other's Evolution
  const crossSupport =
    seqA.lifeWork?.key === seqB.evolution?.key ||
    seqB.lifeWork?.key === seqA.evolution?.key;

  const lifeWorkHarmony = lifeWorkMatch ? 1.0 : lifeWorkPartner ? 0.85 : 0.5;
  const purposeConnection = purposeMatch ? 1.0 : purposePartner ? 0.85 : crossSupport ? 0.75 : 0.5;

  let description = '';
  if (lifeWorkMatch) {
    description = 'Same Life\'s Work Key - deeply understand each other\'s purpose';
  } else if (lifeWorkPartner) {
    description = 'Life\'s Work Keys are programming partners - catalyze each other\'s gifts';
  } else if (crossSupport) {
    description = 'One\'s purpose supports the other\'s evolution - growth partnership';
  } else {
    description = 'Different primary keys - bring diverse gifts to each other';
  }

  return {
    lifeWorkHarmony,
    evolutionSync: crossSupport ? 0.8 : 0.5,
    purposeConnection,
    description
  };
}

/**
 * Analyze Venus Sequence (relationships/emotional)
 */
function analyzeVenusAlignment(profileA, profileB) {
  const venusA = profileA.venusSequence;
  const venusB = profileB.venusSequence;

  if (!venusA || !venusB) {
    return { attractionDynamic: 'Unknown', emotionalResonance: 0.5, description: 'Incomplete data' };
  }

  // Attraction sphere comparison
  const attractionMatch = venusA.attraction?.key === venusB.attraction?.key;
  const attractionPartner = PROGRAMMING_PARTNERS[venusA.attraction?.key] === venusB.attraction?.key;

  // EQ (emotional) comparison
  const eqMatch = venusA.eq?.key === venusB.eq?.key;
  const eqPartner = PROGRAMMING_PARTNERS[venusA.eq?.key] === venusB.eq?.key;

  // SQ (spiritual) comparison
  const sqMatch = venusA.sq?.key === venusB.sq?.key;

  let attractionDynamic = 'Standard';
  let emotionalResonance = 0.5;

  if (attractionMatch) {
    attractionDynamic = 'Mirror';
    emotionalResonance = 0.9;
  } else if (attractionPartner) {
    attractionDynamic = 'Magnetic';
    emotionalResonance = 0.85;
  } else if (eqMatch || eqPartner) {
    attractionDynamic = 'Emotionally Aligned';
    emotionalResonance = 0.75;
  }

  let description = '';
  if (attractionMatch) {
    description = `Both have Key ${venusA.attraction?.key} in Attraction - instant recognition and magnetic pull`;
  } else if (attractionPartner) {
    description = `Attraction Keys ${venusA.attraction?.key} and ${venusB.attraction?.key} are programming partners - powerful attraction`;
  } else if (eqMatch) {
    description = `Same EQ Key - process emotions similarly, deep empathy`;
  } else {
    description = `Different Venus patterns - opportunity to learn new ways of relating`;
  }

  return {
    attractionDynamic,
    emotionalResonance,
    sqAlignment: sqMatch ? 'Aligned' : 'Complementary',
    description
  };
}

/**
 * Analyze Pearl Sequence (prosperity/vocation)
 */
function analyzePearlAlignment(profileA, profileB) {
  const pearlA = profileA.pearlSequence;
  const pearlB = profileB.pearlSequence;

  if (!pearlA || !pearlB) {
    return { vocationalSynergy: 0.5, prosperityConnection: 0.5, description: 'Incomplete data' };
  }

  // Vocation comparison
  const vocationMatch = pearlA.vocation?.key === pearlB.vocation?.key;
  const vocationPartner = PROGRAMMING_PARTNERS[pearlA.vocation?.key] === pearlB.vocation?.key;

  // Pearl comparison
  const pearlMatch = pearlA.pearl?.key === pearlB.pearl?.key;
  const pearlPartner = PROGRAMMING_PARTNERS[pearlA.pearl?.key] === pearlB.pearl?.key;

  let vocationalSynergy = 0.5;
  let prosperityConnection = 0.5;

  if (vocationMatch) {
    vocationalSynergy = 0.9;
  } else if (vocationPartner) {
    vocationalSynergy = 0.8;
  }

  if (pearlMatch) {
    prosperityConnection = 0.9;
  } else if (pearlPartner) {
    prosperityConnection = 0.8;
  }

  let description = '';
  if (vocationMatch && pearlMatch) {
    description = 'Strong work and prosperity alignment - natural business/creative partners';
  } else if (vocationPartner || pearlPartner) {
    description = 'Complementary vocational energies - catalyze each other\'s prosperity';
  } else {
    description = 'Different prosperity paths - can support each other\'s unique gifts';
  }

  return {
    vocationalSynergy,
    prosperityConnection,
    description
  };
}

/**
 * Generate summary text
 */
function generateSummary(sharedKeys, complementaryPairs, activationAlignment, venusAlignment) {
  const parts = [];

  if (sharedKeys.length > 0) {
    parts.push(`${sharedKeys.length} shared Gene Key${sharedKeys.length > 1 ? 's' : ''} create deep recognition.`);
  }

  if (complementaryPairs.length > 0) {
    parts.push(`${complementaryPairs.length} programming partner pair${complementaryPairs.length > 1 ? 's' : ''} catalyze growth.`);
  }

  parts.push(activationAlignment.description);

  if (venusAlignment.attractionDynamic !== 'Standard') {
    parts.push(`Venus alignment: ${venusAlignment.attractionDynamic}.`);
  }

  return parts.join(' ');
}

/**
 * Main comparison function
 * @param {Object} profileA - First person's Gene Keys profile
 * @param {Object} profileB - Second person's Gene Keys profile
 * @returns {Object} Compatibility analysis
 */
export function compareGeneKeys(profileA, profileB) {
  // Find shared Gene Keys
  const sharedKeys = findSharedKeys(profileA, profileB);

  // Find complementary programming partner pairs
  const complementaryPairs = findComplementaryPairs(profileA, profileB);

  // Analyze sequence alignments
  const activationAlignment = analyzeActivationAlignment(profileA, profileB);
  const venusAlignment = analyzeVenusAlignment(profileA, profileB);
  const pearlAlignment = analyzePearlAlignment(profileA, profileB);

  // Summary
  const summary = generateSummary(sharedKeys, complementaryPairs, activationAlignment, venusAlignment);

  return {
    sharedKeys,
    complementaryPairs,
    activationAlignment,
    venusAlignment,
    pearlAlignment,
    summary,

    // Quick stats
    stats: {
      sharedKeysCount: sharedKeys.length,
      complementaryPairsCount: complementaryPairs.length,
      hasLifeWorkConnection: activationAlignment.lifeWorkHarmony >= 0.8,
      hasVenusConnection: venusAlignment.emotionalResonance >= 0.75,
      hasPearlConnection: pearlAlignment.vocationalSynergy >= 0.75
    }
  };
}

export default compareGeneKeys;
