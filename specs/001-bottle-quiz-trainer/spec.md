# Feature Specification: Bottle Quiz Trainer

**Feature Branch**: `001-bottle-quiz-trainer`

**Created**: 2026-05-15

**Status**: Draft

**Input**: User description: "Build a single page web app on Github pages that helps training to identify returnable bottles from non-returnable bottles. The interface should be like a quiz, present a single bottle (glass, plastic) or Screw-top jar (like Nutella or jam) and the user needs to decide if this is returnable (I got money back) or not (I need to put it in the public glass container). Each round is e.g. 10 items presented, the decision is swiping left - returnable, swiping right - throw away. As assets it should use images from public sources (german brands). A user can join the quiz by entering the name and start the quiz (and repeat as often as they like), have a scoreboard for all participants. The quiz should also add some upskilling, e.g. the german QR-code to identify returnable plastic bottles, or german beer bottles are always returnable, but not the similar looking Cider bottles (as they are differently sized, 540ml vs 500ml) or other types of hints to get better at their learning journey"

## Clarifications

### Session 2026-05-15

- Q: What JavaScript framework/approach should be used? → A: Vanilla HTML/CSS/JS — zero build step, pure static files, no dependencies
- Q: When a player refreshes or closes mid-quiz, what should happen? → A: Start fresh — discard in-progress quiz, player begins a new round
- Q: How should player name uniqueness be determined? → A: Case-insensitive + whitespace-trimmed — "Anna", "anna", and "  Anna  " resolve to the same player; stored using the first-entered casing
- Q: What language should the UI text be in? → A: German — all button labels, instructions, feedback messages, and scoreboard headings in German
- Q: How should quiz images be selected each round? → A: Random 10 from full set — each quiz independently picks 10 random images from the full library to prevent memorization
- Q: How does image bootstrapping work over time? → A: Incremental and repeatable — bootstrapping can be run multiple times to grow the library; images are deduplicated automatically by stable identifier (e.g. filename or source URL) so re-running never creates duplicates
- Q: What happens when a player swipes correctly? → A: Brief positive flash — green overlay with "Richtig!" text auto-advances to the next card after ~1 second
- Q: How does the player advance past wrong-answer educational feedback? → A: Blocking dismiss — the feedback panel stays visible until the player explicitly taps or swipes it away; it does not auto-advance
- Q: Is the scoreboard accessible while a quiz is in progress? → A: Home + results screens only — no scoreboard access during an active quiz; scoreboard shown before starting and after completing a round

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player Takes Initial Quiz (Priority: P1)

A new player enters their name and starts their first bottle quiz. They are presented with 10 bottle/jar images one at a time and swipe left for returnable or right for non-returnable. After completing the round, they see their score and are added to the global scoreboard.

**Why this priority**: Core gameplay loop - without this, there is no app. All other features build on this foundation.

**Independent Test**: Can be fully tested by: entering a name, completing a 10-item quiz with swipe gestures, seeing final score, and verifying scoreboard updated.

**Acceptance Scenarios**:

1. **Given** a new player, **When** they enter their name and see the first bottle, **Then** they can swipe left or right
2. **Given** a player mid-quiz, **When** they swipe, **Then** the app shows the next bottle and updates progress counter
3. **Given** a player completes all 10 items, **When** the quiz ends, **Then** they see their score and final result
4. **Given** a quiz is complete, **When** the player returns to home, **Then** their name and score appear on the global scoreboard

---

### User Story 2 - Scoreboard Tracks All Players (Priority: P1)

The app maintains a persistent scoreboard showing all players who have participated, ranked by their best score. The scoreboard is visible on the home screen before starting a quiz and on the results screen after completing a round.

**Why this priority**: Gamification mechanic - leaderboard drives engagement and motivation to replay.

**Independent Test**: Can be fully tested by: multiple players completing quizzes, scores being recorded and ranked correctly, scoreboard updating after each session.

**Acceptance Scenarios**:

1. **Given** multiple players have completed quizzes, **When** viewing the scoreboard, **Then** players are sorted by highest score descending
2. **Given** the same player completes two quizzes, **When** both scores are recorded, **Then** the scoreboard shows only their best score
3. **Given** the app loads, **When** there are no players yet, **Then** scoreboard shows empty state gracefully

---

### User Story 3 - Learn from Mistakes (Priority: P2)

When a player makes an incorrect decision (swipes wrong direction), they receive educational feedback explaining why their answer was wrong. This includes hints like QR codes for plastic, beer bottle size rules, or brand information.

**Why this priority**: Transforms quiz from pure game to learning tool; enables skill improvement through reinforcement.

**Independent Test**: Can be fully tested by: intentionally selecting wrong answers, seeing relevant educational hints, and understanding the correct categorization.

