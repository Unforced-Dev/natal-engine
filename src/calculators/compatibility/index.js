/**
 * Compatibility Calculator Module
 *
 * Exports all compatibility analysis functions for:
 * - Astrology (synastry aspects)
 * - Human Design (electromagnetic connections)
 * - Gene Keys (programming partners)
 */

import { compareAstrology } from './astrology.js';
import { compareHumanDesign } from './humandesign.js';
import { compareGeneKeys } from './genekeys.js';

export { compareAstrology, compareHumanDesign, compareGeneKeys };

/**
 * Combined comparison across all three systems
 * @param {Object} personA - First person's data with astrology, humanDesign, geneKeys
 * @param {Object} personB - Second person's data with astrology, humanDesign, geneKeys
 * @param {string[]} systems - Which systems to include (default: all)
 * @returns {Object} Combined compatibility results
 */
export function compareCharts(personA, personB, systems = ['astrology', 'humandesign', 'genekeys']) {
  const result = {
    personA: personA.name || 'Person A',
    personB: personB.name || 'Person B',
    systems: systems,
    comparisons: {}
  };

  if (systems.includes('astrology') && personA.astrology && personB.astrology) {
    result.comparisons.astrology = compareAstrology(personA.astrology, personB.astrology);
  }

  if (systems.includes('humandesign') && personA.humanDesign && personB.humanDesign) {
    result.comparisons.humanDesign = compareHumanDesign(personA.humanDesign, personB.humanDesign);
  }

  if (systems.includes('genekeys') && personA.geneKeys && personB.geneKeys) {
    result.comparisons.geneKeys = compareGeneKeys(personA.geneKeys, personB.geneKeys);
  }

  // Generate combined summary
  const summaries = [];
  if (result.comparisons.astrology) {
    summaries.push(`Astrology: ${result.comparisons.astrology.summary}`);
  }
  if (result.comparisons.humanDesign) {
    summaries.push(`Human Design: ${result.comparisons.humanDesign.summary}`);
  }
  if (result.comparisons.geneKeys) {
    summaries.push(`Gene Keys: ${result.comparisons.geneKeys.summary}`);
  }

  result.summary = summaries.join('\n\n');

  return result;
}

export default {
  compareAstrology,
  compareHumanDesign,
  compareGeneKeys,
  compareCharts
};
