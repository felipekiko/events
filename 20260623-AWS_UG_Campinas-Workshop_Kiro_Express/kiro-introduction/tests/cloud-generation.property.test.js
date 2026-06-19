import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { BackgroundRenderer, DEFAULT_CONFIG } = require('../game.js');

/**
 * Property 1: Cloud generation invariants
 * Validates: Requirements 1.2
 *
 * - BackgroundRenderer always generates at least 3 clouds
 * - Each cloud has opacity between configured minOpacity and maxOpacity
 */
describe('Feature: flappy-ghosty, Property 1: Cloud generation invariants', () => {
  it('always generates at least 3 clouds with valid opacities', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 200, max: 800 }),
        fc.integer({ min: 300, max: 1200 }),
        fc.integer({ min: 3, max: 15 }),
        (width, height, count) => {
          const config = {
            ...DEFAULT_CONFIG,
            clouds: { ...DEFAULT_CONFIG.clouds, count },
            pipes: { ...DEFAULT_CONFIG.pipes },
          };
          const playArea = { width, height };
          const bg = new BackgroundRenderer(playArea, config);

          expect(bg.clouds.length).toBeGreaterThanOrEqual(3);
          expect(bg.clouds.length).toBeGreaterThanOrEqual(Math.max(3, count));

          for (const cloud of bg.clouds) {
            expect(cloud.opacity).toBeGreaterThanOrEqual(config.clouds.minOpacity - 1e-10);
            expect(cloud.opacity).toBeLessThanOrEqual(config.clouds.maxOpacity + 1e-10);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('cloud speeds are within configured bounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 200, max: 800 }),
        fc.integer({ min: 300, max: 1200 }),
        (width, height) => {
          const config = DEFAULT_CONFIG;
          const playArea = { width, height };
          const bg = new BackgroundRenderer(playArea, config);

          const minSpeed = config.clouds.minSpeedFraction * config.pipes.speed;
          const maxSpeed = config.clouds.maxSpeedFraction * config.pipes.speed;

          for (const cloud of bg.clouds) {
            expect(cloud.speed).toBeGreaterThanOrEqual(minSpeed - 1e-10);
            expect(cloud.speed).toBeLessThanOrEqual(maxSpeed + 1e-10);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
