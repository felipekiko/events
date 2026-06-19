import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { DEFAULT_CONFIG, PipeManager, PipePair } = require('../game.js');

/**
 * Property 9: Pipe generation constraints
 * Validates: Requirements 4.5, 4.6
 *
 * For any generated pipe pair, the gap height SHALL be between 3 and 4 times
 * the ghost sprite height, AND the top pipe SHALL have a visible length of at
 * least 50 pixels, AND the bottom pipe SHALL have a visible length of at least
 * 50 pixels within the play area.
 */

describe('Feature: flappy-ghosty, Property 9: Pipe generation constraints', () => {
  it('gap height is between gapMultiplierMin and gapMultiplierMax times ghost height', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 20, max: 60 }),
        (ghostHeight) => {
          const playArea = { x: 0, y: 0, width: 400, height: 560 };
          const config = { ...DEFAULT_CONFIG };
          const pipeManager = new PipeManager(playArea, config, ghostHeight);

          const { gapMultiplierMin, gapMultiplierMax } = config.pipes;
          const minGap = gapMultiplierMin * ghostHeight;
          const maxGap = gapMultiplierMax * ghostHeight;

          expect(pipeManager.gapHeight).toBeGreaterThanOrEqual(minGap);
          expect(pipeManager.gapHeight).toBeLessThanOrEqual(maxGap);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('top pipe has at least minPipeLength visible pixels', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 20, max: 60 }),
        (ghostHeight) => {
          const playArea = { x: 0, y: 0, width: 400, height: 560 };
          const config = { ...DEFAULT_CONFIG };
          const pipeManager = new PipeManager(playArea, config, ghostHeight);

          // Trigger pipe generation via update
          pipeManager.update(0.016);

          const { minPipeLength } = config.pipes;

          for (const pipe of pipeManager.pipes) {
            // topPipeHeight = gapCenterY - gapHeight / 2
            expect(pipe.topPipeHeight).toBeGreaterThanOrEqual(minPipeLength);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('bottom pipe has at least minPipeLength visible pixels within play area', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 20, max: 60 }),
        (ghostHeight) => {
          const playArea = { x: 0, y: 0, width: 400, height: 560 };
          const config = { ...DEFAULT_CONFIG };
          const pipeManager = new PipeManager(playArea, config, ghostHeight);

          // Trigger pipe generation via update
          pipeManager.update(0.016);

          const { minPipeLength } = config.pipes;

          for (const pipe of pipeManager.pipes) {
            // bottomPipeY = gapCenterY + gapHeight / 2
            const bottomPipeVisibleLength = playArea.height - pipe.bottomPipeY;
            expect(bottomPipeVisibleLength).toBeGreaterThanOrEqual(minPipeLength);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all constraints hold simultaneously for generated pipes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 20, max: 60 }),
        (ghostHeight) => {
          const playArea = { x: 0, y: 0, width: 400, height: 560 };
          const config = { ...DEFAULT_CONFIG };
          const pipeManager = new PipeManager(playArea, config, ghostHeight);

          // Trigger pipe generation
          pipeManager.update(0.016);

          const { gapMultiplierMin, gapMultiplierMax, minPipeLength } = config.pipes;
          const minGap = gapMultiplierMin * ghostHeight;
          const maxGap = gapMultiplierMax * ghostHeight;

          // Verify gap height constraint
          expect(pipeManager.gapHeight).toBeGreaterThanOrEqual(minGap);
          expect(pipeManager.gapHeight).toBeLessThanOrEqual(maxGap);

          for (const pipe of pipeManager.pipes) {
            // Verify top pipe minimum visible length
            expect(pipe.topPipeHeight).toBeGreaterThanOrEqual(minPipeLength);

            // Verify bottom pipe minimum visible length
            const bottomPipeVisibleLength = playArea.height - pipe.bottomPipeY;
            expect(bottomPipeVisibleLength).toBeGreaterThanOrEqual(minPipeLength);

            // Verify gap height matches the PipeManager's calculated value
            expect(pipe.gapHeight).toBe(pipeManager.gapHeight);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
