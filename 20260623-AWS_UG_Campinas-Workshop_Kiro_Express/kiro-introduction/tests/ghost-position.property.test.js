import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { DEFAULT_CONFIG, Ghost } = require('../game.js');

/**
 * Property 5: Ghost position update
 * Validates: Requirements 3.4
 *
 * For any ghost with position Y and velocity V, and any positive delta time dt,
 * the updated position SHALL equal Y + V * dt.
 */

describe('Feature: flappy-ghosty, Property 5: Ghost position update', () => {
  it('updated position equals Y + V * dt for any position, velocity, and positive deltaTime', () => {
    // Create a minimal sprite mock and play area
    const mockSprite = { width: 34, height: 24 };
    const playArea = { x: 0, y: 0, width: 400, height: 560 };

    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }), // position Y
        fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }), // velocity V
        fc.double({ min: 0.001, max: 0.25, noNaN: true, noDefaultInfinity: true }), // deltaTime dt
        (posY, velocity, dt) => {
          const ghost = new Ghost(mockSprite, playArea, DEFAULT_CONFIG);

          // Set ghost to arbitrary position and velocity
          ghost.y = posY;
          ghost.velocityY = velocity;

          // Calculate expected position
          const expectedY = posY + velocity * dt;

          // Apply position update
          ghost.updatePosition(dt);

          // Verify: updated position equals Y + V * dt
          expect(ghost.y).toBeCloseTo(expectedY, 10);
        }
      ),
      { numRuns: 100 }
    );
  });
});
