import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { DEFAULT_CONFIG, Ghost } = require('../game.js');

/**
 * Property 4: Gravity application with velocity cap
 * Validates: Requirements 3.1, 3.2
 *
 * For any ghost in the active state with any current velocity and any positive
 * delta time, applying gravity SHALL increase the velocity by gravity * deltaTime,
 * but the resulting velocity SHALL never exceed the maximum fall speed cap.
 */

// Helper to create a Ghost instance with a given initial velocity
function createGhostWithVelocity(initialVelocityY) {
  const spriteImage = { width: 34, height: 24 };
  const playArea = { x: 0, y: 0, width: 400, height: 560 };
  const ghost = new Ghost(spriteImage, playArea, DEFAULT_CONFIG);
  ghost.velocityY = initialVelocityY;
  return ghost;
}

describe('Feature: flappy-ghosty, Property 4: Gravity application with velocity cap', () => {
  it('gravity increases velocity by gravity * deltaTime when below cap', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.001, max: 0.25, noNaN: true, noDefaultInfinity: true }),
        (initialVelocity, deltaTime) => {
          const ghost = createGhostWithVelocity(initialVelocity);
          const { gravity, maxFallSpeed } = DEFAULT_CONFIG.ghost;

          ghost.applyGravity(deltaTime);

          const expectedUncapped = initialVelocity + gravity * deltaTime;

          if (expectedUncapped <= maxFallSpeed) {
            // Velocity should increase by exactly gravity * dt
            expect(ghost.velocityY).toBeCloseTo(expectedUncapped, 10);
          } else {
            // Velocity should be capped at maxFallSpeed
            expect(ghost.velocityY).toBe(maxFallSpeed);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('velocity never exceeds maxFallSpeed after applying gravity', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.001, max: 0.25, noNaN: true, noDefaultInfinity: true }),
        (initialVelocity, deltaTime) => {
          const ghost = createGhostWithVelocity(initialVelocity);
          const { maxFallSpeed } = DEFAULT_CONFIG.ghost;

          ghost.applyGravity(deltaTime);

          expect(ghost.velocityY).toBeLessThanOrEqual(maxFallSpeed);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when initial velocity is below maxFallSpeed, gravity increases velocity', () => {
    const { maxFallSpeed } = DEFAULT_CONFIG.ghost;
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: maxFallSpeed - 1, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.001, max: 0.25, noNaN: true, noDefaultInfinity: true }),
        (initialVelocity, deltaTime) => {
          const ghost = createGhostWithVelocity(initialVelocity);

          ghost.applyGravity(deltaTime);

          // Gravity is positive (downward), so velocity should increase or hit cap
          expect(ghost.velocityY).toBeGreaterThan(initialVelocity);
        }
      ),
      { numRuns: 100 }
    );
  });
});
