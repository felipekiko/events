// Flappy Ghosty - Main Game Module
// This file will contain all game logic.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

if (!ctx) {
  document.body.innerHTML = '<p style="color: white; text-align: center; margin-top: 2rem;">Your browser does not support HTML5 Canvas.</p>';
}

// ─── Default Configuration ───────────────────────────────────────────────────
// Hardcoded defaults — used as fallback if config.json cannot be loaded
const DEFAULT_CONFIG = {
  canvas: { width: 400, height: 600 },
  scoreBar: { height: 40 },
  ghost: {
    startXFraction: 0.25,
    gravity: 980,
    maxFallSpeed: 500,
    jumpVelocity: -300,
    maxRotationUp: -30,
    maxRotationDown: 30,
  },
  pipes: {
    width: 50,
    capWidth: 60,
    capHeight: 20,
    horizontalSpacing: 220,
    speed: 150,
    minPipeLength: 50,
    gapMultiplierMin: 3,
    gapMultiplierMax: 4,
  },
  clouds: {
    count: 5,
    minSpeedFraction: 0.10,
    maxSpeedFraction: 0.50,
    minOpacity: 0.3,
    maxOpacity: 0.7,
  },
  timing: {
    maxDeltaTime: 0.25,
    gameOverCooldown: 500,
  },
};

