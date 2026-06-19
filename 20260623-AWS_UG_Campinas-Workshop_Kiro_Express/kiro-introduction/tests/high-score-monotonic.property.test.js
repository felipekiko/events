import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { ScoreManager } = require('../game.js');

/**
 * Property 11: High score monotonically tracks maximum
 * Validates: Requirements 5.3
 *
 * For any sequence of score increments, the high score SHALL always equal
 * the maximum score value achieved during the session, and SHALL never decrease.
 */

describe('Feature: flappy-ghosty, Property 11: High score monotonically tracks maximum', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('high score never decreases across random sequences of increments and resets', () => {
    fc.assert(
      fc.property(
        // Generate an array of "rounds" — each round is a number of increments before a reset
        fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1, maxLength: 20 }),
        (incrementsPerRound) => {
          localStorage.clear();
          const sm = new ScoreManager();
          let previousHighScore = 0;
          let maxScoreAchieved = 0;

          for (const increments of incrementsPerRound) {
            // Simulate a round: increment N times, then reset
            for (let i = 0; i < increments; i++) {
              sm.increment();

              // Track the maximum score we've ever seen
              if (sm.score > maxScoreAchieved) {
                maxScoreAchieved = sm.score;
              }

              // High score must never decrease (monotonic)
              expect(sm.highScore).toBeGreaterThanOrEqual(previousHighScore);

              // High score must always equal the maximum score achieved
              expect(sm.highScore).toBe(maxScoreAchieved);

              previousHighScore = sm.highScore;
            }

            // Reset simulates starting a new game
            sm.reset();

            // After reset, high score must still be retained (never decrease)
            expect(sm.highScore).toBeGreaterThanOrEqual(previousHighScore);
            expect(sm.highScore).toBe(maxScoreAchieved);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('high score equals maximum score achieved for any increment sequence', () => {
    fc.assert(
      fc.property(
        // Generate a flat sequence of operations: true = increment, false = reset
        fc.array(fc.boolean(), { minLength: 1, maxLength: 100 }),
        (operations) => {
          localStorage.clear();
          const sm = new ScoreManager();
          let maxScoreAchieved = 0;

          for (const isIncrement of operations) {
            if (isIncrement) {
              sm.increment();
              if (sm.score > maxScoreAchieved) {
                maxScoreAchieved = sm.score;
              }
            } else {
              sm.reset();
            }

            // After every operation, high score must equal max achieved
            expect(sm.highScore).toBe(maxScoreAchieved);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
