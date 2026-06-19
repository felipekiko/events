import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to set up DOM globals before requiring game.js
document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';

const { DEFAULT_CONFIG, ConfigLoader } = require('../game.js');

describe('DEFAULT_CONFIG', () => {
  it('has all required top-level sections', () => {
    expect(DEFAULT_CONFIG).toHaveProperty('canvas');
    expect(DEFAULT_CONFIG).toHaveProperty('scoreBar');
    expect(DEFAULT_CONFIG).toHaveProperty('ghost');
    expect(DEFAULT_CONFIG).toHaveProperty('pipes');
    expect(DEFAULT_CONFIG).toHaveProperty('clouds');
    expect(DEFAULT_CONFIG).toHaveProperty('timing');
  });

  it('has correct default values', () => {
    expect(DEFAULT_CONFIG.canvas.width).toBe(400);
    expect(DEFAULT_CONFIG.canvas.height).toBe(600);
    expect(DEFAULT_CONFIG.ghost.gravity).toBe(980);
    expect(DEFAULT_CONFIG.ghost.jumpVelocity).toBe(-300);
    expect(DEFAULT_CONFIG.pipes.speed).toBe(150);
    expect(DEFAULT_CONFIG.timing.maxDeltaTime).toBe(0.25);
    expect(DEFAULT_CONFIG.timing.gameOverCooldown).toBe(500);
  });
});

describe('ConfigLoader.merge', () => {
  it('returns full defaults when loaded is empty', () => {
    const result = ConfigLoader.merge({}, DEFAULT_CONFIG);
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  it('overrides only specified fields (deep merge)', () => {
    const partial = { ghost: { gravity: 1000 } };
    const result = ConfigLoader.merge(partial, DEFAULT_CONFIG);
    expect(result.ghost.gravity).toBe(1000);
    expect(result.ghost.jumpVelocity).toBe(-300); // retained default
    expect(result.ghost.maxFallSpeed).toBe(500); // retained default
    expect(result.canvas).toEqual(DEFAULT_CONFIG.canvas); // untouched section
  });

  it('merges multiple sections independently', () => {
    const partial = {
      canvas: { width: 800 },
      pipes: { speed: 180 },
    };
    const result = ConfigLoader.merge(partial, DEFAULT_CONFIG);
    expect(result.canvas.width).toBe(800);
    expect(result.canvas.height).toBe(600); // default
    expect(result.pipes.speed).toBe(180);
    expect(result.pipes.width).toBe(50); // default
  });

  it('handles null loaded gracefully', () => {
    const result = ConfigLoader.merge(null, DEFAULT_CONFIG);
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  it('handles undefined loaded gracefully', () => {
    const result = ConfigLoader.merge(undefined, DEFAULT_CONFIG);
    expect(result).toEqual(DEFAULT_CONFIG);
  });
});

describe('ConfigLoader.validate', () => {
  it('returns empty object for null input', () => {
    expect(ConfigLoader.validate(null)).toEqual({});
  });

  it('returns empty object for array input', () => {
    expect(ConfigLoader.validate([])).toEqual({});
  });

  it('keeps valid values within range', () => {
    const valid = {
      canvas: { width: 800, height: 600 },
      ghost: { gravity: 1000, jumpVelocity: -300 },
    };
    const result = ConfigLoader.validate(valid);
    expect(result.canvas.width).toBe(800);
    expect(result.canvas.height).toBe(600);
    expect(result.ghost.gravity).toBe(1000);
    expect(result.ghost.jumpVelocity).toBe(-300);
  });

  it('removes invalid values (out of range)', () => {
    const invalid = {
      canvas: { width: -1, height: 600 },
      ghost: { gravity: 5000, jumpVelocity: 100 },
      scoreBar: { height: 10 },
    };
    const result = ConfigLoader.validate(invalid);
    expect(result.canvas.width).toBeUndefined();
    expect(result.canvas.height).toBe(600);
    expect(result.ghost.gravity).toBeUndefined();
    expect(result.ghost.jumpVelocity).toBeUndefined();
    expect(result.scoreBar.height).toBeUndefined();
  });

  it('validates pipes.capWidth must be greater than pipes.width', () => {
    const config = {
      pipes: { width: 50, capWidth: 40 }, // capWidth <= width, invalid
    };
    const result = ConfigLoader.validate(config);
    expect(result.pipes.capWidth).toBeUndefined();
  });

  it('validates pipes.capWidth against loaded valid width', () => {
    const config = {
      pipes: { width: 45, capWidth: 50 }, // 50 > 45, valid
    };
    const result = ConfigLoader.validate(config);
    expect(result.pipes.width).toBe(45);
    expect(result.pipes.capWidth).toBe(50);
  });

  it('validates gapMultiplierMax must be greater than gapMultiplierMin', () => {
    const config = {
      pipes: { gapMultiplierMin: 3, gapMultiplierMax: 2 }, // max < min, invalid
    };
    const result = ConfigLoader.validate(config);
    expect(result.pipes.gapMultiplierMin).toBe(3);
    expect(result.pipes.gapMultiplierMax).toBeUndefined();
  });

  it('validates cloud speed fractions relationship', () => {
    const config = {
      clouds: { minSpeedFraction: 0.5, maxSpeedFraction: 0.3 }, // max < min, invalid
    };
    const result = ConfigLoader.validate(config);
    expect(result.clouds.minSpeedFraction).toBe(0.5);
    expect(result.clouds.maxSpeedFraction).toBeUndefined();
  });

  it('validates cloud opacity relationship', () => {
    const config = {
      clouds: { minOpacity: 0.7, maxOpacity: 0.5 }, // max < min, invalid
    };
    const result = ConfigLoader.validate(config);
    expect(result.clouds.minOpacity).toBe(0.7);
    expect(result.clouds.maxOpacity).toBeUndefined();
  });
});

describe('ConfigLoader.load', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns defaults when fetch throws (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const config = await ConfigLoader.load('config.json');
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('returns defaults when response is not ok (404)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }));
    const config = await ConfigLoader.load('config.json');
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('returns defaults when JSON is malformed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    }));
    const config = await ConfigLoader.load('config.json');
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('merges valid partial config over defaults', async () => {
    const partial = { ghost: { gravity: 1100 } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(partial),
    }));
    const config = await ConfigLoader.load('config.json');
    expect(config.ghost.gravity).toBe(1100);
    expect(config.ghost.jumpVelocity).toBe(-300); // default retained
    expect(config.canvas).toEqual(DEFAULT_CONFIG.canvas);
  });

  it('replaces invalid values with defaults during load', async () => {
    const invalidConfig = { ghost: { gravity: 5000, jumpVelocity: -300 } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(invalidConfig),
    }));
    const config = await ConfigLoader.load('config.json');
    // gravity 5000 is invalid (range 800-1200), so default is used
    expect(config.ghost.gravity).toBe(980);
    // jumpVelocity -300 is valid (range -350 to -250), so it's kept
    expect(config.ghost.jumpVelocity).toBe(-300);
  });
});