// ─── ConfigLoader ────────────────────────────────────────────────────────────
// Responsible for fetching, validating, and merging external configuration.
class ConfigLoader {
  /**
   * Fetch and parse config.json from the given URL.
   * On any failure (network, 404, malformed JSON), returns DEFAULT_CONFIG.
   */
  static async load(url = 'config.json') {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      const validated = ConfigLoader.validate(json);
      const config = ConfigLoader.merge(validated, DEFAULT_CONFIG);
      console.log('Game config loaded from config.json');
      return config;
    } catch (error) {
      console.warn('Failed to load config.json, using defaults:', error.message);
      return ConfigLoader.merge({}, DEFAULT_CONFIG);
    }
  }

  /**
   * Validate loaded JSON fields against acceptable ranges.
   * Invalid fields are removed so that merge will fill them with defaults.
   * Returns a new object with only valid fields preserved.
   */
  static validate(json) {
    if (json === null || typeof json !== 'object' || Array.isArray(json)) {
      return {};
    }

    const result = {};

    // Canvas validation
    if (json.canvas && typeof json.canvas === 'object') {
      result.canvas = {};
      if (Number.isInteger(json.canvas.width) && json.canvas.width > 0) {
        result.canvas.width = json.canvas.width;
      }
      if (Number.isInteger(json.canvas.height) && json.canvas.height > 0) {
        result.canvas.height = json.canvas.height;
      }
    }

    // ScoreBar validation
    if (json.scoreBar && typeof json.scoreBar === 'object') {
      result.scoreBar = {};
      if (Number.isInteger(json.scoreBar.height) && json.scoreBar.height >= 30 && json.scoreBar.height <= 50) {
        result.scoreBar.height = json.scoreBar.height;
      }
    }

    // Ghost validation
    if (json.ghost && typeof json.ghost === 'object') {
      result.ghost = {};
      const g = json.ghost;
      if (typeof g.startXFraction === 'number' && g.startXFraction >= 0.0 && g.startXFraction <= 1.0) {
        result.ghost.startXFraction = g.startXFraction;
      }
      if (typeof g.gravity === 'number' && g.gravity >= 800 && g.gravity <= 1200) {
        result.ghost.gravity = g.gravity;
      }
      if (typeof g.maxFallSpeed === 'number' && g.maxFallSpeed >= 400 && g.maxFallSpeed <= 600) {
        result.ghost.maxFallSpeed = g.maxFallSpeed;
      }
      if (typeof g.jumpVelocity === 'number' && g.jumpVelocity >= -350 && g.jumpVelocity <= -250) {
        result.ghost.jumpVelocity = g.jumpVelocity;
      }
      if (typeof g.maxRotationUp === 'number' && g.maxRotationUp >= -45 && g.maxRotationUp <= 0) {
        result.ghost.maxRotationUp = g.maxRotationUp;
      }
      if (typeof g.maxRotationDown === 'number' && g.maxRotationDown >= 0 && g.maxRotationDown <= 45) {
        result.ghost.maxRotationDown = g.maxRotationDown;
      }
    }

    // Pipes validation
    if (json.pipes && typeof json.pipes === 'object') {
      result.pipes = {};
      const p = json.pipes;
      if (Number.isInteger(p.width) && p.width >= 40 && p.width <= 60) {
        result.pipes.width = p.width;
      }
      // capWidth must be > pipes.width — use loaded width if valid, else default
      const effectivePipeWidth = result.pipes.width !== undefined ? result.pipes.width : DEFAULT_CONFIG.pipes.width;
      if (Number.isInteger(p.capWidth) && p.capWidth > effectivePipeWidth) {
        result.pipes.capWidth = p.capWidth;
      }
      if (Number.isInteger(p.capHeight) && p.capHeight > 0) {
        result.pipes.capHeight = p.capHeight;
      }
      if (Number.isInteger(p.horizontalSpacing) && p.horizontalSpacing >= 200 && p.horizontalSpacing <= 250) {
        result.pipes.horizontalSpacing = p.horizontalSpacing;
      }
      if (typeof p.speed === 'number' && p.speed >= 100 && p.speed <= 200) {
        result.pipes.speed = p.speed;
      }
      if (Number.isInteger(p.minPipeLength) && p.minPipeLength > 0) {
        result.pipes.minPipeLength = p.minPipeLength;
      }
      if (typeof p.gapMultiplierMin === 'number' && p.gapMultiplierMin >= 2) {
        result.pipes.gapMultiplierMin = p.gapMultiplierMin;
      }
      // gapMultiplierMax must be > gapMultiplierMin
      const effectiveGapMin = result.pipes.gapMultiplierMin !== undefined ? result.pipes.gapMultiplierMin : DEFAULT_CONFIG.pipes.gapMultiplierMin;
      if (typeof p.gapMultiplierMax === 'number' && p.gapMultiplierMax > effectiveGapMin) {
        result.pipes.gapMultiplierMax = p.gapMultiplierMax;
      }
    }

    // Clouds validation
    if (json.clouds && typeof json.clouds === 'object') {
      result.clouds = {};
      const c = json.clouds;
      if (Number.isInteger(c.count) && c.count >= 3) {
        result.clouds.count = c.count;
      }
      if (typeof c.minSpeedFraction === 'number' && c.minSpeedFraction >= 0.0 && c.minSpeedFraction <= 1.0) {
        result.clouds.minSpeedFraction = c.minSpeedFraction;
      }
      // maxSpeedFraction must be > minSpeedFraction and <= 1.0
      const effectiveMinSpeed = result.clouds.minSpeedFraction !== undefined ? result.clouds.minSpeedFraction : DEFAULT_CONFIG.clouds.minSpeedFraction;
      if (typeof c.maxSpeedFraction === 'number' && c.maxSpeedFraction > effectiveMinSpeed && c.maxSpeedFraction <= 1.0) {
        result.clouds.maxSpeedFraction = c.maxSpeedFraction;
      }
      if (typeof c.minOpacity === 'number' && c.minOpacity >= 0.0 && c.minOpacity <= 1.0) {
        result.clouds.minOpacity = c.minOpacity;
      }
      // maxOpacity must be > minOpacity and <= 1.0
      const effectiveMinOpacity = result.clouds.minOpacity !== undefined ? result.clouds.minOpacity : DEFAULT_CONFIG.clouds.minOpacity;
      if (typeof c.maxOpacity === 'number' && c.maxOpacity > effectiveMinOpacity && c.maxOpacity <= 1.0) {
        result.clouds.maxOpacity = c.maxOpacity;
      }
    }

    // Timing validation
    if (json.timing && typeof json.timing === 'object') {
      result.timing = {};
      const t = json.timing;
      if (typeof t.maxDeltaTime === 'number' && t.maxDeltaTime > 0) {
        result.timing.maxDeltaTime = t.maxDeltaTime;
      }
      if (Number.isInteger(t.gameOverCooldown) && t.gameOverCooldown > 0) {
        result.timing.gameOverCooldown = t.gameOverCooldown;
      }
    }

    return result;
  }

  /**
   * Deep merge loaded config values over defaults.
   * For each section, merges field-by-field so partial configs work correctly.
   * Only the provided fields override their defaults; missing fields retain defaults.
   */
  static merge(loaded, defaults) {
    const result = {};
    for (const key of Object.keys(defaults)) {
      if (
        typeof defaults[key] === 'object' &&
        defaults[key] !== null &&
        !Array.isArray(defaults[key])
      ) {
        // Deep merge nested objects
        const loadedSection = (loaded && typeof loaded[key] === 'object' && !Array.isArray(loaded[key]))
          ? loaded[key]
          : {};
        result[key] = { ...defaults[key], ...loadedSection };
      } else {
        // Primitive value — use loaded if present, else default
        result[key] = (loaded && loaded[key] !== undefined) ? loaded[key] : defaults[key];
      }
    }
    return result;
  }
}


