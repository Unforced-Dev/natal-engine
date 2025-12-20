/**
 * Human Design / Gene Keys Verification Script
 * Compare these results with online calculators
 */

import calculateHumanDesign, { calculateGeneKeys } from '../src/calculators/humandesign.js';
import { calculateBirthPositions } from '../src/calculators/astronomy.js';

// User's birth data: Sept 6, 1992, 12:04 AM PDT (-7), Vida, OR
const birthDate = '1992-09-06';
const birthHour = 0.0667; // 12:04 AM = 0 + 4/60
const timezone = -7; // PDT

console.log('='.repeat(60));
console.log('Human Design / Gene Keys Verification');
console.log('Birth: September 6, 1992, 12:04 AM PDT, Vida, OR');
console.log('='.repeat(60));
console.log('');

// Get planetary positions
const positions = calculateBirthPositions(1992, 9, 6, birthHour + 7, 0); // Convert to UTC

console.log('PLANETARY POSITIONS (Birth Time)');
console.log('-'.repeat(40));
console.log(`Sun:      ${positions.sun.sign} ${positions.sun.degree}`);
console.log(`          Longitude: ${positions.sun.longitude.toFixed(2)}°`);
console.log(`Moon:     ${positions.moon.sign} ${positions.moon.degree}`);
console.log(`          Longitude: ${positions.moon.longitude.toFixed(2)}°`);
console.log(`Mercury:  ${positions.mercury.sign} ${positions.mercury.degree}`);
console.log(`Venus:    ${positions.venus.sign} ${positions.venus.degree}`);
console.log(`Mars:     ${positions.mars.sign} ${positions.mars.degree}`);
console.log(`Jupiter:  ${positions.jupiter.sign} ${positions.jupiter.degree}`);
console.log('');

// Calculate Human Design
const hd = calculateHumanDesign(birthDate, birthHour, timezone);

console.log('HUMAN DESIGN CHART');
console.log('-'.repeat(40));
console.log(`Type:       ${hd.type.name}`);
console.log(`Strategy:   ${hd.type.strategy}`);
console.log(`Authority:  ${hd.authority.name}`);
console.log(`Profile:    ${hd.profile.numbers} (${hd.profile.name})`);
console.log('');

console.log('PERSONALITY GATES (Conscious - Black)');
console.log('-'.repeat(40));
const pg = hd.gates.personality;
console.log(`Sun:        Gate ${pg.sun.gate}.${pg.sun.line} (${pg.sun.name})`);
console.log(`Earth:      Gate ${pg.earth.gate}.${pg.earth.line} (${pg.earth.name})`);
console.log(`Moon:       Gate ${pg.moon.gate}.${pg.moon.line} (${pg.moon.name})`);
console.log(`Mercury:    Gate ${pg.mercury.gate}.${pg.mercury.line}`);
console.log(`Venus:      Gate ${pg.venus.gate}.${pg.venus.line}`);
console.log(`Mars:       Gate ${pg.mars.gate}.${pg.mars.line}`);
console.log(`Jupiter:    Gate ${pg.jupiter.gate}.${pg.jupiter.line}`);
console.log(`Saturn:     Gate ${pg.saturn.gate}.${pg.saturn.line}`);
console.log(`Uranus:     Gate ${pg.uranus.gate}.${pg.uranus.line}`);
console.log(`Neptune:    Gate ${pg.neptune.gate}.${pg.neptune.line}`);
console.log(`Pluto:      Gate ${pg.pluto.gate}.${pg.pluto.line}`);
console.log(`N.Node:     Gate ${pg.northNode.gate}.${pg.northNode.line}`);
console.log(`S.Node:     Gate ${pg.southNode.gate}.${pg.southNode.line}`);
console.log('');

