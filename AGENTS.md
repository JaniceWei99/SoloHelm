# SoloHelm — Project Guide

## Quick Start
```
Windows:  double-click install-windows.bat
macOS:    double-click install-macos.command
Linux:    bash install-linux.sh
```

## Tech Stack
- **Backend**: Node.js + Express + sql.js (SQLite in-memory, persisted to `data/board.db`)
- **Frontend**: Vanilla HTML/CSS/JS, no build step, single-page app
- **CDN deps**: FontAwesome 6.5.1, Chart.js 4.x, Inter font
- **Database**: SQLite via sql.js (no native binaries needed)
- **i18n**: Chinese/English switching via inline dictionary + `t()` function

## File Structure
```
server.js                — Express server (~565 lines)
public/
  index.html             — Single-page app: sidebar nav + Ideas/Board/Analytics tabs (~350 lines)
  app.js                 — Frontend logic + i18n system (~1705 lines)
  style.css              — All styles incl. sidebar (~364 lines, dark/light theme)
  manifest.json          — PWA manifest
  sw.js                  — Service Worker for offline caching
data/
  board.db               — SQLite database (auto-created)
doc/
  user-guide.md          — User guide (features, workflow, shortcuts)
  deploy.md              — Deployment guide (Docker, Helm, bare metal)
  competitive-analysis.md — Competitive analysis + changelog
openspec/changes/        — OpenSpec change archive (proposals, designs, specs, tasks)
helm/solohelm/           — Helm Chart for Kubernetes deployment
install-linux.sh         — One-click install & deploy script (Linux)
install-macos.command    — macOS double-click installer
install-windows.bat      — Windows double-click installer
Dockerfile               — Multi-stage Docker build
.dockerignore            — Docker build exclusions
```

## Layout
- **Left sidebar** (200px, fixed, dark #1e293b): Logo + vertical tab buttons (Ideas/Board/Analytics)
- **Top navbar**: Tool buttons only (theme/language/history/settings/new task)
- **Content area**: margin-left 200px, shows active tab content
- **Mobile (≤768px)**: Sidebar becomes bottom tab bar, icons only

## Verification Commands
```bash
# Start server
node server.js

# Run tests
npm test

# Quick smoke test (all endpoints)
curl -s http://localhost:3000/api/tasks | head -c 100
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/index.html
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/analytics

# Validation test
curl -s -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"","priority":"P9"}' 
# Should return 400

# Docker build
docker build -t solohelm:latest .
docker run -d --name solohelm -p 3000:3000 -v solohelm-data:/app/data solohelm:latest

# Helm lint
helm lint ./helm/solohelm
helm template test-release ./helm/solohelm
```

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tasks | List all tasks |
| GET | /api/tasks/:id | Get single task |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/tasks/:id/history | Task change history |
| POST | /api/tasks/:id/clone | Clone task (recurrence) |
| GET | /api/history | Global activity log |
| GET | /api/analytics | Analytics data |
| GET | /api/export | Export all tasks (JSON) |
| POST | /api/import | Bulk import tasks |

## Key Features (V3)
- Single-page app with dark sidebar navigation
- i18n: Chinese/English language switching (default: Chinese)
- 5-stage lifecycle: backlog → todo → dev → done → publish
- Kanban columns: Todo / In Progress / Dev Done / Published
- Kanban + List + Timeline views
- Subtasks/checklist with progress bars
- Dark/light theme toggle (sidebar always dark)
- Keyboard shortcuts (1/2/3 tab switch, N, /, Esc, ?, Ctrl+Z)
- Data export (JSON/CSV) and import (JSON)
- Undo for delete/status change (5s toast)
- Recurring tasks (auto-clone on completion)
- Analytics: status/priority charts, velocity, burndown
- PWA: offline support, installable
- Full change history tracking
- Frontend + backend validation

## Notes
- `better-sqlite3` doesn't work on this system (no `make`), using `sql.js` instead
- Database auto-migrates: adds new columns if missing, imports from old JSON if present
- No build step needed — everything runs directly
- Docker: multi-stage build (node:20-alpine), non-root user, healthcheck included
- Helm Chart: PVC for data persistence, SecurityContext, Ingress support, HPA optional
