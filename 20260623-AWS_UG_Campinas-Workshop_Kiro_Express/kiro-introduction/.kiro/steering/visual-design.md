# Visual Design Standards

## Sprite Rendering

- Pre-load all sprites via `new Image()` with `onload` promises before starting the game loop
- Provide geometric fallbacks (colored rectangles/circles) if any sprite fails to load
- Use `ctx.drawImage(sprite, x, y, width, height)` for consistent sizing regardless of source dimensions
- Round positions to integers (`Math.round()`) to avoid sub-pixel blurring
- Maintain original aspect ratio when scaling sprites — derive height from width or vice versa

## Animation Systems

### Sprite Rotation

```javascript
ctx.save();
ctx.translate(centerX, centerY);
ctx.rotate(angleInRadians);
ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
ctx.restore();
```

- Map velocity to rotation angle for tilt effects (nose-up on jump, nose-down on fall)
- Clamp rotation between min/max angles to prevent unnatural flipping
- Interpolate rotation smoothly using delta-time, not snapping

### Frame-Based Animation

- Store frames as an array of sub-regions or separate images
- Advance frame index using an accumulator: `elapsed += deltaTime; if (elapsed >= frameDuration) nextFrame()`
- Reset accumulator on frame advance, not on every tick
- Pause animation when game state is not `'active'`

### Floating/Idle Animation

- Use sine wave for idle bob: `offsetY = amplitude * Math.sin(time * frequency)`
- Apply only during `'start'` state; disable during active gameplay

## Particle Effects

### Design Principles

- Particles are cosmetic — never affect gameplay or collision
- Use object pooling: pre-allocate a fixed-size array and recycle dead particles
- Each particle stores: `x, y, vx, vy, life, maxLife, size, color, alpha`

### Lifecycle

```javascript
update(deltaTime) {
  this.x += this.vx * deltaTime;
  this.y += this.vy * deltaTime;
  this.life -= deltaTime;
  this.alpha = Math.max(0, this.life / this.maxLife);
}
```

- Spawn burst on events (jump, collision, score) with randomized velocity spread
- Remove/recycle when `life <= 0`
- Cap active particles (e.g., 50 max) to prevent GC pressure

### Rendering

- Draw particles after game objects, before UI overlay
- Use `ctx.globalAlpha` for fade-out, restore after batch
- Simple shapes only (`fillRect` or `arc`) — no sprite particles in this project
- Batch all particle draws together to minimize state changes

## Render Order

1. Background (solid color or gradient)
2. Scrolling scenery (clouds, ground)
3. Obstacles (pipes)
4. Particles (behind player)
5. Player sprite (ghost)
6. Particles (in front of player, e.g., score pop)
7. UI overlay (score, messages, buttons)
