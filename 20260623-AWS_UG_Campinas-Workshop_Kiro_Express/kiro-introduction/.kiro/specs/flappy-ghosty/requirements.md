# Requirements Document

## Introduction

Flappy Ghosty is a retro-style infinite browser game inspired by the classic Flappy Bird. The player controls a small white ghost character ("fantasminha") that must navigate between sets of green pipes. The game features a pencil/sketch visual aesthetic with a light blue background, white clouds, and a bottom score bar. The game runs entirely in the browser using HTML, CSS, and JavaScript with no server-side dependencies.

## Glossary

- **Game_Engine**: The core HTML5 Canvas-based game loop responsible for updating and rendering the game state each frame
- **Ghost**: The player-controlled white ghost character sprite rendered from the ghosty.png asset
- **Pipe**: A green obstacle with a dark green cap that extends from either the top or bottom of the play area, forming a gap the Ghost must pass through
- **Pipe_Pair**: A set of two Pipes (one from top, one from bottom) with a navigable gap between them
- **Gap**: The vertical space between the top Pipe and bottom Pipe in a Pipe_Pair through which the Ghost must pass
- **Score_Manager**: The component responsible for tracking and displaying the current score and high score
- **Collision_Detector**: The component responsible for detecting contact between the Ghost and Pipes or boundaries
- **Audio_Manager**: The component responsible for playing sound effects (jump.wav, game_over.wav)
- **Play_Area**: The visible canvas region where gameplay occurs, excluding the score bar
- **Score_Bar**: The dark bottom bar displaying the current score and high score
- **Config_Loader**: The component responsible for fetching, validating, and merging the external config.json file with hardcoded defaults

## Requirements

### Requirement 1: Game Initialization

**User Story:** As a player, I want the game to load and display a start screen, so that I can begin playing when ready.

#### Acceptance Criteria

1. WHEN the browser page loads, THE Game_Engine SHALL render the Play_Area with a light blue background and pencil/sketch texture on an HTML5 Canvas element
2. WHEN the browser page loads, THE Game_Engine SHALL display at least 3 white rounded semi-transparent clouds at varying vertical positions and sizes across the background of the Play_Area, each with an individual opacity between 0.3 and 0.7
3. WHEN the browser page loads, THE Game_Engine SHALL display the Ghost sprite (ghosty.png) at a vertically centered position within the left third of the Play_Area, with no physics applied
4. WHEN the browser page loads, THE Score_Bar SHALL display "Score" with a value of 0 and "High" with the stored high score value from localStorage
5. IF no high score value exists in localStorage, THEN THE Score_Bar SHALL display "High" with a value of 0
6. WHEN the browser page loads, THE Game_Engine SHALL display a visible text prompt indicating the player should tap or press a key to start
7. WHILE the game is in the start screen state, THE Game_Engine SHALL not generate Pipe_Pairs and shall not apply gravity to the Ghost

### Requirement 2: Player Input

**User Story:** As a player, I want to make the ghost jump by clicking or pressing a key, so that I can navigate through the pipes.

#### Acceptance Criteria

1. WHILE the game is in the active gameplay state, WHEN the player clicks the mouse or taps the screen, THE Ghost SHALL move upward with an immediate vertical velocity impulse
2. WHILE the game is in the active gameplay state, WHEN the player presses the spacebar, THE Ghost SHALL move upward with an immediate vertical velocity impulse
3. WHEN the player provides a jump input (mouse click, screen tap, or spacebar press), THE Audio_Manager SHALL play the jump.wav sound effect
4. WHILE the game is in the start screen state, WHEN the player provides a jump input, THE Game_Engine SHALL transition to the active gameplay state and apply the first jump impulse to the Ghost simultaneously
5. WHEN the player holds down or repeatedly triggers a jump input, THE Game_Engine SHALL only register one jump per discrete key-press or click event, ignoring held-key repeat events

### Requirement 3: Ghost Physics

**User Story:** As a player, I want the ghost to be affected by gravity, so that the game presents a challenge requiring timed inputs.

#### Acceptance Criteria

