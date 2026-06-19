import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { PipeManager, PipePair, DEFAULT_CONFIG } = require('../game.js');

/**
 * Property 8: Offscreen pipe cleanup
 * Validates: Requirements 4.4
 *
 * For any array of pipe pairs, after an update cycle, all pipe pairs whose
 * right edge (x + pipeWidth + capOffset) is <= 0 SHALL be removed from the
 * array, and all pipe pairs still within or to the right of the visible area
 * SHALL be retained.
 */

// Helper: compute the effective right edge used by cleanup logic
function computeRightEdge(pipe) {
  const capOffsetX = (pipe.capWidth - pipe.pipeWidth) / 2;
  return pipe.x + pipe.pipeWidth + capOffsetX;
}

// Helper: create a PipePair with a specific X position
function createPipeAtX(x, playArea, config) {
  const { width: pipeWidth, capWidth, capHeight } = config.pipes;
  const gapCenterY = playArea.height / 2;
  const gapHeight = 120;
  return new PipePair(x, gapCenterY, gapHeight, pipeWidth, capWidth, capHeight, playArea);
}

describe('Feature: flappy-ghosty, Property 8: Offscreen pipe cleanup', () => {
  const playArea = { x: 0, y: 0, width: 400, height: 560 };
  const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  const ghostHeight = 34;

  it('pipes with right edge <= 0 are removed after update', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.double({ min: -500, max: 500, noNaN: true, noDefaultInfinity: true }),
          { minLength: 1, maxLength: 20 }
        ),
        (xPositions) => {
          const pm = new PipeManager(playArea, config, ghostHeight);

          // Create pipes at the generated X positions
          pm.pipes = xPositions.map(x => createPipeAtX(x, playArea, config));

          // Determine which pipes should be removed vs retained BEFORE update
          const expectedRetained = pm.pipes.filter(pipe => computeRightEdge(pipe) > 0);
          const expectedRemoved = pm.pipes.filter(pipe => computeRightEdge(pipe) <= 0);

          // Call update with deltaTime=0 so no movement occurs
          // But update also generates new pipes, so we track existing pipes first
          const retainedXs = expectedRetained.map(p => p.x);

          pm.update(0);

          // All pipes that should be removed must not appear in the result
          // (check that no pipe with right edge <= 0 survives)
          for (const pipe of pm.pipes) {
            // Newly generated pipes will be at playArea.width, so they have right edge > 0
            // We only verify that no offscreen pipe remains
            if (!retainedXs.includes(pipe.x) && pipe.x !== playArea.width) {
              // This is neither a retained original pipe nor a newly generated one
              expect(computeRightEdge(pipe)).toBeGreaterThan(0);
            }
          }

          // All originally retained pipes should still be in the array
          for (const expectedX of retainedXs) {
            const found = pm.pipes.some(p => p.x === expectedX);
            expect(found).toBe(true);
          }

          // Verify no pipe with right edge <= 0 exists in result
          for (const pipe of pm.pipes) {
            expect(computeRightEdge(pipe)).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('pipes with right edge > 0 are always retained after update', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.double({ min: -100, max: 800, noNaN: true, noDefaultInfinity: true }),
          { minLength: 1, maxLength: 15 }
        ),
        (xPositions) => {
          const pm = new PipeManager(playArea, config, ghostHeight);

          // Create pipes at the generated X positions
          pm.pipes = xPositions.map(x => createPipeAtX(x, playArea, config));

          // Identify pipes that should survive (right edge > 0)
          const survivorXs = pm.pipes
            .filter(pipe => computeRightEdge(pipe) > 0)
            .map(pipe => pipe.x);

          pm.update(0);

          // Every pipe that was onscreen must still be present
          for (const x of survivorXs) {
            const found = pm.pipes.some(p => p.x === x);
            expect(found).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all offscreen pipes are removed — none with right edge <= 0 remain', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.double({ min: -1000, max: -1, noNaN: true, noDefaultInfinity: true }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.array(
          fc.double({ min: 1, max: 600, noNaN: true, noDefaultInfinity: true }),
          { minLength: 0, maxLength: 10 }
        ),
        (offscreenXs, onscreenXs) => {
          const pm = new PipeManager(playArea, config, ghostHeight);

          // Create a mix of offscreen and onscreen pipes
          const allXs = [...offscreenXs, ...onscreenXs];
          pm.pipes = allXs.map(x => createPipeAtX(x, playArea, config));

          // Count how many should survive (right edge > 0)
          const expectedSurvivorCount = pm.pipes.filter(
            pipe => computeRightEdge(pipe) > 0
          ).length;

          pm.update(0);

          // After update, the pipe count should be at least the survivors
          // (could be more due to new pipe generation)
          const originalSurvivors = pm.pipes.filter(
            pipe => pipe.x !== playArea.width
          ).length;
          expect(originalSurvivors).toBe(expectedSurvivorCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