// ─── Ghost ────────────────────────────────────────────────────────────────────
// Manages the player character's position, velocity, and visual rotation.
class Ghost {
  /**
   * @param {Object} spriteImage - Image object with width/height properties
   * @param {Object} playArea - { x, y, width, height } defining the play region
   * @param {Object} config - Full game config object (uses config.ghost section)
   */
  constructor(spriteImage, playArea, config) {
    this.sprite = spriteImage;
    this.config = config;

    // Sprite dimensions — use image dimensions if available, else fallback
    this.width = (spriteImage && spriteImage.width > 0) ? spriteImage.width : 34;
    this.height = (spriteImage && spriteImage.height > 0) ? spriteImage.height : 24;

    // Position and physics state
    this.x = 0;
    this.y = 0;
    this.velocityY = 0;
    this.rotation = 0;

    // Set initial position
    this.reset(playArea);
  }

  /**
   * Apply gravitational acceleration to vertical velocity.
   * Velocity is capped at maxFallSpeed to prevent uncontrollable falling.
   * @param {number} deltaTime - Time elapsed in seconds
   */
  applyGravity(deltaTime) {
    const { gravity, maxFallSpeed } = this.config.ghost;
    this.velocityY += gravity * deltaTime;
    this.velocityY = Math.min(this.velocityY, maxFallSpeed);
  }

  /**
   * Set velocity to the configured upward impulse value.
   * Overrides current velocity regardless of its magnitude.
   */
  jump() {
    this.velocityY = this.config.ghost.jumpVelocity;
  }

  /**
   * Update vertical position based on current velocity.
   * @param {number} deltaTime - Time elapsed in seconds
   */
  updatePosition(deltaTime) {
    this.y += this.velocityY * deltaTime;
  }

  /**
   * Linearly interpolate rotation based on current velocity.
   * Maps velocity from [jumpVelocity, maxFallSpeed] to [maxRotationUp, maxRotationDown] degrees,
   * then converts to radians for rendering.
   */
  updateRotation() {
    const { jumpVelocity, maxFallSpeed, maxRotationUp, maxRotationDown } = this.config.ghost;

    // Clamp velocity to the interpolation range
    const clampedVelocity = Math.max(jumpVelocity, Math.min(this.velocityY, maxFallSpeed));

    // Linear interpolation: map [jumpVelocity, maxFallSpeed] → [maxRotationUp, maxRotationDown]
    const t = (clampedVelocity - jumpVelocity) / (maxFallSpeed - jumpVelocity);
    const rotationDegrees = maxRotationUp + t * (maxRotationDown - maxRotationUp);

    // Convert degrees to radians
    this.rotation = rotationDegrees * (Math.PI / 180);
  }

  /**
   * Return the axis-aligned bounding box for collision detection.
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  getBoundingBox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  /**
   * Reposition ghost to its starting location within the play area.
   * Resets velocity and rotation to zero.
   * @param {Object} playArea - { x, y, width, height } defining the play region
   */
  reset(playArea) {
    this.x = playArea.width * this.config.ghost.startXFraction;
    this.y = playArea.height / 2 - this.height / 2;
    this.velocityY = 0;
    this.rotation = 0;
  }
}


// ─── InputHandler ────────────────────────────────────────────────────────────
// Captures and normalizes player input events, filtering held-key repeats.
class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.jumpCallback = null;
    this.enabled = false;

    // Bind handlers so we can add/remove the same references
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleTouchStart = this._handleTouchStart.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  /**
   * Register the callback to invoke on a valid jump input.
   */
  onJump(callback) {
    this.jumpCallback = callback;
  }

  /**
   * Start listening for input events.
   * Guards against duplicate listeners from multiple enable() calls.
   */
  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.canvas.addEventListener('mousedown', this._handleMouseDown);
    this.canvas.addEventListener('touchstart', this._handleTouchStart, { passive: false });
    document.addEventListener('keydown', this._handleKeyDown);
  }

  /**
   * Stop listening for input events.
   */
  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.canvas.removeEventListener('mousedown', this._handleMouseDown);
    this.canvas.removeEventListener('touchstart', this._handleTouchStart);
    document.removeEventListener('keydown', this._handleKeyDown);
  }

  _handleMouseDown() {
    if (this.jumpCallback) {
      this.jumpCallback();
    }
  }

  _handleTouchStart(event) {
    event.preventDefault(); // Prevent scroll/zoom on touch
    if (this.jumpCallback) {
      this.jumpCallback();
    }
  }

  _handleKeyDown(event) {
    // Only spacebar, and only non-repeat events
    if (event.key === ' ' && !event.repeat) {
      event.preventDefault(); // Prevent page scroll on space
      if (this.jumpCallback) {
        this.jumpCallback();
      }
    }
  }
}


