## Why

We need a lightweight, self-hosted personal productivity tool that combines task management (Kanban board) with an idea capture system (Ideas Pool). Existing tools are either too heavy (Jira/Notion) or lack the idea-to-task pipeline. This project provides a single-deploy solution with offline resilience via localStorage fallback, enabling uninterrupted workflow even without network access.

## What Changes

- **New**: Two-page static frontend — Task Board (`index.html`) with Kanban/List views, and Ideas Pool (`ideas.html`) with searchable backlog grid
- **New**: Unified data model (Task/Idea) with UUID, priority (P1/P2/P3), type (idea/feature/bug), and 5-stage status flow (backlog → todo → dev → done → publish)
- **New**: Express.js backend (`server.js`) with CRUD REST API and JSON file persistence (`data/tasks.json`)
- **New**: Automatic fallback to browser localStorage (`solohelm-v1`) when API is unreachable
- **New**: Drag-and-drop Kanban columns (Todo/Dev/Done/Publish) with real-time status and metric updates
- **New**: Bi-directional conversion between ideas (backlog) and tasks (todo), plus marker cycling (none → in-progress → blocked)
- **New**: Voice input for idea descriptions via Web Speech API with graceful degradation
- **New**: Dark glassmorphism theme with status-colored indicators (pink/cyan/green/yellow)
- **New**: Modal-based create/edit flow shared across both pages
- **New**: Demo seed data on first load when data store is empty

## Capabilities

### New Capabilities
- `task-data-model`: Unified Task/Idea data schema with UUID, tags, priority, type, status lifecycle, dependency, releaseTime, risk flag, and timestamps
- `task-board-ui`: Task Board page — navbar, hero metrics (in-progress/done/backlog/publish), dashboard summary (today/risk/active), Kanban view with 4 draggable columns, list view with table, view toggle
- `ideas-pool-ui`: Ideas Pool page — navbar, hero metrics (total/in-dev), real-time search filtering by title/tags, backlog card grid with "To Todo" conversion
- `task-crud-api`: Express.js REST API — GET/POST/PUT/DELETE `/api/tasks` with JSON file storage and UUID generation
- `data-persistence`: Dual persistence strategy — API-first with automatic localStorage fallback, demo data seeding on empty store
- `modal-workflow`: Shared modal for create/edit across both pages — all fields (title, desc, tags, priority, type, status, dependency, releaseTime), form validation
- `drag-and-drop`: HTML5 drag-and-drop for Kanban columns — dragstart/dragover/drop handlers, status/lastMoved update on drop, visual feedback
- `voice-input`: Web Speech API integration for idea description — microphone recording toggle, transcript simplification, graceful fallback for unsupported browsers
- `status-markers`: Task card marker cycling (none → in-progress → blocked) with risk flag sync and visual indicators

### Modified Capabilities
<!-- No existing capabilities to modify — this is a greenfield project -->

## Impact

- **New files**: `server.js`, `public/index.html`, `public/ideas.html`, `public/style.css`, `public/app.js`, `data/tasks.json`
- **Dependencies**: `express@^4.18`, `uuid@^9.0` (npm)
- **External CDN**: Font Awesome 6.5, Google Fonts (Inter)
- **Browser APIs**: HTML5 Drag and Drop, localStorage, Web Speech API (optional)
- **Port**: localhost:3000 (configurable via `PORT` env)
- **No breaking changes** — greenfield project with no existing users or APIs
