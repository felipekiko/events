# Implementation Plan: Flappy Ghosty

## Overview

Implement a retro-style Flappy Bird clone using HTML5 Canvas and vanilla JavaScript. The game features a ghost sprite navigating through scrolling pipe obstacles, with externalized configuration, delta-time physics, parallax clouds, sound effects, and localStorage-based high score persistence. The implementation follows an incremental approach: project structure first, then core components, then integration and wiring.

## Tasks

- [x] 1. Set up project structure and configuration system
  - [x] 1.1 Create index.html with canvas element and game.js script tag
    - Create HTML file with a 400x600 canvas element (id="gameCanvas")
    - Include a `<script type="module">` tag loading game.js
    - Add basic CSS to center the canvas and set page background
    - _Requirements: 9.4_

  - [x] 1.2 Create config.json with default game parameters
    - Create the external configuration file at project root
    - Include all sections: canvas, scoreBar, ghost, pipes, clouds, timing
    - Use the default values specified in the design document
    - _Requirements: 10.1, 10.4_

  - [x] 1.3 Implement ConfigLoader with fetch, validation, and deep merge
    - Implement `ConfigLoader.load(url)` to fetch and parse config.json
    - Implement `ConfigLoader.validate(json)` to check value ranges and replace invalid fields with defaults
    - Implement `ConfigLoader.merge(loaded, defaults)` for deep merge of partial configs over defaults
    - Define `DEFAULT_CONFIG` constant with all hardcoded default values
    - Handle fetch failures (network error, 404, malformed JSON) by falling back to defaults
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 1.4 Write property test for config deep merge (Property 18)
    - **Property 18: Config deep merge preserves defaults for missing fields**
    - **Validates: Requirements 10.3**
    - Use fast-check to generate random partial config objects
    - Verify merged result always contains all DEFAULT_CONFIG fields
    - Verify overridden fields match loaded values, missing fields retain defaults

- [x] 2. Implement Ghost physics and input handling
  - [x] 2.1 Implement Ghost class with position, velocity, gravity, and jump
    - Create Ghost class with constructor(spriteImage, playArea, config)
    - Implement `applyGravity(deltaTime)` with configurable gravity and max fall speed cap
    - Implement `jump()` to set velocity to configured upward impulse value
    - Implement `updatePosition(deltaTime)` to update Y by velocity * deltaTime
    - Implement `updateRotation()` for linear interpolation between -30° and +30°
    - Implement `getBoundingBox()` returning {x, y, width, height}
    - Implement `reset(playArea)` to reposition ghost to start location
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.6_

  - [x] 2.2 Write property test for jump overrides velocity (Property 2)
    - **Property 2: Jump overrides velocity**
    - **Validates: Requirements 2.1, 3.3**
    - Generate random velocities in [-1000, 1000]
    - Verify jump always sets velocity to exact jump impulse value

  - [x] 2.3 Write property test for gravity with velocity cap (Property 4)
    - **Property 4: Gravity application with velocity cap**
    - **Validates: Requirements 3.1, 3.2**
    - Generate random velocities and deltaTimes [0.001, 0.25]
    - Verify velocity increases by gravity*dt but never exceeds maxFallSpeed

  - [x] 2.4 Write property test for ghost position update (Property 5)
    - **Property 5: Ghost position update**
    - **Validates: Requirements 3.4**
    - Generate random positions, velocities, and deltaTimes
    - Verify updated position equals Y + V * dt

  - [x] 2.5 Write property test for rotation interpolation (Property 16)
    - **Property 16: Ghost rotation interpolation**
    - **Validates: Requirements 8.6**
    - Generate random velocities within [jumpVelocity, maxFallSpeed]
    - Verify rotation is linearly interpolated and within [-30, +30] degrees

  - [x] 2.6 Implement InputHandler with repeat filtering
    - Create InputHandler class with constructor(canvas)
    - Listen for mousedown, touchstart, and keydown (spacebar) events
    - Filter out held-key repeats using `event.repeat` flag
    - Normalize all input types to a single jump callback
    - Implement `enable()` and `disable()` methods
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.7 Write property test for input repeat filtering (Property 3)
    - **Property 3: Input repeat filtering**
    - **Validates: Requirements 2.5**
    - Generate random event sequences with repeat flags
    - Verify only events with repeat=false trigger jump callback