// ─── PipePair ─────────────────────────────────────────────────────────────────
// Represents a single pair of pipes (top and bottom) with a navigable gap.
class PipePair {
  /**
   * @param {number} x - Left edge horizontal position of the pipe body
   * @param {number} gapCenterY - Vertical center of the gap
   * @param {number} gapHeight - Total height of the gap between pipes
   * @param {number} pipeWidth - Width of the pipe body
   * @param {number} capWidth - Width of the pipe cap (wider than body)
   * @param {number} capHeight - Height of the pipe cap
   * @param {Object} playArea - { x, y, width, height } defining the play region
   */
  constructor(x, gapCenterY, gapHeight, pipeWidth, capWidth, capHeight, playArea) {
    this.x = x;
    this.gapCenterY = gapCenterY;
    this.gapHeight = gapHeight;
    this.pipeWidth = pipeWidth;
    this.capWidth = capWidth;
    this.capHeight = capHeight;
    this.playArea = playArea;

    // Derived pipe geometry
    this.topPipeHeight = gapCenterY - gapHeight / 2;
    this.bottomPipeY = gapCenterY + gapHeight / 2;

    // Scoring flag — prevents double-counting
    this.scored = false;
  }

  /**
   * Return the bounding box for the top pipe, using capWidth for conservative
   * collision detection (caps extend wider than the pipe body).
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  getTopBoundingBox() {
    const capOffsetX = (this.capWidth - this.pipeWidth) / 2;
    return {
      x: this.x - capOffsetX,
      y: 0,
      width: this.capWidth,
      height: this.topPipeHeight,
    };
  }

  /**
   * Return the bounding box for the bottom pipe, using capWidth for conservative
   * collision detection (caps extend wider than the pipe body).
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  getBottomBoundingBox() {
    const capOffsetX = (this.capWidth - this.pipeWidth) / 2;
    return {
      x: this.x - capOffsetX,
      y: this.bottomPipeY,
      width: this.capWidth,
      height: this.playArea.height - this.bottomPipeY,
    };
  }

  /**
   * Return the right edge X of the pipe body, used for scoring checks.
   * @returns {number}
   */
  getTrailingEdgeX() {
    return this.x + this.pipeWidth;
  }
}


// ─── PipeManager ──────────────────────────────────────────────────────────────
// Handles generation, movement, and cleanup of pipe pairs.
class PipeManager {
  /**
   * @param {Object} playArea - { x, y, width, height } defining the play region
   * @param {Object} config - Full game config object (uses config.pipes section)
   * @param {number} ghostHeight - Height of the ghost sprite in pixels
   */
  constructor(playArea, config, ghostHeight) {
    this.playArea = playArea;
    this.config = config;
    this.ghostHeight = ghostHeight;

    // Calculate gap height once per game session (consistent across all PipePairs)
    const { gapMultiplierMin, gapMultiplierMax } = config.pipes;
    this.gapHeight = ghostHeight * (gapMultiplierMin + Math.random() * (gapMultiplierMax - gapMultiplierMin));

    // Active pipe pairs
    this.pipes = [];
  }

  /**
   * Move all pipes left, generate new pipes when needed, and remove offscreen pipes.
   * @param {number} deltaTime - Time elapsed in seconds
   */
  update(deltaTime) {
    const { speed, horizontalSpacing } = this.config.pipes;

    // Move all pipes left
    for (const pipe of this.pipes) {
      pipe.x -= speed * deltaTime;
    }

    // Remove offscreen pipes (pipe entirely past the left edge)
    this.pipes = this.pipes.filter(pipe => {
      const capOffsetX = (pipe.capWidth - pipe.pipeWidth) / 2;
      return (pipe.x + pipe.pipeWidth + capOffsetX) > 0;
    });

    // Generate new pipe if needed
    const shouldGenerate = this.pipes.length === 0 ||
      (this.playArea.width - this.pipes[this.pipes.length - 1].x >= horizontalSpacing);

    if (shouldGenerate) {
      this._generatePipe();
    }
  }

  /**
   * Clear all pipes (used on game reset).
   */
  reset() {
    this.pipes = [];
  }

