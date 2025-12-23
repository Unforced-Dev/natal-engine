/**
 * Incarnation Cross Data
 *
 * There are 192 named Incarnation Crosses in Human Design:
 * - 64 gates × 3 angles (Right Angle, Left Angle, Juxtaposition)
 *
 * The cross is determined by:
 * 1. Personality Sun gate (primary)
 * 2. Profile angle:
 *    - Right Angle: profiles 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6
 *    - Left Angle: profiles 5/1, 5/2, 6/2, 6/3
 *    - Juxtaposition: profile 4/1 only
 *
 * The four gates of the cross are:
 * - Personality Sun (conscious purpose)
 * - Personality Earth (grounding, opposite of Sun)
 * - Design Sun (unconscious theme)
 * - Design Earth (unconscious grounding)
 */

// Determine angle from profile
export function getAngleFromProfile(profile) {
  const rightAngleProfiles = ['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6'];
  const leftAngleProfiles = ['5/1', '5/2', '6/2', '6/3'];
  const juxtapositionProfile = '4/1';

  if (profile === juxtapositionProfile) return 'juxtaposition';
  if (leftAngleProfiles.includes(profile)) return 'left';
  if (rightAngleProfiles.includes(profile)) return 'right';
  return 'right'; // Default fallback
}

// Cross names indexed by Personality Sun gate
// Each gate has [Right Angle name, Juxtaposition name, Left Angle name]
export const INCARNATION_CROSSES = {
  1: ['The Sphinx', 'Self-Expression', 'Defiance'],
  2: ['The Sphinx', 'The Driver', 'Defiance'],
  3: ['Laws', 'Mutation', 'Wishes'],
  4: ['Explanation', 'Formulization', 'Revolution'],
  5: ['Consciousness', 'Habits', 'Separation'],
  6: ['Eden', 'Conflict', 'The Plane'],
  7: ['The Sphinx', 'Interaction', 'The Masks'],
  8: ['Contagion', 'Contribution', 'Uncertainty'],
  9: ['Planning', 'Focus', 'Identification'],
  10: ['The Vessel of Love', 'Behavior', 'Prevention'],
  11: ['Eden', 'Ideas', 'Education'],
  12: ['Eden', 'Articulation', 'Education'],
  13: ['The Sphinx', 'Listening', 'The Masks'],
  14: ['Contagion', 'Power Skills', 'Uncertainty'],
  15: ['The Vessel of Love', 'Extremes', 'Prevention'],
  16: ['Planning', 'Experimentation', 'Identification'],
  17: ['Service', 'Opinions', 'Upheaval'],
  18: ['Service', 'Correction', 'Upheaval'],
  19: ['The Four Ways', 'Wanting', 'Refinement'],
  20: ['The Sleeping Phoenix', 'The Now', 'Duality'],
  21: ['Tension', 'Control', 'Endeavor'],
  22: ['Rulership', 'Grace', 'Informing'],
  23: ['Explanation', 'Assimilation', 'Dedication'],
  24: ['The Four Ways', 'Rationalization', 'Incarnation'],
  25: ['The Vessel of Love', 'Innocence', 'The Spirit'],
  26: ['Rulership', 'The Trickster', 'Confrontation'],
  27: ['The Unexpected', 'Caring', 'Alignment'],
  28: ['The Unexpected', 'Risks', 'Alignment'],
  29: ['Contagion', 'Commitment', 'Industry'],
  30: ['Contagion', 'Fates', 'Industry'],
  31: ['The Unexpected', 'Influence', 'The Alpha'],
  32: ['Maya', 'Conservation', 'Limitation'],
  33: ['The Four Ways', 'Privacy', 'Refinement'],
  34: ['The Sleeping Phoenix', 'Power', 'Duality'],
  35: ['Consciousness', 'Experience', 'Separation'],
  36: ['Eden', 'Crisis', 'The Plane'],
  37: ['Planning', 'Bargains', 'Migration'],
  38: ['Tension', 'Opposition', 'Individualism'],
  39: ['Tension', 'Provocation', 'Individualism'],
  40: ['Planning', 'Denial', 'Migration'],
  41: ['The Unexpected', 'Fantasy', 'The Alpha'],
  42: ['Maya', 'Completion', 'Limitation'],
  43: ['Explanation', 'Insight', 'Dedication'],
  44: ['The Four Ways', 'Alertness', 'Incarnation'],
  45: ['Rulership', 'Possession', 'Confrontation'],
  46: ['The Vessel of Love', 'Serendipity', 'The Spirit'],
  47: ['Rulership', 'Oppression', 'Informing'],
  48: ['Tension', 'Depth', 'Endeavor'],
  49: ['Explanation', 'Principles', 'Revolution'],
  50: ['Laws', 'Values', 'Wishes'],
  51: ['Penetration', 'Shock', 'The Clarion'],
  52: ['Service', 'Stillness', 'Demands'],
  53: ['Penetration', 'Beginnings', 'Cycles'],
  54: ['Penetration', 'Ambition', 'Cycles'],
  55: ['The Sleeping Phoenix', 'Moods', 'Spirit'],
  56: ['Laws', 'Stimulation', 'Distraction'],
  57: ['Penetration', 'Intuition', 'The Clarion'],
  58: ['Service', 'Vitality', 'Demands'],
  59: ['The Sleeping Phoenix', 'Sexuality', 'Spirit'],
  60: ['Laws', 'Limitation', 'Distraction'],
  61: ['Maya', 'Thinking', 'Obscuration'],
  62: ['Maya', 'Details', 'Obscuration'],
  63: ['Consciousness', 'Doubts', 'Dominion'],
  64: ['Consciousness', 'Confusion', 'Dominion']
};

/**
 * Get the full Incarnation Cross name
 * @param {number} personalitySunGate - The Personality Sun gate number
 * @param {string} profile - The profile string (e.g., "6/2")
 * @returns {object} Cross information
 */
export function getIncarnationCross(personalitySunGate, profile) {
  const angle = getAngleFromProfile(profile);
  const crossNames = INCARNATION_CROSSES[personalitySunGate];

  if (!crossNames) {
    return {
      angle,
      name: 'Unknown Cross',
      fullName: 'Unknown Incarnation Cross'
    };
  }

  let name;
  let prefix;

  switch (angle) {
    case 'right':
      name = crossNames[0];
      prefix = 'Right Angle Cross of';
      break;
    case 'juxtaposition':
      name = crossNames[1];
      prefix = 'Juxtaposition Cross of';
      break;
    case 'left':
      name = crossNames[2];
      prefix = 'Left Angle Cross of';
      break;
    default:
      name = crossNames[0];
      prefix = 'Cross of';
  }

  return {
    angle,
    angleName: angle === 'right' ? 'Right Angle' : angle === 'left' ? 'Left Angle' : 'Juxtaposition',
    name,
    fullName: `The ${prefix} ${name}`
  };
}

export default {
  getAngleFromProfile,
  getIncarnationCross,
  INCARNATION_CROSSES
};
