import { describe, it, expect, beforeEach } from 'vitest';

// Set up DOM globals before requiring game.js
document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { ScoreManager } = require('../game.js');

describe('ScoreManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('constructor', () => {
    it('initializes score to 0', () => {
      const sm = new ScoreManager();
      expect(sm.score).toBe(0);
    });

    it('initializes highScore to 0 when localStorage is empty', () => {
      const sm = new ScoreManager();
      expect(sm.highScore).toBe(0);
    });

    it('loads existing highScore from localStorage', () => {
      localStorage.setItem('flappyGhosty_highScore', JSON.stringify(42));
      const sm = new ScoreManager();
      expect(sm.highScore).toBe(42);
    });
  });

  describe('increment', () => {
    it('increases score by 1', () => {
      const sm = new ScoreManager();
      sm.increment();
      expect(sm.score).toBe(1);
    });

    it('updates highScore when score exceeds it', () => {
      const sm = new ScoreManager();
      sm.increment();
      expect(sm.highScore).toBe(1);
    });

    it('does not update highScore when score does not exceed it', () => {
      localStorage.setItem('flappyGhosty_highScore', JSON.stringify(10));
      const sm = new ScoreManager();
      sm.increment();
      expect(sm.score).toBe(1);
      expect(sm.highScore).toBe(10);
    });

    it('persists highScore to localStorage when new high is achieved', () => {
      const sm = new ScoreManager();
      sm.increment();
      const stored = JSON.parse(localStorage.getItem('flappyGhosty_highScore'));
      expect(stored).toBe(1);
    });

    it('increments multiple times correctly', () => {
      const sm = new ScoreManager();
      sm.increment();
      sm.increment();
      sm.increment();
      expect(sm.score).toBe(3);
      expect(sm.highScore).toBe(3);
    });
  });

  describe('reset', () => {
    it('sets score to 0', () => {
      const sm = new ScoreManager();
      sm.increment();
      sm.increment();
      sm.reset();
      expect(sm.score).toBe(0);
    });

    it('retains highScore after reset', () => {
      const sm = new ScoreManager();
      sm.increment();
      sm.increment();
      sm.increment();
      sm.reset();
      expect(sm.highScore).toBe(3);
    });
  });

  describe('persist', () => {
    it('saves highScore to localStorage with correct key', () => {
      const sm = new ScoreManager();
      sm.highScore = 25;
      sm.persist();
      const stored = JSON.parse(localStorage.getItem('flappyGhosty_highScore'));
      expect(stored).toBe(25);
    });
  });

  describe('loadHighScore', () => {
    it('returns 0 when localStorage has no value', () => {
      const sm = new ScoreManager();
      expect(sm.loadHighScore()).toBe(0);
    });

    it('returns stored integer value', () => {
      localStorage.setItem('flappyGhosty_highScore', JSON.stringify(99));
      const sm = new ScoreManager();
      expect(sm.loadHighScore()).toBe(99);
    });

    it('returns 0 for invalid stored value (NaN)', () => {
      localStorage.setItem('flappyGhosty_highScore', 'not-a-number');
      const sm = new ScoreManager();
      expect(sm.loadHighScore()).toBe(0);
    });
  });
});
