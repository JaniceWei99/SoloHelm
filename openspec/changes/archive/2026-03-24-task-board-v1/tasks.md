## 1. Project Setup

- [ ] 1.1 Initialize project with `package.json`, install `express` and `uuid` dependencies
- [ ] 1.2 Create directory structure: `public/`, `data/`, `data/tasks.json` (empty array)

## 2. Backend API (server.js)

- [ ] 2.1 Create Express server with static file serving from `public/` directory
- [ ] 2.2 Implement `GET /api/tasks` — read and return all tasks from `data/tasks.json`
- [ ] 2.3 Implement `POST /api/tasks` — create task with UUID, timestamps, persist to JSON file
- [ ] 2.4 Implement `PUT /api/tasks/:id` — update task fields, update `updatedAt`, update `lastMoved` on status change, return 404 if not found
- [ ] 2.5 Implement `DELETE /api/tasks/:id` — remove task from JSON file, return 404 if not found
- [ ] 2.6 Verify all API endpoints with curl (GET, POST, PUT, DELETE)

## 3. Shared Styles (style.css)

- [ ] 3.1 Set up CSS reset, CSS custom properties for dark theme (`#0f172a`), and glassmorphism variables
- [ ] 3.2 Create navbar styles (sticky, backdrop-filter, flex layout)
- [ ] 3.3 Create button system (`.btn-primary`, `.btn-outline`, `.btn-danger`, `.btn-ghost`, `.btn-sm`)
- [ ] 3.4 Create hero metric cards with status-colored values (todo=pink, dev=cyan, done=green, publish=yellow, backlog=purple)
- [ ] 3.5 Create dashboard summary chip styles
- [ ] 3.6 Create Kanban grid layout (4 columns), column styles, drag-over state
- [ ] 3.7 Create card styles with glassmorphism, badges (priority P1/P2/P3, type idea/feature/bug), tags, truncated description
- [ ] 3.8 Create list view table styles
- [ ] 3.9 Create modal overlay and form styles
- [ ] 3.10 Create voice button styles with recording pulse animation
- [ ] 3.11 Add responsive breakpoints (900px: 2-col kanban, 560px: 1-col, stacked form rows)

## 4. Data Layer & Core Logic (app.js)

- [ ] 4.1 Implement API-first data loading (`loadFromAPI`) with localStorage fallback (`loadFromLS`, key `solohelm-v1`)
- [ ] 4.2 Implement `saveToLS` for dual-write to localStorage on every mutation
- [ ] 4.3 Implement `apiCreate`, `apiUpdate`, `apiDelete` wrappers with silent failure
- [ ] 4.4 Implement `seedIfEmpty` with demo tasks spanning all statuses and types
- [ ] 4.5 Implement UUID generator and `todayStr` utility
- [ ] 4.6 Implement page detection via `body.dataset.page` to branch tasks/ideas logic

## 5. Modal Workflow (app.js)

- [ ] 5.1 Implement `showModal(task)` — open overlay, pre-fill form if editing, set defaults per page
- [ ] 5.2 Implement `hideModal` — close overlay, clear editing state, reset form
- [ ] 5.3 Implement `handleFormSubmit` — validate title required, call addTask or updateTask, close modal, re-render
- [ ] 5.4 Bind modal close on Cancel button, overlay click, and Close button

## 6. Task Board Page (index.html + rendering)

