## ADDED Requirements

### Requirement: Inline translation dictionary
The system SHALL define a translation dictionary object containing all user-visible strings in both Chinese (`zh`) and English (`en`) within `app.js`.

#### Scenario: Dictionary contains all UI strings
- **WHEN** the application loads
- **THEN** the `i18n` object SHALL contain entries for both `zh` and `en` covering all user-visible text (nav labels, form labels, button text, placeholders, toast messages, empty states, validation errors, chart labels, panel titles, shortcut descriptions)

### Requirement: Translation function `t(key)`
The system SHALL provide a `t(key)` function that returns the translated string for the current language.

#### Scenario: Valid key returns translation
- **WHEN** `t('nav.board')` is called with language set to `zh`
- **THEN** the function SHALL return the Chinese translation (e.g. `"看板"`)

#### Scenario: Missing key falls back to English
- **WHEN** `t(key)` is called with a key that exists in `en` but not in `zh`
- **THEN** the function SHALL return the English string

#### Scenario: Completely missing key returns the key itself
- **WHEN** `t(key)` is called with a key that exists in neither language
- **THEN** the function SHALL return the raw key string

### Requirement: Static HTML translation via data-i18n
The system SHALL translate static HTML elements by reading `data-i18n` attributes and setting `textContent` to the translated value.

#### Scenario: Elements with data-i18n are translated
- **WHEN** the language is switched or the page loads
- **THEN** every element with a `data-i18n` attribute SHALL have its `textContent` set to `t(attribute_value)`

#### Scenario: Placeholder translation via data-i18n-placeholder
- **WHEN** an input element has a `data-i18n-placeholder` attribute
- **THEN** its `placeholder` property SHALL be set to `t(attribute_value)`

### Requirement: Language toggle button
The system SHALL display a language toggle button in the navbar actions area, positioned between the theme toggle and the history button.

#### Scenario: Toggle button appearance
- **WHEN** the page loads
- **THEN** a button with a globe icon SHALL be visible in the navbar, showing "中" when current language is Chinese or "EN" when current language is English

#### Scenario: Clicking the toggle switches language
- **WHEN** the user clicks the language toggle button
- **THEN** the language SHALL switch (zh→en or en→zh), all visible text SHALL update immediately without page reload, and the `<html lang>` attribute SHALL update

### Requirement: Language persistence
The system SHALL persist the user's language choice in localStorage under the key `solohelm-lang`.

#### Scenario: Language saved on change
- **WHEN** the user switches language
- **THEN** the value (`zh` or `en`) SHALL be written to `localStorage.setItem('solohelm-lang', lang)`

#### Scenario: Language restored on load
- **WHEN** the page loads and `localStorage.getItem('solohelm-lang')` returns a value
- **THEN** the system SHALL use that value as the current language

#### Scenario: Default language when no preference stored
- **WHEN** the page loads and no `solohelm-lang` key exists in localStorage
- **THEN** the system SHALL default to `zh` (Chinese)

### Requirement: Dynamic content re-translation
The system SHALL re-translate all dynamically generated content when the language changes.

#### Scenario: Kanban cards and empty states update
- **WHEN** the language is switched while the Board tab is active
- **THEN** all card action buttons, empty state messages, and column headers SHALL display in the new language

#### Scenario: Charts re-render with new labels
- **WHEN** the language is switched while the Analytics tab is active
- **THEN** all Chart.js instances SHALL be destroyed and recreated with translated labels

#### Scenario: Toast messages use current language
- **WHEN** a toast is triggered after a language switch
- **THEN** the toast message SHALL display in the currently active language
