import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { CollisionDetector } = require('../game.js');

/**
 * Property 13: Boundary collision detection
 * Validates: Requirements 6.2, 6.3
 *
 * For any ghost bounding box, the collision detector SHALL report a collision
 * if and only if the ghost's top edge (y) is less than or equal to 0 OR the
 * ghost's bottom edge (y + height) is greater than or equal to the play area
 * bottom boundary.
 */

const detector = new CollisionDetector();

// Play area used for boundary checks
function createPlayArea(height = 560) {
  return { x: 0, y: 0, width: 400, height };
}

describe('Feature: flappy-ghosty, Property 13: Boundary collision detection', () => {
  it('reports collision when ghost top edge is at or above 0', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -500, max: 0, noNaN: true, noDefaultInfinity: true }), // y <= 0
        fc.double({ min: 10, max: 100, noNaN: true, noDefaultInfinity: true }), // width
        fc.double({ min: 10, max: 100, noNaN: true, noDefaultInfinity: true }), // height
        fc.double({ min: 200, max: 800, noNaN: true, noDefaultInfinity: true }), // playArea height
        (y, width, height, playAreaHeight) => {
          const ghostBox = { x: 50, y, width, height };
          const playArea = createPlayArea(playAreaHeight);

          const result = detector.checkCollision(ghostBox, [], playArea);

          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('reports collision when ghost bottom edge meets or crosses play area bottom', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 200, max: 800 }), // playArea height (integer to avoid float precision)
        fc.integer({ min: 10, max: 100 }),   // ghost height
        fc.integer({ min: 10, max: 100 }),   // ghost width
        fc.integer({ min: 0, max: 50 }),     // overshoot (0 = exactly at boundary)
        (playAreaHeight, ghostHeight, ghostWidth, overshoot) => {
          // Position ghost so bottom edge >= playArea.height
          // y + ghostHeight = playAreaHeight + overshoot
          const y = playAreaHeight - ghostHeight + overshoot;

          const ghostBox = { x: 50, y, width: ghostWidth, height: ghostHeight };
          const playArea = createPlayArea(playAreaHeight);

          const result = detector.checkCollision(ghostBox, [], playArea);

          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('reports collision when ghost bottom edge is beyond play area bottom', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 200, max: 800, noNaN: true, noDefaultInfinity: true }), // playArea height
        fc.double({ min: 10, max: 100, noNaN: true, noDefaultInfinity: true }), // ghost height
        fc.double({ min: 0.01, max: 200, noNaN: true, noDefaultInfinity: true }), // overshoot amount
        (playAreaHeight, ghostHeight, overshoot) => {
          // Position ghost so bottom edge is beyond the boundary
          const y = playAreaHeight - ghostHeight + overshoot;

          const ghostBox = { x: 50, y, width: 34, height: ghostHeight };
          const playArea = createPlayArea(playAreaHeight);

          const result = detector.checkCollision(ghostBox, [], playArea);

          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does NOT report collision when ghost is safely within play area boundaries', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 300, max: 800, noNaN: true, noDefaultInfinity: true }), // playArea height
        fc.double({ min: 10, max: 50, noNaN: true, noDefaultInfinity: true }),   // ghost height
        fc.double({ min: 10, max: 50, noNaN: true, noDefaultInfinity: true }),   // ghost width
        (playAreaHeight, ghostHeight, ghostWidth) => {
          // Ensure ghost is strictly within boundaries:
          // y > 0 AND y + ghostHeight < playAreaHeight
          const minY = 1; // strictly above 0
          const maxY = playAreaHeight - ghostHeight - 1; // strictly below bottom

          // Only test when there's valid space
          fc.pre(maxY > minY);

          const y = minY + (maxY - minY) * 0.5; // place in the middle of safe zone

          const ghostBox = { x: 50, y, width: ghostWidth, height: ghostHeight };
          const playArea = createPlayArea(playAreaHeight);

          const result = detector.checkCollision(ghostBox, [], playArea);

          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('boundary collision is independent of ghost horizontal position', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -500, max: 500, noNaN: true, noDefaultInfinity: true }), // x position
        fc.double({ min: -100, max: 0, noNaN: true, noDefaultInfinity: true }),   // y at or above top
        fc.double({ min: 10, max: 50, noNaN: true, noDefaultInfinity: true }),    // width
        fc.double({ min: 10, max: 50, noNaN: true, noDefaultInfinity: true }),    // height
        (x, y, width, height) => {
          const ghostBox = { x, y, width, height };
          const playArea = createPlayArea(560);

          const result = detector.checkCollision(ghostBox, [], playArea);

          // Should always collide regardless of x, because y <= 0
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('collision iff ghost touches or crosses any boundary (combined property)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -200, max: 800, noNaN: true, noDefaultInfinity: true }), // y position
        fc.double({ min: 10, max: 60, noNaN: true, noDefaultInfinity: true }),    // ghost height
        fc.double({ min: 10, max: 60, noNaN: true, noDefaultInfinity: true }),    // ghost width
        fc.double({ min: 300, max: 800, noNaN: true, noDefaultInfinity: true }),  // playArea height
        (y, ghostHeight, ghostWidth, playAreaHeight) => {
          const ghostBox = { x: 100, y, width: ghostWidth, height: ghostHeight };
          const playArea = createPlayArea(playAreaHeight);

          const result = detector.checkCollision(ghostBox, [], playArea);

          // Expected: collision iff top edge <= 0 OR bottom edge >= playArea.height
          const touchesTop = y <= 0;
          const touchesBottom = (y + ghostHeight) >= playAreaHeight;
          const expectedCollision = touchesTop || touchesBottom;

          expect(result).toBe(expectedCollision);
        }
      ),
      { numRuns: 100 }
    );
  });
});