1. WHILE the game is in the active gameplay state, THE Game_Engine SHALL apply a constant downward gravitational acceleration of 800 to 1200 pixels per second squared to the Ghost each frame, scaled by delta time
2. WHILE the game is in the active gameplay state, THE Ghost SHALL have a maximum downward velocity capped between 400 and 600 pixels per second to prevent uncontrollable falling speed
3. WHEN the player provides a jump input, THE Game_Engine SHALL set the Ghost vertical velocity to a fixed upward value between -250 and -350 pixels per second, overriding the current downward velocity regardless of its magnitude
4. THE Game_Engine SHALL update the Ghost vertical position each frame by adding the current velocity multiplied by delta time to the current Y position
5. WHILE the game is in the start screen state or game over state, THE Game_Engine SHALL NOT apply gravitational acceleration or update the Ghost position

### Requirement 4: Pipe Generation and Movement

**User Story:** As a player, I want pipes to continuously appear and scroll toward the ghost, so that the game provides an endless challenge.

#### Acceptance Criteria

1. WHILE the game is in the active gameplay state, THE Game_Engine SHALL generate a new Pipe_Pair offscreen to the right each time the previously generated Pipe_Pair has moved a fixed horizontal spacing of 200 to 250 pixels from the right edge of the Play_Area
2. THE Game_Engine SHALL render each Pipe as a green rectangle with a fixed width between 40 and 60 pixels and a dark green rectangular cap at the opening end
3. WHILE the game is in the active gameplay state, THE Game_Engine SHALL move all Pipe_Pairs to the left at a constant horizontal speed between 100 and 200 pixels per second, scaled by delta time
4. WHEN a Pipe_Pair moves entirely offscreen to the left, THE Game_Engine SHALL remove the Pipe_Pair from active rendering and memory
5. THE Game_Engine SHALL randomize the vertical position of the Gap center for each new Pipe_Pair such that the top Pipe and bottom Pipe each have a minimum visible length of 50 pixels within the Play_Area
6. THE Game_Engine SHALL set the Gap height to a fixed value no less than 3 times the Ghost sprite height and no greater than 4 times the Ghost sprite height, consistent across all Pipe_Pairs

### Requirement 5: Scoring

**User Story:** As a player, I want to earn points for each pipe I pass, so that I can track my progress.

#### Acceptance Criteria

1. WHEN the Ghost horizontal center passes the trailing edge of a Pipe_Pair for the first time, THE Score_Manager SHALL increment the current score by 1, marking that Pipe_Pair as scored to prevent double-counting
2. THE Score_Bar SHALL display the current score value updated within the same frame the score is incremented
3. WHEN the current score exceeds the stored high score, THE Score_Manager SHALL update the displayed high score to match the current score within the same frame
4. THE Score_Manager SHALL persist the high score in browser localStorage immediately each time the high score is updated
5. IF no high score value exists in localStorage on first play, THEN THE Score_Manager SHALL initialize the high score to 0

### Requirement 6: Collision Detection

**User Story:** As a player, I want the game to detect when the ghost hits a pipe or boundary, so that the game ends appropriately.

#### Acceptance Criteria

1. WHILE the game is in the active gameplay state, THE Collision_Detector SHALL check for axis-aligned bounding box overlap between the Ghost bounding box and the bounding boxes of all visible Pipes (including their caps) each frame
2. WHEN any edge of the Ghost bounding box meets or crosses the top boundary of the Play_Area, THE Collision_Detector SHALL report a collision
3. WHEN any edge of the Ghost bounding box meets or crosses the bottom boundary of the Play_Area, THE Collision_Detector SHALL report a collision
4. WHEN the Collision_Detector reports a collision, THE Game_Engine SHALL transition to the game over state within the same frame
5. WHILE the game is in the active gameplay state, IF no overlap exists between the Ghost bounding box and any Pipe bounding box or Play_Area boundary, THEN THE Collision_Detector SHALL NOT report a collision

### Requirement 7: Game Over

**User Story:** As a player, I want to see my final score and be able to restart, so that I can try to beat my high score.

#### Acceptance Criteria

