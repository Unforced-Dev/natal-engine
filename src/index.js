/**
 * NatalEngine - Birth Chart Calculator
 *
 * A comprehensive library for calculating Western Astrology, Human Design,
 * Gene Keys, and Vedic (Jyotish) astrology charts with astronomical precision.
 *
 * @example
 * import { calculateAstrology, calculateHumanDesign, calculateGeneKeys, calculateVedic } from 'natalengine';
 *
 * const astro = calculateAstrology('1990-06-15', 14.5, -5, 40.7128, -74.0060);
 * console.log(astro.bigThree); // "Gemini Sun, Pisces Moon, Scorpio Rising"
 *
 * const hd = calculateHumanDesign('1990-06-15', 14.5, -5);
 * console.log(hd.type.name); // "Generator"
 *
 * const gk = calculateGeneKeys(hd);
 * console.log(gk.activationSequence.lifeWork.gift); // "Imagination"
 *
 * const vedic = calculateVedic('1990-06-15', 14.5, -5, 40.7128, -74.0060);
 * console.log(vedic.moonSign.summary); // "Moon in Simha (Leo), Purva Phalguni Nakshatra"
 *
 * // Compatibility analysis
 * import { compareAstrology, compareHumanDesign, compareGeneKeys } from 'natalengine';
 * const synastry = compareAstrology(astroA, astroB);
 * console.log(synastry.overallScore); // 72
 */

// Main calculators
export { default as calculateAstrology } from './calculators/astrology.js';
export { default as calculateHumanDesign, calculateGeneKeys } from './calculators/humandesign.js';
export { default as calculateVedic } from './calculators/vedic.js';

// Compatibility calculators
export {
  compareAstrology,
  compareHumanDesign,
  compareGeneKeys,
  compareCharts
} from './calculators/compatibility/index.js';

// Profile storage (browser only)
export {
  getProfiles,
  getProfile,
  saveProfile,
  deleteProfile,
  renameProfile,
  updateProfileCache,
  clearAllProfiles,
  exportProfiles,
  importProfiles
} from './storage/profiles.js';

// Lower-level astronomy functions
export { calculateBirthPositions, getZodiacSign } from './calculators/astronomy.js';

// Data constants (for advanced users)
export {
  GATES,
  CHANNELS,
  CENTERS,
  TYPES,
  PROFILES,
  AUTHORITIES
} from './calculators/humandesign.js';

// Vedic astrology data and functions
export {
  RASHIS,
  NAKSHATRAS,
  DASHA_ORDER,
  DASHA_YEARS,
  calculateLahiriAyanamsa,
  getNakshatra,
  getRashi
} from './calculators/vedic.js';

// Utility functions
export { parseDateComponents, daysBetween } from './calculators/utils.js';
