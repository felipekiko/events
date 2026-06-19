import { describe, it, expect } from 'vitest';

// Set up DOM globals before requiring game.js
document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { CollisionDetector } = require('../game.js');

// Helper: default play area (canvas height minus scoreBar)
function createPlayArea() {
  return { x: 0, y: 0, width: 400, height: 560 };
}

describe('CollisionDetector', () => {
  describe('static aabbOverlap', () => {
    it('returns true for overlapping boxes', () => {
      const boxA = { x: 10, y: 10, width: 20, height: 20 };
      const boxB = { x: 15, y: 15, width: 20, height: 20 };
      expect(CollisionDetector.aabbOverlap(boxA, boxB)).toBe(true);
    });

    it('returns false for non-overlapping boxes (separated horizontally)', () => {
      const boxA = { x: 10, y: 10, width: 20, height: 20 };
      const boxB = { x: 50, y: 10, width: 20, height: 20 };
      expect(CollisionDetector.aabbOverlap(boxA, boxB)).toBe(false);
    });

    it('returns false for non-overlapping boxes (separated vertically)', () => {
      const boxA = { x: 10, y: 10, width: 20, height: 20 };
      const boxB = { x: 10, y: 50, width: 20, height: 20 };
      expect(CollisionDetector.aabbOverlap(boxA, boxB)).toBe(false);
    });

    it('returns false for boxes touching exactly at edges (no overlap)', () => {
      // boxA right edge = 30, boxB left edge = 30 → no overlap (uses strict <)
      const boxA = { x: 10, y: 10, width: 20, height: 20 };
      const boxB = { x: 30, y: 10, width: 20, height: 20 };
      expect(CollisionDetector.aabbOverlap(boxA, boxB)).toBe(false);
    });

    it('returns true when one box contains the other', () => {
      const boxA = { x: 0, y: 0, width: 100, height: 100 };
      const boxB = { x: 25, y: 25, width: 10, height: 10 };
      expect(CollisionDetector.aabbOverlap(boxA, boxB)).toBe(true);
    });

    it('returns true for identical boxes', () => {
      const boxA = { x: 10, y: 10, width: 20, height: 20 };
      expect(CollisionDetector.aabbOverlap(boxA, boxA)).toBe(true);
    });
  });

  describe('checkCollision', () => {
    let detector;

    beforeEach(() => {
      detector = new CollisionDetector();
    });

    it('returns true when ghost touches top boundary (y <= 0)', () => {
      const ghostBox = { x: 100, y: 0, width: 34, height: 24 };
      const result = detector.checkCollision(ghostBox, [], createPlayArea());
      expect(result).toBe(true);
    });

    it('returns true when ghost crosses top boundary (y < 0)', () => {
      const ghostBox = { x: 100, y: -5, width: 34, height: 24 };
      const result = detector.checkCollision(ghostBox, [], createPlayArea());
      expect(result).toBe(true);
    });

    it('returns true when ghost touches bottom boundary', () => {
      const playArea = createPlayArea();
      const ghostBox = { x: 100, y: playArea.height - 24, width: 34, height: 24 };
      const result = detector.checkCollision(ghostBox, [], playArea);
      expect(result).toBe(true);
    });

    it('returns true when ghost crosses bottom boundary', () => {
      const playArea = createPlayArea();
      const ghostBox = { x: 100, y: playArea.height - 10, width: 34, height: 24 };
      const result = detector.checkCollision(ghostBox, [], playArea);
      expect(result).toBe(true);
    });

    it('returns true when ghost overlaps with a pipe box', () => {
      const ghostBox = { x: 100, y: 200, width: 34, height: 24 };
      const pipeBoxes = [{ x: 110, y: 0, width: 60, height: 210 }];
      const result = detector.checkCollision(ghostBox, pipeBoxes, createPlayArea());
      expect(result).toBe(true);
    });

    it('returns false when ghost is safely in play area with no pipe overlap', () => {
      const ghostBox = { x: 100, y: 200, width: 34, height: 24 };
      const pipeBoxes = [{ x: 300, y: 0, width: 60, height: 150 }];
      const result = detector.checkCollision(ghostBox, pipeBoxes, createPlayArea());
      expect(result).toBe(false);
    });

    it('returns false when no pipes and ghost within boundaries', () => {
      const ghostBox = { x: 100, y: 200, width: 34, height: 24 };
      const result = detector.checkCollision(ghostBox, [], createPlayArea());
      expect(result).toBe(false);
    });

    it('detects collision with second pipe in array', () => {
      const ghostBox = { x: 100, y: 200, width: 34, height: 24 };
      const pipeBoxes = [
        { x: 300, y: 0, width: 60, height: 150 }, // no overlap
        { x: 90, y: 190, width: 60, height: 50 },  // overlaps
      ];
      const result = detector.checkCollision(ghostBox, pipeBoxes, createPlayArea());
      expect(result).toBe(true);
    });
  });
});
