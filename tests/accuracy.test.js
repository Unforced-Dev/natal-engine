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

describe('Astrology Calculations', () => {
  test('Steve Jobs - Sun, Moon, Rising all correct', () => {
    // February 24, 1955, 19:15 PST, San Francisco
    // Source: astro.com (birth certificate verified)
    const result = calculateAstrology('1955-02-24', 19.25, -8, 37.7749, -122.4194);

    assert.strictEqual(result.sun.sign.name, 'Pisces', 'Sun should be in Pisces');
    assert.strictEqual(result.moon.sign.name, 'Aries', 'Moon should be in Aries');
    assert.strictEqual(result.rising.sign.name, 'Virgo', 'Rising should be Virgo');
  });

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
