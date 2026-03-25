## Context

SoloHelm is a single-user personal task management tool built with vanilla HTML/CSS/JS (no build step). The UI currently has ~150 hardcoded English strings spread across `index.html` (static HTML) and `app.js` (dynamically generated text). The primary user is Chinese-speaking. There is no existing i18n infrastructure.

Constraints:
- No build step, no bundler — everything is vanilla
- Single JS file (`app.js`) contains all frontend logic inside an IIFE
- Text appears in two forms: static HTML elements and JS-generated innerHTML/textContent
- Must work offline (PWA with service worker)
- Must not introduce external dependencies

## Goals / Non-Goals

**Goals:**
- Support Chinese (zh) and English (en) with instant switching, no page reload
- Persist language preference across sessions
- Default to Chinese
- Keep the implementation simple — inline dictionary, no framework
- Translate all user-visible text including toasts, validation errors, empty states, and chart labels

**Non-Goals:**
- Supporting more than 2 languages (can be extended later, but not designed for N languages)
- Translating user-generated content (task titles, descriptions, tags)
- Server-side i18n (API error messages stay in English)
- RTL layout support
- Date/number formatting localization (dates stay in ISO format)

## Decisions

### 1. Inline dictionary object over external JSON files
**Decision**: Define `const i18n = { zh: {...}, en: {...} }` at the top of `app.js`.
**Rationale**: Zero additional network requests, works offline immediately, no async loading complexity. With ~150 keys per language, the dictionary adds ~5KB — negligible. Keeps the "no build step" constraint.
**Alternative considered**: Separate `en.json` / `zh.json` fetched at load — rejected because it adds a network dependency and async complexity for minimal benefit at this scale.

### 2. `data-i18n` attributes for static HTML + `t(key)` function for JS
**Decision**: Two-pronged approach:
- Static HTML elements get a `data-i18n="key"` attribute. A `applyI18n()` function iterates `[data-i18n]` and sets `textContent`.
- For `placeholder` attributes, use `data-i18n-placeholder="key"`.
- JS-generated strings call `t('key')` which returns `i18n[currentLang][key]`.
**Rationale**: Keeps HTML readable (elements still have visible text as fallback). The `t()` function is the simplest possible API for dynamic text. No template syntax needed.

### 3. Language toggle as a globe icon button
**Decision**: Add a `<button>` with `fa-globe` icon in navbar-actions, between the theme toggle and the history button. Clicking cycles zh → en → zh. The button shows "EN" / "中" text label to indicate current state.
**Rationale**: Consistent with the theme toggle pattern (icon button in navbar). Two languages means a simple toggle is sufficient — no dropdown needed.

### 4. localStorage key `solohelm-lang`
**Decision**: Store language preference in `localStorage.getItem('solohelm-lang')` with values `'zh'` or `'en'`. Default to `'zh'` when no preference is stored.
**Rationale**: Follows the existing pattern of `solohelm-theme` for theme persistence. No browser language detection — the user is known to be Chinese-speaking, so Chinese default is appropriate.

### 5. Flat key namespace with dot notation
**Decision**: Use flat dot-notation keys like `nav.board`, `modal.title.new_task`, `toast.deleted`, `empty.kanban.todo`.
**Rationale**: Flat keys are simple to look up (`i18n[lang][key]`), easy to grep, and don't require nested object traversal. Dot notation provides logical grouping without nesting.

## Risks / Trade-offs

- **[Risk] Missing translation keys** → Mitigation: `t(key)` falls back to English, then to the raw key string. Console warning in dev for missing keys.
- **[Risk] HTML flicker on load** → Mitigation: HTML keeps Chinese text as default content. `applyI18n()` runs on DOMContentLoaded, so Chinese users see no flash. English users may see a brief Chinese flash — acceptable for a single-user tool.
- **[Trade-off] Inline dictionary increases app.js size** → ~5KB added, negligible for a local tool.
- **[Trade-off] No pluralization support** → Not needed for zh/en in this UI (no "N items" patterns that differ between languages).
- **[Risk] Chart.js labels need re-render on language switch** → Mitigation: Destroy and recreate charts when language changes.