  /**
   * Return array of all pipe bounding boxes for collision detection.
   * @returns {Array<{ x: number, y: number, width: number, height: number }>}
   */
  getCollidables() {
    const boxes = [];
    for (const pipe of this.pipes) {
      boxes.push(pipe.getTopBoundingBox());
      boxes.push(pipe.getBottomBoundingBox());
    }
    return boxes;
  }

  /**
   * Generate a new pipe pair at the right edge of the play area.
   * Randomizes gap center Y ensuring minimum visible pipe length top and bottom.
   * @private
   */
  _generatePipe() {
    const { width: pipeWidth, capWidth, capHeight, minPipeLength } = this.config.pipes;

    // Calculate valid range for gap center Y
    const minGapCenterY = this.gapHeight / 2 + minPipeLength;
    const maxGapCenterY = this.playArea.height - this.gapHeight / 2 - minPipeLength;

    // Randomize gap center within valid range
    const gapCenterY = minGapCenterY + Math.random() * (maxGapCenterY - minGapCenterY);

    // Create new pipe pair at right edge of play area
    const pipe = new PipePair(
      this.playArea.width,
      gapCenterY,
      this.gapHeight,
      pipeWidth,
      capWidth,
      capHeight,
      this.playArea
    );

    this.pipes.push(pipe);
  }
}


// ─── CollisionDetector ────────────────────────────────────────────────────────
// Performs axis-aligned bounding box (AABB) overlap detection and boundary checks.
class CollisionDetector {
  /**
   * Check if the ghost collides with any boundary or pipe.
   * @param {{ x: number, y: number, width: number, height: number }} ghostBox - Ghost bounding box
   * @param {Array<{ x: number, y: number, width: number, height: number }>} pipeBoxes - Array of pipe bounding boxes
   * @param {{ x: number, y: number, width: number, height: number }} playArea - Play area dimensions
   * @returns {boolean} true if collision detected
   */
  checkCollision(ghostBox, pipeBoxes, playArea) {
    // Check top boundary
    if (ghostBox.y <= 0) {
      return true;
    }

    // Check bottom boundary
    if (ghostBox.y + ghostBox.height >= playArea.height) {
      return true;
    }

    // Check pipe collisions
    for (const pipeBox of pipeBoxes) {
      if (CollisionDetector.aabbOverlap(ghostBox, pipeBox)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Standard AABB overlap test between two axis-aligned bounding boxes.
   * Returns true if and only if the two boxes overlap.
   * @param {{ x: number, y: number, width: number, height: number }} boxA
   * @param {{ x: number, y: number, width: number, height: number }} boxB
   * @returns {boolean}
   */
  static aabbOverlap(boxA, boxB) {
    return (
      boxA.x < boxB.x + boxB.width &&
      boxA.x + boxA.width > boxB.x &&
      boxA.y < boxB.y + boxB.height &&
      boxA.y + boxA.height > boxB.y
    );
  }
}


// ─── ScoreManager ─────────────────────────────────────────────────────────────
// Tracks current score, high score, and handles localStorage persistence.
class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = this.loadHighScore();
  }

  /**
   * Increase score by 1. If the new score exceeds the high score,
   * update the high score and persist it to localStorage.
   */
  increment() {
    this.score++;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.persist();
    }
  }

  /**
   * Reset the current score to 0 while retaining the high score.
   */
  reset() {
    this.score = 0;
  }

  /**
   * Save the current high score to localStorage.
   * Wrapped in try/catch for graceful degradation in private browsing
   * or when localStorage is unavailable/quota exceeded.
   */
  persist() {
    try {
      localStorage.setItem('flappyGhosty_highScore', JSON.stringify(this.highScore));
    } catch (e) {
      // Silent failure — localStorage may be unavailable
    }
  }

  /**
   * Read the high score from localStorage.
   * Returns 0 if the value is unavailable, invalid, or localStorage throws.
   * @returns {number}
   */
  loadHighScore() {
    try {
      return parseInt(localStorage.getItem('flappyGhosty_highScore'), 10) || 0;
    } catch (e) {
      return 0;
    }
  }
}


// ─── AudioManager ────────────────────────────────────────────────────────────

/**
 * Handles loading and playback of sound effects.
 * Audio is non-critical — all operations are wrapped in try/catch
 * so failures never crash or interrupt the game.
 */
class AudioManager {
  constructor() {
    try {
      this.jumpSound = new Audio('assets/jump.wav');
      this.gameOverSound = new Audio('assets/game_over.wav');
    } catch (e) {
      this.jumpSound = null;
      this.gameOverSound = null;
    }
  }

