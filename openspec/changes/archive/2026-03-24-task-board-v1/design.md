## Context

This is a greenfield personal productivity tool combining a Kanban-style task board with an idea capture system. There is no existing codebase to migrate from. The target user is a solo developer/creator who needs a lightweight, self-hosted alternative to heavy project management tools.

The system consists of:
- A Node.js/Express backend serving static files and a REST API
- Two HTML pages sharing a single JS/CSS bundle
- JSON file storage on disk with browser localStorage as fallback

Constraints:
- Must work offline (localStorage fallback when API unreachable)
- No build step — vanilla HTML/CSS/JS served as static files
- Single-user, no authentication required
- Browser compatibility: modern browsers with HTML5 Drag and Drop support

## Goals / Non-Goals

**Goals:**
- Provide a two-page SPA-like experience (Task Board + Ideas Pool) with shared data
- Enable full CRUD on tasks/ideas through a modal-based UI
- Support drag-and-drop Kanban workflow with real-time metric updates
- Implement dual persistence (API-first, localStorage fallback) transparently
- Deliver a polished dark glassmorphism UI with zero build tooling
- Support voice input for rapid idea capture on ideas page

**Non-Goals:**
- Multi-user / collaboration features
- Authentication or authorization
- Real-time sync across tabs/devices (single-user assumption)
- Database backend (SQLite, PostgreSQL, etc.) — JSON file is sufficient
- PWA / service worker offline support (localStorage fallback is enough)
- Server-side rendering or templating

## Decisions

### 1. Vanilla JS over framework (React/Vue/Svelte)
**Decision**: Use plain HTML/CSS/JS with no build step.
**Rationale**: Minimizes complexity for a small two-page app. No bundler, no node_modules on the frontend, instant reload during development. The app's UI complexity (modal + kanban + list) is well within vanilla JS capability.
**Alternative considered**: React — rejected because it requires a build pipeline and is overkill for 2 pages with ~300 lines of shared logic.

### 2. Express + JSON file over database
**Decision**: Use `express` serving static files + a JSON file (`data/tasks.json`) for persistence.
**Rationale**: Zero configuration, no database process to manage, data is human-readable and git-friendly. For a single-user tool with <1000 items, file I/O performance is not a concern.
**Alternative considered**: SQLite via `better-sqlite3` — rejected for added dependency complexity with no real benefit at this scale.

### 3. localStorage fallback with API-first strategy
**Decision**: Always try API first on load; on failure, read from localStorage. All mutations write to both API and localStorage.
**Rationale**: Ensures data is preserved if the server goes down. localStorage acts as a local cache, not a primary store. On next successful API load, localStorage is overwritten with server data (server is source of truth when available).
**Alternative considered**: localStorage-only — rejected because it's browser-specific and can't persist across devices.

### 4. Single shared `app.js` with page detection via `body.dataset.page`
**Decision**: One JS file, branching on `data-page="tasks"|"ideas"`.
**Rationale**: Both pages share 80% of logic (data layer, modal, card rendering, CRUD). Splitting into separate files would duplicate code. The page attribute keeps initialization clean.

### 5. HTML5 native Drag and Drop over libraries
**Decision**: Use native `dragstart`/`dragover`/`drop` events.
**Rationale**: No external dependency needed. The interaction is simple (move card between 4 columns). Touch support is a non-goal for v1.
**Alternative considered**: SortableJS — rejected to avoid adding a dependency for a simple 4-column drop target.

### 6. Web Speech API with graceful degradation
**Decision**: Use `webkitSpeechRecognition` / `SpeechRecognition` for voice input on ideas page only. If unsupported, show alert and disable button.
**Rationale**: Voice capture is a convenience feature for rapid idea capture. Not all browsers support it, so degradation is essential.

## Risks / Trade-offs

- **[Risk] JSON file corruption on concurrent writes** → Mitigation: Single-user tool, no concurrent access expected. Synchronous `fs.writeFileSync` ensures atomic writes.
- **[Risk] localStorage quota exceeded** → Mitigation: For personal use, task count will stay well under the ~5MB limit. No mitigation needed for v1.
- **[Risk] Data divergence between API and localStorage** → Mitigation: Server data always wins on load. localStorage is overwritten whenever API load succeeds.
- **[Risk] Web Speech API browser support is limited** → Mitigation: Feature detection with fallback alert. Voice input is optional, not critical path.
- **[Risk] No data backup mechanism** → Mitigation: `data/tasks.json` can be version-controlled or manually backed up. Export feature is a future enhancement.
- **[Trade-off] No real-time cross-tab sync** → Accepted for v1 simplicity. Single-user assumption means only one tab is typically active.
