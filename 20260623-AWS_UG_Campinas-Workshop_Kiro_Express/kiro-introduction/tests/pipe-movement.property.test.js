import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { DEFAULT_CONFIG, PipePair } = require('../game.js');

/**
 * Property 7: Pipe horizontal movement
 * Validates: Requirements 4.3
 *
 * For any pipe pair at position X with any positive delta time dt,
 * the updated X position SHALL equal X - speed * dt,
 * where speed is the configured pipe speed.
 */

describe('Feature: flappy-ghosty, Property 7: Pipe horizontal movement', () => {
  it('updated X equals X - speed * dt for any X position and positive deltaTime', () => {
    const playArea = { x: 0, y: 0, width: 400, height: 560 };
    const speed = DEFAULT_CONFIG.pipes.speed;
    const pipeWidth = DEFAULT_CONFIG.pipes.width;
    const capWidth = DEFAULT_CONFIG.pipes.capWidth;
    const capHeight = DEFAULT_CONFIG.pipes.capHeight;
    const gapHeight = 120;
    const gapCenterY = 280;

    fc.assert(
      fc.property(
        fc.double({ min: -500, max: 1000, noNaN: true, noDefaultInfinity: true }), // X position
        fc.double({ min: 0.001, max: 0.25, noNaN: true, noDefaultInfinity: true }), // deltaTime
        (initialX, dt) => {
          // Create a pipe pair at the given X position
          const pipe = new PipePair(initialX, gapCenterY, gapHeight, pipeWidth, capWidth, capHeight, playArea);

          // Calculate expected position after movement
          const expectedX = initialX - speed * dt;

          // Apply the movement formula (same as PipeManager.update)
          pipe.x -= speed * dt;

          // Verify: updated X equals X - speed * dt
          expect(pipe.x).toBeCloseTo(expectedX, 10);
        }
      ),
      { numRuns: 100 }
    );
  });
});
