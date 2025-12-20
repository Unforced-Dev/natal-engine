/**
 * BirthCode Test Script
 * Tests all calculators against known birth data
 */

import calculateNumerology from './src/calculators/numerology.js';
import calculateBiorhythm from './src/calculators/biorhythm.js';
import { calculateSunSign, approximateMoonSign, calculateAstrology } from './src/calculators/astrology.js';
import calculateChinese from './src/calculators/chinese.js';
import calculateMayan from './src/calculators/mayan.js';
import calculateHumanDesign, { calculateGeneKeys } from './src/calculators/humandesign.js';

// Test cases with verified data
const TEST_CASES = [
  {
    name: "User's Birthday",
    birthDate: '1992-09-06',
    birthTime: '00:04',
    birthHour: 0.0667, // 00:04 AM
    timezone: -7, // Pacific Daylight Time
    location: { lat: 44.0, lon: -122.5 }, // Vida, OR area
    expected: {
      lifePath: 9,
      sunSign: 'Virgo',
      moonSign: 'Capricorn', // Verified from external sources
      chineseAnimal: 'Monkey',
      chineseElement: 'Water'
    }
  }
];

function runTests() {
  console.log('='.repeat(60));
  console.log('BirthCode Calculator Tests');
  console.log('='.repeat(60));
  console.log('');

  for (const testCase of TEST_CASES) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Birth: ${testCase.birthDate} ${testCase.birthTime}`);
    console.log('-'.repeat(40));

    // Numerology
    const numerology = calculateNumerology(testCase.birthDate);
    console.log(`\n📊 NUMEROLOGY:`);
    console.log(`  Life Path: ${numerology.lifePath} (expected: ${testCase.expected.lifePath})`);
    console.log(`  ${numerology.lifePath === testCase.expected.lifePath ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Type: ${numerology.lifePathMeaning.name}`);
    console.log(`  Birthday Number: ${numerology.birthdayNumber}`);
    console.log(`  Personal Year: ${numerology.personalYear}`);

    // Biorhythm
    const biorhythm = calculateBiorhythm(testCase.birthDate);
    console.log(`\n🌊 BIORHYTHM:`);
    console.log(`  Days Alive: ${biorhythm.daysAlive}`);
    console.log(`  Physical: ${Math.round(biorhythm.physical.value * 100)}% (${biorhythm.physical.phase})`);
    console.log(`  Emotional: ${Math.round(biorhythm.emotional.value * 100)}% (${biorhythm.emotional.phase})`);
    console.log(`  Intellectual: ${Math.round(biorhythm.intellectual.value * 100)}% (${biorhythm.intellectual.phase})`);

    // Astrology (sync version for quick test)
    const sunSign = calculateSunSign(testCase.birthDate);
    const moonSign = approximateMoonSign(testCase.birthDate);
    console.log(`\n⭐ ASTROLOGY (Sync - Approximate):`);
    console.log(`  Sun Sign: ${sunSign.name} (expected: ${testCase.expected.sunSign})`);
    console.log(`  ${sunSign.name === testCase.expected.sunSign ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Moon Sign: ${moonSign.sign.name} (expected: ${testCase.expected.moonSign})`);
    console.log(`  ${moonSign.sign.name === testCase.expected.moonSign ? '✅ PASS' : '⚠️ APPROXIMATE - needs ephemeris'}`);
    console.log(`  Element: ${sunSign.element}, Modality: ${sunSign.modality}`);

    // Chinese Astrology
    const chinese = calculateChinese(testCase.birthDate, testCase.birthHour);
    console.log(`\n🐲 CHINESE ASTROLOGY:`);
    console.log(`  Zodiac Animal: ${chinese.zodiacAnimal.emoji} ${chinese.zodiacAnimal.name} (expected: ${testCase.expected.chineseAnimal})`);
    console.log(`  ${chinese.zodiacAnimal.name === testCase.expected.chineseAnimal ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Element: ${chinese.element.primary} (expected: ${testCase.expected.chineseElement})`);
    console.log(`  ${chinese.element.primary === testCase.expected.chineseElement ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Day Master: ${chinese.dayMaster.description}`);
    console.log(`  BaZi: ${chinese.baziChart.year} ${chinese.baziChart.month} ${chinese.baziChart.day} ${chinese.baziChart.hour}`);

    // Mayan Tzolkin
    const mayan = calculateMayan(testCase.birthDate);
    console.log(`\n🌀 MAYAN TZOLKIN:`);
    console.log(`  Kin: ${mayan.kin}`);
    console.log(`  Day Sign: ${mayan.daySign.glyph} ${mayan.daySign.name}`);
    console.log(`  Galactic Tone: ${mayan.galacticTone.number} - ${mayan.galacticTone.name}`);
    console.log(`  Color: ${mayan.daySign.color}`);
    console.log(`  Wavespell: ${mayan.wavespell.sign.name}`);

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Run full tests with Meeus algorithms
function runFullTests() {
  console.log('Running Full Tests (with Meeus Algorithms)...\n');

  for (const testCase of TEST_CASES) {
    console.log(`Testing: ${testCase.name}`);
    console.log('-'.repeat(40));

    try {
      // Astrology with Meeus
      const astrology = calculateAstrology(
        testCase.birthDate,
        testCase.birthHour,
        testCase.timezone,
        testCase.location?.lat,
        testCase.location?.lon
      );

      console.log(`\n⭐ ASTROLOGY (Meeus Algorithms):`);
      console.log(`  Sun Sign: ${astrology.sun.sign.name} ${astrology.sun.degree || ''}`);
      console.log(`  Moon Sign: ${astrology.moon.sign.name} ${astrology.moon.degree || ''} (expected: ${testCase.expected.moonSign})`);
      console.log(`  ${astrology.moon.sign.name === testCase.expected.moonSign ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  Rising Sign: ${astrology.rising.sign.name}`);
      console.log(`  Using Meeus: ${astrology.useEphemeris ? 'Yes ✓' : 'No'}`);

      // Human Design with Meeus
      const humanDesign = calculateHumanDesign(
        testCase.birthDate,
        testCase.birthHour,
        testCase.timezone
      );

      console.log(`\n🔷 HUMAN DESIGN:`);
      console.log(`  Type: ${humanDesign.type.name}`);
      console.log(`  Strategy: ${humanDesign.type.strategy}`);
      console.log(`  Authority: ${humanDesign.authority.name}`);
      console.log(`  Profile: ${humanDesign.profile.numbers} ${humanDesign.profile.name}`);
      console.log(`  Sun Gate: ${humanDesign.gates.personality?.sun?.gate}.${humanDesign.gates.personality?.sun?.line}`);
      console.log(`  Moon Gate: ${humanDesign.gates.personality?.moon?.gate}.${humanDesign.gates.personality?.moon?.line}`);
      console.log(`  Incarnation Cross: ${humanDesign.incarnationCross.name}`);
      console.log(`  Active Gates: ${humanDesign.gates.all?.length || 0}`);
      console.log(`  Using Meeus: ${humanDesign.useEphemeris ? 'Yes ✓' : 'No'}`);

      const geneKeys = calculateGeneKeys(humanDesign);
      console.log(`\n🧬 GENE KEYS:`);
      console.log(`  Life's Work: Gene Key ${geneKeys.lifeWork.key} - ${geneKeys.lifeWork.name}`);
      console.log(`  Evolution: Gene Key ${geneKeys.evolution.key} - ${geneKeys.evolution.name}`);

    } catch (error) {
      console.error(`  Error: ${error.message}`);
      console.error(error.stack);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Run sync tests first
runTests();

// Then run full tests
runFullTests();
console.log('All tests completed.');