- [ ] 6.1 Create `index.html` with navbar (title, Ideas Pool link, New Task button)
- [ ] 6.2 Add hero metrics section (In Progress, Done, Ideas Pool, Published)
- [ ] 6.3 Add dashboard summary chips (Today, Risk/Blocked, Active)
- [ ] 6.4 Add view toggle buttons (Kanban / List)
- [ ] 6.5 Add Kanban HTML structure — 4 columns (Todo/Dev/Done/Publish) with `data-status` attributes
- [ ] 6.6 Add list view HTML structure — table with columns (Type, Title, Description, Tags, Priority, Release, Status, Actions)
- [ ] 6.7 Add shared modal HTML (form with all fields, Cancel/Save buttons)
- [ ] 6.8 Implement `renderTasksPage` — update hero metrics, dashboard summary, dispatch to kanban or list render
- [ ] 6.9 Implement `renderKanban` — populate each column with filtered cards, update column counts
- [ ] 6.10 Implement `renderListView` — populate table rows for non-backlog tasks
- [ ] 6.11 Implement view toggle binding — switch between kanban/list, update active button state

## 7. Ideas Pool Page (ideas.html + rendering)

- [ ] 7.1 Create `ideas.html` with navbar (title, Task Board link, New Idea button)
- [ ] 7.2 Add hero metrics section (Ideas Total, In Dev)
- [ ] 7.3 Add search bar input for filtering
- [ ] 7.4 Add backlog grid container
- [ ] 7.5 Add shared modal HTML with voice input button on Description label
- [ ] 7.6 Implement `renderIdeasPage` — update metrics, filter backlog by search query, render card grid
- [ ] 7.7 Bind real-time search input listener to trigger re-render on each keystroke

## 8. Card Rendering & Actions

- [ ] 8.1 Implement `createCardHTML` — generate card with title, badges (priority + type), description, tags, action buttons, marker icon
- [ ] 8.2 Implement `wireActions` — bind click handlers for Edit, Delete, To Todo, To Idea, and Marker buttons
- [ ] 8.3 Implement "To Todo" conversion — set status to "todo", re-render
- [ ] 8.4 Implement "To Idea" conversion — set status to "backlog" and type to "idea", re-render
- [ ] 8.5 Implement delete with confirmation dialog, remove from data, re-render

## 9. Drag and Drop (Kanban)

- [ ] 9.1 Implement `wireDragDrop` — bind dragover/dragleave/drop on Kanban columns
- [ ] 9.2 Implement dragstart on cards — set task ID in dataTransfer, add dragging class
- [ ] 9.3 Implement drop handler — read task ID, update status to column's `data-status`, update `lastMoved`, save, re-render
- [ ] 9.4 Implement visual feedback — column highlight on dragover, card opacity on drag

## 10. Status Markers

- [ ] 10.1 Implement `cycleMarker` — cycle through none → inprogress → blocked → none
- [ ] 10.2 Implement `markerIcon` — return appropriate icon HTML (play/warning/circle) with color
- [ ] 10.3 Sync `risk` field with blocked state — set risk=true on blocked, risk=false otherwise
- [ ] 10.4 Persist marker state and risk flag to data store on change

## 11. Voice Input (Ideas Page)

- [ ] 11.1 Implement `bindVoice` — detect SpeechRecognition support, set up button handler
- [ ] 11.2 Implement recording start — create SpeechRecognition instance, lang=zh-CN, start listening
- [ ] 11.3 Implement recording stop — toggle off on second click, handle onend/onerror
- [ ] 11.4 Implement `simplifyTranscript` — strip trailing punctuation from recognized text
- [ ] 11.5 Implement visual recording state — toggle `.recording` class (red + pulse animation)
- [ ] 11.6 Implement graceful degradation — dim button and show alert on unsupported browsers

## 12. Integration & Testing

- [ ] 12.1 Start server, verify Task Board page loads with demo data and correct metrics
- [ ] 12.2 Verify Kanban drag-and-drop updates status and metrics
- [ ] 12.3 Verify view toggle switches between Kanban and List views
- [ ] 12.4 Verify modal create/edit/delete flow on Task Board
- [ ] 12.5 Verify Ideas Pool page loads with backlog items and search filtering works
- [ ] 12.6 Verify "To Todo" and "To Idea" conversions work across pages
- [ ] 12.7 Verify marker cycling updates risk count in dashboard summary
- [ ] 12.8 Verify localStorage fallback works when server is stopped
