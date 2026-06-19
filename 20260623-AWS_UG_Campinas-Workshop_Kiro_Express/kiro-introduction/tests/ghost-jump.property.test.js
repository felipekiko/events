import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { DEFAULT_CONFIG, Ghost } = require('../game.js');

/**
 * Property 2: Jump overrides velocity
 * Validates: Requirements 2.1, 3.3
 *
 * For any ghost with any current vertical velocity (positive, negative, or zero),
 * applying a jump SHALL set the vertical velocity to exactly the fixed jump impulse
 * value (between -250 and -350 px/s), regardless of the previous velocity magnitude.
 */

// Mock sprite image with reasonable dimensions
const mockSprite = { width: 34, height: 24 };

// Play area matching default config
const playArea = {
  x: 0,
  y: 0,
  width: DEFAULT_CONFIG.canvas.width,
  height: DEFAULT_CONFIG.canvas.height - DEFAULT_CONFIG.scoreBar.height,
};

describe('Feature: flappy-ghosty, Property 2: Jump overrides velocity', () => {
  it('jump always sets velocity to exact jump impulse value regardless of current velocity', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
        (initialVelocity) => {
          const ghost = new Ghost(mockSprite, playArea, DEFAULT_CONFIG);

          // Set ghost to an arbitrary velocity
          ghost.velocityY = initialVelocity;

          // Apply jump
          ghost.jump();

          // Velocity must be exactly the configured jump impulse value
          expect(ghost.velocityY).toBe(DEFAULT_CONFIG.ghost.jumpVelocity);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('jump impulse value is within the valid range [-350, -250] px/s', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
        (initialVelocity) => {
          const ghost = new Ghost(mockSprite, playArea, DEFAULT_CONFIG);

          ghost.velocityY = initialVelocity;
          ghost.jump();

          // The resulting velocity must be within the spec-defined range
          expect(ghost.velocityY).toBeGreaterThanOrEqual(-350);
          expect(ghost.velocityY).toBeLessThanOrEqual(-250);
        }
      ),
      { numRuns: 100 }
    );
  });
});
