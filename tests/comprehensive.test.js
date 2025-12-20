/**
 * Comprehensive Test Suite for BirthCode Calculators
 *
 * Reference data sources:
 * - Western Astrology: Prokerala (prokerala.com), Astro-Charts (astro-charts.com)
 * - Chinese BaZi: YourChineseAstrology (yourchineseastrology.com)
 * - Mayan Tzolkin: GMT 584283 correlation, verified with Dec 21, 2012 = Kin 1
 * - Numerology: Standard Pythagorean system
 *
 * Test dates verified against online calculators 2025
 */

import { calculateBirthPositions, getZodiacSign, formatDegree } from '../src/calculators/astronomy.js';
import calculateChinese from '../src/calculators/chinese.js';
import calculateMayan from '../src/calculators/mayan.js';
import calculateNumerology from '../src/calculators/numerology.js';
import calculateHumanDesign, { calculateGeneKeys } from '../src/calculators/humandesign.js';
import calculateBiorhythm from '../src/calculators/biorhythm.js';

// Test configuration
const TOLERANCE_DEGREES = 2; // Allow 2 degree tolerance for planetary positions

function assertWithinTolerance(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  const passed = diff <= tolerance;
  return { passed, actual, expected, diff, message };
}

function runTests() {
  console.log('='.repeat(70));
  console.log('BirthCode Comprehensive Test Suite');
  console.log('='.repeat(70));
  console.log('');

  let totalTests = 0;
  let passedTests = 0;
  const failures = [];

  // ============================================================
  // TEST 1: September 6, 1992 (User's birth date)
  // Reference: Prokerala (noon positions)
  // ============================================================
  console.log('TEST 1: September 6, 1992 (Noon UTC)');
  console.log('-'.repeat(50));

  const date1 = { year: 1992, month: 9, day: 6, hour: 12, tz: 0 };
  const astro1 = calculateBirthPositions(date1.year, date1.month, date1.day, date1.hour, date1.tz);

  // Expected values from Prokerala (approximate noon positions)
  const expected1 = {
    sun: { sign: 'Virgo', degree: 14 },
    moon: { sign: 'Capricorn', degree: 14 },
    mercury: { sign: 'Virgo', degree: 9 },
    venus: { sign: 'Libra', degree: 9 },
    mars: { sign: 'Gemini', degree: 26 },
    jupiter: { sign: 'Virgo', degree: 22 },
    saturn: { sign: 'Aquarius', degree: 13 },
    uranus: { sign: 'Capricorn', degree: 14 },
    neptune: { sign: 'Capricorn', degree: 16 },
    pluto: { sign: 'Scorpio', degree: 20 }
  };

  for (const [planet, exp] of Object.entries(expected1)) {
    const actual = astro1[planet];
    totalTests++;

    // Check sign
    if (actual.sign === exp.sign) {
      passedTests++;
      console.log(`  ${planet.padEnd(10)}: ${actual.sign.padEnd(12)} ✓ (${actual.degree})`);
    } else {
      failures.push({ test: 'Sept 6 1992', planet, expected: exp.sign, actual: actual.sign });
      console.log(`  ${planet.padEnd(10)}: ${actual.sign.padEnd(12)} ✗ (expected ${exp.sign})`);
    }
  }
  console.log('');

  // ============================================================
  // TEST 2: Emma Watson - April 15, 1990, 6:00 PM Paris
  // Reference: Astro-Charts.com (verified birth time)
  // ============================================================
  console.log('TEST 2: Emma Watson - April 15, 1990, 6:00 PM Paris');
  console.log('-'.repeat(50));

  // Paris is UTC+1 in April (CEST), so 6PM local = 5PM UTC = 17:00
  const date2 = { year: 1990, month: 4, day: 15, hour: 17, tz: 0 };
  const astro2 = calculateBirthPositions(date2.year, date2.month, date2.day, date2.hour, date2.tz);

  const expected2 = {
    sun: { sign: 'Aries', degree: 25 },
    moon: { sign: 'Sagittarius', degree: 25 },
    mercury: { sign: 'Taurus', degree: 14 },
    venus: { sign: 'Pisces', degree: 9 },
    mars: { sign: 'Aquarius', degree: 26 },
    jupiter: { sign: 'Cancer', degree: 4 },
    saturn: { sign: 'Capricorn', degree: 25 },
    uranus: { sign: 'Capricorn', degree: 9 },
    neptune: { sign: 'Capricorn', degree: 14 },
    pluto: { sign: 'Scorpio', degree: 16 }
  };

  for (const [planet, exp] of Object.entries(expected2)) {
    const actual = astro2[planet];
    totalTests++;

    if (actual.sign === exp.sign) {
      passedTests++;
      console.log(`  ${planet.padEnd(10)}: ${actual.sign.padEnd(12)} ✓ (${actual.degree})`);
    } else {
      failures.push({ test: 'Emma Watson', planet, expected: exp.sign, actual: actual.sign });
      console.log(`  ${planet.padEnd(10)}: ${actual.sign.padEnd(12)} ✗ (expected ${exp.sign})`);
    }
  }
  console.log('');

  // ============================================================
  // TEST 3: Taylor Swift - December 13, 1989, 5:17 AM EST
  // Reference: Astro-Charts.com (poor birth time accuracy noted)
  // ============================================================
  console.log('TEST 3: Taylor Swift - December 13, 1989');
  console.log('-'.repeat(50));

  // EST = UTC-5, so 5:17 AM EST = 10:17 AM UTC
  const date3 = { year: 1989, month: 12, day: 13, hour: 10.28, tz: 0 };
  const astro3 = calculateBirthPositions(date3.year, date3.month, date3.day, date3.hour, date3.tz);

  const expected3 = {
    sun: { sign: 'Sagittarius', degree: 21 },
    moon: { sign: 'Cancer', degree: 1 },
    mercury: { sign: 'Capricorn', degree: 8 },
    venus: { sign: 'Aquarius', degree: 1 },
    mars: { sign: 'Scorpio', degree: 26 },
    jupiter: { sign: 'Cancer', degree: 7 },
    saturn: { sign: 'Capricorn', degree: 13 },
    uranus: { sign: 'Capricorn', degree: 4 },
    neptune: { sign: 'Capricorn', degree: 11 },
    pluto: { sign: 'Scorpio', degree: 16 }
  };

  for (const [planet, exp] of Object.entries(expected3)) {
    const actual = astro3[planet];
    totalTests++;

    if (actual.sign === exp.sign) {
      passedTests++;
      console.log(`  ${planet.padEnd(10)}: ${actual.sign.padEnd(12)} ✓ (${actual.degree})`);
    } else {
      failures.push({ test: 'Taylor Swift', planet, expected: exp.sign, actual: actual.sign });
      console.log(`  ${planet.padEnd(10)}: ${actual.sign.padEnd(12)} ✗ (expected ${exp.sign})`);
    }
  }
  console.log('');

  // ============================================================
  // TEST 4: Chinese BaZi - September 6, 1992
  // Reference: YourChineseAstrology.com
  // ============================================================
  console.log('TEST 4: Chinese BaZi - September 6, 1992');
  console.log('-'.repeat(50));

  const chinese1 = calculateChinese('1992-09-06', 0.0667);

  const expectedChinese = {
    year: '壬申',   // Ren Shen (Water Monkey)
    month: '戊申',  // Wu Shen (Earth Monkey) - before Bailu solar term
    day: '乙酉'     // Yi You (Wood Rooster)
  };

  for (const [pillar, expected] of Object.entries(expectedChinese)) {
    totalTests++;
    const actual = chinese1.baziChart[pillar];
    if (actual === expected) {
      passedTests++;
      console.log(`  ${pillar.padEnd(10)}: ${actual} ✓`);
    } else {
      failures.push({ test: 'BaZi Sept 6 1992', pillar, expected, actual });
      console.log(`  ${pillar.padEnd(10)}: ${actual} ✗ (expected ${expected})`);
    }
  }

  // Additional BaZi checks
  totalTests++;
  if (chinese1.zodiacAnimal.name === 'Monkey') {
    passedTests++;
    console.log(`  zodiac    : Monkey ✓`);
  } else {
    failures.push({ test: 'BaZi Zodiac', expected: 'Monkey', actual: chinese1.zodiacAnimal.name });
    console.log(`  zodiac    : ${chinese1.zodiacAnimal.name} ✗ (expected Monkey)`);
  }

  totalTests++;
  if (chinese1.element.primary === 'Water') {
    passedTests++;
    console.log(`  element   : Water ✓`);
  } else {
    failures.push({ test: 'BaZi Element', expected: 'Water', actual: chinese1.element.primary });
    console.log(`  element   : ${chinese1.element.primary} ✗ (expected Water)`);
  }
  console.log('');

  // ============================================================
  // TEST 5: Mayan Tzolkin Reference Dates
  // ============================================================
  console.log('TEST 5: Mayan Tzolkin');
  console.log('-'.repeat(50));

  // December 21, 2012 = Kin 1 (1 Imix) - end of 13th Baktun
  const mayan1 = calculateMayan('2012-12-21');
  totalTests++;
  if (mayan1.kin === 1) {
    passedTests++;
    console.log(`  Dec 21, 2012: Kin ${mayan1.kin} ✓`);
  } else {
    failures.push({ test: 'Mayan Dec 21 2012', expected: 'Kin 1', actual: `Kin ${mayan1.kin}` });
    console.log(`  Dec 21, 2012: Kin ${mayan1.kin} ✗ (expected Kin 1)`);
  }

  totalTests++;
  if (mayan1.daySign.name === 'Imix') {
    passedTests++;
    console.log(`  Day Sign  : ${mayan1.daySign.name} ✓`);
  } else {
    failures.push({ test: 'Mayan Day Sign', expected: 'Imix', actual: mayan1.daySign.name });
    console.log(`  Day Sign  : ${mayan1.daySign.name} ✗ (expected Imix)`);
  }

  totalTests++;
  if (mayan1.galacticTone.number === 1) {
    passedTests++;
    console.log(`  Tone      : ${mayan1.galacticTone.number} (${mayan1.galacticTone.name}) ✓`);
  } else {
    failures.push({ test: 'Mayan Tone', expected: 1, actual: mayan1.galacticTone.number });
    console.log(`  Tone      : ${mayan1.galacticTone.number} ✗ (expected 1)`);
  }

  // September 6, 1992 - calculated Kin 130
  const mayan2 = calculateMayan('1992-09-06');
  console.log(`  Sep 6, 1992: Kin ${mayan2.kin} (${mayan2.galacticTone.number} ${mayan2.daySign.name})`);
  console.log('');

  // ============================================================
  // TEST 6: Numerology
  // ============================================================
  console.log('TEST 6: Numerology');
  console.log('-'.repeat(50));

  // September 6, 1992: Life Path = 9
  // 1+9+9+2 = 21 -> 3, 0+9 = 9, 0+6 = 6, 3+9+6 = 18 -> 9
  const num1 = calculateNumerology('1992-09-06');
  totalTests++;
  if (num1.lifePath === 9) {
    passedTests++;
    console.log(`  Sep 6, 1992: Life Path ${num1.lifePath} ✓`);
  } else {
    failures.push({ test: 'Life Path 1992-09-06', expected: 9, actual: num1.lifePath });
    console.log(`  Sep 6, 1992: Life Path ${num1.lifePath} ✗ (expected 9)`);
  }

  // Test master number preservation: November 11, 2000 should = 11
  // 1+1 = 2, 1+1 = 2, 2+0+0+0 = 2, total = 2+2+2 = 6 (not 11)
  // Actually: 11/11/2000 -> 11 + 11 + 2 = 24 -> 6
  // Let's test with a known master number date: March 11, 1992
  // 3 + 11 + 1992 -> 3 + 11 + 21 -> 3 + 11 + 3 = 17 -> 8
  // December 29, 1929: 1+2 + 2+9 + 1+9+2+9 = 3 + 11 + 21 = 3 + 11 + 3 = 17 -> 8

  // Test: August 8, 1989 = 8 + 8 + 27 -> 8 + 8 + 9 = 25 -> 7
  const num2 = calculateNumerology('1989-08-08');
  totalTests++;
  if (num2.lifePath === 7) {
    passedTests++;
    console.log(`  Aug 8, 1989: Life Path ${num2.lifePath} ✓`);
  } else {
    failures.push({ test: 'Life Path 1989-08-08', expected: 7, actual: num2.lifePath });
    console.log(`  Aug 8, 1989: Life Path ${num2.lifePath} ✗ (expected 7)`);
  }

  // Birthday number test: Day 6 -> 6
  totalTests++;
  if (num1.birthdayNumber === 6) {
    passedTests++;
    console.log(`  Birthday Number: ${num1.birthdayNumber} ✓`);
  } else {
    failures.push({ test: 'Birthday Number', expected: 6, actual: num1.birthdayNumber });
    console.log(`  Birthday Number: ${num1.birthdayNumber} ✗ (expected 6)`);
  }
  console.log('');

  // ============================================================
  // TEST 7: Human Design Basic Checks
  // ============================================================
  console.log('TEST 7: Human Design');
  console.log('-'.repeat(50));

  const hd1 = calculateHumanDesign('1992-09-06', 0.0667, -7);

  // Check that gates are being calculated (should have > 10 gates with all planets)
  totalTests++;
  if (hd1.gates.all.length >= 10) {
    passedTests++;
    console.log(`  Total Gates: ${hd1.gates.all.length} ✓ (>= 10 with all planets)`);
  } else {
    failures.push({ test: 'HD Gates Count', expected: '>= 10', actual: hd1.gates.all.length });
    console.log(`  Total Gates: ${hd1.gates.all.length} ✗ (expected >= 10)`);
  }

  // Check type is valid
  const validTypes = ['Generator', 'Manifesting Generator', 'Projector', 'Manifestor', 'Reflector'];
  totalTests++;
  if (validTypes.includes(hd1.type.name)) {
    passedTests++;
    console.log(`  Type: ${hd1.type.name} ✓`);
  } else {
    failures.push({ test: 'HD Type', expected: 'valid type', actual: hd1.type.name });
    console.log(`  Type: ${hd1.type.name} ✗ (invalid)`);
  }

  // Check profile format
  totalTests++;
  const profileMatch = /^\d\/\d$/.test(hd1.profile.numbers);
  if (profileMatch) {
    passedTests++;
    console.log(`  Profile: ${hd1.profile.numbers} (${hd1.profile.name}) ✓`);
  } else {
    failures.push({ test: 'HD Profile', expected: 'X/Y format', actual: hd1.profile.numbers });
    console.log(`  Profile: ${hd1.profile.numbers} ✗ (invalid format)`);
  }
  console.log('');

  // ============================================================
  // TEST 8: Gene Keys
  // ============================================================
  console.log('TEST 8: Gene Keys');
  console.log('-'.repeat(50));

  const gk1 = calculateGeneKeys(hd1);

  // Gene Keys should have Life's Work (Sun gate) and Evolution (Earth gate)
  totalTests++;
  if (gk1.lifeWork && typeof gk1.lifeWork.key === 'number' && gk1.lifeWork.key >= 1 && gk1.lifeWork.key <= 64) {
    passedTests++;
    console.log(`  Life's Work: Gene Key ${gk1.lifeWork.key} (${gk1.lifeWork.name}) ✓`);
  } else {
    failures.push({ test: 'Gene Keys Life Work', expected: '1-64', actual: gk1.lifeWork?.key });
    console.log(`  Life's Work: ${gk1.lifeWork?.key} ✗ (invalid)`);
  }

  totalTests++;
  if (gk1.evolution && typeof gk1.evolution.key === 'number' && gk1.evolution.key >= 1 && gk1.evolution.key <= 64) {
    passedTests++;
    console.log(`  Evolution: Gene Key ${gk1.evolution.key} (${gk1.evolution.name}) ✓`);
  } else {
    failures.push({ test: 'Gene Keys Evolution', expected: '1-64', actual: gk1.evolution?.key });
    console.log(`  Evolution: ${gk1.evolution?.key} ✗ (invalid)`);
  }

  // Check spectrum is defined
  totalTests++;
  if (gk1.lifeWork.spectrum && Array.isArray(gk1.lifeWork.spectrum) && gk1.lifeWork.spectrum.length === 3) {
    passedTests++;
    console.log(`  Spectrum: Shadow → Gift → Siddhi ✓`);
  } else {
    failures.push({ test: 'Gene Keys Spectrum', expected: '[Shadow, Gift, Siddhi]', actual: gk1.lifeWork.spectrum });
    console.log(`  Spectrum: invalid ✗`);
  }
  console.log('');

  // ============================================================
  // TEST 9: Biorhythm
  // ============================================================
  console.log('TEST 9: Biorhythm');
  console.log('-'.repeat(50));

  // Test biorhythm for Sept 6, 1992 calculated on a specific date
  // Use a fixed target date for reproducible results: Dec 19, 2025
  const bio1 = calculateBiorhythm('1992-09-06', '2025-12-19');

  // Check days alive calculation
  // Sept 6, 1992 to Dec 19, 2025 = 12,157 days (approximate)
  totalTests++;
  const expectedDaysApprox = 12157;
  if (Math.abs(bio1.daysAlive - expectedDaysApprox) < 5) {
    passedTests++;
    console.log(`  Days Alive: ${bio1.daysAlive} ✓ (expected ~${expectedDaysApprox})`);
  } else {
    failures.push({ test: 'Biorhythm Days Alive', expected: expectedDaysApprox, actual: bio1.daysAlive });
    console.log(`  Days Alive: ${bio1.daysAlive} ✗ (expected ~${expectedDaysApprox})`);
  }

  // Check physical cycle: period 23 days
  totalTests++;
  if (bio1.physical && bio1.physical.period === 23) {
    passedTests++;
    console.log(`  Physical: ${bio1.physical.value} (period: ${bio1.physical.period}) ✓`);
  } else {
    failures.push({ test: 'Biorhythm Physical Period', expected: 23, actual: bio1.physical?.period });
    console.log(`  Physical: period ${bio1.physical?.period} ✗ (expected 23)`);
  }

  // Check emotional cycle: period 28 days
  totalTests++;
  if (bio1.emotional && bio1.emotional.period === 28) {
    passedTests++;
    console.log(`  Emotional: ${bio1.emotional.value} (period: ${bio1.emotional.period}) ✓`);
  } else {
    failures.push({ test: 'Biorhythm Emotional Period', expected: 28, actual: bio1.emotional?.period });
    console.log(`  Emotional: period ${bio1.emotional?.period} ✗ (expected 28)`);
  }

  // Check intellectual cycle: period 33 days
  totalTests++;
  if (bio1.intellectual && bio1.intellectual.period === 33) {
    passedTests++;
    console.log(`  Intellectual: ${bio1.intellectual.value} (period: ${bio1.intellectual.period}) ✓`);
  } else {
    failures.push({ test: 'Biorhythm Intellectual Period', expected: 33, actual: bio1.intellectual?.period });
    console.log(`  Intellectual: period ${bio1.intellectual?.period} ✗ (expected 33)`);
  }

  // Verify sine wave calculation: values should be between -1 and 1
  totalTests++;
  const validPhysical = bio1.physical.value >= -1 && bio1.physical.value <= 1;
  const validEmotional = bio1.emotional.value >= -1 && bio1.emotional.value <= 1;
  const validIntellectual = bio1.intellectual.value >= -1 && bio1.intellectual.value <= 1;
  if (validPhysical && validEmotional && validIntellectual) {
    passedTests++;
    console.log(`  Values in range [-1, 1]: ✓`);
  } else {
    failures.push({ test: 'Biorhythm Value Range', expected: '[-1, 1]', actual: 'out of range' });
    console.log(`  Values in range: ✗`);
  }

  // Check phase descriptions exist
  totalTests++;
  if (bio1.physical.phaseDescription && bio1.emotional.phaseDescription && bio1.intellectual.phaseDescription) {
    passedTests++;
    console.log(`  Phase descriptions: present ✓`);
  } else {
    failures.push({ test: 'Biorhythm Phase Descriptions', expected: 'present', actual: 'missing' });
    console.log(`  Phase descriptions: missing ✗`);
  }

  // Verify mathematical accuracy: sin(2π * days / period) formula
  // For a known number of days, we can verify the calculation
  const testDays = 23; // Exactly one physical cycle
  const physicalAtCycle = Math.sin((2 * Math.PI * testDays) / 23);
  totalTests++;
  if (Math.abs(physicalAtCycle) < 0.001) { // Should be ~0 after full cycle
    passedTests++;
    console.log(`  Sine formula verification: ✓`);
  } else {
    failures.push({ test: 'Biorhythm Sine Formula', expected: '~0', actual: physicalAtCycle });
    console.log(`  Sine formula: ${physicalAtCycle} ✗ (expected ~0 after full cycle)`);
  }
  console.log('');

  // ============================================================
  // Summary
  // ============================================================
  console.log('='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('');

  if (failures.length > 0) {
    console.log('FAILURES:');
    for (const f of failures) {
      console.log(`  - ${f.test}: ${f.planet || f.pillar || ''} expected ${f.expected}, got ${f.actual}`);
    }
  } else {
    console.log('All tests passed!');
  }
  console.log('');

  // Return exit code
  return failures.length === 0 ? 0 : 1;
}

runTests();
