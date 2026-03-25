## Status

**COMPLETED** — All items implemented 2026-03-25.

## Why

The original three-page layout (index.html, ideas.html, analytics.html) created unnecessary navigation friction for a single-user tool. Full page reloads broke flow. The dark glassmorphism theme felt heavy for a daily-driver productivity tool. The project name "OPC Board" was generic and didn't convey identity for a solo-creator tool.

Three goals in one change:
1. **Single-page consolidation** — eliminate page transitions, keep everything one click away
2. **Visual refresh** — lighter, calmer default palette that's easier on the eyes during long sessions
3. **Brand identity** — rename to "SoloHelm" to reflect the solo-creator audience

## What Changed

- **Done**: Single-page tab layout — merged Board, Ideas, and Analytics into one `index.html` with tab navigation in navbar center. Old `ideas.html` and `analytics.html` now redirect to `/`.
- **Done**: Pastel/light default theme — `--bg:#f5f7fb`, `--surface:#ffffff`, softer status colors, lighter shadows. Dark theme preserved via `[data-theme="dark"]` toggle.
- **Done**: Keyboard shortcuts 1/2/3 for tab switching.
- **Done**: Project rename — "OPC Board" to "SoloHelm" across all 15 files: package.json, HTML titles, navbar, manifest.json, localStorage keys (`solohelm-v1`, `solohelm-theme`), service worker cache name, export filenames, server export header, all documentation and openspec references.

## Capabilities

### New Capabilities
- `tab-navigation`: Three-tab layout (Board / Ideas / Analytics) in navbar with keyboard shortcuts (1/2/3), `activeTab` state variable, `getActivePage()` context switching
- `pastel-theme`: Light pastel as default theme, dark mode via `[data-theme="dark"]` selector

### Modified Capabilities
- `task-board-ui`: Board content now lives in a `#section-board` div within the unified page
- `ideas-pool-ui`: Ideas content now in `#section-ideas` div, no longer a separate page
- `analytics-dashboard`: Analytics content now in `#section-analytics` div with Chart.js loaded on main page
- `theme-toggle`: Default flipped from dark to light; localStorage key changed from `opc-theme` to `solohelm-theme`
- `data-persistence`: localStorage key changed from `opc-board-v1` to `solohelm-v1`
- `pwa-support`: Service worker cache name changed from `opc-board-v3` to `solohelm-v1`

## Impact

- **Removed pages**: `ideas.html` and `analytics.html` replaced with redirects to `/`
- **Rewritten files**: `public/index.html` (unified), `public/style.css` (pastel defaults), `public/app.js` (tab switching + integrated analytics)
- **Updated files**: `public/manifest.json`, `public/sw.js`, `public/competitive-analysis.html`, `server.js`, `package.json`, `package-lock.json`, `AGENTS.md`, `doc/competitive-analysis.md`, 3 openspec docs
- **localStorage migration**: Users with existing `opc-board-v1` / `opc-theme` keys will need to manually clear or the app starts fresh (acceptable for single-user tool)
- **No new dependencies** — all vanilla JS/CSS
- **No breaking API changes** — all endpoints unchanged
