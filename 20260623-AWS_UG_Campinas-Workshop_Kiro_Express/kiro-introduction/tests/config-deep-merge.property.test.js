import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { DEFAULT_CONFIG, ConfigLoader } = require('../game.js');

/**
 * Property 18: Config deep merge preserves defaults for missing fields
 * Validates: Requirements 10.3
 *
 * For any partial config JSON object (containing any subset of valid fields),
 * merging it with DEFAULT_CONFIG SHALL produce a complete config where every
 * field present in DEFAULT_CONFIG exists in the result, overridden fields match
 * the loaded values, and missing fields retain their default values.
 */

// Helper: Generate a partial object by randomly including/excluding each field.
// This mimics what JSON.parse produces — keys are either present with a value or absent.
function partialRecordArb(fieldGenerators) {
  const keys = Object.keys(fieldGenerators);
  return fc.tuple(
    fc.subarray(keys, { minLength: 0, maxLength: keys.length }),
    ...keys.map(k => fieldGenerators[k])
  ).map(([selectedKeys, ...values]) => {
    const obj = {};
    keys.forEach((k, i) => {
      if (selectedKeys.includes(k)) {
        obj[k] = values[i];
      }
    });
    return obj;
  });
}

// Generators for each config section (values only — no undefined)
const canvasFieldsArb = partialRecordArb({
  width: fc.integer({ min: 1, max: 2000 }),
  height: fc.integer({ min: 1, max: 2000 }),
});

const scoreBarFieldsArb = partialRecordArb({
  height: fc.integer({ min: 30, max: 50 }),
});

const ghostFieldsArb = partialRecordArb({
  startXFraction: fc.double({ min: 0, max: 1, noNaN: true }),
  gravity: fc.double({ min: 100, max: 2000, noNaN: true }),
  maxFallSpeed: fc.double({ min: 100, max: 1000, noNaN: true }),
  jumpVelocity: fc.double({ min: -500, max: -100, noNaN: true }),
  maxRotationUp: fc.double({ min: -45, max: 0, noNaN: true }),
  maxRotationDown: fc.double({ min: 0, max: 45, noNaN: true }),
});

const pipesFieldsArb = partialRecordArb({
  width: fc.integer({ min: 10, max: 100 }),
  capWidth: fc.integer({ min: 20, max: 150 }),
  capHeight: fc.integer({ min: 5, max: 50 }),
  horizontalSpacing: fc.integer({ min: 100, max: 400 }),
  speed: fc.double({ min: 50, max: 300, noNaN: true }),
  minPipeLength: fc.integer({ min: 10, max: 200 }),
  gapMultiplierMin: fc.double({ min: 1, max: 10, noNaN: true }),
  gapMultiplierMax: fc.double({ min: 1, max: 10, noNaN: true }),
});

const cloudsFieldsArb = partialRecordArb({
  count: fc.integer({ min: 1, max: 20 }),
  minSpeedFraction: fc.double({ min: 0, max: 1, noNaN: true }),
  maxSpeedFraction: fc.double({ min: 0, max: 1, noNaN: true }),
  minOpacity: fc.double({ min: 0, max: 1, noNaN: true }),
  maxOpacity: fc.double({ min: 0, max: 1, noNaN: true }),
});

const timingFieldsArb = partialRecordArb({
  maxDeltaTime: fc.double({ min: 0.01, max: 5, noNaN: true }),
  gameOverCooldown: fc.integer({ min: 100, max: 5000 }),
});

// Generator for a partial config: each top-level section may or may not be present
const partialConfigArb = fc.tuple(
  fc.subarray(['canvas', 'scoreBar', 'ghost', 'pipes', 'clouds', 'timing'], { minLength: 0, maxLength: 6 }),
  canvasFieldsArb,
  scoreBarFieldsArb,
  ghostFieldsArb,
  pipesFieldsArb,
  cloudsFieldsArb,
  timingFieldsArb
).map(([selectedSections, canvas, scoreBar, ghost, pipes, clouds, timing]) => {
  const config = {};
  const sections = { canvas, scoreBar, ghost, pipes, clouds, timing };
  for (const key of selectedSections) {
    config[key] = sections[key];
  }
  return config;
});

describe('Feature: flappy-ghosty, Property 18: Config deep merge preserves defaults for missing fields', () => {
  it('merged result always contains all DEFAULT_CONFIG top-level keys', () => {
    fc.assert(
      fc.property(partialConfigArb, (partialConfig) => {
        const result = ConfigLoader.merge(partialConfig, DEFAULT_CONFIG);

        // All top-level keys from DEFAULT_CONFIG must exist in result
        for (const key of Object.keys(DEFAULT_CONFIG)) {
          expect(result).toHaveProperty(key);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('merged result always contains all nested keys within each section', () => {
    fc.assert(
      fc.property(partialConfigArb, (partialConfig) => {
        const result = ConfigLoader.merge(partialConfig, DEFAULT_CONFIG);

        // All nested keys within each section must exist in result
        for (const sectionKey of Object.keys(DEFAULT_CONFIG)) {
          const defaultSection = DEFAULT_CONFIG[sectionKey];
          if (typeof defaultSection === 'object' && defaultSection !== null) {
            for (const fieldKey of Object.keys(defaultSection)) {
              expect(result[sectionKey]).toHaveProperty(fieldKey);
              expect(result[sectionKey][fieldKey]).not.toBeUndefined();
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('overridden fields match the loaded values in the result', () => {
    fc.assert(
      fc.property(partialConfigArb, (partialConfig) => {
        const result = ConfigLoader.merge(partialConfig, DEFAULT_CONFIG);

        // Any field explicitly set in the partial must match in the result
        for (const sectionKey of Object.keys(DEFAULT_CONFIG)) {
          if (partialConfig[sectionKey] !== undefined && typeof partialConfig[sectionKey] === 'object') {
            const loadedSection = partialConfig[sectionKey];
            for (const fieldKey of Object.keys(loadedSection)) {
              expect(result[sectionKey][fieldKey]).toBe(loadedSection[fieldKey]);
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('missing fields retain their default values', () => {
    fc.assert(
      fc.property(partialConfigArb, (partialConfig) => {
        const result = ConfigLoader.merge(partialConfig, DEFAULT_CONFIG);

        // Any field NOT set in the partial must match DEFAULT_CONFIG value
        for (const sectionKey of Object.keys(DEFAULT_CONFIG)) {
          const defaultSection = DEFAULT_CONFIG[sectionKey];
          if (typeof defaultSection === 'object' && defaultSection !== null) {
            const loadedSection = (partialConfig[sectionKey] !== undefined && typeof partialConfig[sectionKey] === 'object')
              ? partialConfig[sectionKey]
              : {};
            for (const fieldKey of Object.keys(defaultSection)) {
              if (!(fieldKey in loadedSection)) {
                expect(result[sectionKey][fieldKey]).toBe(defaultSection[fieldKey]);
              }
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