1. WHEN the Game_Engine transitions to the game over state, THE Audio_Manager SHALL play the game_over.wav sound effect
2. WHEN the Game_Engine transitions to the game over state, THE Game_Engine SHALL stop all Pipe movement and freeze the Ghost at its current position, ceasing gravity and velocity updates
3. WHEN the Game_Engine transitions to the game over state, THE Game_Engine SHALL display a game over message showing the final score and the high score, along with a prompt instructing the player to tap or press a key to restart
4. WHILE the game is in the game over state, IF the player provides a jump input within 500 milliseconds of entering the game over state, THEN THE Game_Engine SHALL ignore the input
5. WHILE the game is in the game over state, WHEN the player provides a jump input after 500 milliseconds have elapsed since entering the game over state, THE Game_Engine SHALL reset the game and transition to the active gameplay state
6. WHEN the game resets, THE Score_Manager SHALL set the current score to 0, retain the high score, remove all existing Pipe_Pairs, and reposition the Ghost to the initial starting position as defined in Requirement 1 criterion 3

### Requirement 8: Visual Presentation

**User Story:** As a player, I want the game to have a retro visual style matching the reference design, so that the experience feels polished and nostalgic.

#### Acceptance Criteria

1. THE Game_Engine SHALL render the background with a light blue color and a pencil/sketch texture overlay applied across the entire Play_Area
2. THE Game_Engine SHALL render at least 3 white rounded semi-transparent clouds at varying vertical positions in the background, each cloud scrolling left at its own unique speed (ranging from 10% to 50% of the Pipe_Pair horizontal speed) to simulate realistic depth-based parallax, with slower clouds appearing more transparent and smaller, and faster clouds appearing more opaque and larger
3. THE Game_Engine SHALL render the Ghost using the ghosty.png sprite asset scaled proportionally to fit within the Gap height
4. THE Game_Engine SHALL render Pipes in green with darker green rectangular caps at the pipe openings, where each cap extends wider than the pipe body on both sides
5. THE Score_Bar SHALL appear as a dark-colored bar with a fixed height between 30 and 50 pixels, fixed at the bottom of the canvas, displaying "Score" and "High" labels with their numeric values in white text
6. THE Game_Engine SHALL apply a rotation to the Ghost sprite ranging from -30 degrees (nose up when vertical velocity is upward) to +30 degrees (nose down when vertical velocity is at maximum downward), interpolated linearly based on the current vertical velocity

### Requirement 9: Game Loop and Performance

**User Story:** As a player, I want the game to run smoothly in the browser, so that the gameplay feels responsive and consistent.

#### Acceptance Criteria

1. THE Game_Engine SHALL use requestAnimationFrame to drive the game loop, maintaining a target frame rate of 60 frames per second
2. THE Game_Engine SHALL use delta-time calculations to ensure gameplay speed remains consistent across frame rates ranging from 30 to 144 FPS, with no more than 5% deviation in game object movement speed relative to the target rate
3. IF the delta-time between frames exceeds 250 milliseconds (e.g., after a browser tab becomes inactive and returns to focus), THEN THE Game_Engine SHALL clamp the delta-time to 250 milliseconds to prevent physics calculations from producing excessive position changes
4. THE Game_Engine SHALL render all game elements on an HTML5 Canvas element with a fixed resolution of 400 by 600 pixels, scaled to fit within the browser viewport while preserving the aspect ratio

### Requirement 10: External Configuration

**User Story:** As a developer/designer, I want game parameters to be stored in an external config.json file, so that I can tune gameplay without modifying source code.

#### Acceptance Criteria

1. WHEN the browser page loads, THE Config_Loader SHALL fetch and parse a config.json file located at the project root to load game parameters before the Game_Engine initializes
2. IF config.json cannot be loaded due to a network error, a 404 response, or malformed JSON, THEN THE Config_Loader SHALL fall back to hardcoded default values and THE Game_Engine SHALL remain fully playable using those defaults
3. WHEN config.json contains a partial configuration with only a subset of supported fields, THE Config_Loader SHALL merge the specified fields with hardcoded defaults such that only the provided fields override their corresponding default values and all unspecified fields retain their default values
4. THE Config_Loader SHALL support configuration sections for canvas, scoreBar, ghost, pipes, clouds, and timing parameters within the config.json file structure
