# Deployment Guide

This project is a static frontend with a lightweight Node.js JSON-file backend.

## Prerequisites
- Node.js 18+ installed on target machine (`node -v` to verify)
- Python 3.8+ (for simple static file serving) or any static web server
- Open ports (or adjusted via env vars):
  - 4000 for the backend API (configurable with `PORT`)
  - 8080 for the static site (or your chosen port)
- File system write permission in the project directory to persist `data/tasks.json`

## Files to copy
Copy the entire project directory to the target machine, including:
- `index.html`, `ideas.html`, `script.js`, `styles`/assets (if present)
- `server.js`
- (Will be created on first write) `data/tasks.json`

## Start the backend API
From the project root:
```bash
node server.js
```
- API runs at `http://localhost:4000`
- Health check: `curl http://localhost:4000/health`
- Data persists to `data/tasks.json` (auto-created on first write)
- To change port: `PORT=5000 node server.js`

## Start the frontend (static)
In a separate shell, from the project root:
```bash
python -m http.server 8080
```
Then open in browser:
- Tasks page: `http://localhost:8080/index.html`
- Ideas page: `http://localhost:8080/ideas.html`

You can use any static server instead of Python (e.g., nginx, serve, http-server); just ensure it serves the project root.

## Configuration notes
- Frontend expects the API at `http://localhost:4000/api/tasks` by default (`script.js` has `API_URL` and `useApi` toggles). If you change API host/port, update `API_URL` accordingly.
- If the API is down, frontend falls back to `localStorage` (non-persistent across browsers/machines).

## Production hardening (optional)
- Run backend behind a process manager (systemd/pm2) and a reverse proxy (nginx) if exposed publicly.
- Back up `data/tasks.json` regularly.
- Restrict API exposure or add auth if deployed on an untrusted network.

## Deploying to another machine (step-by-step)
1. Install prerequisites: Node.js 18+ and Python 3.8+ (or any static server). Ensure target ports are open (default 4000 for API, 8080 for static).
2. Copy the entire project directory to the target machine (includes `index.html`, `ideas.html`, `script.js`, `server.js`, assets). `data/tasks.json` will be created on first write.
3. Start backend API:
   ```bash
   node server.js            # uses PORT=4000 by default
   # optional: PORT=5000 node server.js
   ```
   Health check: `curl http://localhost:4000/health`.
4. Start frontend (static):
   ```bash
   python -m http.server 8080
   ```
   Then open `http://localhost:8080/index.html` (tasks) or `/ideas.html` (ideas).
   You may use nginx/serve/http-server instead—just serve the project root.
5. If API host/port differs, edit `script.js` (`API_URL`, `useApi`) to the correct address (e.g., `http://<ip>:5000/api/tasks`).
6. (Optional) For production: run backend under systemd/pm2 and put nginx in front; back up `data/tasks.json` regularly; add auth if on an untrusted network.
