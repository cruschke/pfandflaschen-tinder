# Feature Specification: Bottle Quiz Trainer

**Feature Branch**: `001-bottle-quiz-trainer`

**Created**: 2026-05-15

**Status**: Draft

**Input**: User description: "Build a single page web app on Github pages that helps training to identify returnable bottles from non-returnable bottles. The interface should be like a quiz, present a single bottle (glass, plastic) or Screw-top jar (like Nutella or jam) and the user needs to decide if this is returnable (I got money back) or not (I need to put it in the public glass container). Each round is e.g. 10 items presented, the decision is swiping left - returnable, swiping right - throw away. As assets it should use images from public sources (german brands). A user can join the quiz by entering the name and start the quiz (and repeat as often as they like), have a scoreboard for all participants. The quiz should also add some upskilling, e.g. the german QR-code to identify returnable plastic bottles, or german beer bottles are always returnable, but not the similar looking Cider bottles (as they are differently sized, 540ml vs 500ml) or other types of hints to get better at their learning journey"

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

The app maintains a persistent scoreboard showing all players who have participated, ranked by their best score. The scoreboard is visible before, during, and after each quiz session.

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

1. **Given** a player swipes incorrectly, **When** the feedback displays, **Then** they see an explanation specific to that bottle type
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

### Edge Cases

- What happens if the scoreboard is viewed on multiple devices simultaneously? (Data consistency should be maintained via browser local storage or cloud sync)
- How does the app handle a player closing/refreshing mid-quiz? (Quiz state should be recoverable or restarted cleanly)
- What if a player enters the same name multiple times? (Each session records independently; best score is tracked per unique name)
- How does the app handle network unavailability on GitHub Pages? (App is fully offline-capable; scoreboard data stored locally)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a single bottle/jar image per quiz item from a curated German brands library
- **FR-002**: System MUST accept user input via swipe gestures (left = returnable, right = non-returnable) or click-based buttons as fallback
- **FR-003**: System MUST present exactly 10 items per quiz round
- **FR-004**: System MUST track and display the player's score (correct answers / 10) at the end of each quiz
- **FR-005**: System MUST maintain a persistent global scoreboard showing all unique player names and their best score, sorted descending by score
- **FR-006**: System MUST allow a player to enter their name before starting a quiz
- **FR-007**: System MUST allow a player to retake the quiz as many times as they wish using the same or different name
- **FR-008**: System MUST provide educational feedback when a player makes an incorrect choice, explaining the correct categorization
- **FR-009**: System MUST include learning hints in feedback for specific bottle types (e.g., QR-code system for plastics, beer vs. cider distinction, size differences)
- **FR-010**: System MUST be fully playable as a single-page application hosted on GitHub Pages with no backend server required
- **FR-011**: System MUST persist scoreboard data across browser sessions using client-side storage (localStorage or similar)
- **FR-012**: System MUST randomize the order of quiz items across different sessions to prevent memorization

### Key Entities

- **Player**: Represented by a unique name, tracks best quiz score, and persists across sessions
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

## Assumptions

- **Player Data Scope**: Scoreboard persists only within a single browser/device using localStorage; clearing browser data resets scoreboard. No cross-device sync in v1.
- **Image Assets**: 20-30 German bottle/jar images can be sourced from public-domain or creative-commons licensed sources (Pixabay, Pexels, Wikimedia Commons, etc.)
- **Quiz Content**: The correct returnability status for each bottle item is deterministic based on German deposit/Pfand system rules (beer bottles always returnable, most plastic bottles returnable if marked with QR, screw-top jars typically not returnable except specific types)
- **User Base**: Mobile and desktop users; no app-store distribution required; users access via GitHub Pages URL
- **Mobile Gestures**: Touch-based swipe is primary interaction on mobile; mouse swipe or click buttons acceptable on desktop
- **Offline Support**: App is fully offline-capable once initially loaded; no requirement for real-time sync or backend
- **Gamification Scope**: Scoreboard is local per-device; no global multi-device leaderboard in v1
