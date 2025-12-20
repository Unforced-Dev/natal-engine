/**
 * Test Astronomical Algorithms
 * Verify Moon position calculation accuracy
 */

import {
  dateToJulianDay,
  calculateMoonPosition,
  calculateSunPosition,
  calculateBirthPositions,
  getZodiacSign,
  formatDegree
} from './src/calculators/astronomy.js';

console.log('='.repeat(60));
console.log('Astronomy Calculation Tests');
console.log('='.repeat(60));
console.log('');

// Test 1: Julian Day calculation
// Reference: January 1, 2000, 12:00 UT = JD 2451545.0
const jd2000 = dateToJulianDay(2000, 1, 1, 12);
console.log('Test 1: Julian Day for J2000.0');
console.log(`  Calculated: ${jd2000}`);
console.log(`  Expected:   2451545.0`);
console.log(`  ${Math.abs(jd2000 - 2451545.0) < 0.0001 ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Test 2: Moon position for a known date
// Using NASA Horizons reference data for comparison
console.log('Test 2: Moon position on Jan 1, 2000, 12:00 UT');
const moonJ2000 = calculateMoonPosition(2451545.0);
console.log(`  Longitude: ${moonJ2000.longitude.toFixed(4)}° (${getZodiacSign(moonJ2000.longitude)} ${formatDegree(moonJ2000.longitude)})`);
console.log(`  Latitude:  ${moonJ2000.latitude.toFixed(4)}°`);
console.log(`  Distance:  ${moonJ2000.distance.toFixed(0)} km`);
// Expected from NASA Horizons: ~98.8° (Cancer)
console.log(`  Expected:  ~98.8° (Cancer/Gemini border)`);
console.log('');

// Test 3: Sun position for a known date
console.log('Test 3: Sun position on Jan 1, 2000, 12:00 UT');
const sunJ2000 = calculateSunPosition(2451545.0);
console.log(`  Longitude: ${sunJ2000.longitude.toFixed(4)}° (${getZodiacSign(sunJ2000.longitude)} ${formatDegree(sunJ2000.longitude)})`);
// Expected: ~280.5° (Capricorn)
console.log(`  Expected:  ~280.5° (Capricorn ~10°)`);
console.log('');

// Test 4: User's birth date - September 6, 1992, 12:04 AM PDT (UTC-7)
// Vida, OR coordinates: 44.0482° N, 122.5217° W
console.log('Test 4: User birth date (Sept 6, 1992, 12:04 AM PDT, Vida OR)');
const birthHour = 0 + 4/60; // 12:04 AM = 0.0667 hours
const timezone = -7; // PDT
const latitude = 44.0482;
const longitude = -122.5217;
const userBirth = calculateBirthPositions(1992, 9, 6, birthHour, timezone, latitude, longitude);

console.log(`  Julian Day: ${userBirth.julianDay.toFixed(4)}`);
console.log('');
console.log('  PLANETS:');
console.log(`  ☉ Sun:      ${userBirth.sun.longitude.toFixed(2).padStart(7)}° = ${userBirth.sun.sign.padEnd(11)} ${userBirth.sun.degree}`);
console.log(`  ☽ Moon:     ${userBirth.moon.longitude.toFixed(2).padStart(7)}° = ${userBirth.moon.sign.padEnd(11)} ${userBirth.moon.degree}`);
console.log(`  ☿ Mercury:  ${userBirth.mercury.longitude.toFixed(2).padStart(7)}° = ${userBirth.mercury.sign.padEnd(11)} ${userBirth.mercury.degree}`);
console.log(`  ♀ Venus:    ${userBirth.venus.longitude.toFixed(2).padStart(7)}° = ${userBirth.venus.sign.padEnd(11)} ${userBirth.venus.degree}`);
console.log(`  ♂ Mars:     ${userBirth.mars.longitude.toFixed(2).padStart(7)}° = ${userBirth.mars.sign.padEnd(11)} ${userBirth.mars.degree}`);
console.log(`  ♃ Jupiter:  ${userBirth.jupiter.longitude.toFixed(2).padStart(7)}° = ${userBirth.jupiter.sign.padEnd(11)} ${userBirth.jupiter.degree}`);
console.log(`  ♄ Saturn:   ${userBirth.saturn.longitude.toFixed(2).padStart(7)}° = ${userBirth.saturn.sign.padEnd(11)} ${userBirth.saturn.degree}`);
console.log(`  ⛢ Uranus:   ${userBirth.uranus.longitude.toFixed(2).padStart(7)}° = ${userBirth.uranus.sign.padEnd(11)} ${userBirth.uranus.degree}`);
console.log(`  ♆ Neptune:  ${userBirth.neptune.longitude.toFixed(2).padStart(7)}° = ${userBirth.neptune.sign.padEnd(11)} ${userBirth.neptune.degree}`);
console.log(`  ♇ Pluto:    ${userBirth.pluto.longitude.toFixed(2).padStart(7)}° = ${userBirth.pluto.sign.padEnd(11)} ${userBirth.pluto.degree}`);
console.log('');
console.log('  LUNAR NODES:');
console.log(`  ☊ North Node: ${userBirth.northNode.longitude.toFixed(2).padStart(7)}° = ${userBirth.northNode.sign.padEnd(11)} ${userBirth.northNode.degree}`);
console.log(`  ☋ South Node: ${userBirth.southNode.longitude.toFixed(2).padStart(7)}° = ${userBirth.southNode.sign.padEnd(11)} ${userBirth.southNode.degree}`);
console.log('');
console.log('  ANGLES (with birth location):');
console.log(`  ASC Ascendant: ${userBirth.ascendant.longitude.toFixed(2).padStart(7)}° = ${userBirth.ascendant.sign.padEnd(11)} ${userBirth.ascendant.degree}`);
console.log(`  MC  Midheaven: ${userBirth.midheaven.longitude.toFixed(2).padStart(7)}° = ${userBirth.midheaven.sign.padEnd(11)} ${userBirth.midheaven.degree}`);
console.log('');
console.log('  VERIFICATION:');
console.log(`  Sun Sign:  ${userBirth.sun.sign === 'Virgo' ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Moon Sign: ${userBirth.moon.sign === 'Capricorn' ? '✅ PASS' : '❌ FAIL - got ' + userBirth.moon.sign}`);
console.log('');

// Test 5: Additional verification with different birth times on same day
console.log('Test 5: Moon movement throughout Sept 6, 1992');
for (let hour = 0; hour <= 24; hour += 6) {
  const pos = calculateBirthPositions(1992, 9, 6, hour, timezone);
  console.log(`  ${String(hour).padStart(2, '0')}:00 -> Moon at ${pos.moon.longitude.toFixed(2)}° ${pos.moon.sign} (${pos.moon.degree})`);
}
console.log('');

// Test 6: Check Moon position around the time it should be in Capricorn
// Moon moves ~13° per day, so let's check a range
console.log('Test 6: Moon positions around Sept 5-7, 1992 (noon UT)');
for (let day = 4; day <= 8; day++) {
  const jd = dateToJulianDay(1992, 9, day, 12);
  const moon = calculateMoonPosition(jd);
  console.log(`  Sept ${day}: ${moon.longitude.toFixed(2)}° ${getZodiacSign(moon.longitude)} (${formatDegree(moon.longitude)})`);
}
console.log('');

console.log('='.repeat(60));
console.log('Tests completed');
console.log('='.repeat(60));
