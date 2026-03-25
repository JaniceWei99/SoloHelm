## Status

**COMPLETED** — All 7 items implemented 2026-03-24.

## Why

The v1 board is functional but lacks the UX polish expected of a daily-driver tool. Users cannot break tasks into subtasks, cannot operate the UI without a mouse, cannot back up or migrate data, and have no way to recover from accidental deletions. The single dark theme doesn't adapt to user preference. Empty states provide no guidance. Task details require opening the edit modal even for read-only viewing.

These are the "quality of life" features that make the difference between a prototype and a tool you actually want to use every day.

## What Changed

- **Done**: Subtasks/Checklist — `subtasks` JSON array field in DB, add/remove/toggle UI in modal, progress bar on task cards showing completion percentage
- **Done**: Keyboard shortcuts — N (new task), / (focus search), Esc (close modal/panel), ? (show shortcut overlay), Ctrl+Z (undo last action), K/J (navigate cards on tasks page)
- **Done**: Data export/import — Settings dropdown with Export JSON (full backup), Export CSV (spreadsheet-friendly), Import JSON (bulk restore with duplicate detection)
- **Done**: Dark/light theme toggle — CSS custom properties for both themes, system preference detection via `prefers-color-scheme`, localStorage persistence (`solohelm-theme` key), toggle button in navbar
- **Done**: Undo system — 5-second toast with Undo button for delete and status change operations, Ctrl+Z keyboard shortcut support
- **Done**: Empty states — SVG icons + guidance text when kanban columns are empty, when grid/list has no tasks, and when search returns no results
- **Done**: Card detail panel — click task title to open right-side slide-in panel with full task info, subtask list, and metadata (read-only view without needing edit modal)

## Capabilities

### New Capabilities
- `subtasks`: JSON array field on tasks with add/remove/toggle operations, progress bar visualization
- `keyboard-shortcuts`: Global hotkeys for common actions with discoverable overlay (? key)
- `data-export-import`: JSON and CSV export, JSON import with validation and duplicate skip
- `theme-toggle`: Dark/light theme with system preference detection and persistence
- `undo-system`: Reversible delete and status changes with 5-second recovery window
- `empty-states`: Contextual guidance when views have no content
- `detail-panel`: Read-only side panel for quick task inspection

### Modified Capabilities
- `task-data-model`: Added `subtasks TEXT DEFAULT '[]'` column (auto-migrated)
- `task-board-ui`: Settings dropdown, theme toggle, detail panel, shortcut overlay, empty state placeholders
- `task-crud-api`: Export/import endpoints, subtask field in CRUD operations

## Impact

- **New DB column**: `subtasks TEXT DEFAULT '[]'` (auto-migrated)
- **New endpoints**: `GET /api/export`, `POST /api/import`
- **Modified files**: `public/app.js` (~540 lines added), `public/style.css` (~130 lines added), `public/index.html` & `public/ideas.html` (settings dropdown, theme toggle, detail panel, shortcut overlay, subtask UI in modal)
- **No new dependencies** — all implemented with vanilla JS/CSS
- **No breaking changes** — new fields default to empty, existing data unaffected
