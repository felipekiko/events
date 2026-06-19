import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { GameEngine, DEFAULT_CONFIG } = require('../game.js');

/**
 * Property 14: Game over input cooldown
 * Validates: Requirements 7.4, 7.5
 */
describe('Feature: flappy-ghosty, Property 14: Game over input cooldown', () => {
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

  it('input before cooldown does not restart', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 499 }),
        (elapsedMs) => {
          const engine = createEngine();
          engine.transition('gameOver');
          const originalNow = performance.now;
          const stateTime = engine.stateTimestamp;
          performance.now = () => stateTime + elapsedMs;

          engine._handleInput();
          expect(engine.state).toBe('gameOver');

          performance.now = originalNow;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('input after cooldown triggers restart', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 500, max: 5000 }),
        (elapsedMs) => {
          const engine = createEngine();
          engine.transition('gameOver');
          const originalNow = performance.now;
          const stateTime = engine.stateTimestamp;
          performance.now = () => stateTime + elapsedMs;

          engine._handleInput();
          expect(engine.state).toBe('start');

          performance.now = originalNow;
        }
      ),
      { numRuns: 100 }
    );
  });
});
