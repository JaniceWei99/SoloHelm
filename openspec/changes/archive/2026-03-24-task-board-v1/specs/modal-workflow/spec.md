## ADDED Requirements

### Requirement: Shared modal for create and edit
Both pages SHALL use a shared modal overlay for creating and editing tasks/ideas. The modal SHALL contain a form with fields: Title (required), Description (textarea), Tags (comma-separated input), Priority (select: P1/P2/P3), Type (select: idea/feature/bug), Status (select: backlog/todo/dev/done/publish), Dependency (optional input), Release Time (date input). The modal footer SHALL have Cancel and Save buttons.

#### Scenario: Open modal for new task
- **WHEN** user clicks "New Task" or "New Idea"
- **THEN** the modal SHALL appear with all fields empty, heading set to "New Task", and appropriate defaults for the current page (tasks page defaults: status=todo, type=feature; ideas page defaults: status=backlog, type=idea)

#### Scenario: Open modal for editing
- **WHEN** user clicks "Edit" on a card
- **THEN** the modal SHALL appear with all fields pre-filled with the task's current data and heading set to "Edit Task"

### Requirement: Modal form validation
The modal form SHALL require the Title field to be non-empty before allowing submission. If Title is empty on submit, the system SHALL focus the Title input without closing the modal.

#### Scenario: Submit with empty title
- **WHEN** user clicks Save with an empty title field
- **THEN** the modal SHALL remain open and focus SHALL move to the title input

### Requirement: Modal close behavior
The modal SHALL close when the user clicks Cancel, clicks the overlay background, or successfully saves. On close, the editing state SHALL be cleared and the form SHALL be reset.

#### Scenario: Close modal via Cancel
- **WHEN** user clicks Cancel in the modal
- **THEN** the modal SHALL close, form SHALL reset, and no data SHALL be saved

#### Scenario: Close modal via overlay click
- **WHEN** user clicks the dark overlay area outside the modal
- **THEN** the modal SHALL close without saving

### Requirement: Save creates or updates
When the modal form is submitted with a valid title, the system SHALL create a new task (if no editing ID) or update the existing task (if editing). After save, the modal SHALL close and the page SHALL re-render.

#### Scenario: Save new task
- **WHEN** user fills in the form and clicks Save with no editing ID set
- **THEN** the system SHALL create a new task with the form data, close the modal, and re-render the page

#### Scenario: Save edited task
- **WHEN** user modifies fields in an edit modal and clicks Save
- **THEN** the system SHALL update the existing task, close the modal, and re-render the page
