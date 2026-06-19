import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { GameEngine } = require('../game.js');

/**
 * Property 17: Delta-time clamping
 * Validates: Requirements 9.3
 *
 * For any positive raw deltaTime, the clamped value must equal min(rawDelta, 0.25).
 */
describe('Feature: flappy-ghosty, Property 17: Delta-time clamping', () => {
  it('clamped delta equals min(rawDelta, maxDelta)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 10, noNaN: true }),
        (rawDelta) => {
          const maxDelta = 0.25;
          const clamped = GameEngine.clampDeltaTime(rawDelta, maxDelta);
          expect(clamped).toBeCloseTo(Math.min(rawDelta, maxDelta), 10);
        }
      ),
      { numRuns: 100 }
    );
  });
});
