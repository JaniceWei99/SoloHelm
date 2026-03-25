## ADDED Requirements

### Requirement: Unified Task/Idea data schema
The system SHALL use a single data model for both tasks and ideas with the following fields: `id` (UUID string), `title` (string), `desc` (string), `tags` (array of strings), `priority` (enum: P1|P2|P3), `type` (enum: idea|feature|bug), `status` (enum: backlog|todo|dev|done|publish), `dependency` (string, may be empty), `releaseTime` (string, may be empty), `risk` (boolean, default false), `createdAt` (ISO 8601 string), `updatedAt` (ISO 8601 string), `lastMoved` (YYYY-MM-DD string).

#### Scenario: New task creation with all fields
- **WHEN** a new task is created with title "Fix login", priority "P1", type "bug", status "todo"
- **THEN** the system SHALL generate a UUID for `id`, set `createdAt` and `updatedAt` to the current ISO timestamp, set `lastMoved` to today's date in YYYY-MM-DD format, and store all provided fields

#### Scenario: Default values for optional fields
- **WHEN** a new task is created without specifying `dependency`, `releaseTime`, or `risk`
- **THEN** the system SHALL set `dependency` to empty string, `releaseTime` to empty string, and `risk` to false

### Requirement: Status lifecycle
The system SHALL support five statuses representing the task lifecycle: `backlog` (ideas pool), `todo` (planned), `dev` (in development), `done` (completed), `publish` (released).

#### Scenario: Status values are restricted to enum
- **WHEN** a task status is set
- **THEN** the system SHALL only accept one of: backlog, todo, dev, done, publish

### Requirement: Priority levels
The system SHALL support three priority levels: P1 (high), P2 (medium), P3 (low). Default priority SHALL be P3.

#### Scenario: Default priority assignment
- **WHEN** a task is created without specifying priority
- **THEN** the system SHALL assign P3 as the default priority

### Requirement: Type classification
The system SHALL classify each item as one of: `idea`, `feature`, or `bug`.

#### Scenario: Type determines card badge
- **WHEN** a task with type "bug" is displayed
- **THEN** the system SHALL show a "bug" type badge on the card