- [x] 3. Implement Pipe system
  - [x] 3.1 Implement PipePair class with gap constraints and bounding boxes
    - Create PipePair class with constructor(x, gapCenterY, gapHeight, pipeWidth, capWidth, capHeight, playArea)
    - Implement `getTopBoundingBox()` and `getBottomBoundingBox()` including caps
    - Implement `getTrailingEdgeX()` for scoring checks
    - Track `scored` flag to prevent double-counting
    - _Requirements: 4.2, 4.5, 4.6_

  - [x] 3.2 Implement PipeManager with generation, movement, and cleanup
    - Create PipeManager class with constructor(playArea, config, ghostHeight)
    - Implement `update(deltaTime)` to move pipes left at configured speed * dt
    - Generate new pipe pairs when last pipe has moved horizontalSpacing pixels from right edge
    - Randomize gap center Y ensuring minimum 50px visible pipe length top and bottom
    - Set gap height between 3x and 4x ghost sprite height
    - Remove pipe pairs that move entirely offscreen to the left
    - Implement `reset()` to clear all pipes
    - Implement `getCollidables()` returning array of all pipe bounding boxes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 3.3 Write property test for pipe horizontal movement (Property 7)
    - **Property 7: Pipe horizontal movement**
    - **Validates: Requirements 4.3**
    - Generate random X positions and deltaTimes
    - Verify updated X equals X - speed * dt

  - [x] 3.4 Write property test for offscreen pipe cleanup (Property 8)
    - **Property 8: Offscreen pipe cleanup**
    - **Validates: Requirements 4.4**
    - Generate random pipe arrays with varying X positions
    - Verify pipes with right edge <= 0 are removed, others retained

  - [x] 3.5 Write property test for pipe generation constraints (Property 9)
    - **Property 9: Pipe generation constraints**
    - **Validates: Requirements 4.5, 4.6**
    - Generate random gap centers and ghost heights
    - Verify gap height is 3-4x ghost height, min 50px visible pipe length

- [x] 4. Implement CollisionDetector and ScoreManager
  - [x] 4.1 Implement CollisionDetector with AABB overlap and boundary checks
    - Create CollisionDetector class
    - Implement `checkCollision(ghostBox, pipeBoxes, playArea)` returning boolean
    - Implement static `aabbOverlap(boxA, boxB)` for standard AABB test
    - Check ghost against top boundary (y <= 0) and bottom boundary (y + height >= playArea bottom)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.2 Write property test for AABB collision (Property 12)
    - **Property 12: AABB collision correctness**
    - **Validates: Requirements 6.1, 6.5**
    - Generate random bounding box pairs
    - Verify overlap detection matches mathematical AABB formula

  - [x] 4.3 Write property test for boundary collision (Property 13)
    - **Property 13: Boundary collision detection**
    - **Validates: Requirements 6.2, 6.3**
    - Generate random ghost positions relative to play area boundaries
    - Verify collision reported iff ghost touches or crosses boundary

  - [x] 4.4 Implement ScoreManager with localStorage persistence
    - Create ScoreManager class with score and highScore properties
    - Implement `increment()` to increase score by 1 and update high score if exceeded
    - Implement `reset()` to set score to 0 while retaining high score
    - Implement `persist()` to save high score to localStorage key 'flappyGhosty_highScore'
    - Implement `loadHighScore()` to read from localStorage, defaulting to 0 if unavailable
    - Handle localStorage errors gracefully (private browsing, quota exceeded)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.5 Write property test for score increments once (Property 10)
    - **Property 10: Score increments exactly once per pipe crossing**
    - **Validates: Requirements 5.1**
    - Generate random ghost/pipe position sequences
    - Verify score increments exactly once per pipe when ghost passes trailing edge

  - [x] 4.6 Write property test for high score monotonic (Property 11)
    - **Property 11: High score monotonically tracks maximum**
    - **Validates: Requirements 5.3**
    - Generate random score increment sequences
    - Verify high score always equals maximum score achieved, never decreases

- [x] 5. Checkpoint - Ensure all core component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement AudioManager and BackgroundRenderer
  - [x] 6.1 Implement AudioManager with jump and game over sounds
    - Create AudioManager class
    - Load jump.wav and game_over.wav from assets/ directory
    - Implement `playJump()` and `playGameOver()` methods
    - Handle audio load/play failures silently (non-critical)
    - _Requirements: 2.3, 7.1_

  - [x] 6.2 Implement BackgroundRenderer with sky, texture, and parallax clouds
    - Create BackgroundRenderer class with constructor(playArea, config)
    - Generate clouds (at least 3) with varying positions, sizes, speeds, and opacities
    - Speed range: 10% to 50% of pipe speed; opacity proportional to speed
    - Slower/smaller clouds more transparent, faster/larger clouds more opaque
    - Implement `update(deltaTime)` to scroll clouds left and wrap around
    - Implement `render(ctx)` to draw light blue background, pencil texture overlay, and clouds
    - _Requirements: 1.2, 8.1, 8.2_

  - [x] 6.3 Write property test for cloud generation invariants (Property 1)
    - **Property 1: Cloud generation invariants**
    - **Validates: Requirements 1.2**
    - Generate random seeds and play area dimensions
    - Verify at least 3 clouds, each with opacity between 0.3 and 0.7