  /**
   * Play the jump sound effect.
   * Resets currentTime to 0 for immediate playback even if already playing.
   * Uses cloneNode() to allow overlapping sounds.
   */
  playJump() {
    try {
      if (!this.jumpSound) return;
      const sound = this.jumpSound.cloneNode();
      sound.currentTime = 0;
      const playResult = sound.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => {});
      }
    } catch (e) {
      // Audio is non-critical — fail silently
    }
  }

  /**
   * Play the game over sound effect.
   * Resets currentTime to 0 for immediate playback.
   */
  playGameOver() {
    try {
      if (!this.gameOverSound) return;
      const sound = this.gameOverSound.cloneNode();
      sound.currentTime = 0;
      const playResult = sound.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => {});
      }
    } catch (e) {
      // Audio is non-critical — fail silently
    }
  }
}


/**
 * Renders the background layer: light blue sky, pencil texture overlay,
 * and parallax-scrolling clouds with varying speeds and opacities.
 */
class BackgroundRenderer {
  /**
   * @param {{width: number, height: number}} playArea - The play area dimensions
   * @param {object} config - The full game config object (needs config.clouds and config.pipes.speed)
   */
  constructor(playArea, config) {
    this.playArea = playArea;
    this.config = config;

    const cloudsConfig = config.clouds;
    const pipeSpeed = config.pipes.speed;
    const count = Math.max(3, cloudsConfig.count);

    const minSpeed = cloudsConfig.minSpeedFraction * pipeSpeed;
    const maxSpeed = cloudsConfig.maxSpeedFraction * pipeSpeed;
    const minOpacity = cloudsConfig.minOpacity;
    const maxOpacity = cloudsConfig.maxOpacity;

    this.clouds = [];

    for (let i = 0; i < count; i++) {
      // Random speed between minSpeed and maxSpeed
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

      // Opacity proportional to speed: map [minSpeed, maxSpeed] → [minOpacity, maxOpacity]
      const speedFraction = (maxSpeed === minSpeed) ? 0.5 : (speed - minSpeed) / (maxSpeed - minSpeed);
      const opacity = minOpacity + speedFraction * (maxOpacity - minOpacity);

      // Width proportional to speed: faster clouds are larger (40-100px range)
      const width = 40 + speedFraction * 60;
      // Height: width * 0.4 to 0.6 (random elliptical shape)
      const heightRatio = 0.4 + Math.random() * 0.2;
      const height = Math.round(width * heightRatio);

      // X: random across full width + some can start offscreen to avoid clustering
      const x = Math.random() * (playArea.width + 100) - 50;
      // Y: random within top 2/3 of play area (clouds are in the sky)
      const y = Math.random() * (playArea.height * (2 / 3));

      this.clouds.push({ x, y, width: Math.round(width), height, speed, opacity });
    }
  }

  /**
   * Move clouds left. When a cloud scrolls fully offscreen to the left,
   * wrap it to the right side with a random offset.
   * @param {number} deltaTime - Time elapsed in seconds
   */
  update(deltaTime) {
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];
      cloud.x -= cloud.speed * deltaTime;

