import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Set up DOM globals before requiring game.js
// Mock getContext to prevent game.js from replacing innerHTML
HTMLCanvasElement.prototype.getContext = function () {
  return {};
};
document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { InputHandler } = require('../game.js');

describe('InputHandler', () => {
  let canvas;
  let handler;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    handler = new InputHandler(canvas);
  });

  afterEach(() => {
    handler.disable();
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });

  describe('constructor', () => {
    it('initializes with canvas reference', () => {
      expect(handler.canvas).toBe(canvas);
    });

    it('starts in disabled state', () => {
      expect(handler.enabled).toBe(false);
    });

    it('has no jump callback initially', () => {
      expect(handler.jumpCallback).toBeNull();
    });
  });

  describe('onJump', () => {
    it('registers a jump callback', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      expect(handler.jumpCallback).toBe(callback);
    });
  });

  describe('enable / disable', () => {
    it('sets enabled to true on enable()', () => {
      handler.enable();
      expect(handler.enabled).toBe(true);
    });

    it('sets enabled to false on disable()', () => {
      handler.enable();
      handler.disable();
      expect(handler.enabled).toBe(false);
    });

    it('does not add duplicate listeners on multiple enable() calls', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();
      handler.enable(); // second call should be a no-op

      canvas.dispatchEvent(new MouseEvent('mousedown'));
      expect(callback).toHaveBeenCalledTimes(1); // not 2
    });

    it('does not throw on multiple disable() calls', () => {
      handler.enable();
      handler.disable();
      expect(() => handler.disable()).not.toThrow();
    });
  });

  describe('mousedown events', () => {
    it('triggers jump callback on mousedown', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();

      canvas.dispatchEvent(new MouseEvent('mousedown'));
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not trigger callback when disabled', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      // Not calling enable()

      canvas.dispatchEvent(new MouseEvent('mousedown'));
      expect(callback).not.toHaveBeenCalled();
    });

    it('does not trigger when no callback is registered', () => {
      handler.enable();
      // No onJump registered — should not throw
      expect(() => {
        canvas.dispatchEvent(new MouseEvent('mousedown'));
      }).not.toThrow();
    });
  });

  describe('touchstart events', () => {
    it('triggers jump callback on touchstart', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();

      const touchEvent = new Event('touchstart', { bubbles: true, cancelable: true });
      canvas.dispatchEvent(touchEvent);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('calls preventDefault on touchstart to prevent scroll/zoom', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();

      const touchEvent = new Event('touchstart', { bubbles: true, cancelable: true });
      const preventSpy = vi.spyOn(touchEvent, 'preventDefault');
      canvas.dispatchEvent(touchEvent);
      expect(preventSpy).toHaveBeenCalled();
    });
  });

  describe('keydown events (spacebar)', () => {
    it('triggers jump callback on spacebar keydown', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: false }));
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does NOT trigger on held-key repeats (event.repeat = true)', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true }));
      expect(callback).not.toHaveBeenCalled();
    });

    it('does NOT trigger on non-spacebar keys', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: false }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', repeat: false }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', repeat: false }));
      expect(callback).not.toHaveBeenCalled();
    });

    it('calls preventDefault on spacebar to prevent page scroll', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();

      const event = new KeyboardEvent('keydown', { key: ' ', repeat: false, cancelable: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      document.dispatchEvent(event);
      expect(preventSpy).toHaveBeenCalled();
    });
  });

  describe('input normalization', () => {
    it('all input types call the same callback', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();

      canvas.dispatchEvent(new MouseEvent('mousedown'));
      const touchEvent = new Event('touchstart', { bubbles: true, cancelable: true });
      canvas.dispatchEvent(touchEvent);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: false }));

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('listener cleanup on disable', () => {
    it('stops receiving events after disable()', () => {
      const callback = vi.fn();
      handler.onJump(callback);
      handler.enable();
      handler.disable();

      canvas.dispatchEvent(new MouseEvent('mousedown'));
      canvas.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: false }));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
