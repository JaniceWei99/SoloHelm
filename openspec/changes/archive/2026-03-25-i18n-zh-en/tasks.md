## 1. i18n Infrastructure (app.js)

- [x] 1.1 Define `const i18n = { zh: {...}, en: {...} }` dictionary with all ~150 translatable keys using dot-notation namespace (nav.*, modal.*, toast.*, empty.*, validation.*, chart.*, detail.*, history.*, shortcut.*)
- [x] 1.2 Implement `t(key)` function: lookup `i18n[currentLang][key]`, fallback to `en`, fallback to raw key
- [x] 1.3 Implement `applyI18n()` function: iterate `[data-i18n]` elements setting `textContent`, iterate `[data-i18n-placeholder]` elements setting `placeholder`
- [x] 1.4 Implement `initLang()`: read `localStorage.getItem('solohelm-lang')`, default to `'zh'`, set `currentLang`, call `applyI18n()`
- [x] 1.5 Implement `toggleLang()`: switch `currentLang` zh↔en, update `<html lang>`, persist to localStorage, call `applyI18n()`, re-render active tab

## 2. Language Toggle Button (index.html + app.js)

- [x] 2.1 Add language toggle button in navbar-actions (between theme toggle and history button), globe icon + text label ("中"/"EN")
- [x] 2.2 Bind click handler to call `toggleLang()`
- [x] 2.3 Add `updateLangButton()` to sync button label with current language

## 3. Static HTML Translation Markup (index.html)

- [x] 3.1 Add `data-i18n` attributes to navbar tab labels (Board, Ideas, Analytics)
- [x] 3.2 Add `data-i18n` attributes to Board tab: metric labels, summary labels, view toggle buttons, kanban column headers, list view table headers
- [x] 3.3 Add `data-i18n` attributes to Ideas tab: metric labels, search placeholder (`data-i18n-placeholder`)
- [x] 3.4 Add `data-i18n` attributes to Analytics tab: metric labels, chart section titles
- [x] 3.5 Add `data-i18n` attributes to modal: form heading, field labels, select options, button text, placeholder attributes
- [x] 3.6 Add `data-i18n` attributes to detail panel title, history panel title, keyboard shortcuts overlay (title + descriptions)
- [x] 3.7 Add `data-i18n` attributes to settings menu items (Export JSON, Export CSV, Import JSON, Shortcuts)

## 4. Dynamic JS Text Translation (app.js)

- [x] 4.1 Replace hardcoded toast messages with `t()` calls (deleted, restored, status changed, undo, export/import success/error, clone, offline mode)
- [x] 4.2 Replace hardcoded validation error messages with `t()` calls
- [x] 4.3 Replace hardcoded empty state titles and hints with `t()` calls (kanban columns, list view, ideas, timeline)
- [x] 4.4 Replace hardcoded modal heading text with `t()` calls (New Task, Edit Task, New Idea)
- [x] 4.5 Replace hardcoded card action button labels with `t()` calls (Edit, Del, To Todo, To Idea)
- [x] 4.6 Replace hardcoded detail panel field labels and empty values with `t()` calls
- [x] 4.7 Replace hardcoded history action/field labels with `t()` calls
- [x] 4.8 Replace hardcoded chart labels with `t()` calls (legend text, dataset labels)
- [x] 4.9 Replace theme toggle tooltip text with `t()` calls
- [x] 4.10 Replace confirm dialog text with `t()` calls
- [x] 4.11 Replace "New Task"/"New Idea" button text update in tab switching with `t()` calls

## 5. Re-render on Language Switch

- [x] 5.1 In `toggleLang()`, call render function for active tab to refresh all dynamic content
- [x] 5.2 In `toggleLang()`, destroy and recreate Chart.js instances if Analytics tab is active
- [x] 5.3 Update "New Task"/"New Idea" button label on language switch based on active tab

## 6. Verification

- [x] 6.1 Start server, verify page loads in Chinese by default
- [x] 6.2 Click language toggle, verify all visible text switches to English instantly
- [x] 6.3 Refresh page, verify English persists (localStorage)
- [x] 6.4 Switch to each tab (Board/Ideas/Analytics), verify all text is translated
- [x] 6.5 Open modal (new task, edit task), verify labels/placeholders/options are translated
- [x] 6.6 Trigger toast messages (delete, status change), verify they appear in current language
- [x] 6.7 Check keyboard shortcuts overlay, verify descriptions are translated
- [x] 6.8 Verify `<html lang>` attribute updates on switch
