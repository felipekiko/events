import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

// Set up DOM globals before requiring game.js
HTMLCanvasElement.prototype.getContext = function () {
  return {};
};
document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { InputHandler } = require('../game.js');

/**
 * Property 3: Input repeat filtering
 * Validates: Requirements 2.5
 *
 * For any sequence of keyboard events where the event.repeat flag is true,
 * the input handler SHALL NOT trigger a jump callback. Only events where
 * event.repeat is false SHALL trigger jumps.
 */

// Generator for a random keydown event descriptor
const keydownEventArb = fc.record({
  key: fc.oneof(
    fc.constant(' '),        // spacebar — the only key that triggers jump
    fc.constant('Enter'),
    fc.constant('a'),
    fc.constant('ArrowUp'),
    fc.constant('Escape'),
    fc.string({ minLength: 1, maxLength: 1 }) // random single character
  ),
  repeat: fc.boolean(),
});

// Generator for a sequence of keydown events (at least 1, up to 50)
const keydownSequenceArb = fc.array(keydownEventArb, { minLength: 1, maxLength: 50 });

describe('Feature: flappy-ghosty, Property 3: Input repeat filtering', () => {
  let canvas;
  let handler;
  let callback;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    handler = new InputHandler(canvas);
    callback = vi.fn();
    handler.onJump(callback);
    handler.enable();
  });

  afterEach(() => {
    handler.disable();
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });

  it('only events with key=" " and repeat=false trigger the jump callback', () => {
    fc.assert(
      fc.property(keydownSequenceArb, (events) => {
        // Reset callback count before each property run
        callback.mockClear();

        // Dispatch all events in the sequence
        for (const evt of events) {
          const keyEvent = new KeyboardEvent('keydown', {
            key: evt.key,
            repeat: evt.repeat,
            cancelable: true,
          });
          document.dispatchEvent(keyEvent);
        }

        // Expected: only events with key=' ' AND repeat=false should trigger
        const expectedCallCount = events.filter(
          (e) => e.key === ' ' && e.repeat === false
        ).length;

        expect(callback).toHaveBeenCalledTimes(expectedCallCount);
      }),
      { numRuns: 100 }
    );
  });

  it('events with repeat=true never trigger the jump callback regardless of key', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            key: fc.oneof(fc.constant(' '), fc.constant('Enter'), fc.string({ minLength: 1, maxLength: 1 })),
            repeat: fc.constant(true), // All events have repeat=true
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (events) => {
          callback.mockClear();

          for (const evt of events) {
            const keyEvent = new KeyboardEvent('keydown', {
              key: evt.key,
              repeat: evt.repeat,
              cancelable: true,
            });
            document.dispatchEvent(keyEvent);
          }

          // No event with repeat=true should ever trigger the callback
          expect(callback).toHaveBeenCalledTimes(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
