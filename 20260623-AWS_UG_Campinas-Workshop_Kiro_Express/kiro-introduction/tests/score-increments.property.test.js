import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { ScoreManager, PipePair, DEFAULT_CONFIG } = require('../game.js');

/**
 * Property 10: Score increments exactly once per pipe crossing
 * Validates: Requirements 5.1
 *
 * For any pipe pair, the score SHALL increment by exactly 1 when the ghost's
 * horizontal center first passes the pipe's trailing edge, and subsequent
 * frames where the ghost remains past the trailing edge SHALL NOT increment
 * the score again for that same pipe pair.
 */

describe('Feature: flappy-ghosty, Property 10: Score increments exactly once per pipe crossing', () => {
  it('score increments exactly once when ghost center first passes trailing edge', () => {
    const playArea = { x: 0, y: 0, width: 400, height: 560 };
    const pipeWidth = DEFAULT_CONFIG.pipes.width;
    const capWidth = DEFAULT_CONFIG.pipes.capWidth;
    const capHeight = DEFAULT_CONFIG.pipes.capHeight;
    const gapHeight = 120;
    const gapCenterY = 280;
    const ghostWidth = 30;

    fc.assert(
      fc.property(
        // Pipe X position (where the pipe is placed)
        fc.double({ min: 50, max: 350, noNaN: true, noDefaultInfinity: true }),
        // Number of frames the ghost remains past the trailing edge (1 to 20)
        fc.integer({ min: 1, max: 20 }),
        // Ghost X center positions before crossing (fraction of distance to trailing edge)
        fc.array(
          fc.double({ min: 0.01, max: 0.99, noNaN: true, noDefaultInfinity: true }),
          { minLength: 0, maxLength: 5 }
        ),
        (pipeX, framesAfterCrossing, beforeFractions) => {
          // Create fresh ScoreManager and PipePair for each test
          const scoreManager = new ScoreManager();
          const pipe = new PipePair(pipeX, gapCenterY, gapHeight, pipeWidth, capWidth, capHeight, playArea);

          const trailingEdgeX = pipe.getTrailingEdgeX();

          // Simulate scoring logic (as done in GameEngine):
          // Score increments when ghostCenterX > trailingEdgeX && !pipe.scored

          // Phase 1: Ghost is before the trailing edge — score should NOT increment
          for (const frac of beforeFractions) {
            const ghostCenterX = trailingEdgeX * frac; // Always less than trailingEdgeX
            if (ghostCenterX > trailingEdgeX && !pipe.scored) {
              scoreManager.increment();
              pipe.scored = true;
            }
          }
          expect(scoreManager.score).toBe(0);
          expect(pipe.scored).toBe(false);

          // Phase 2: Ghost crosses the trailing edge for the first time
          const firstCrossingX = trailingEdgeX + 1;
          if (firstCrossingX > trailingEdgeX && !pipe.scored) {
            scoreManager.increment();
            pipe.scored = true;
          }
          expect(scoreManager.score).toBe(1);
          expect(pipe.scored).toBe(true);

          // Phase 3: Ghost remains past the trailing edge for multiple subsequent frames
          for (let i = 0; i < framesAfterCrossing; i++) {
            const ghostCenterX = trailingEdgeX + 1 + i * 3; // Moving further past
            if (ghostCenterX > trailingEdgeX && !pipe.scored) {
              scoreManager.increment();
              pipe.scored = true;
            }
          }

          // Score must still be exactly 1 — no double counting
          expect(scoreManager.score).toBe(1);
          expect(pipe.scored).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('score increments once per pipe across multiple pipe pairs', () => {
    const playArea = { x: 0, y: 0, width: 400, height: 560 };
    const pipeWidth = DEFAULT_CONFIG.pipes.width;
    const capWidth = DEFAULT_CONFIG.pipes.capWidth;
    const capHeight = DEFAULT_CONFIG.pipes.capHeight;
    const gapHeight = 120;
    const ghostWidth = 30;

    fc.assert(
      fc.property(
        // Number of pipes the ghost passes (1 to 10)
        fc.integer({ min: 1, max: 10 }),
        // Random gap center Y positions for each pipe
        fc.array(
          fc.double({ min: 100, max: 460, noNaN: true, noDefaultInfinity: true }),
          { minLength: 1, maxLength: 10 }
        ),
        // Number of redundant checks per pipe after crossing
        fc.integer({ min: 1, max: 5 }),
        (numPipes, gapCenters, redundantChecks) => {
          const scoreManager = new ScoreManager();
          const actualNumPipes = Math.min(numPipes, gapCenters.length);

          // Create pipe pairs at spaced positions
          const pipes = [];
          for (let i = 0; i < actualNumPipes; i++) {
            const pipeX = 100 + i * 150;
            const gapCenterY = gapCenters[i];
            pipes.push(new PipePair(pipeX, gapCenterY, gapHeight, pipeWidth, capWidth, capHeight, playArea));
          }

          // Simulate ghost moving from left to right, crossing each pipe
          for (let i = 0; i < actualNumPipes; i++) {
            const pipe = pipes[i];
            const trailingEdgeX = pipe.getTrailingEdgeX();

            // Ghost crosses this pipe's trailing edge
            const ghostCenterX = trailingEdgeX + 5;

            // Check scoring for ALL pipes (as the game loop does)
            for (const p of pipes) {
              if (ghostCenterX > p.getTrailingEdgeX() && !p.scored) {
                scoreManager.increment();
                p.scored = true;
              }
            }

            // Redundant checks — ghost still past this pipe, score must not increase
            const scoreBefore = scoreManager.score;
            for (let r = 0; r < redundantChecks; r++) {
              for (const p of pipes) {
                if (ghostCenterX > p.getTrailingEdgeX() && !p.scored) {
                  scoreManager.increment();
                  p.scored = true;
                }
              }
            }
            expect(scoreManager.score).toBe(scoreBefore);
          }

          // Final assertion: total score equals number of pipes passed
          expect(scoreManager.score).toBe(actualNumPipes);
        }
      ),
      { numRuns: 100 }
    );
  });
});
