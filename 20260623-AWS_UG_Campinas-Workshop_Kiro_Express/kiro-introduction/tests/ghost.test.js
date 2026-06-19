import { describe, it, expect } from 'vitest';

// Set up DOM globals before requiring game.js
document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { DEFAULT_CONFIG, Ghost } = require('../game.js');

// Helper: create a mock sprite image with dimensions
function createMockSprite(width = 34, height = 24) {
  return { width, height };
}

// Helper: default play area (canvas height minus scoreBar)
function createPlayArea() {
  return { x: 0, y: 0, width: 400, height: 560 };
}

describe('Ghost', () => {
  describe('constructor', () => {
    it('initializes with sprite dimensions from image', () => {
      const sprite = createMockSprite(50, 36);
      const ghost = new Ghost(sprite, createPlayArea(), DEFAULT_CONFIG);
      expect(ghost.width).toBe(50);
      expect(ghost.height).toBe(36);
    });

    it('uses fallback dimensions when sprite has no valid size', () => {
      const sprite = { width: 0, height: 0 };
      const ghost = new Ghost(sprite, createPlayArea(), DEFAULT_CONFIG);
      expect(ghost.width).toBe(34);
      expect(ghost.height).toBe(24);
    });

    it('uses fallback dimensions when sprite is null', () => {
      const ghost = new Ghost(null, createPlayArea(), DEFAULT_CONFIG);
      expect(ghost.width).toBe(34);
      expect(ghost.height).toBe(24);
    });

    it('sets initial position via reset (centered vertically, left fraction horizontally)', () => {
      const playArea = createPlayArea();
      const ghost = new Ghost(createMockSprite(), playArea, DEFAULT_CONFIG);
      expect(ghost.x).toBe(playArea.width * DEFAULT_CONFIG.ghost.startXFraction);
      expect(ghost.y).toBe(playArea.height / 2 - ghost.height / 2);
    });

    it('starts with zero velocity and rotation', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      expect(ghost.velocityY).toBe(0);
      expect(ghost.rotation).toBe(0);
    });
  });

  describe('applyGravity', () => {
    it('increases velocity by gravity * deltaTime', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.velocityY = 0;
      ghost.applyGravity(0.016);
      expect(ghost.velocityY).toBeCloseTo(DEFAULT_CONFIG.ghost.gravity * 0.016, 5);
    });

    it('caps velocity at maxFallSpeed', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.velocityY = DEFAULT_CONFIG.ghost.maxFallSpeed - 10;
      ghost.applyGravity(1.0); // large dt to exceed cap
      expect(ghost.velocityY).toBe(DEFAULT_CONFIG.ghost.maxFallSpeed);
    });

    it('does not change velocity beyond maxFallSpeed when already at cap', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.velocityY = DEFAULT_CONFIG.ghost.maxFallSpeed;
      ghost.applyGravity(0.016);
      expect(ghost.velocityY).toBe(DEFAULT_CONFIG.ghost.maxFallSpeed);
    });
  });

  describe('jump', () => {
    it('sets velocity to configured jumpVelocity', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.velocityY = 200;
      ghost.jump();
      expect(ghost.velocityY).toBe(DEFAULT_CONFIG.ghost.jumpVelocity);
    });

    it('overrides any current velocity (including negative)', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.velocityY = -500;
      ghost.jump();
      expect(ghost.velocityY).toBe(DEFAULT_CONFIG.ghost.jumpVelocity);
    });
  });

  describe('updatePosition', () => {
    it('updates Y by velocity * deltaTime', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.y = 100;
      ghost.velocityY = 200;
      ghost.updatePosition(0.016);
      expect(ghost.y).toBeCloseTo(100 + 200 * 0.016, 5);
    });

    it('moves upward with negative velocity', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.y = 100;
      ghost.velocityY = -300;
      ghost.updatePosition(0.016);
      expect(ghost.y).toBeCloseTo(100 + (-300) * 0.016, 5);
    });
  });

  describe('updateRotation', () => {
    it('sets rotation to maxRotationUp (in radians) at jumpVelocity', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.velocityY = DEFAULT_CONFIG.ghost.jumpVelocity;
      ghost.updateRotation();
      const expectedRadians = DEFAULT_CONFIG.ghost.maxRotationUp * (Math.PI / 180);
      expect(ghost.rotation).toBeCloseTo(expectedRadians, 5);
    });

    it('sets rotation to maxRotationDown (in radians) at maxFallSpeed', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.velocityY = DEFAULT_CONFIG.ghost.maxFallSpeed;
      ghost.updateRotation();
      const expectedRadians = DEFAULT_CONFIG.ghost.maxRotationDown * (Math.PI / 180);
      expect(ghost.rotation).toBeCloseTo(expectedRadians, 5);
    });

    it('sets rotation to 0 at midpoint velocity', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      const midVelocity = (DEFAULT_CONFIG.ghost.jumpVelocity + DEFAULT_CONFIG.ghost.maxFallSpeed) / 2;
      ghost.velocityY = midVelocity;
      ghost.updateRotation();
      // midpoint between -30 and +30 degrees is 0 degrees
      expect(ghost.rotation).toBeCloseTo(0, 5);
    });

    it('clamps rotation when velocity exceeds maxFallSpeed', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.velocityY = 1000; // well beyond maxFallSpeed
      ghost.updateRotation();
      const expectedRadians = DEFAULT_CONFIG.ghost.maxRotationDown * (Math.PI / 180);
      expect(ghost.rotation).toBeCloseTo(expectedRadians, 5);
    });

    it('clamps rotation when velocity is below jumpVelocity', () => {
      const ghost = new Ghost(createMockSprite(), createPlayArea(), DEFAULT_CONFIG);
      ghost.velocityY = -1000; // well below jumpVelocity
      ghost.updateRotation();
      const expectedRadians = DEFAULT_CONFIG.ghost.maxRotationUp * (Math.PI / 180);
      expect(ghost.rotation).toBeCloseTo(expectedRadians, 5);
    });
  });

  describe('getBoundingBox', () => {
    it('returns correct bounding box', () => {
      const ghost = new Ghost(createMockSprite(34, 24), createPlayArea(), DEFAULT_CONFIG);
      ghost.x = 50;
      ghost.y = 100;
      const box = ghost.getBoundingBox();
      expect(box).toEqual({ x: 50, y: 100, width: 34, height: 24 });
    });
  });

  describe('reset', () => {
    it('repositions ghost to starting location', () => {
      const playArea = createPlayArea();
      const ghost = new Ghost(createMockSprite(), playArea, DEFAULT_CONFIG);
      // Move ghost to arbitrary position
      ghost.x = 999;
      ghost.y = 999;
      ghost.velocityY = 500;
      ghost.rotation = 1.5;

      ghost.reset(playArea);

      expect(ghost.x).toBe(playArea.width * DEFAULT_CONFIG.ghost.startXFraction);
      expect(ghost.y).toBe(playArea.height / 2 - ghost.height / 2);
      expect(ghost.velocityY).toBe(0);
      expect(ghost.rotation).toBe(0);
    });

    it('works with a different play area', () => {
      const playArea1 = { x: 0, y: 0, width: 400, height: 560 };
      const playArea2 = { x: 0, y: 0, width: 800, height: 1000 };
      const ghost = new Ghost(createMockSprite(), playArea1, DEFAULT_CONFIG);

      ghost.reset(playArea2);

      expect(ghost.x).toBe(800 * DEFAULT_CONFIG.ghost.startXFraction);
      expect(ghost.y).toBe(1000 / 2 - ghost.height / 2);
    });
  });
});
