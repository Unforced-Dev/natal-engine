/**
 * BirthCode Test Data
 * Verified birth chart data for testing calculators
 *
 * Add your verified data here to test the calculators
 */

export const TEST_CASES = [
  {
    name: "Test User 1",
    birthDate: "1992-09-06",
    birthTime: "00:04", // 12:04 AM
    birthCity: "Vida, OR",
    latitude: 44.0486,
    longitude: -122.5856,
    timezone: -7, // PDT

    // VERIFIED VALUES - these are known correct
    expected: {
      numerology: {
        lifePath: 9,           // 9 + 6 + 1992 = 9 + 6 + 21 = 9 + 6 + 3 = 18 = 9
        birthdayNumber: 6,
      },
      astrology: {
        sunSign: "Virgo",      // Sept 6 = Virgo
        moonSign: "Capricorn", // VERIFIED
        // risingSign: "?",    // Need to verify
      },
      chinese: {
        zodiacAnimal: "Monkey", // 1992 is Year of the Monkey
        element: "Water",       // 1992 is Water Monkey
      },
      // humanDesign: {
      //   type: "?",
      //   profile: "?",
      // },
      // mayan: {
      //   kin: "?",
      //   daySign: "?",
      // },
    }
  },

  // Famous people with known charts for validation
  {
    name: "Albert Einstein",
    birthDate: "1879-03-14",
    birthTime: "11:30",
    birthCity: "Ulm, Germany",
    latitude: 48.4011,
    longitude: 9.9876,
    timezone: 1,

    expected: {
      numerology: {
        lifePath: 6,  // 3 + 14 + 1879 = 3 + 5 + 25 = 33 -> Some say 33 (master), some say 6
        birthdayNumber: 5,
      },
      astrology: {
        sunSign: "Pisces",
        // moonSign: "Sagittarius", // Need to verify exact
      },
      chinese: {
        zodiacAnimal: "Rabbit", // 1879
        element: "Earth",
      },
    }
  },

  {
    name: "Beyoncé",
    birthDate: "1981-09-04",
    birthTime: "10:00",
    birthCity: "Houston, TX",
    latitude: 29.7604,
    longitude: -95.3698,
    timezone: -5,

    expected: {
      numerology: {
        lifePath: 5,  // 9 + 4 + 1981 = 9 + 4 + 19 = 9 + 4 + 1 = 14 = 5
        birthdayNumber: 4,
      },
      astrology: {
        sunSign: "Virgo",
        moonSign: "Scorpio",
      },
      chinese: {
        zodiacAnimal: "Rooster", // 1981
        element: "Metal",
      },
    }
  },
];

/**
 * Run tests and report results
 */
export function runTests(calculators) {
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  for (const testCase of TEST_CASES) {
    console.log(`\nTesting: ${testCase.name} (${testCase.birthDate})`);

    // Test Numerology
    if (testCase.expected.numerology && calculators.numerology) {
      const numResult = calculators.numerology(testCase.birthDate);

      if (testCase.expected.numerology.lifePath !== undefined) {
        if (numResult.lifePath === testCase.expected.numerology.lifePath) {
          console.log(`  ✓ Life Path: ${numResult.lifePath}`);
          results.passed++;
        } else {
          console.log(`  ✗ Life Path: got ${numResult.lifePath}, expected ${testCase.expected.numerology.lifePath}`);
          results.failed++;
          results.errors.push({
            testCase: testCase.name,
            system: 'numerology',
            field: 'lifePath',
            got: numResult.lifePath,
            expected: testCase.expected.numerology.lifePath
          });
        }
      }

      if (testCase.expected.numerology.birthdayNumber !== undefined) {
        if (numResult.birthdayNumber === testCase.expected.numerology.birthdayNumber) {
          console.log(`  ✓ Birthday Number: ${numResult.birthdayNumber}`);
          results.passed++;
        } else {
          console.log(`  ✗ Birthday Number: got ${numResult.birthdayNumber}, expected ${testCase.expected.numerology.birthdayNumber}`);
          results.failed++;
        }
      }
    }

    // Test Astrology
    if (testCase.expected.astrology && calculators.astrology) {
      const astroResult = calculators.astrology(testCase.birthDate);

      if (testCase.expected.astrology.sunSign) {
        if (astroResult.sun.sign.name === testCase.expected.astrology.sunSign) {
          console.log(`  ✓ Sun Sign: ${astroResult.sun.sign.name}`);
          results.passed++;
        } else {
          console.log(`  ✗ Sun Sign: got ${astroResult.sun.sign.name}, expected ${testCase.expected.astrology.sunSign}`);
          results.failed++;
        }
      }

      if (testCase.expected.astrology.moonSign) {
        if (astroResult.moon.sign.name === testCase.expected.astrology.moonSign) {
          console.log(`  ✓ Moon Sign: ${astroResult.moon.sign.name}`);
          results.passed++;
        } else {
          console.log(`  ✗ Moon Sign: got ${astroResult.moon.sign.name}, expected ${testCase.expected.astrology.moonSign}`);
          results.failed++;
          results.errors.push({
            testCase: testCase.name,
            system: 'astrology',
            field: 'moonSign',
            got: astroResult.moon.sign.name,
            expected: testCase.expected.astrology.moonSign,
            note: 'Moon sign requires precise ephemeris calculation'
          });
        }
      }
    }

    // Test Chinese
    if (testCase.expected.chinese && calculators.chinese) {
      const chineseResult = calculators.chinese(testCase.birthDate);

      if (testCase.expected.chinese.zodiacAnimal) {
        if (chineseResult.zodiacAnimal.name === testCase.expected.chinese.zodiacAnimal) {
          console.log(`  ✓ Chinese Zodiac: ${chineseResult.zodiacAnimal.name}`);
          results.passed++;
        } else {
          console.log(`  ✗ Chinese Zodiac: got ${chineseResult.zodiacAnimal.name}, expected ${testCase.expected.chinese.zodiacAnimal}`);
          results.failed++;
        }
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${results.passed} passed, ${results.failed} failed`);

  if (results.errors.length > 0) {
    console.log('\nErrors requiring attention:');
    results.errors.forEach(e => {
      console.log(`  - ${e.testCase}: ${e.system}.${e.field}`);
      if (e.note) console.log(`    Note: ${e.note}`);
    });
  }

  return results;
}

export default TEST_CASES;
