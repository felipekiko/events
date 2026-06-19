---
inclusion: always
---

# Game Coding Standards

## Class Naming Conventions

- **Game entities:** PascalCase noun describing the game object — `Ghost`, `PipePair`, `Cloud`
- **Managers:** PascalCase noun + `Manager` suffix — `PipeManager`, `ScoreManager`, `AudioManager`
- **Detectors/Handlers:** PascalCase noun + role suffix — `CollisionDetector`, `InputHandler`
- **Renderers:** PascalCase noun + `Renderer` suffix — `BackgroundRenderer`, `UIRenderer`
- **Engine:** Single orchestrator class named `GameEngine`
- **Loaders:** PascalCase noun + `Loader` suffix — `ConfigLoader`

## JavaScript Game Patterns

### Class Structure

Each class should follow this order:

1. `constructor()` — initialize properties, accept dependencies
2. Public state properties (position, velocity, dimensions)
3. Core logic methods (`update(deltaTime)`, `render(ctx)`)
4. Query methods (`getBoundingBox()`, `getTrailingEdgeX()`)
5. Lifecycle methods (`reset()`, `enable()`, `disable()`)
6. Static/utility methods

### Method Naming

- `update(deltaTime)` — advance state by one frame
- `render(ctx)` — draw current state to canvas context
- `reset()` — restore to initial state
- `get*()` — pure queries with no side effects (e.g., `getBoundingBox()`)
- `check*()` — boolean checks (e.g., `checkCollision()`)
- `apply*()` — mutate internal state (e.g., `applyGravity(deltaTime)`)
- `on*()` — register event callbacks (e.g., `onJump(callback)`)
- `play*()` — trigger audio playback (e.g., `playJump()`)

### Constructor Patterns

```javascript
class Ghost {
  constructor(spriteImage, playArea) {
    // Store dependencies
    this.sprite = spriteImage;
    this.playArea = playArea;

    // Initialize state
    this.x = 0;
    this.y = 0;
    this.velocityY = 0;
    this.rotation = 0;

    // Derived constants from config
    this.width = spriteImage.width;
    this.height = spriteImage.height;
  }
}
```

- Accept dependencies as constructor parameters (canvas, config, sprites)
- Initialize all instance properties in the constructor — no lazy property creation
- Use descriptive parameter names that indicate what is expected

### State Machine Pattern

```javascript
transition(newState) {
  this.state.current = newState;
  // Handle entry actions for the new state
}
```

- State values are string literals: `'start'`, `'active'`, `'gameOver'`
- Centralize transitions in a single method
- Guard input handling with state checks before processing

### Delta-Time Physics Pattern

```javascript
applyGravity(deltaTime) {
  this.velocityY += CONFIG.ghost.gravity * deltaTime;
  this.velocityY = Math.min(this.velocityY, CONFIG.ghost.maxFallSpeed);
}

updatePosition(deltaTime) {
  this.y += this.velocityY * deltaTime;
}
```

- Always multiply velocity/acceleration by `deltaTime`
- Apply velocity caps after accumulation, before position update
- Keep physics methods small and composable

## Performance Optimization Guidelines

### Canvas Rendering

- Clear only the full canvas once per frame with `clearRect(0, 0, width, height)` — avoid partial clears
- Batch similar draw operations together (all pipes, then all UI)
- Use integer pixel values for positions to avoid sub-pixel anti-aliasing blur: `Math.round(x)`
- Minimize `ctx.save()`/`ctx.restore()` calls — only use when applying transforms (rotation, scale)
- Set `ctx.fillStyle` and `ctx.strokeStyle` once before a batch, not per-object

### Object Pooling and Allocation

- Reuse pipe/cloud objects when possible rather than creating new ones each frame
- Remove offscreen objects promptly — check `x + width <= 0` and splice from arrays
- Avoid allocating new objects inside the game loop (no `{}` or `[]` literals in `update()`/`render()`)
- Pre-allocate arrays at known sizes where applicable

### Game Loop

- Use `requestAnimationFrame` — never `setInterval` for the primary loop
- Clamp `deltaTime` to a maximum of 250ms to prevent physics explosions on tab resume
- Avoid DOM reads/writes inside the game loop — canvas API only
- Do not query `getBoundingClientRect()` or similar layout APIs per frame

### Image and Audio Assets

- Pre-load all `Image` objects before starting the game loop (use `onload` promises)
- Create `Audio` objects once and reuse them — reset `currentTime = 0` before replay
- Use `cloneNode()` for overlapping sound effects rather than new `Audio()` instances

### Memory and GC Pressure

- Prefer mutating existing objects over creating new ones in hot paths
- Cache computed values that don't change per frame (sprite dimensions, play area bounds)
- Use simple arrays over Maps/Sets for small collections in performance-critical code
- Avoid string concatenation in render loops — pre-compute UI strings when score changes
