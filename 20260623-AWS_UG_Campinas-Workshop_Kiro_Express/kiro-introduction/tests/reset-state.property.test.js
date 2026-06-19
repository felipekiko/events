import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { GameEngine, DEFAULT_CONFIG } = require('../game.js');

/**
 * Property 15: Reset produces correct initial state
 * Validates: Requirements 7.6
 */
describe('Feature: flappy-ghosty, Property 15: Reset produces correct initial state', () => {
  function createEngine() {
    const canvas = document.createElement('canvas');
    canvas.width = DEFAULT_CONFIG.canvas.width;
    canvas.height = DEFAULT_CONFIG.canvas.height;
    canvas.getContext = () => ({
      clearRect() {}, fillRect() {}, fillText() {}, beginPath() {},
      ellipse() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {},
      arc() {}, save() {}, restore() {}, drawImage() {}, rotate() {}, translate() {},
      set fillStyle(_) {}, set strokeStyle(_) {}, set lineWidth(_) {},
      set globalAlpha(_) {}, set font(_) {}, set textAlign(_) {}, set textBaseline(_) {},
    });
    return new GameEngine(canvas, DEFAULT_CONFIG);
  }

  it('restart produces correct initial state regardless of prior game state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.double({ min: -500, max: 500, noNaN: true }),
        fc.double({ min: -300, max: 300, noNaN: true }),
        (score, ghostY, velocity) => {
          const engine = createEngine();

          // Simulate game state
          engine.scoreManager.score = score;
          if (score > engine.scoreManager.highScore) {
            engine.scoreManager.highScore = score;
          }
          engine.ghost.y = ghostY;
          engine.ghost.velocityY = velocity;
          engine.transition('gameOver');
          const highScoreBefore = engine.scoreManager.highScore;

          // Trigger restart (mock time past cooldown)
          const originalNow = performance.now;
          performance.now = () => engine.stateTimestamp + 1000;
          engine._handleInput();
          performance.now = originalNow;

          // Verify reset state
          expect(engine.scoreManager.score).toBe(0);
          expect(engine.scoreManager.highScore).toBe(highScoreBefore);
          expect(engine.pipeManager.pipes.length).toBe(0);
          expect(engine.ghost.velocityY).toBe(0);
          expect(engine.ghost.rotation).toBe(0);
          expect(engine.state).toBe('start');

          // Ghost at start position
          const expectedX = engine.playArea.width * DEFAULT_CONFIG.ghost.startXFraction;
          const expectedY = engine.playArea.height / 2 - engine.ghost.height / 2;
          expect(engine.ghost.x).toBe(expectedX);
          expect(engine.ghost.y).toBe(expectedY);
        }
      ),
      { numRuns: 100 }
    );
  });
});
