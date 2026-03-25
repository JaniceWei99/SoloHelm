## ADDED Requirements

### Requirement: Voice input button on Ideas page
The Ideas Pool modal SHALL include a voice input button next to the Description field label. The button SHALL use a microphone icon and be styled as a circular accent-colored button.

#### Scenario: Voice button visible on Ideas page
- **WHEN** the modal is opened on the Ideas Pool page
- **THEN** a microphone button SHALL be visible next to the Description label

### Requirement: Voice recording with Web Speech API
When the user clicks the voice button, the system SHALL start speech recognition using `SpeechRecognition` or `webkitSpeechRecognition` with language set to `zh-CN`. The recognized transcript SHALL be appended to the Description textarea after simplification (trailing punctuation removed).

#### Scenario: Record and transcribe voice input
- **WHEN** user clicks the microphone button and speaks "Add dark mode support"
- **THEN** the system SHALL append the simplified transcript to the Description field and stop recording

#### Scenario: Toggle recording off
- **WHEN** user clicks the microphone button while recording is active
- **THEN** the system SHALL stop the speech recognition session

### Requirement: Visual recording state
While recording, the voice button SHALL display a red background with a pulsing animation to indicate active recording. When recording stops, the button SHALL return to its default style.

#### Scenario: Recording indicator
- **WHEN** speech recognition is active
- **THEN** the microphone button SHALL have a red background and pulsing animation

### Requirement: Graceful degradation for unsupported browsers
If the browser does not support the Web Speech API, the voice button SHALL be visually dimmed and clicking it SHALL show an alert message instructing the user to type manually.

#### Scenario: Unsupported browser fallback
- **WHEN** the page loads in a browser without SpeechRecognition support
- **THEN** the voice button SHALL have reduced opacity and clicking it SHALL display an alert saying "Voice input is not supported in your browser. Please type your description manually."
