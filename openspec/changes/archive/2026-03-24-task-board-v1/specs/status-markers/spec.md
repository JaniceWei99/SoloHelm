## ADDED Requirements

### Requirement: Marker cycling on task cards
Each task card in the Kanban and List views SHALL have a clickable marker icon in the top-right corner. Clicking the marker SHALL cycle through three states: none (default) → in-progress → blocked → none.

#### Scenario: Cycle from none to in-progress
- **WHEN** user clicks the marker on a card with no marker set
- **THEN** the marker SHALL change to an in-progress icon (play symbol, cyan colored)

#### Scenario: Cycle from in-progress to blocked
- **WHEN** user clicks the marker on a card showing in-progress
- **THEN** the marker SHALL change to a blocked/warning icon (warning symbol, red colored)

#### Scenario: Cycle from blocked to none
- **WHEN** user clicks the marker on a card showing blocked
- **THEN** the marker SHALL return to the default state (dim circle)

### Requirement: Risk flag sync with blocked marker
When the marker is set to "blocked", the task's `risk` field SHALL be set to `true`. When the marker cycles away from "blocked", `risk` SHALL be set to `false`. The risk count in the dashboard summary SHALL update accordingly.

#### Scenario: Blocked marker sets risk flag
- **WHEN** user sets a card's marker to "blocked"
- **THEN** the task's `risk` field SHALL become `true` and the Risk/Blocked count in the dashboard summary SHALL increment

#### Scenario: Clearing blocked marker clears risk
- **WHEN** user cycles the marker from "blocked" to none
- **THEN** the task's `risk` field SHALL become `false` and the Risk/Blocked count SHALL decrement

### Requirement: Marker persists across renders
The marker state SHALL be preserved in the task data and survive page re-renders. The risk flag (synced from blocked state) SHALL be persisted to the data store.

#### Scenario: Marker state survives re-render
- **WHEN** a task is marked as "blocked" and the page re-renders (e.g., after another task is edited)
- **THEN** the blocked marker icon SHALL still be displayed on that task's card
