# Flappy Kiro Domain Patterns

## Game State Management

### State Machine

States: `'start'` → `'active'` → `'gameOver'` → `'start'`

```javascript
transition(newState) {
  this.state = newState;
  this.stateTimestamp = performance.now();
}
```

### State Behaviors

| State      | Input Accepted | Physics Active | Pipes Moving | Score Counting |
|------------|---------------|----------------|--------------|----------------|
| start      | jump to begin | no             | no           | no             |
| active     | jump          | yes            | yes          | yes            |
| gameOver   | restart*      | gravity only   | no           | no             |

*Restart requires cooldown of 500ms after entering `gameOver`.

### State Entry Actions

- **start:** reset ghost position to center-left, reset velocity, clear pipes, show "tap to start"
- **active:** apply first jump immediately so the ghost doesn't drop on start
- **gameOver:** play game-over sound, save high score, show final score and restart prompt

## Score Persistence

### Scoring Logic

```javascript
if (!pipe.scored && ghost.x > pipe.x + pipe.width) {
  pipe.scored = true;
  this.score++;
}
```

- Flag each pipe pair with `scored: false` on creation
- Increment exactly once per pipe when ghost trailing edge passes pipe trailing edge
- Never decrement score

### High Score Storage

```javascript
loadHighScore() {
  try {
    return parseInt(localStorage.getItem('flappyKiro_highScore'), 10) || 0;
  } catch { return 0; }
}

saveHighScore(score) {
  try {
    const current = this.loadHighScore();
    if (score > current) localStorage.setItem('flappyKiro_highScore', String(score));
  } catch {}
}
```

- Key: `'flappyKiro_highScore'`
- Monotonically increasing — only write if new score exceeds stored value
- Wrap all `localStorage` access in try/catch (private browsing may throw)
- Save on game over, not every frame

## Difficulty Progression

### Progressive Parameters

Difficulty scales with score thresholds, not time:

| Score Range | Pipe Speed (px/s) | Gap Height (px) | Spawn Interval (frames) |
|-------------|-------------------|-----------------|------------------------|
| 0–4         | 180               | 140             | 100                    |
| 5–14        | 210               | 125             | 90                     |
| 15–29       | 240               | 115             | 80                     |
| 30+         | 270               | 105             | 70                     |

### Implementation Pattern

```javascript
getDifficultyTier() {
  if (this.score >= 30) return 3;
  if (this.score >= 15) return 2;
  if (this.score >= 5) return 1;
  return 0;
}
```

- Store tier configs in `config.json` under a `difficulty` array
- Apply new tier values immediately when threshold is crossed
- Never decrease difficulty mid-run (if score somehow decreases, keep current tier)
- Pipes already spawned retain their original speed — only new pipes use updated values

### Constraints

- Minimum gap height must always accommodate ghost height + 20px margin
- Maximum pipe speed must not exceed a value where reaction becomes impossible (~300 px/s)
- All progression values are externalizable via `config.json`