- [x] 7. Implement GameEngine with game loop and state management
  - [x] 7.1 Implement GameEngine class with state machine and game loop
    - Create GameEngine class with constructor(canvas, config)
    - Implement game states: 'start', 'active', 'gameOver'
    - Implement `start()` to show start screen with ghost at centered position, no physics
    - Implement game loop using requestAnimationFrame with delta-time calculation
    - Clamp delta time to maxDeltaTime (250ms) to prevent physics explosion on tab resume
    - Implement `transition(newState)` for state changes
    - Implement `update(deltaTime)` dispatching to appropriate state handlers
    - Implement `render()` to draw all components each frame
    - _Requirements: 1.1, 1.3, 1.6, 1.7, 9.1, 9.2, 9.3, 9.4_

  - [x] 7.2 Write property test for delta-time clamping (Property 17)
    - **Property 17: Delta-time clamping**
    - **Validates: Requirements 9.3**
    - Generate random positive floats [0, 10]
    - Verify clamped value equals min(rawDeltaTime, 0.25)

  - [x] 7.3 Write property test for no physics in non-active states (Property 6)
    - **Property 6: No physics in non-active states**
    - **Validates: Requirements 3.5, 7.2**
    - Generate random deltaTimes, positions, and velocities
    - Verify update in 'start' or 'gameOver' state does not change ghost position or velocity

  - [x] 7.4 Implement game over handling with cooldown and restart
    - On collision: transition to gameOver, play game_over.wav, freeze ghost and pipes
    - Display game over overlay with final score, high score, and restart prompt
    - Implement 500ms input cooldown using gameOverTimestamp
    - On restart input after cooldown: reset all components and transition to active state
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 7.5 Write property test for game over input cooldown (Property 14)
    - **Property 14: Game over input cooldown**
    - **Validates: Requirements 7.4, 7.5**
    - Generate random timestamps relative to game over time
    - Verify input ignored if < 500ms, triggers restart if >= 500ms

  - [x] 7.6 Write property test for reset produces correct initial state (Property 15)
    - **Property 15: Reset produces correct initial state**
    - **Validates: Requirements 7.6**
    - Generate random game states (scores, positions, velocities, pipes)
    - Verify reset produces: score=0, highScore unchanged, pipes empty, ghost at start position

- [x] 8. Wire components together and integrate rendering
  - [x] 8.1 Integrate all components in GameEngine update/render cycle
    - Wire InputHandler to trigger ghost.jump() and audioManager.playJump()
    - Wire start state: first input triggers transition to active + first jump
    - Wire active state update: ghost physics, pipe generation/movement, collision detection, scoring
    - Wire active state render: background, pipes, ghost (with rotation), score bar, start prompt
    - Wire scoring: increment when ghost center passes pipe trailing edge (mark pipe as scored)
    - Wire score bar rendering with "Score" and "High" labels at bottom of canvas
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 4.1, 5.1, 5.2, 8.3, 8.4, 8.5_

  - [x] 8.2 Implement Ghost sprite rendering with rotation and fallback
    - Load ghosty.png sprite, scale proportionally to fit within gap height
    - Apply rotation transform based on current velocity
    - If sprite fails to load, render white circle as fallback
    - _Requirements: 8.3, 8.6_

  - [x] 8.3 Implement Pipe rendering with green body and dark green caps
    - Render pipes as green rectangles with configured width
    - Render dark green caps at pipe openings, wider than pipe body on both sides
    - _Requirements: 4.2, 8.4_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The game uses vanilla JavaScript with no build tools or frameworks
- All game parameters are tunable via config.json at project root
- Audio failures are non-critical and handled silently

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3"] },
    { "id": 2, "tasks": ["1.4", "2.1", "2.6"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.7", "3.1"] },
    { "id": 4, "tasks": ["3.2", "4.1", "4.4"] },
    { "id": 5, "tasks": ["3.3", "3.4", "3.5", "4.2", "4.3", "4.5", "4.6"] },
    { "id": 6, "tasks": ["6.1", "6.2"] },
    { "id": 7, "tasks": ["6.3", "7.1"] },
    { "id": 8, "tasks": ["7.2", "7.3", "7.4"] },
    { "id": 9, "tasks": ["7.5", "7.6"] },
    { "id": 10, "tasks": ["8.1", "8.2", "8.3"] }
  ]
}
```
