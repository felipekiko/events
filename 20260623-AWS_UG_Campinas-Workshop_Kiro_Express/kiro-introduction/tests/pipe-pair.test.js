import { describe, it, expect } from 'vitest';

// Set up DOM globals before requiring game.js
document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { PipePair } = require('../game.js');

// Helper: default play area (canvas height minus scoreBar)
function createPlayArea() {
  return { x: 0, y: 0, width: 400, height: 560 };
}

describe('PipePair', () => {
  const defaultX = 400;
  const defaultGapCenterY = 280;
  const defaultGapHeight = 120;
  const defaultPipeWidth = 50;
  const defaultCapWidth = 60;
  const defaultCapHeight = 20;

  function createDefaultPipePair() {
    return new PipePair(
      defaultX,
      defaultGapCenterY,
      defaultGapHeight,
      defaultPipeWidth,
      defaultCapWidth,
      defaultCapHeight,
      createPlayArea()
    );
  }

  describe('constructor', () => {
    it('stores all provided parameters', () => {
      const playArea = createPlayArea();
      const pipe = new PipePair(400, 280, 120, 50, 60, 20, playArea);

      expect(pipe.x).toBe(400);
      expect(pipe.gapCenterY).toBe(280);
      expect(pipe.gapHeight).toBe(120);
      expect(pipe.pipeWidth).toBe(50);
      expect(pipe.capWidth).toBe(60);
      expect(pipe.capHeight).toBe(20);
      expect(pipe.playArea).toBe(playArea);
    });

    it('computes topPipeHeight as gapCenterY - gapHeight / 2', () => {
      const pipe = createDefaultPipePair();
      expect(pipe.topPipeHeight).toBe(280 - 120 / 2); // 220
    });

    it('computes bottomPipeY as gapCenterY + gapHeight / 2', () => {
      const pipe = createDefaultPipePair();
      expect(pipe.bottomPipeY).toBe(280 + 120 / 2); // 340
    });

    it('initializes scored flag to false', () => {
      const pipe = createDefaultPipePair();
      expect(pipe.scored).toBe(false);
    });

    it('handles edge case where gap is near the top', () => {
      const pipe = new PipePair(400, 80, 120, 50, 60, 20, createPlayArea());
      expect(pipe.topPipeHeight).toBe(20); // 80 - 60
      expect(pipe.bottomPipeY).toBe(140); // 80 + 60
    });

    it('handles edge case where gap is near the bottom', () => {
      const playArea = createPlayArea();
      const pipe = new PipePair(400, 480, 120, 50, 60, 20, playArea);
      expect(pipe.topPipeHeight).toBe(420); // 480 - 60
      expect(pipe.bottomPipeY).toBe(540); // 480 + 60
    });
  });

  describe('getTopBoundingBox', () => {
    it('returns bounding box with capWidth centered on pipe body', () => {
      const pipe = createDefaultPipePair();
      const box = pipe.getTopBoundingBox();
      const capOffsetX = (60 - 50) / 2; // 5

      expect(box.x).toBe(400 - capOffsetX); // 395
      expect(box.y).toBe(0);
      expect(box.width).toBe(60);
      expect(box.height).toBe(220);
    });

    it('starts from y=0 (top of play area)', () => {
      const pipe = createDefaultPipePair();
      const box = pipe.getTopBoundingBox();
      expect(box.y).toBe(0);
    });

    it('height equals topPipeHeight', () => {
      const pipe = new PipePair(400, 300, 140, 50, 60, 20, createPlayArea());
      const box = pipe.getTopBoundingBox();
      expect(box.height).toBe(300 - 140 / 2); // 230
    });
  });

  describe('getBottomBoundingBox', () => {
    it('returns bounding box with capWidth centered on pipe body', () => {
      const pipe = createDefaultPipePair();
      const box = pipe.getBottomBoundingBox();
      const capOffsetX = (60 - 50) / 2; // 5

      expect(box.x).toBe(400 - capOffsetX); // 395
      expect(box.y).toBe(340);
      expect(box.width).toBe(60);
      expect(box.height).toBe(560 - 340); // 220
    });

    it('starts at bottomPipeY', () => {
      const pipe = createDefaultPipePair();
      const box = pipe.getBottomBoundingBox();
      expect(box.y).toBe(pipe.bottomPipeY);
    });

    it('extends to the bottom of the play area', () => {
      const playArea = createPlayArea();
      const pipe = createDefaultPipePair();
      const box = pipe.getBottomBoundingBox();
      expect(box.y + box.height).toBe(playArea.height);
    });
  });

  describe('getTrailingEdgeX', () => {
    it('returns x + pipeWidth', () => {
      const pipe = createDefaultPipePair();
      expect(pipe.getTrailingEdgeX()).toBe(400 + 50); // 450
    });

    it('uses pipeWidth not capWidth', () => {
      const pipe = new PipePair(100, 280, 120, 50, 80, 20, createPlayArea());
      expect(pipe.getTrailingEdgeX()).toBe(150); // 100 + 50, not 100 + 80
    });
  });

  describe('scored flag', () => {
    it('can be set to true to mark as scored', () => {
      const pipe = createDefaultPipePair();
      expect(pipe.scored).toBe(false);
      pipe.scored = true;
      expect(pipe.scored).toBe(true);
    });
  });
});
