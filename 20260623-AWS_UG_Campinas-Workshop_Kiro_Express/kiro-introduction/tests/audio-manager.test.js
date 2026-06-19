import { describe, it, expect, vi } from 'vitest';

// Set up DOM globals before requiring game.js
document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { AudioManager } = require('../game.js');

describe('AudioManager', () => {
  describe('constructor', () => {
    it('creates an AudioManager instance without throwing', () => {
      const am = new AudioManager();
      expect(am).toBeInstanceOf(AudioManager);
    });

    it('initializes jumpSound and gameOverSound properties', () => {
      const am = new AudioManager();
      // In jsdom, Audio constructor exists but may not fully work
      // The key is that the constructor doesn't throw
      expect(am.jumpSound).not.toBeUndefined();
      expect(am.gameOverSound).not.toBeUndefined();
    });
  });

  describe('playJump', () => {
    it('does not throw when called', () => {
      const am = new AudioManager();
      expect(() => am.playJump()).not.toThrow();
    });

    it('does not throw when jumpSound is null', () => {
      const am = new AudioManager();
      am.jumpSound = null;
      expect(() => am.playJump()).not.toThrow();
    });
  });

  describe('playGameOver', () => {
    it('does not throw when called', () => {
      const am = new AudioManager();
      expect(() => am.playGameOver()).not.toThrow();
    });

    it('does not throw when gameOverSound is null', () => {
      const am = new AudioManager();
      am.gameOverSound = null;
      expect(() => am.playGameOver()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('handles Audio constructor failure gracefully', () => {
      // Temporarily break the Audio constructor
      const originalAudio = globalThis.Audio;
      globalThis.Audio = function () { throw new Error('Audio not supported'); };

      const am = new AudioManager();
      expect(am.jumpSound).toBeNull();
      expect(am.gameOverSound).toBeNull();

      // Methods still work without throwing
      expect(() => am.playJump()).not.toThrow();
      expect(() => am.playGameOver()).not.toThrow();

      globalThis.Audio = originalAudio;
    });

    it('handles play() returning rejected promise silently', () => {
      const am = new AudioManager();
      // Mock the sound with a cloneNode that returns an object with play() that rejects
      am.jumpSound = {
        cloneNode: () => ({
          currentTime: 0,
          play: () => Promise.reject(new Error('User interaction required'))
        })
      };

      // Should not throw
      expect(() => am.playJump()).not.toThrow();
    });

    it('handles cloneNode throwing silently', () => {
      const am = new AudioManager();
      am.jumpSound = {
        cloneNode: () => { throw new Error('Clone failed'); }
      };

      expect(() => am.playJump()).not.toThrow();
    });
  });
});
