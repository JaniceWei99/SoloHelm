## ADDED Requirements

### Requirement: Task Board navbar
The Task Board page SHALL display a top navigation bar containing the page title, a link to the Ideas Pool page, and a "New Task" button (type="button") that opens the task creation modal.

#### Scenario: Navigate to Ideas Pool
- **WHEN** user clicks the "Ideas Pool" link in the navbar
- **THEN** the browser SHALL navigate to ideas.html

#### Scenario: Open new task modal
- **WHEN** user clicks the "New Task" button
- **THEN** the system SHALL display the task creation modal with empty fields and status defaulting to "todo"

### Requirement: Hero metrics display
The Task Board page SHALL display four hero metric cards: In Progress (count of todo + dev tasks), Done (count of done tasks), Ideas Pool (count of backlog tasks), Published (count of publish tasks).

#### Scenario: Metrics reflect current data
- **WHEN** there are 2 todo tasks, 1 dev task, 3 done tasks, 1 backlog task, and 2 publish tasks
- **THEN** the hero metrics SHALL show In Progress: 3, Done: 3, Ideas Pool: 1, Published: 2

#### Scenario: Metrics update after task change
- **WHEN** a task status changes from "todo" to "dev"
- **THEN** the hero metrics SHALL update immediately without page reload

### Requirement: Dashboard summary
The Task Board page SHALL display a dashboard summary with three chips: Today's progress (count of tasks moved to done or publish today), Risk/Blocked (count of tasks with risk=true), Active (count of todo + dev tasks).

#### Scenario: Today count uses lastMoved date
- **WHEN** 2 tasks have lastMoved equal to today's date and status "done" or "publish"
- **THEN** the Today chip SHALL display 2

### Requirement: View toggle between Kanban and List
The Task Board page SHALL provide toggle buttons to switch between Kanban view and List view. The Kanban view SHALL be the default active view.

#### Scenario: Switch to list view
- **WHEN** user clicks the "List" toggle button
- **THEN** the Kanban columns SHALL be hidden and a table-based list view SHALL be displayed

#### Scenario: Switch back to kanban view
- **WHEN** user clicks the "Kanban" toggle button while in list view
- **THEN** the list table SHALL be hidden and the Kanban columns SHALL be displayed

### Requirement: Kanban view with four columns
The Kanban view SHALL display four columns: Todo, Dev, Done, Publish. Each column SHALL show a header with the status name and a count badge. Backlog items SHALL NOT appear in the Kanban view.

#### Scenario: Cards appear in correct columns
- **WHEN** there are tasks with statuses todo, dev, done, and publish
- **THEN** each task card SHALL appear in its corresponding column with the column count badge updated

### Requirement: Kanban card features
Each Kanban card SHALL display: title, priority badge, type badge, description (truncated to 2 lines), tags, and action buttons (Edit, Delete, "To Idea"). Each card SHALL have a marker icon in the top-right corner for status marking.

#### Scenario: Card displays all elements
- **WHEN** a task has title "Fix login", priority P1, type bug, desc "Session timeout issue", tags ["auth"]
- **THEN** the card SHALL show the title, a P1 badge, a bug badge, truncated description, an "auth" tag chip, and Edit/Delete/To Idea buttons

### Requirement: List view with table
The List view SHALL display non-backlog tasks in a table with columns: Type, Title, Description, Tags, Priority, Release, Status, and Actions (Edit, Delete, To Idea, Marker).

#### Scenario: List view shows all active tasks
- **WHEN** there are 5 tasks (2 todo, 1 dev, 1 done, 1 publish) and 2 backlog ideas
- **THEN** the list view table SHALL show 5 rows (backlog items excluded)

### Requirement: Convert task to idea
Each task card (in both Kanban and List view) SHALL have a "To Idea" button that converts the task back to an idea by setting status to "backlog" and type to "idea".

#### Scenario: Task converted to idea
- **WHEN** user clicks "To Idea" on a task with status "dev"
- **THEN** the task's status SHALL change to "backlog", type SHALL change to "idea", the task SHALL disappear from the Kanban/List view, and the Ideas Pool metric SHALL increment
