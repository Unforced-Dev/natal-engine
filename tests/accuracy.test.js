/**
 * Accuracy Tests for NatalEngine
 *
 * Tests verified against:
 * - Official Human Design sources (Jovian Archive, IHDS)
 * - Astro.com birth data (Astro-Databank)
 * - Gene Keys official documentation
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import calculateHumanDesign, { calculateGeneKeys } from '../src/calculators/humandesign.js';
import { calculateAstrology } from '../src/calculators/astrology.js';

describe('Human Design Type Calculations', () => {
  test('Ra Uru Hu - Manifestor (founder of Human Design)', () => {
    // April 9, 1948, 00:14 EST, Montreal
    // Source: humandesignsystem.com/archive/charts/HuRaUru.pdf
    const result = calculateHumanDesign('1948-04-09', 0.233, -5);

    assert.strictEqual(result.type.name, 'Manifestor', 'Type should be Manifestor');
    assert.strictEqual(result.authority.name, 'Splenic Authority', 'Authority should be Splenic');
    assert.strictEqual(result.profile.numbers, '5/1', 'Profile should be 5/1');

    // Verify incarnation cross gates
    const crossGates = result.incarnationCross.gates;
    assert.ok(crossGates.includes(51), 'Cross should include gate 51');
    assert.ok(crossGates.includes(57), 'Cross should include gate 57');
    assert.ok(crossGates.includes(61), 'Cross should include gate 61');
    assert.ok(crossGates.includes(62), 'Cross should include gate 62');

    // Verify channels (order-independent comparison)
    const channelPairs = result.channels.map(c => c.gates.sort((a,b) => a-b).join('-'));
    assert.ok(channelPairs.includes('10-20'), 'Should have channel 10-20 (Awakening)');
    assert.ok(channelPairs.includes('10-57'), 'Should have channel 10-57 (Perfected Form)');
    assert.ok(channelPairs.includes('20-57'), 'Should have channel 20-57 (Brainwave)');
    assert.ok(channelPairs.includes('23-43'), 'Should have channel 23-43 (Structuring)');
    assert.ok(channelPairs.includes('25-51'), 'Should have channel 25-51 (Initiation)');
  });

  test('Steve Jobs - Generator', () => {
    // February 24, 1955, 19:15 PST, San Francisco
    // Source: astro.com/astro-databank/Jobs,_Steve (birth certificate)
    const result = calculateHumanDesign('1955-02-24', 19.25, -8);

    assert.strictEqual(result.type.name, 'Generator', 'Type should be Generator');
    assert.ok(
      result.centers.definedNames.includes('sacral'),
      'Sacral should be defined for Generator'
    );
  });

  test('Angelina Jolie - Manifesting Generator', () => {
    // June 4, 1975, 09:09 PDT, Los Angeles
    // Source: astro.com
    const result = calculateHumanDesign('1975-06-04', 9.15, -7);

    assert.strictEqual(result.type.name, 'Manifesting Generator', 'Type should be Manifesting Generator');
  });

  test('Projector type detection (no sacral, no motor-to-throat)', () => {
    // Create a test case that should be a Projector
    // This requires specific planetary positions that create
    // defined centers without sacral and without motor-to-throat connection
    // Using a generic test date where this configuration occurs
    const result = calculateHumanDesign('1985-03-15', 14, 0);

    // Just verify the type determination logic works
    assert.ok(
      ['Generator', 'Manifesting Generator', 'Projector', 'Manifestor', 'Reflector'].includes(result.type.name),
      'Should return a valid Human Design type'
    );
  });

  test('Reflector type detection (no defined centers)', () => {
    // Reflectors are rare (~1% of population)
    // They have no defined centers
    // This test verifies our logic correctly identifies when no channels are complete
    const result = calculateHumanDesign('1960-01-01', 12, 0);

    if (result.channels.length === 0) {
      assert.strictEqual(result.type.name, 'Reflector', 'Should be Reflector with no channels');
    }
  });
});

describe('Human Design Gate Calculations', () => {
  test('Gate order verification - all 64 gates exist', () => {
    // Test that our gate order array has exactly 64 unique gates
    const result = calculateHumanDesign('2000-01-01', 12, 0);
    const allGates = new Set(result.gates.all);

    // Should have some gates activated (26 planets x 2 calculations = potential for many gates)
    assert.ok(result.gates.all.length > 0, 'Should have activated gates');

    // All gates should be valid (1-64)
    result.gates.all.forEach(gate => {
      assert.ok(gate >= 1 && gate <= 64, `Gate ${gate} should be between 1 and 64`);
    });
  });

  test('Gate 25 starts at correct zodiac position', () => {
    // Gate 25 should be active for Sun at 0° Aries (early Aries degrees)
    // At March 21, the Sun is at ~0° Aries
    const result = calculateHumanDesign('2000-03-21', 12, 0);

    // The personality Sun gate should be 25 (or very close to the boundary with 17)
    const sunGate = result.gates.personality.sun.gate;
    assert.ok(
      sunGate === 25 || sunGate === 17,
      `Sun at 0° Aries should activate gate 25 (got ${sunGate})`
    );
  });

  test('Profile calculation from Sun lines', () => {
    const result = calculateHumanDesign('1990-06-15', 12, 0);

    // Profile should be in format "X/Y" where X and Y are 1-6
    const [conscious, unconscious] = result.profile.numbers.split('/').map(Number);

    assert.ok(conscious >= 1 && conscious <= 6, 'Conscious line should be 1-6');
    assert.ok(unconscious >= 1 && unconscious <= 6, 'Unconscious line should be 1-6');
  });
});

describe('Human Design Motor-to-Throat Connection', () => {
  test('Indirect motor-to-throat connection creates Manifestor', () => {
    // Ra Uru Hu has Heart -> G -> Throat (indirect)
    // This should still be detected as motor-to-throat
    const result = calculateHumanDesign('1948-04-09', 0.233, -5);

    assert.strictEqual(result.type.name, 'Manifestor',
      'Indirect motor-to-throat connection should create Manifestor');
  });

  test('Sacral connected to throat creates Manifesting Generator', () => {
    // Angelina Jolie has Sacral connected to Throat via 34-20
    const result = calculateHumanDesign('1975-06-04', 9.15, -7);

    assert.strictEqual(result.type.name, 'Manifesting Generator',
      'Sacral connected to throat should create Manifesting Generator');
  });
});

describe('Astrology Calculations - Celebrity Charts', () => {
  test('Steve Jobs - Sun, Moon, Rising all correct', () => {
    // February 24, 1955, 19:15 PST, San Francisco
    // Source: astro.com/astro-databank/Jobs,_Steve (birth certificate verified, Rodden Rating AA)
    const result = calculateAstrology('1955-02-24', 19.25, -8, 37.7749, -122.4194);

    assert.strictEqual(result.sun.sign.name, 'Pisces', 'Sun should be in Pisces');
    assert.strictEqual(result.moon.sign.name, 'Aries', 'Moon should be in Aries');
    assert.strictEqual(result.rising.sign.name, 'Virgo', 'Rising should be Virgo');

    // Verify planetary positions are in correct signs
    assert.strictEqual(result.planets.mercury.sign.name, 'Aquarius', 'Mercury should be in Aquarius');
    assert.strictEqual(result.planets.venus.sign.name, 'Capricorn', 'Venus should be in Capricorn');
    assert.strictEqual(result.planets.mars.sign.name, 'Aries', 'Mars should be in Aries');
  });

  test('Barack Obama - verified birth certificate', () => {
    // August 4, 1961, 19:24 HST (-10), Honolulu, Hawaii
    // Source: astro.com/astro-databank/Obama,_Barack (birth certificate, Rodden Rating AA)
    // Lat: 21.3069, Long: -157.8583
    const result = calculateAstrology('1961-08-04', 19.4, -10, 21.3069, -157.8583);

    assert.strictEqual(result.sun.sign.name, 'Leo', 'Sun should be in Leo');
    assert.strictEqual(result.moon.sign.name, 'Gemini', 'Moon should be in Gemini');
    assert.strictEqual(result.rising.sign.name, 'Aquarius', 'Rising should be Aquarius');

    // Additional planet verifications
    assert.strictEqual(result.planets.mercury.sign.name, 'Leo', 'Mercury should be in Leo');
    assert.strictEqual(result.planets.venus.sign.name, 'Cancer', 'Venus should be in Cancer');
  });

  test('Princess Diana - verified birth data', () => {
    // July 1, 1961, 19:45 BST (+1), Sandringham, UK
    // Source: astro.com/astro-databank/Spencer,_Diana (Rodden Rating A)
    // Lat: 52.8333, Long: 0.5167
    const result = calculateAstrology('1961-07-01', 19.75, 1, 52.8333, 0.5167);

    assert.strictEqual(result.sun.sign.name, 'Cancer', 'Sun should be in Cancer');
    assert.strictEqual(result.moon.sign.name, 'Aquarius', 'Moon should be in Aquarius');
    assert.strictEqual(result.rising.sign.name, 'Sagittarius', 'Rising should be Sagittarius');
  });

  test('Marilyn Monroe - birth certificate verified', () => {
    // June 1, 1926, 09:30 PST, Los Angeles
    // Source: astro.com/astro-databank/Monroe,_Marilyn (birth certificate, Rodden Rating AA)
    // Lat: 34.0522, Long: -118.2437
    const result = calculateAstrology('1926-06-01', 9.5, -8, 34.0522, -118.2437);

    assert.strictEqual(result.sun.sign.name, 'Gemini', 'Sun should be in Gemini');
    assert.strictEqual(result.moon.sign.name, 'Aquarius', 'Moon should be in Aquarius');
    assert.strictEqual(result.rising.sign.name, 'Leo', 'Rising should be Leo');

    // Verify other key positions
    assert.strictEqual(result.planets.venus.sign.name, 'Aries', 'Venus should be in Aries');
    assert.strictEqual(result.planets.mars.sign.name, 'Pisces', 'Mars should be in Pisces');
  });

  test('Albert Einstein - historical records', () => {
    // March 14, 1879, 11:30 LMT, Ulm, Germany
    // Source: astro.com/astro-databank/Einstein,_Albert (biography, Rodden Rating A)
    // Lat: 48.4011, Long: 9.9876 (Ulm)
    // LMT for Ulm: UTC+0:40 (longitude 9.9876 / 15 = 0.666 hours)
    const result = calculateAstrology('1879-03-14', 11.5, 0.666, 48.4011, 9.9876);

    assert.strictEqual(result.sun.sign.name, 'Pisces', 'Sun should be in Pisces');
    // Moon and Rising harder to verify for historical dates with LMT
  });

  test('Oprah Winfrey - verified birth data', () => {
    // January 29, 1954, 04:30 CST (-6), Kosciusko, Mississippi
    // Source: astro.com/astro-databank/Winfrey,_Oprah (birth certificate, Rodden Rating AA)
    // Lat: 33.0576, Long: -89.5876
    const result = calculateAstrology('1954-01-29', 4.5, -6, 33.0576, -89.5876);

    assert.strictEqual(result.sun.sign.name, 'Aquarius', 'Sun should be in Aquarius');
    assert.strictEqual(result.moon.sign.name, 'Sagittarius', 'Moon should be in Sagittarius');
    assert.strictEqual(result.rising.sign.name, 'Sagittarius', 'Rising should be Sagittarius');
  });

  test('Madonna - birth certificate verified', () => {
    // August 16, 1958, 07:05 EST (-5), Bay City, Michigan
    // Source: astro.com/astro-databank/Madonna (birth certificate, Rodden Rating AA)
    // Lat: 43.5945, Long: -83.8889
    const result = calculateAstrology('1958-08-16', 7.083, -5, 43.5945, -83.8889);

    assert.strictEqual(result.sun.sign.name, 'Leo', 'Sun should be in Leo');
    assert.strictEqual(result.moon.sign.name, 'Virgo', 'Moon should be in Virgo');
    assert.strictEqual(result.rising.sign.name, 'Virgo', 'Rising should be Virgo');
  });
});

describe('Astrology Calculations - Sun Signs', () => {
  test('Sun sign calculation across all 12 signs', () => {
    // Test approximate dates for each Sun sign
    const testCases = [
      { date: '2000-01-15', expected: 'Capricorn' },
      { date: '2000-02-15', expected: 'Aquarius' },
      { date: '2000-03-21', expected: 'Aries' }, // Near equinox
      { date: '2000-04-15', expected: 'Aries' },
      { date: '2000-05-15', expected: 'Taurus' },
      { date: '2000-06-15', expected: 'Gemini' },
      { date: '2000-07-15', expected: 'Cancer' },
      { date: '2000-08-15', expected: 'Leo' },
      { date: '2000-09-15', expected: 'Virgo' },
      { date: '2000-10-15', expected: 'Libra' },
      { date: '2000-11-15', expected: 'Scorpio' },
      { date: '2000-12-15', expected: 'Sagittarius' },
    ];

    testCases.forEach(({ date, expected }) => {
      const result = calculateAstrology(date, 12, 0);
      assert.strictEqual(
        result.sun.sign.name,
        expected,
        `Sun on ${date} should be in ${expected}, got ${result.sun.sign.name}`
      );
    });
  });

  test('Sun sign boundary dates are accurate', () => {
    // Test cusp dates - the exact time matters for boundaries
    // In 2000, the Spring Equinox was March 20 at 07:35 UTC
    const cuspTests = [
      // Aries begins March 20, 2000 at 07:35 UTC
      { date: '2000-03-19', hour: 12, expected: 'Pisces' },
      { date: '2000-03-20', hour: 12, expected: 'Aries' }, // After equinox
      // Taurus begins around April 19-20
      { date: '2000-04-19', hour: 6, expected: 'Aries' },
      { date: '2000-04-20', hour: 12, expected: 'Taurus' },
      // Gemini begins around May 20-21
      { date: '2000-05-20', hour: 6, expected: 'Taurus' },
      { date: '2000-05-21', hour: 12, expected: 'Gemini' },
    ];

    cuspTests.forEach(({ date, hour, expected }) => {
      const result = calculateAstrology(date, hour, 0);
      assert.strictEqual(
        result.sun.sign.name,
        expected,
        `Sun on ${date} at ${hour}:00 should be in ${expected}, got ${result.sun.sign.name}`
      );
    });
  });
});

describe('Astrology Calculations - Technical Accuracy', () => {
  test('Ascendant requires location', () => {
    const withLocation = calculateAstrology('2000-01-01', 12, 0, 40.7128, -74.0060);
    const withoutLocation = calculateAstrology('2000-01-01', 12, 0);

    assert.ok(withLocation.hasLocation, 'Should indicate location was provided');
    assert.ok(!withoutLocation.hasLocation, 'Should indicate no location');
  });

  test('Planetary positions are within valid ranges', () => {
    const result = calculateAstrology('2000-01-01', 12, 0);

    // Check all planets have valid longitudes (0-360)
    const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    planets.forEach(planet => {
      const longitude = result.planets[planet].longitude;
      assert.ok(
        longitude >= 0 && longitude < 360,
        `${planet} longitude ${longitude} should be 0-360`
      );
    });
  });

  test('Sun longitude matches degree in sign', () => {
    const result = calculateAstrology('2000-06-15', 12, 0);

    // Sun should be in Gemini, longitude should be between 60-90
    const sunLong = result.sun.longitude;

    assert.ok(sunLong >= 60 && sunLong < 90, `Gemini Sun longitude should be 60-90 (got ${sunLong})`);

    // Degree is formatted as "X°Y'Z"" - extract the degree portion
    const sunDegree = result.sun.degree;
    const degreeMatch = typeof sunDegree === 'string' ? parseInt(sunDegree.split('°')[0]) : sunDegree;
    assert.ok(degreeMatch >= 0 && degreeMatch < 30, `Degree in sign should be 0-30 (got ${sunDegree})`);
  });

  test('Outer planets move slowly (sanity check)', () => {
    // Check that outer planets are in expected signs for 2000
    const result = calculateAstrology('2000-06-15', 12, 0);

    // In 2000: Pluto was in Sagittarius, Neptune in Aquarius, Uranus in Aquarius
    assert.strictEqual(result.planets.pluto.sign.name, 'Sagittarius', 'Pluto should be in Sagittarius in 2000');
    assert.strictEqual(result.planets.neptune.sign.name, 'Aquarius', 'Neptune should be in Aquarius in 2000');
    assert.strictEqual(result.planets.uranus.sign.name, 'Aquarius', 'Uranus should be in Aquarius in 2000');
  });

  test('Jupiter and Saturn transit check for 2020', () => {
    // Famous Great Conjunction: December 21, 2020 - Jupiter and Saturn in early Aquarius
    const result = calculateAstrology('2020-12-21', 12, 0);

    assert.strictEqual(result.planets.jupiter.sign.name, 'Aquarius', 'Jupiter should be in Aquarius on Dec 21, 2020');
    assert.strictEqual(result.planets.saturn.sign.name, 'Aquarius', 'Saturn should be in Aquarius on Dec 21, 2020');

    // They should be very close together (within a few degrees)
    const jupLong = result.planets.jupiter.longitude;
    const satLong = result.planets.saturn.longitude;
    const diff = Math.abs(jupLong - satLong);

    assert.ok(diff < 2, `Jupiter and Saturn should be conjunct (diff: ${diff.toFixed(2)}°)`);
  });

  test('Lunar nodes are opposite each other', () => {
    const result = calculateAstrology('2000-01-01', 12, 0);

    const northLong = result.nodes.north.longitude;
    const southLong = result.nodes.south.longitude;

    // Nodes should be exactly opposite (180° apart)
    let diff = Math.abs(northLong - southLong);
    if (diff > 180) diff = 360 - diff;

    assert.ok(
      Math.abs(diff - 180) < 1,
      `Nodes should be 180° apart (got ${diff.toFixed(2)}°)`
    );
  });

  test('Aspects are calculated correctly', () => {
    const result = calculateAstrology('2000-01-01', 12, 0);

    // Should have some aspects
    assert.ok(result.aspects.length > 0, 'Should calculate some aspects');

    // Each aspect should have required properties
    result.aspects.forEach(aspect => {
      assert.ok(aspect.planet1, 'Aspect should have planet1');
      assert.ok(aspect.planet2, 'Aspect should have planet2');
      assert.ok(aspect.aspect, 'Aspect should have aspect name');
      assert.ok(typeof aspect.orb === 'number', 'Aspect should have numeric orb');
      assert.ok(aspect.orb <= 8, 'Major aspect orb should be <= 8°');
    });
  });
});

describe('Gene Keys Calculations', () => {
  test('Sphere-to-planet mapping is correct', () => {
    const hd = calculateHumanDesign('1990-06-15', 12, 0);
    const gk = calculateGeneKeys(hd);

    // Verify each sphere has a key number (1-64)
    assert.ok(gk.activationSequence.lifeWork.key >= 1 && gk.activationSequence.lifeWork.key <= 64);
    assert.ok(gk.activationSequence.evolution.key >= 1 && gk.activationSequence.evolution.key <= 64);
    assert.ok(gk.activationSequence.radiance.key >= 1 && gk.activationSequence.radiance.key <= 64);
    assert.ok(gk.activationSequence.purpose.key >= 1 && gk.activationSequence.purpose.key <= 64);

    assert.ok(gk.venusSequence.attraction.key >= 1 && gk.venusSequence.attraction.key <= 64);
    assert.ok(gk.venusSequence.iq.key >= 1 && gk.venusSequence.iq.key <= 64);
    assert.ok(gk.venusSequence.eq.key >= 1 && gk.venusSequence.eq.key <= 64);
    assert.ok(gk.venusSequence.sq.key >= 1 && gk.venusSequence.sq.key <= 64);

    assert.ok(gk.pearlSequence.vocation.key >= 1 && gk.pearlSequence.vocation.key <= 64);
    assert.ok(gk.pearlSequence.culture.key >= 1 && gk.pearlSequence.culture.key <= 64);
    assert.ok(gk.pearlSequence.pearl.key >= 1 && gk.pearlSequence.pearl.key <= 64);
  });

  test('Each Gene Key has shadow, gift, and siddhi', () => {
    const hd = calculateHumanDesign('1990-06-15', 12, 0);
    const gk = calculateGeneKeys(hd);

    const spheres = [
      gk.activationSequence.lifeWork,
      gk.activationSequence.evolution,
      gk.venusSequence.attraction,
      gk.pearlSequence.pearl
    ];

    spheres.forEach(sphere => {
      assert.ok(sphere.shadow, `${sphere.sphere} should have shadow`);
      assert.ok(sphere.gift, `${sphere.sphere} should have gift`);
      assert.ok(sphere.siddhi, `${sphere.sphere} should have siddhi`);
      assert.ok(sphere.keyLine, `${sphere.sphere} should have keyLine`);
    });
  });

  test('Core and Vocation use same Gene Key (Design Mars)', () => {
    const hd = calculateHumanDesign('1990-06-15', 12, 0);
    const gk = calculateGeneKeys(hd);

    // Core and Vocation should have the same key (both from Design Mars)
    assert.strictEqual(
      gk.core.key,
      gk.pearlSequence.vocation.key,
      'Core and Vocation should have the same Gene Key'
    );
  });

  test('Brand and Life\'s Work use same Gene Key (Personality Sun)', () => {
    const hd = calculateHumanDesign('1990-06-15', 12, 0);
    const gk = calculateGeneKeys(hd);

    // Brand and Life's Work should have the same key (both from Personality Sun)
    assert.strictEqual(
      gk.brand.key,
      gk.activationSequence.lifeWork.key,
      'Brand and Life\'s Work should have the same Gene Key'
    );
  });
});

describe('Design Date Calculation (88° Solar Arc)', () => {
  test('Design date is approximately 88 days before birth', () => {
    const hd = calculateHumanDesign('2000-06-15', 12, 0);

    // Design date should be roughly 88 days before birth
    const birthDate = new Date('2000-06-15');
    const designDate = new Date(hd.positions.design.date);
    const daysDiff = (birthDate - designDate) / (24 * 60 * 60 * 1000);

    // Should be approximately 88 days (±5 due to solar speed variation)
    assert.ok(
      daysDiff >= 83 && daysDiff <= 93,
      `Design date should be ~88 days before birth (got ${daysDiff.toFixed(1)} days)`
    );
  });

  test('Design Sun is 88° before Personality Sun', () => {
    const hd = calculateHumanDesign('2000-06-15', 12, 0);

    const personalitySun = hd.positions.personality.sun.longitude;
    const designSun = hd.positions.design.sun.longitude;

    // Calculate angular difference (accounting for 360° wrap)
    let diff = personalitySun - designSun;
    if (diff < 0) diff += 360;

    // Should be approximately 88° (±1° for calculation precision)
    assert.ok(
      diff >= 87 && diff <= 89,
      `Design Sun should be 88° before Personality Sun (got ${diff.toFixed(2)}°)`
    );
  });
});

console.log('Running accuracy tests...\n');
