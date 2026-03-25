## ADDED Requirements

### Requirement: GET all tasks endpoint
The server SHALL expose `GET /api/tasks` that returns a JSON array of all tasks stored in `data/tasks.json`.

#### Scenario: Retrieve all tasks
- **WHEN** a GET request is made to `/api/tasks`
- **THEN** the server SHALL respond with HTTP 200 and a JSON array of all stored tasks

#### Scenario: Empty data file
- **WHEN** `data/tasks.json` contains an empty array
- **THEN** the server SHALL respond with HTTP 200 and `[]`

### Requirement: POST create task endpoint
The server SHALL expose `POST /api/tasks` that creates a new task with a server-generated UUID, sets `createdAt`/`updatedAt` to the current ISO timestamp, sets `lastMoved` to today's date, and persists it to `data/tasks.json`.

#### Scenario: Create a new task
- **WHEN** a POST request is made to `/api/tasks` with body `{"title":"New task","priority":"P1","status":"todo"}`
- **THEN** the server SHALL respond with HTTP 201 and the created task object including a generated `id`, `createdAt`, `updatedAt`, and `lastMoved`

### Requirement: PUT update task endpoint
The server SHALL expose `PUT /api/tasks/:id` that updates the specified task's fields, sets `updatedAt` to the current timestamp, and updates `lastMoved` if the status field changed.

#### Scenario: Update task status
- **WHEN** a PUT request is made to `/api/tasks/:id` with body `{"status":"dev"}`
- **THEN** the server SHALL update the task's status to "dev", update `updatedAt`, update `lastMoved` to today, and respond with HTTP 200 and the updated task

#### Scenario: Update non-status field
- **WHEN** a PUT request is made to `/api/tasks/:id` with body `{"title":"Updated title"}`
- **THEN** the server SHALL update the title, update `updatedAt`, keep `lastMoved` unchanged, and respond with HTTP 200

#### Scenario: Update non-existent task
- **WHEN** a PUT request is made to `/api/tasks/:id` with an ID that does not exist
- **THEN** the server SHALL respond with HTTP 404

### Requirement: DELETE task endpoint
The server SHALL expose `DELETE /api/tasks/:id` that removes the specified task from `data/tasks.json`.

#### Scenario: Delete an existing task
- **WHEN** a DELETE request is made to `/api/tasks/:id` with a valid ID
- **THEN** the server SHALL remove the task and respond with HTTP 200 and `{"ok":true}`

#### Scenario: Delete non-existent task
- **WHEN** a DELETE request is made to `/api/tasks/:id` with an ID that does not exist
- **THEN** the server SHALL respond with HTTP 404

### Requirement: Static file serving
The server SHALL serve all files in the `public/` directory as static assets at the root URL path.

#### Scenario: Serve index.html
- **WHEN** a GET request is made to `/`
- **THEN** the server SHALL serve `public/index.html`
