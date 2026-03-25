## Why

The current UI is entirely English, but the primary user is Chinese-speaking. A Chinese/English toggle lets the user work in their preferred language and makes the tool more comfortable for daily use. Since this is a single-user tool, a simple client-side i18n solution is sufficient.

## What Changes

- Add an inline i18n dictionary object (`const i18n = { zh: {...}, en: {...} }`) containing all ~150 translatable strings
- Add a `data-i18n` attribute system for static HTML elements, with a `t(key)` helper for JS-generated text
- Add a language toggle button (globe icon) in the navbar, next to the theme toggle
- Persist language choice in localStorage (`solohelm-lang` key)
- Default language: Chinese (`zh`)
- Update `<html lang>` attribute on switch
- Chinese translations for all UI text: tabs, metrics, form labels, buttons, placeholders, toasts, empty states, chart labels, validation errors, keyboard shortcut descriptions

## Capabilities

### New Capabilities
- `i18n-system`: Inline dictionary with `zh`/`en` entries, `data-i18n` attribute binding for HTML elements, `t(key)` function for JS-generated strings, language toggle with localStorage persistence

### Modified Capabilities
- `task-board-ui`: All static text in Board tab gets `data-i18n` attributes
- `ideas-pool-ui`: Ideas tab text gets `data-i18n` attributes
- `analytics-dashboard`: Analytics tab text and chart labels translated
- `theme-toggle`: No behavior change, but language toggle button placed adjacent to it in navbar

## Impact

- **Modified files**: `public/index.html` (add `data-i18n` attributes + language toggle button), `public/app.js` (i18n dictionary, `t()` function, all hardcoded strings replaced)
- **New localStorage key**: `solohelm-lang` (values: `zh` | `en`)
- **No new dependencies** — pure vanilla JS
- **No API changes** — i18n is entirely client-side
- **No breaking changes** — existing functionality unchanged, just text becomes dynamic