      // Wrap around when cloud moves entirely offscreen to the left
      if (cloud.x + cloud.width < 0) {
        cloud.x = this.playArea.width + Math.random() * 50;
        // Randomize Y on wrap to add visual variety
        cloud.y = Math.random() * (this.playArea.height * (2 / 3));
      }
    }
  }

  /**
   * Draw the background layers:
   * 1. Light blue sky fill
   * 2. Pencil texture overlay (subtle noise pattern)
   * 3. Clouds as white rounded ellipses
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    // 1. Light blue sky background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, this.playArea.width, this.playArea.height);

    // 2. Pencil texture overlay — subtle semi-transparent lines/dots
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;

    // Draw sparse diagonal hatching lines for pencil texture effect
    const spacing = 8;
    for (let i = -this.playArea.height; i < this.playArea.width; i += spacing) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + this.playArea.height, this.playArea.height);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Draw clouds as white rounded ellipses
    ctx.save();
    ctx.fillStyle = '#FFFFFF';

    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];
      ctx.globalAlpha = cloud.opacity;
      ctx.beginPath();
      ctx.ellipse(
        Math.round(cloud.x + cloud.width / 2),
        Math.round(cloud.y + cloud.height / 2),
        cloud.width / 2,
        cloud.height / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }
}


// ─── GameEngine ───────────────────────────────────────────────────────────────
// Main orchestrator: state machine, game loop, wiring of all components.
class GameEngine {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;

    // Play area excludes the score bar at bottom
    this.playArea = {
      x: 0,
      y: 0,
      width: config.canvas.width,
      height: config.canvas.height - config.scoreBar.height,
    };

    // State machine
    this.state = 'start';
    this.stateTimestamp = 0;

    // Game loop timing
    this.lastFrameTime = 0;
    this.animationFrameId = null;

    // Components
    this.ghost = new Ghost({ width: 34, height: 24 }, this.playArea, config);
    this.pipeManager = new PipeManager(this.playArea, config, this.ghost.height);
    this.collisionDetector = new CollisionDetector();
    this.scoreManager = new ScoreManager();
    this.audioManager = new AudioManager();
    this.backgroundRenderer = new BackgroundRenderer(this.playArea, config);
    this.inputHandler = new InputHandler(canvas);

    // Wire input
    this.inputHandler.onJump(() => this._handleInput());
    this.inputHandler.enable();
  }

  /**
   * Centralized state transition.
   */
  transition(newState) {
    this.state = newState;
    this.stateTimestamp = performance.now();
  }

  /**
   * Start the game loop.
   */
  start() {
    this.lastFrameTime = performance.now();
    this._loop();
  }

  /**
   * Main game loop using requestAnimationFrame.
   */
  _loop() {
    const now = performance.now();
    const rawDelta = (now - this.lastFrameTime) / 1000;
    const deltaTime = GameEngine.clampDeltaTime(rawDelta, this.config.timing.maxDeltaTime);
    this.lastFrameTime = now;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(() => this._loop());
  }

  /**
   * Clamp delta time to prevent physics explosions on tab resume.
   * @param {number} rawDelta - Raw delta time in seconds
   * @param {number} maxDelta - Maximum allowed delta time
   * @returns {number}
   */
  static clampDeltaTime(rawDelta, maxDelta) {
    return Math.min(rawDelta, maxDelta);
  }

  /**
   * Update game state based on current state.
   * @param {number} deltaTime - Clamped time in seconds
   */
  update(deltaTime) {
    if (this.state === 'active') {
      // Ghost physics
      this.ghost.applyGravity(deltaTime);
      this.ghost.updatePosition(deltaTime);
      this.ghost.updateRotation();

      // Pipes
      this.pipeManager.update(deltaTime);

      // Background parallax
      this.backgroundRenderer.update(deltaTime);

      // Scoring
      for (const pipe of this.pipeManager.pipes) {
        if (!pipe.scored && this.ghost.x > pipe.getTrailingEdgeX()) {
          pipe.scored = true;
          this.scoreManager.increment();
        }
      }

      // Collision detection
      const ghostBox = this.ghost.getBoundingBox();
      const pipeBoxes = this.pipeManager.getCollidables();
      if (this.collisionDetector.checkCollision(ghostBox, pipeBoxes, this.playArea)) {
        this._triggerGameOver();
      }
    } else if (this.state === 'start') {
      // Only update background in start state (no physics)
      this.backgroundRenderer.update(deltaTime);
    }
    // gameOver: no updates (frozen)
  }

  /**
   * Render all components in layered order.
   */
  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    // Clear full canvas
    ctx.clearRect(0, 0, this.config.canvas.width, this.config.canvas.height);

    // Background
    this.backgroundRenderer.render(ctx);

    // Pipes
    this._renderPipes(ctx);

    // Ghost
    this._renderGhost(ctx);

    // Score bar
    this._renderScoreBar(ctx);

    // Overlays based on state
    if (this.state === 'start') {
      this._renderStartOverlay(ctx);
    } else if (this.state === 'gameOver') {
      this._renderGameOverOverlay(ctx);
    }
  }

  /**
   * Handle player input based on current state.
   */
  _handleInput() {
    if (this.state === 'start') {
      this.transition('active');
      this.ghost.jump();
      this.audioManager.playJump();
    } else if (this.state === 'active') {
      this.ghost.jump();
      this.audioManager.playJump();
    } else if (this.state === 'gameOver') {
      // Enforce cooldown before allowing restart
      const elapsed = performance.now() - this.stateTimestamp;
      if (elapsed >= this.config.timing.gameOverCooldown) {
        this._restart();
      }
    }
  }

  /**
   * Transition to game over state.
   */
  _triggerGameOver() {
    this.transition('gameOver');
    this.audioManager.playGameOver();
    this.scoreManager.persist();
  }

  /**
   * Reset all components and transition to start.
   */
  _restart() {
    this.ghost.reset(this.playArea);
    this.pipeManager.reset();
    this.scoreManager.reset();
    this.transition('start');
  }

  // ─── Rendering helpers ───────────────────────────────────────────────

  _renderGhost(ctx) {
    const g = this.ghost;
    if (g.sprite && g.sprite.width > 0 && g.sprite.complete !== false) {
      ctx.save();
      ctx.translate(Math.round(g.x + g.width / 2), Math.round(g.y + g.height / 2));
      ctx.rotate(g.rotation);
      ctx.drawImage(g.sprite, -g.width / 2, -g.height / 2, g.width, g.height);
      ctx.restore();
    } else {
      // Fallback: white circle
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(Math.round(g.x + g.width / 2), Math.round(g.y + g.height / 2), Math.min(g.width, g.height) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _renderPipes(ctx) {
    const pipeColor = '#4CAF50';
    const capColor = '#2E7D32';

    for (const pipe of this.pipeManager.pipes) {
      const capOffsetX = (pipe.capWidth - pipe.pipeWidth) / 2;

      // Top pipe body
      ctx.fillStyle = pipeColor;
      ctx.fillRect(Math.round(pipe.x), 0, pipe.pipeWidth, pipe.topPipeHeight);
      // Top pipe cap
      ctx.fillStyle = capColor;
      ctx.fillRect(Math.round(pipe.x - capOffsetX), pipe.topPipeHeight - pipe.capHeight, pipe.capWidth, pipe.capHeight);

      // Bottom pipe body
      ctx.fillStyle = pipeColor;
      ctx.fillRect(Math.round(pipe.x), pipe.bottomPipeY, pipe.pipeWidth, this.playArea.height - pipe.bottomPipeY);
      // Bottom pipe cap
      ctx.fillStyle = capColor;
      ctx.fillRect(Math.round(pipe.x - capOffsetX), pipe.bottomPipeY, pipe.capWidth, pipe.capHeight);
    }
  }

  _renderScoreBar(ctx) {
    const barY = this.playArea.height;
    const barH = this.config.scoreBar.height;

    ctx.fillStyle = '#333333';
    ctx.fillRect(0, barY, this.config.canvas.width, barH);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px monospace';
    ctx.textBaseline = 'middle';

    const centerY = barY + barH / 2;
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.scoreManager.score}`, 10, centerY);
    ctx.textAlign = 'right';
    ctx.fillText(`High: ${this.scoreManager.highScore}`, this.config.canvas.width - 10, centerY);
  }

  _renderStartOverlay(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, this.playArea.width, this.playArea.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tap to Start', this.playArea.width / 2, this.playArea.height / 2);
  }

  _renderGameOverOverlay(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, this.playArea.width, this.playArea.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cy = this.playArea.height / 2;
    ctx.fillText('Game Over', this.playArea.width / 2, cy - 30);
    ctx.font = '16px monospace';
    ctx.fillText(`Score: ${this.scoreManager.score}  High: ${this.scoreManager.highScore}`, this.playArea.width / 2, cy + 10);
    ctx.fillText('Tap to Restart', this.playArea.width / 2, cy + 40);
  }
}


// ─── Module exports for testing (Node.js environment only) ───────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_CONFIG, ConfigLoader, Ghost, InputHandler, PipePair, PipeManager, CollisionDetector, ScoreManager, AudioManager, BackgroundRenderer, GameEngine };
}

// ─── Game Initialization ─────────────────────────────────────────────────────
// Only runs in the browser (not during tests)
if (typeof window !== 'undefined' && canvas && ctx) {
  (async function init() {
    // Load config
    const config = await ConfigLoader.load('config.json');

    // Set canvas dimensions from config
    canvas.width = config.canvas.width;
    canvas.height = config.canvas.height;

    // Load ghost sprite
    const sprite = new Image();
    sprite.src = 'assets/ghosty.png';

    sprite.onload = () => {
      const engine = new GameEngine(canvas, config);
      engine.ghost.sprite = sprite;
      // Scale sprite to a reasonable in-game size (34px wide, maintain aspect ratio)
      const targetWidth = 34;
      const aspectRatio = sprite.naturalHeight / sprite.naturalWidth;
      const targetHeight = Math.round(targetWidth * aspectRatio);
      engine.ghost.width = targetWidth;
      engine.ghost.height = targetHeight;
      engine.ghost.reset(engine.playArea);
      // Recalculate pipe gap based on actual ghost height
      engine.pipeManager.ghostHeight = targetHeight;
      const { gapMultiplierMin, gapMultiplierMax } = config.pipes;
      engine.pipeManager.gapHeight = targetHeight * (gapMultiplierMin + Math.random() * (gapMultiplierMax - gapMultiplierMin));
      engine.start();
    };

    sprite.onerror = () => {
      // Start without sprite (fallback to white circle)
      const engine = new GameEngine(canvas, config);
      engine.start();
    };
  })();
}
