# Game Mechanics - Flappy Kiro

## Physics Constants

- **Gravity:** 0.5 px/frame²
- **Jump velocity:** -8 px/frame (upward)
- **Terminal velocity:** 12 px/frame (max fall speed)
- **Pipe speed:** 3 px/frame (horizontal, moving left)
- **Frame rate target:** 60 FPS

## Movement Algorithms

### Bird (Kiro) Movement

```
each frame:
  velocity += gravity
  velocity = min(velocity, terminal_velocity)
  bird.y += velocity

on jump:
  velocity = jump_velocity
```

### Pipe Movement

```
each frame:
  pipe.x -= pipe_speed

  if pipe.x + pipe_width < 0:
    remove pipe from active list

pipe spawning:
  interval: every 90 frames
  gap_height: 120 px
  gap_y: random between 80 and (canvas_height - 80 - gap_height)
```

## Collision Detection

### AABB (Axis-Aligned Bounding Box)

Use rectangle overlap for all collision checks:

```
collides(a, b):
  return a.x < b.x + b.width
     AND a.x + a.width > b.x
     AND a.y < b.y + b.height
     AND a.y + a.height > b.y
```

### Collision Cases

1. **Bird vs pipe top:** bird rect against upper pipe rect
2. **Bird vs pipe bottom:** bird rect against lower pipe rect
3. **Bird vs ground:** bird.y + bird.height >= canvas_height
4. **Bird vs ceiling:** bird.y <= 0

### Hitbox Shrink

Apply a 2px inset on the bird hitbox for forgiving collisions:

```
bird_hitbox:
  x: bird.x + 2
  y: bird.y + 2
  width: bird.width - 4
  height: bird.height - 4
```

## Scoring

- +1 point when bird.x passes pipe.x + pipe_width (once per pipe pair)
- Track scored pipes to avoid double-counting
