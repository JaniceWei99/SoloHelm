## ADDED Requirements

### Requirement: Draggable Kanban cards
Cards in the Kanban view (Todo/Dev/Done/Publish columns) SHALL be draggable using HTML5 Drag and Drop API. Each card SHALL have `draggable="true"` and store the task ID in the drag data transfer.

#### Scenario: Start dragging a card
- **WHEN** user starts dragging a Kanban card
- **THEN** the card's task ID SHALL be set in `dataTransfer`, and the card SHALL receive a visual "dragging" state (reduced opacity)

#### Scenario: End dragging restores visual state
- **WHEN** user stops dragging (dragend event)
- **THEN** the card SHALL return to normal visual state

### Requirement: Kanban columns as drop targets
Each Kanban column SHALL accept dropped cards. On dragover, the column SHALL show a visual highlight. On dragleave, the highlight SHALL be removed.

#### Scenario: Drag over a column
- **WHEN** a card is dragged over the Dev column
- **THEN** the Dev column SHALL display a highlighted border indicating it is a valid drop target

### Requirement: Drop updates task status
When a card is dropped on a Kanban column, the system SHALL update the task's `status` to match the column's status, update `lastMoved` to today's date, save the data, and re-render the board with updated metrics.

#### Scenario: Move card from Todo to Dev
- **WHEN** user drags a card from the Todo column and drops it on the Dev column
- **THEN** the task's status SHALL change to "dev", `lastMoved` SHALL update to today, the card SHALL move to the Dev column, and column counts SHALL update

### Requirement: Backlog items not draggable
Items with status "backlog" SHALL NOT appear in the Kanban view and SHALL NOT be draggable. Drag-and-drop is restricted to the four Kanban columns (todo/dev/done/publish).

#### Scenario: Backlog items excluded from Kanban
- **WHEN** the Kanban view renders
- **THEN** no cards with status "backlog" SHALL appear in any Kanban column
