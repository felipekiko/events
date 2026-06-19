import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { DEFAULT_CONFIG, Ghost } = require('../game.js');

/**
 * Property 16: Ghost rotation interpolation
 * Validates: Requirements 8.6
 *
 * For any ghost vertical velocity V within the range [jumpVelocity, maxFallSpeed],
 * the applied rotation SHALL be linearly interpolated between -30 degrees (at jumpVelocity)
 * and +30 degrees (at maxFallSpeed), and SHALL never exceed the [-30, +30] degree bounds.
 */

// Helper: create a Ghost instance with a given config
function createGhost(config) {
  const spriteImage = { width: 34, height: 24 };
  const playArea = { x: 0, y: 0, width: config.canvas.width, height: config.canvas.height };
  return new Ghost(spriteImage, playArea, config);
}

describe('Feature: flappy-ghosty, Property 16: Ghost rotation interpolation', () => {
  const config = { ...DEFAULT_CONFIG };
  const { jumpVelocity, maxFallSpeed, maxRotationUp, maxRotationDown } = config.ghost;

  it('rotation is linearly interpolated from velocity within [jumpVelocity, maxFallSpeed]', () => {
    fc.assert(
      fc.property(
        fc.double({ min: jumpVelocity, max: maxFallSpeed, noNaN: true }),
        (velocity) => {
          const ghost = createGhost(config);
          ghost.velocityY = velocity;
          ghost.updateRotation();

          // Calculate expected rotation via linear interpolation
          const t = (velocity - jumpVelocity) / (maxFallSpeed - jumpVelocity);
          const expectedDegrees = maxRotationUp + t * (maxRotationDown - maxRotationUp);
          const expectedRadians = expectedDegrees * (Math.PI / 180);

          expect(ghost.rotation).toBeCloseTo(expectedRadians, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rotation never exceeds [-30, +30] degree bounds for any velocity in range', () => {
    fc.assert(
      fc.property(
        fc.double({ min: jumpVelocity, max: maxFallSpeed, noNaN: true }),
        (velocity) => {
          const ghost = createGhost(config);
          ghost.velocityY = velocity;
          ghost.updateRotation();

          const rotationDegrees = ghost.rotation * (180 / Math.PI);

          // Rotation must be within [-30, +30] degrees
          expect(rotationDegrees).toBeGreaterThanOrEqual(maxRotationUp - 0.0001);
          expect(rotationDegrees).toBeLessThanOrEqual(maxRotationDown + 0.0001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rotation is clamped for velocities outside the interpolation range', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -2000, max: 2000, noNaN: true }),
        (velocity) => {
          const ghost = createGhost(config);
          ghost.velocityY = velocity;
          ghost.updateRotation();

          const rotationDegrees = ghost.rotation * (180 / Math.PI);

          // Even for velocities outside [jumpVelocity, maxFallSpeed],
          // rotation must still be clamped to [-30, +30]
          expect(rotationDegrees).toBeGreaterThanOrEqual(maxRotationUp - 0.0001);
          expect(rotationDegrees).toBeLessThanOrEqual(maxRotationDown + 0.0001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rotation at jumpVelocity equals maxRotationUp (-30 degrees)', () => {
    const ghost = createGhost(config);
    ghost.velocityY = jumpVelocity;
    ghost.updateRotation();

    const expectedRadians = maxRotationUp * (Math.PI / 180);
    expect(ghost.rotation).toBeCloseTo(expectedRadians, 10);
  });

  it('rotation at maxFallSpeed equals maxRotationDown (+30 degrees)', () => {
    const ghost = createGhost(config);
    ghost.velocityY = maxFallSpeed;
    ghost.updateRotation();

    const expectedRadians = maxRotationDown * (Math.PI / 180);
    expect(ghost.rotation).toBeCloseTo(expectedRadians, 10);
  });
});
