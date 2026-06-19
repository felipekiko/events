import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { GameEngine, DEFAULT_CONFIG } = require('../game.js');

/**
 * Property 6: No physics in non-active states
 * Validates: Requirements 3.5, 7.2
 */
describe('Feature: flappy-ghosty, Property 6: No physics in non-active states', () => {
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

  it('update in start state does not change ghost position or velocity', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 0.25, noNaN: true }),
        (deltaTime) => {
          const engine = createEngine();
          engine.transition('start');
          const prevY = engine.ghost.y;
          const prevV = engine.ghost.velocityY;

          engine.update(deltaTime);

          expect(engine.ghost.y).toBe(prevY);
          expect(engine.ghost.velocityY).toBe(prevV);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('update in gameOver state does not change ghost position or velocity', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 0.25, noNaN: true }),
        (deltaTime) => {
          const engine = createEngine();
          engine.transition('gameOver');
          const prevY = engine.ghost.y;
          const prevV = engine.ghost.velocityY;

          engine.update(deltaTime);

          expect(engine.ghost.y).toBe(prevY);
          expect(engine.ghost.velocityY).toBe(prevV);
        }
      ),
      { numRuns: 100 }
    );
  });
});
