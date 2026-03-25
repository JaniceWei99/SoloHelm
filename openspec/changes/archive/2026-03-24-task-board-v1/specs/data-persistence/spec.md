## ADDED Requirements

### Requirement: API-first data loading
On page load, the system SHALL attempt to fetch all tasks from `GET /api/tasks` first. If the API request succeeds, the returned data SHALL be stored in localStorage as a cache.

#### Scenario: Successful API load
- **WHEN** the page loads and the API is reachable
- **THEN** the system SHALL load tasks from the API response and update localStorage with the fetched data

### Requirement: localStorage fallback on API failure
If the API request fails (network error, server down, non-2xx response), the system SHALL fall back to reading data from localStorage using the key `solohelm-v1`.

#### Scenario: API unreachable falls back to localStorage
- **WHEN** the page loads and the API request fails
- **THEN** the system SHALL load tasks from localStorage key `solohelm-v1` and render normally

#### Scenario: Both API and localStorage empty
- **WHEN** the page loads, the API fails, and localStorage has no data
- **THEN** the system SHALL seed demo data and save it to localStorage

### Requirement: Dual-write on mutations
All create, update, and delete operations SHALL write to both the API and localStorage. API failures during mutations SHALL be silently ignored (localStorage ensures local persistence).

#### Scenario: Create task saves to both stores
- **WHEN** a new task is created
- **THEN** the system SHALL POST to the API and also save the full task list to localStorage

### Requirement: Demo data seeding
When the task list is empty (no data from API or localStorage), the system SHALL seed a set of demo tasks covering multiple statuses, types, and priorities.

#### Scenario: First-time load seeds demo data
- **WHEN** the application loads with an empty data store
- **THEN** the system SHALL populate the task list with demo tasks spanning backlog, todo, dev, done, and publish statuses

### Requirement: Server-side JSON file persistence
The server SHALL persist all task data to `data/tasks.json` as a JSON array. Reads and writes SHALL be synchronous to avoid partial write corruption.

#### Scenario: Data survives server restart
- **WHEN** tasks are created, the server is restarted, and the page is reloaded
- **THEN** all previously saved tasks SHALL be available from the API