**Acceptance Scenarios**:

1. **Given** a player swipes incorrectly, **When** the feedback displays, **Then** they see an explanation specific to that bottle type and must tap/swipe to dismiss it before the next item appears
2. **Given** a plastic bottle is shown, **When** feedback for a wrong answer is displayed, **Then** it mentions German QR-code system for identifying returnability
3. **Given** a beer bottle is shown, **When** feedback displays, **Then** it clarifies that German beer bottles are always returnable, unlike similar-looking ciders
4. **Given** a cider bottle (e.g., 540ml) vs beer (e.g., 500ml) is shown, **When** player swipes wrong, **Then** hint explains size difference and distinction

---

### User Story 4 - Replay and Track Progress (Priority: P2)

A player can take the quiz multiple times. The app tracks attempts and shows their score progression. They can always return to home, see their name/best score on the scoreboard, and start a new round.

**Why this priority**: Enables repeated engagement and learning over time; shows player improvement.

**Independent Test**: Can be fully tested by: taking multiple quiz attempts as same player, verifying previous attempts recorded, scoreboard reflecting best score.

**Acceptance Scenarios**:

1. **Given** a player completes a quiz, **When** they return home, **Then** they can enter their name again and start a new quiz
2. **Given** a player takes 3 quizzes with scores 7/10, 8/10, 9/10, **When** the scoreboard updates, **Then** it shows only the best score (9/10)
3. **Given** a player views the scoreboard after their first quiz, **When** they return from a second quiz, **Then** their updated score appears (if it improved)

---

### User Story 5 - Visual Feedback on Swipe (Priority: P3)

During the swiping gesture, the player receives visual feedback (directional indicators, color hints, or animation) suggesting the direction they should swipe to indicate their choice.

**Why this priority**: Improves user experience and clarity; reduces confusion about gesture direction.

**Independent Test**: Can be fully tested by: observing visual cues appear as player drags/swipes, confirming they guide toward left/right actions.

**Acceptance Scenarios**:

1. **Given** a player starts a swipe gesture, **When** they drag their finger/mouse, **Then** visual indicators appear in the direction of motion
2. **Given** a player swipes left, **When** the gesture completes, **Then** the app registers it as "returnable" and moves to next item

---

### User Story 6 - Bootstrap Quiz with Public Images (Priority: P1)

The app ships with a curated set of bottle and jar images collected from public sources (Wikimedia Commons, Pixabay, Pexels, or similar). Images cover a representative mix of German returnable and non-returnable containers: beer bottles, plastic PET bottles with/without Pfand markings, wine bottles, cider bottles, screw-top jars (Nutella, jam), and glass containers for recycling.

**Why this priority**: Without images there is no quiz content. This is a prerequisite for all gameplay functionality.

**Independent Test**: Can be fully tested by: verifying that at least 20 images are available in the app's asset library, each with correct metadata (name, type, returnability, hint text), and that images render correctly at quiz display size.

**Acceptance Scenarios**:

1. **Given** the app is deployed, **When** a quiz starts, **Then** images load from the bundled asset library without external network calls
2. **Given** the image library exists, **When** inspecting metadata, **Then** each image has: filename, container type (glass/plastic/jar), brand or description, correct returnability status, and at least one educational hint
3. **Given** the image set, **When** reviewing coverage, **Then** it includes at least 10 returnable and 10 non-returnable items spanning beer, plastic, wine, cider, and jar categories
4. **Given** the images are from public sources, **When** checking licensing, **Then** all images are public domain, CC0, or Creative Commons licensed with proper attribution

---

### Edge Cases

