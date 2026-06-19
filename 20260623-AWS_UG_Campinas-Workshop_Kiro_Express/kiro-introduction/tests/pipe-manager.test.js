import { describe, it, expect, beforeEach } from 'vitest';

// Set up DOM globals before requiring game.js
document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { PipeManager, PipePair, DEFAULT_CONFIG } = require('../game.js');

// Helper: default play area (canvas height minus scoreBar)
function createPlayArea() {
  return { x: 0, y: 0, width: 400, height: 560 };
}

describe('PipeManager', () => {
  const ghostHeight = 34;
  let playArea;
  let config;

  beforeEach(() => {
    playArea = createPlayArea();
    config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  });

  describe('constructor', () => {
    it('stores playArea, config, and ghostHeight', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      expect(pm.playArea).toBe(playArea);
      expect(pm.config).toBe(config);
      expect(pm.ghostHeight).toBe(ghostHeight);
    });

    it('initializes pipes as empty array', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      expect(pm.pipes).toEqual([]);
    });

    it('calculates gapHeight between 3x and 4x ghost height', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      const minGap = config.pipes.gapMultiplierMin * ghostHeight;
      const maxGap = config.pipes.gapMultiplierMax * ghostHeight;
      expect(pm.gapHeight).toBeGreaterThanOrEqual(minGap);
      expect(pm.gapHeight).toBeLessThanOrEqual(maxGap);
    });
  });

  describe('update(deltaTime)', () => {
    it('moves all pipes left by speed * deltaTime', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      // Force generate a pipe first
      pm.update(0.016);
      const initialX = pm.pipes[0].x;
      pm.update(0.1);
      // The pipe should have moved left by speed * dt
      expect(pm.pipes[0].x).toBeCloseTo(initialX - config.pipes.speed * 0.1, 5);
    });

    it('generates first pipe on first update call', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      expect(pm.pipes.length).toBe(0);
      pm.update(0.016);
      expect(pm.pipes.length).toBeGreaterThanOrEqual(1);
    });

    it('generates new pipe when last pipe is horizontalSpacing from right edge', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      pm.update(0.016); // Generate first pipe at x=playArea.width, then move slightly
      expect(pm.pipes.length).toBe(1);

      // Move in small steps to ensure the generation condition triggers
      // Condition: playArea.width - lastPipe.x >= horizontalSpacing
      // We need lastPipe.x <= playArea.width - horizontalSpacing = 400 - 220 = 180
      // Pipe starts at ~400 (generated at playArea.width then moved by speed*0.016)
      // Need to move ~220 pixels at 150 px/s = ~1.47s
      pm.update(1.5); // Move pipe 225px left, should trigger generation
      expect(pm.pipes.length).toBeGreaterThanOrEqual(2);
    });

    it('removes pipes that move entirely offscreen to the left', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      pm.update(0.016); // Generate first pipe
      // Move far enough to push the pipe entirely offscreen
      // pipe.x + pipeWidth + capOffset <= 0
      const capOffset = (config.pipes.capWidth - config.pipes.width) / 2;
      const requiredMovement = playArea.width + config.pipes.width + capOffset;
      const dt = requiredMovement / config.pipes.speed;
      pm.update(dt + 0.1); // small extra to ensure it's past
      // All original pipes should be removed (new ones may have been generated)
      const allOnscreen = pm.pipes.every(pipe => {
        const offset = (pipe.capWidth - pipe.pipeWidth) / 2;
        return (pipe.x + pipe.pipeWidth + offset) > 0;
      });
      expect(allOnscreen).toBe(true);
    });

    it('generated pipes have gap center within valid range', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      pm.update(0.016);
      const pipe = pm.pipes[0];
      const minGapCenter = pm.gapHeight / 2 + config.pipes.minPipeLength;
      const maxGapCenter = playArea.height - pm.gapHeight / 2 - config.pipes.minPipeLength;
      expect(pipe.gapCenterY).toBeGreaterThanOrEqual(minGapCenter);
      expect(pipe.gapCenterY).toBeLessThanOrEqual(maxGapCenter);
    });

    it('generated pipes use the fixed gapHeight', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      pm.update(0.016);
      expect(pm.pipes[0].gapHeight).toBe(pm.gapHeight);
    });
  });

  describe('reset()', () => {
    it('clears all pipes', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      pm.update(0.016); // Generate pipe
      expect(pm.pipes.length).toBeGreaterThan(0);
      pm.reset();
      expect(pm.pipes).toEqual([]);
    });
  });

  describe('getCollidables()', () => {
    it('returns empty array when no pipes exist', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      expect(pm.getCollidables()).toEqual([]);
    });

    it('returns 2 bounding boxes per pipe (top + bottom)', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      pm.update(0.016); // Generate one pipe
      const boxes = pm.getCollidables();
      expect(boxes.length).toBe(2 * pm.pipes.length);
    });

    it('each bounding box has x, y, width, height properties', () => {
      const pm = new PipeManager(playArea, config, ghostHeight);
      pm.update(0.016);
      const boxes = pm.getCollidables();
      for (const box of boxes) {
        expect(box).toHaveProperty('x');
        expect(box).toHaveProperty('y');
        expect(box).toHaveProperty('width');
        expect(box).toHaveProperty('height');
        expect(typeof box.x).toBe('number');
        expect(typeof box.y).toBe('number');
        expect(typeof box.width).toBe('number');
        expect(typeof box.height).toBe('number');
      }
    });
  });
});