console.log('DESIGN GATES (Unconscious - Red, ~88 days before)');
console.log('-'.repeat(40));
const dg = hd.gates.design;
console.log(`Sun:        Gate ${dg.sun.gate}.${dg.sun.line} (${dg.sun.name})`);
console.log(`Earth:      Gate ${dg.earth.gate}.${dg.earth.line} (${dg.earth.name})`);
console.log(`Moon:       Gate ${dg.moon.gate}.${dg.moon.line} (${dg.moon.name})`);
console.log(`Mercury:    Gate ${dg.mercury.gate}.${dg.mercury.line}`);
console.log(`Venus:      Gate ${dg.venus.gate}.${dg.venus.line}`);
console.log(`Mars:       Gate ${dg.mars.gate}.${dg.mars.line}`);
console.log(`Jupiter:    Gate ${dg.jupiter.gate}.${dg.jupiter.line}`);
console.log('');

console.log('INCARNATION CROSS');
console.log('-'.repeat(40));
console.log(`Gates: ${hd.incarnationCross.gates.join(' / ')}`);
console.log(`Name:  ${hd.incarnationCross.name}`);
console.log('');

console.log('DEFINED CHANNELS');
console.log('-'.repeat(40));
if (hd.channels.length > 0) {
  hd.channels.forEach(ch => {
    console.log(`${ch.gates.join('-')}: ${ch.name}`);
  });
} else {
  console.log('No complete channels (possible Projector/Reflector)');
}
console.log('');

console.log('DEFINED CENTERS');
console.log('-'.repeat(40));
if (hd.centers.defined.length > 0) {
  hd.centers.defined.forEach(c => console.log(`${c.name}: ${c.theme}`));
} else {
  console.log('No defined centers (Reflector)');
}
console.log('');

// Gene Keys
const gk = calculateGeneKeys(hd);

console.log('GENE KEYS - ACTIVATION SEQUENCE');
console.log('-'.repeat(40));
console.log(`Life's Work: Gene Key ${gk.activationSequence.lifeWork.key} - ${gk.activationSequence.lifeWork.name}`);
console.log(`             ${gk.activationSequence.lifeWork.shadow} → ${gk.activationSequence.lifeWork.gift} → ${gk.activationSequence.lifeWork.siddhi}`);
console.log(`Evolution:   Gene Key ${gk.activationSequence.evolution.key} - ${gk.activationSequence.evolution.name}`);
console.log(`             ${gk.activationSequence.evolution.shadow} → ${gk.activationSequence.evolution.gift} → ${gk.activationSequence.evolution.siddhi}`);
console.log(`Radiance:    Gene Key ${gk.activationSequence.radiance.key} - ${gk.activationSequence.radiance.name}`);
console.log(`             ${gk.activationSequence.radiance.shadow} → ${gk.activationSequence.radiance.gift} → ${gk.activationSequence.radiance.siddhi}`);
console.log(`Purpose:     Gene Key ${gk.activationSequence.purpose.key} - ${gk.activationSequence.purpose.name}`);
console.log(`             ${gk.activationSequence.purpose.shadow} → ${gk.activationSequence.purpose.gift} → ${gk.activationSequence.purpose.siddhi}`);
console.log('');

console.log('GENE KEYS - VENUS SEQUENCE');
console.log('-'.repeat(40));
console.log(`Attraction: Gene Key ${gk.venusSequence.attraction.key}`);
console.log(`IQ:         Gene Key ${gk.venusSequence.iq.key}`);
console.log(`EQ:         Gene Key ${gk.venusSequence.eq.key}`);
console.log(`SQ:         Gene Key ${gk.venusSequence.sq.key}`);
console.log('');

console.log('GENE KEYS - PEARL SEQUENCE');
console.log('-'.repeat(40));
console.log(`Vocation:   Gene Key ${gk.pearlSequence.vocation.key}`);
console.log(`Culture:    Gene Key ${gk.pearlSequence.culture.key}`);
console.log(`Pearl:      Gene Key ${gk.pearlSequence.pearl.key}`);
console.log('');

console.log('='.repeat(60));
console.log('Please compare with: https://www.mybodygraph.com/free-chart/');
console.log('                  or: https://humandesign.zone/');
console.log('='.repeat(60));
