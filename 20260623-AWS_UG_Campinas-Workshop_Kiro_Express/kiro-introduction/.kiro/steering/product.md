# Product Summary

Flappy Ghosty is a client-side infinite runner browser game inspired by Flappy Bird. The player controls a ghost sprite that must navigate through scrolling pipe obstacles by jumping (keyboard, mouse, or touch input).

## Core Gameplay

- Ghost falls under gravity; player taps/clicks/presses space to jump
- Pipes scroll horizontally from right to left with randomized gaps
- Score increments each time the ghost passes a pipe pair
- High score persists across sessions via localStorage
- Game states: Start → Active → Game Over (with restart after cooldown)

## Key Characteristics

- Runs entirely in the browser — no server, no backend, no network dependencies at runtime
- Zero build step — open `index.html` and play
- All game parameters externalized to `config.json` for easy tuning
- Graceful degradation: game works even if config, audio, or sprites fail to load
- Created as part of a Kiro IDE workshop (AWS User Group Campinas)