- What happens if the scoreboard is viewed on multiple devices simultaneously? (Each device maintains its own independent scoreboard via localStorage; there is no cross-device sync in v1)
- How does the app handle a player closing/refreshing mid-quiz? (Quiz state is NOT persisted; a refresh discards the in-progress round and the player starts a new quiz from the beginning)
- What if a player enters the same name multiple times? (Names are matched case-insensitively and whitespace-trimmed; "Anna" and "anna" resolve to the same player. The display name is preserved from the first entry. Best score is tracked per canonical name.)
- How does the app handle network unavailability on GitHub Pages? (App is fully offline-capable; scoreboard data stored locally)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ship with a curated image library of at least 20 bottle/jar photos sourced from public/Creative Commons sources, covering German returnable and non-returnable containers
- **FR-001b**: The image library bootstrapping process MUST be repeatable — it can be run multiple times to incrementally add new images; each run MUST deduplicate against existing entries using a stable identifier (filename or source URL) so re-running never creates duplicate entries
- **FR-002**: Each image asset MUST include metadata: container type, brand/description, returnability status (true/false), and educational hint text
- **FR-003**: System MUST display a single bottle/jar image per quiz item from the bundled asset library
- **FR-002**: System MUST accept user input via swipe gestures (left = returnable, right = non-returnable) or click-based buttons as fallback
- **FR-003**: System MUST present exactly 10 items per quiz round
- **FR-004**: System MUST track and display the player's score (correct answers / 10) at the end of each quiz
- **FR-005**: System MUST maintain a persistent global scoreboard showing all unique player names and their best score, sorted descending by score
- **FR-006**: System MUST allow a player to enter their name before starting a quiz
- **FR-007**: System MUST allow a player to retake the quiz as many times as they wish using the same or different name
- **FR-008**: System MUST provide educational feedback when a player makes an incorrect choice, explaining the correct categorization; this feedback panel MUST be blocking — it remains visible until the player explicitly taps or swipes it away before advancing to the next item
- **FR-008b**: System MUST provide positive confirmation when a player swipes correctly: a brief green overlay with "Richtig!" that auto-advances to the next card after approximately 1 second
- **FR-009**: System MUST include learning hints in feedback for specific bottle types (e.g., QR-code system for plastics, beer vs. cider distinction, size differences)
- **FR-010**: System MUST be fully playable as a single-page application hosted on GitHub Pages with no backend server required
- **FR-015**: Implementation MUST use plain Vanilla HTML, CSS, and JavaScript with no build tools, bundlers, or JavaScript frameworks; all code is served as static files directly to the browser
- **FR-016**: All UI copy (button labels, instructions, feedback messages, scoreboard headings, educational hints) MUST be written in German
- **FR-011**: System MUST persist scoreboard data across browser sessions using client-side storage (localStorage or similar)
- **FR-012**: System MUST randomize the quiz by randomly selecting 10 images from the full library each round (not a fixed subset), and present them in random order — preventing both item memorization and sequence memorization
- **FR-013**: UI MUST follow Apple Human Interface design principles: generous whitespace, clean typography (system sans-serif font stack), subtle animations, card-based layouts, and a minimal color palette with high contrast
- **FR-014**: UI MUST feel premium and polished: smooth transitions between quiz items, rounded corners, consistent spacing, and a focus on content over chrome

### Key Entities

- **Player**: Represented by a unique name (matched case-insensitively, whitespace-trimmed; display name preserved from first entry), tracks best quiz score, and persists across sessions
- **QuizRound**: A sequence of 10 bottle items presented in a single session; belongs to a Player; produces a score
- **BottleItem**: A single image asset with metadata (type: glass/plastic/jar, brand, actual returnability status, educational hints)
- **Scoreboard**: Aggregated view of all Players sorted by best score; rebuilt from stored Player records

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete their first quiz (name entry through final score) in under 3 minutes
- **SC-002**: Swipe recognition is accurate; 95% of user swipes are correctly detected as left or right intent
- **SC-003**: Scoreboard remains accurate; players' best scores are correctly tracked even after 100+ quiz attempts across multiple sessions
- **SC-004**: Educational feedback is provided for 100% of incorrect answers, with specific hints for at least 80% of item types
- **SC-005**: App loads and is fully playable with zero external API calls; no network dependency required
- **SC-006**: Player can replay the quiz; at least 70% of players who complete one quiz attempt a second quiz within one session
- **SC-007**: Scoreboard visual feedback is clear; 90% of players understand the left/right swipe direction without instruction
- **SC-008**: Visual design perceived as professional and polished; users describe the app as "clean" or "well-designed" when asked for first impressions

## Assumptions

- **Player Data Scope**: Scoreboard persists only within a single browser/device using localStorage; clearing browser data resets scoreboard. No cross-device sync in v1.
- **Image Assets**: 20-30 German bottle/jar images will be collected from public-domain or Creative Commons licensed sources (Wikimedia Commons, Pixabay, Pexels) as part of the initial build. The bootstrapping process is repeatable — additional images can be added incrementally by re-running it; deduplication by stable identifier (filename or source URL) ensures no duplicates accumulate. Images are bundled directly in the repository and served as static assets — no external image APIs or hotlinking.
- **Quiz Content**: The correct returnability status for each bottle item is deterministic based on German deposit/Pfand system rules (beer bottles always returnable, most plastic bottles returnable if marked with QR, screw-top jars typically not returnable except specific types)
- **User Base**: Mobile and desktop users; no app-store distribution required; users access via GitHub Pages URL
- **Mobile Gestures**: Touch-based swipe is primary interaction on mobile; mouse swipe or click buttons acceptable on desktop
- **Offline Support**: App is fully offline-capable once initially loaded; no requirement for real-time sync or backend
- **Gamification Scope**: Scoreboard is local per-device; no global multi-device leaderboard in v1
