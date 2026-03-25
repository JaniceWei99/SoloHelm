## Status

**COMPLETED** — All items implemented 2026-03-24.

## Why

A one-person company needs visibility into productivity trends to optimize work habits, and mobile access to capture ideas on the go. Currently there is no way to answer "am I getting faster?", "which week had the most output?", or "how long do tasks stay in dev?". Additionally, the tool is desktop-only — ideas that come during commutes or walks are lost because there's no mobile-friendly way to capture them. Recurring tasks (weekly review, monthly invoicing) require manual re-creation every time.

Linear and Notion offer analytics dashboards; Todoist offers recurring tasks; all three have mobile apps. These are the features that separate a "project for fun" from a "tool I rely on daily".

## What Changed

- **Done**: Analytics dashboard (`analytics.html`) — status donut chart, priority bar chart, weekly velocity line chart, burndown area chart (all Chart.js)
- **Done**: Analytics API endpoint (`GET /api/analytics`) — calculates status/priority distribution, weekly velocity, avg cycle time, burndown data from task_history
- **Done**: Timeline view — tasks plotted by `releaseTime` on horizontal timeline, integrated as 3rd view toggle alongside kanban/list
- **Done**: PWA support — `manifest.json` with app metadata, `sw.js` with cache-first strategy for static assets, registered in app.js
- **Done**: Recurring tasks — `recurrence` field (daily/weekly/monthly) on task model, auto-clone via `POST /api/tasks/:id/clone` triggered on completion (done/publish)
- **Done**: Activity log — `task_history` table in SQLite, records all mutations with timestamps, viewable in UI

## Capabilities

### New Capabilities
- `analytics-dashboard`: Dedicated page with 4 Chart.js charts + summary metric cards (total tasks, avg cycle time, completion rate, active streak)
- `timeline-view`: Horizontal timeline plotting tasks by release date, color-coded by status
- `pwa-support`: Service worker with cache-first strategy, web manifest for home screen install
- `recurring-tasks`: Recurrence rules (daily/weekly/monthly) with auto-clone on task completion
- `activity-log`: Append-only `task_history` table recording all task mutations

### Modified Capabilities
- `task-data-model`: Added `recurrence TEXT DEFAULT ''` column
- `task-board-ui`: Added analytics nav link, timeline view toggle, recurrence selector in modal
- `task-crud-api`: History append on all mutations, clone endpoint, analytics endpoint

## Impact

- **New dependency**: Chart.js 4.x (CDN, ~60KB)
- **New files**: `public/analytics.html`, `public/sw.js`, `public/manifest.json`
- **New DB columns**: `recurrence TEXT DEFAULT ''` (auto-migrated)
- **New endpoints**: `GET /api/analytics`, `POST /api/tasks/:id/clone`, `GET /api/export`, `POST /api/import`
- **No breaking changes** — new fields default to empty, existing data unaffected
