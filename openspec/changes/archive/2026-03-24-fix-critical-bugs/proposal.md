## Status

**COMPLETED** — All items implemented 2026-03-24.

## Why

The v1 implementation has several technical issues that cause data loss and degrade reliability. Marker state (in-progress/blocked) is lost on page refresh because `_marker` is a runtime-only property. API errors are silently swallowed with no user feedback, causing data divergence between frontend and backend. Search input re-renders the entire grid on every keystroke without debouncing. Input data is not validated on either frontend or backend, allowing malformed data to be persisted.

These are not feature gaps — they are correctness bugs that undermine trust in the tool for daily use.

## What Changed

- **Fixed**: Marker state persists via SQLite `risk` column — markers survive page refresh and server restart
- **Fixed**: Toast/snackbar system shows error, warning, success, and info notifications on API failures (bottom-right corner, auto-dismiss)
- **Fixed**: 300ms debounce on Ideas Pool search input prevents excessive re-renders
- **Fixed**: Frontend validation (field highlighting + inline error messages) and backend validation middleware (`validateTask`) returning 400 on invalid data
- **Fixed**: Enum validation on `priority` (P0-P3), `type` (feat/bug/chore/idea), `status` (backlog-publish)
- **Fixed**: Input length limits via `maxlength` attributes (title: 200, desc: 2000, tags: 50)
- **Fixed**: Optimistic delete with rollback — removes from UI immediately, restores on API failure with error toast

## Capabilities

### New Capabilities
- `error-feedback`: Toast/snackbar notifications for API errors (error/warn/success/info levels)
- `input-validation`: Frontend field highlighting + inline errors; backend `validateTask` middleware returning 400

### Modified Capabilities
- `status-markers`: Marker state stored in SQLite `risk` column, persists across sessions
- `data-persistence`: Optimistic update/rollback for delete; debounced search

## Impact

- **Modified files**: `public/app.js` (toast system, debounce, validation, optimistic delete), `server.js` (validateTask middleware), `public/style.css` (toast + validation styles), `public/index.html` & `public/ideas.html` (maxlength attributes)
- **No new dependencies**
- **No breaking changes** — backward compatible with existing data
