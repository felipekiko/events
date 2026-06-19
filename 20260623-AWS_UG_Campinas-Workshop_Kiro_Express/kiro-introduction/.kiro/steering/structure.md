# Project Structure

```text
kiro-introduction/
├── index.html              # Entry point — canvas element, loads game.js
├── config.json             # External tunable game parameters (fetched at startup)
├── game.js                 # Main game module — all game logic in one file
├── assets/
│   ├── ghosty.png          # Ghost sprite
│   ├── jump.wav            # Jump sound effect
│   └── game_over.wav       # Game over sound effect
├── img/
│   └── example-ui.png      # Reference screenshot of expected UI
├── .gitignore
├── LICENCE.md
├── README.md
└── .kiro/
    ├── steering/           # AI assistant guidance files
    └── specs/
        └── flappy-ghosty/  # Feature spec (requirements, design, tasks)
```

## Key Conventions

- **Single JS file:** All game logic lives in `game.js` — no splitting into multiple modules
- **No src/ or dist/:** Files sit at the project root since there's no build step
- **Assets folder:** Only binary resources (images, audio) go in `assets/`
- **Config at root:** `config.json` is a peer to `index.html` so relative fetch works directly
- **Specs in .kiro:** Design documents and task lists live under `.kiro/specs/{feature-name}/`
- **Steering in .kiro:** Project rules and AI guidance live under `.kiro/steering/`
