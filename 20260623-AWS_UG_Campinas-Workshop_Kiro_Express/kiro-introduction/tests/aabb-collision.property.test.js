import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { CollisionDetector } = require('../game.js');

/**
 * Property 12: AABB collision correctness
 * Validates: Requirements 6.1, 6.5
 *
 * For any two axis-aligned bounding boxes A and B, the collision detector SHALL
 * return true if and only if A.x < B.x + B.width AND A.x + A.width > B.x AND
 * A.y < B.y + B.height AND A.y + A.height > B.y.
 */

// Generator for a bounding box with x, y in [-500, 500] and width, height in [1, 200]
const boxArbitrary = fc.record({
  x: fc.double({ min: -500, max: 500, noNaN: true, noDefaultInfinity: true }),
  y: fc.double({ min: -500, max: 500, noNaN: true, noDefaultInfinity: true }),
  width: fc.double({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true }),
  height: fc.double({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true }),
});

describe('Feature: flappy-ghosty, Property 12: AABB collision correctness', () => {
  it('aabbOverlap returns true if and only if the mathematical AABB overlap formula holds', () => {
    fc.assert(
      fc.property(
        boxArbitrary,
        boxArbitrary,
        (boxA, boxB) => {
          // Compute expected result using the mathematical AABB formula
          const expected =
            boxA.x < boxB.x + boxB.width &&
            boxA.x + boxA.width > boxB.x &&
            boxA.y < boxB.y + boxB.height &&
            boxA.y + boxA.height > boxB.y;

          // Verify CollisionDetector.aabbOverlap matches the formula
          const actual = CollisionDetector.aabbOverlap(boxA, boxB);

          expect(actual).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});
