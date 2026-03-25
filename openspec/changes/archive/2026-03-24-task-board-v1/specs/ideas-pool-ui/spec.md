## ADDED Requirements

### Requirement: Ideas Pool navbar
The Ideas Pool page SHALL display a top navigation bar containing the page title, a link to the Task Board page, and a "New Idea" button (type="button") that opens the idea creation modal.

#### Scenario: Navigate to Task Board
- **WHEN** user clicks the "Task Board" link in the navbar
- **THEN** the browser SHALL navigate to index.html

#### Scenario: Open new idea modal
- **WHEN** user clicks the "New Idea" button
- **THEN** the system SHALL display the modal with empty fields, type defaulting to "idea", and status defaulting to "backlog"

### Requirement: Ideas Pool hero metrics
The Ideas Pool page SHALL display two hero metric cards: Ideas Total (count of backlog tasks) and In Dev (count of dev tasks).

#### Scenario: Metrics reflect backlog and dev counts
- **WHEN** there are 5 backlog items and 2 dev items
- **THEN** Ideas Total SHALL show 5 and In Dev SHALL show 2

### Requirement: Real-time search filtering
The Ideas Pool page SHALL provide a search input that filters backlog items in real-time by matching the query against task titles and tags.

#### Scenario: Search filters by title
- **WHEN** user types "mobile" in the search input
- **THEN** only backlog items whose title contains "mobile" (case-insensitive) SHALL be displayed

#### Scenario: Search filters by tag
- **WHEN** user types "ux" in the search input
- **THEN** backlog items that have a tag containing "ux" SHALL be displayed

#### Scenario: Empty search shows all backlog
- **WHEN** the search input is cleared
- **THEN** all backlog items SHALL be displayed

### Requirement: Backlog card grid
The Ideas Pool page SHALL display backlog items in a responsive grid of cards. Each card SHALL show title, priority badge, type badge, description, tags, and action buttons (Edit, Delete, "To Todo"). Cards in the Ideas Pool SHALL NOT be draggable.

#### Scenario: Only backlog items displayed
- **WHEN** there are items with statuses backlog, todo, and dev
- **THEN** only items with status "backlog" SHALL appear in the grid

### Requirement: Convert idea to todo
Each backlog card SHALL have a "To Todo" button that converts the idea to a task by setting status to "todo".

#### Scenario: Idea converted to todo
- **WHEN** user clicks "To Todo" on a backlog idea
- **THEN** the idea's status SHALL change to "todo", the card SHALL disappear from the Ideas Pool grid, the Ideas Total metric SHALL decrement, and the item SHALL appear in the Task Board's Todo column

### Requirement: Edit and delete backlog items
Each backlog card SHALL have Edit and Delete buttons. Edit SHALL open the modal pre-filled with the item's data. Delete SHALL remove the item after confirmation.

#### Scenario: Edit a backlog idea
- **WHEN** user clicks "Edit" on a backlog card
- **THEN** the modal SHALL open with all fields pre-filled with the idea's current data

#### Scenario: Delete a backlog idea
- **WHEN** user clicks "Delete" on a backlog card and confirms the deletion
- **THEN** the idea SHALL be removed from the data store and the grid SHALL re-render without it
