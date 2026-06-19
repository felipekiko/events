---
inclusion: always
---

# Tech Stack

## Runtime

- **Language:** Vanilla JavaScript (ES6+ classes, `const`/`let`, never `var`)
- **Rendering:** HTML5 Canvas 2D API (`getContext('2d')`)
- **Audio:** Web Audio via `new Audio()` / HTMLAudioElement
- **Persistence:** `localStorage` for high score
- **Configuration:** External `config.json` loaded via `fetch`, with hardcoded fallback defaults

## Build System

None. No bundlers, transpilers, or package managers. The game runs directly by opening `index.html` in a browser.

## Code Style Rules

- Use ES6 classes for game entities (player, obstacles, etc.)
- Prefer `const` by default; use `let` only when reassignment is needed
- No `var` declarations
- Use `requestAnimationFrame` for the game loop, with `setTimeout` fallback
- Keep all game logic in plain `.js` files — no modules/imports (script tags in HTML)
- No third-party runtime libraries — everything is vanilla JS

## Testing

- **Framework:** fast-check (property-based testing)
- **Runner:** Node.js with Jest or Vitest
- **Approach:** Property-based tests for correctness properties; unit tests for specific scenarios
- **Minimum:** 100 iterations per property-based test

## Common Commands

```bash
# Run the game locally (no build needed)
npx serve .

# Run tests
npm test
```

## Dependencies

- **Production:** Zero — vanilla JS only
- **Dev/Test:** fast-check, Jest or Vitest, jsdom (for DOM mocking)

## Browser Compatibility

- Requires HTML5 Canvas support
- Falls back gracefully if Audio API or `localStorage` is unavailable
- Uses `requestAnimationFrame` with `setTimeout` fallback
