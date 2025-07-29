# Trace Element Design Instructions

## Purpose
The Trace Element is a custom web component designed to display debug, trace, or log information in a structured and user-friendly way. It is intended for use in developer tools, chat widgets, or any application where real-time or historical netork or workflow trace data needs to be visualized.
- **Directional Arrows**: Visual arrows indicate log direction:
  - `→` Outbound (to Claude or external service)
  - `←` Inbound (response from server)
  - `↓` User input
  - `↑` UI update: teal. When a UI update is logged, the entire data object passed up should be included. This must show any errors, reasons for failures, and the response code if present.
- **Dark/Light Mode**: Adapts to parent or system theme.
## Structure
```
  <!-- Most recent log entries appear at the top -->
  <div class="trace-entry info">[12:00:05] ↓ USER: Newest message</div>
  <div class="trace-entry outgoing">[12:00:04] → TO CLAUDE: Payload sent</div>
  <div class="trace-entry incoming">[12:00:03] ← FROM CLAUDE: Response received</div>
  <div class="trace-entry ui">[12:00:02] ↑ TO UI: Response displayed { "response": "...", "error": null, "reason": null, "status": 200 }</div>
  <div class="trace-entry error">[12:00:01] Error: API failed</div>
  ...
    <button class="trace-toggle">Collapse</button>
  </div>
  <div class="trace-controls">
    <select class="trace-level-filter">
      <option value="all">All</option>
      <option value="info">Info</option>
      <option value="warning">Warning</option>
      <option value="error">Error</option>
      <option value="success">Success</option>
    </select>
  </div>
  <div class="trace-log">
    <!-- Log entries go here -->
    <div class="trace-entry info">[12:00:01] ↓ USER: Message sent</div>
    <div class="trace-entry outgoing">[12:00:02] → TO CLAUDE: Payload sent</div>
    <div class="trace-entry incoming">[12:00:03] ← FROM CLAUDE: Response received</div>
    <div class="trace-entry ui">[12:00:04] ↑ TO UI: Response displayed</div>
    <div class="trace-entry error">[12:00:05] Error: API failed</div>
    ...
  </div>
</trace-element>
```

## Styling
- Use CSS custom properties for easy theming.
- Log levels and directions have different colors/icons:
  - `→` Outbound: purple/blue
  - `←` Inbound: green
  - `↓` User input: orange
  - `↑` UI update: teal
- Scrollable log area with max height.
- Responsive and accessible.

- `copy()`: Copy logs to clipboard (triggered by the copy button).
- `clear()`: Clear all logs (triggered by the clear button).
- `addEntry({level, direction, message, data, timestamp})`: Add a new log entry. `direction` can be `outgoing`, `incoming`, `user`, or `ui`. For `ui` direction, the `data` object (including errors, reasons, and response code) must be included.
- `clear()`: Clear all logs.
- `filter(level, text)`: Filter logs by level or text.
- `copy()`: Copy logs to clipboard.
- `export(format)`: Export logs as text or JSON.

## Example Usage
```
const trace = document.querySelector('trace-element');
trace.addEntry({level: 'info', direction: 'user', message: 'Message sent', timestamp: new Date()});
trace.addEntry({level: 'info', direction: 'outgoing', message: 'Payload sent to Claude', timestamp: new Date()});
trace.addEntry({level: 'info', direction: 'incoming', message: 'Response from Claude', timestamp: new Date()});
trace.addEntry({level: 'info', direction: 'ui', message: 'Response displayed in UI', timestamp: new Date()});
```

## Accessibility
- Keyboard accessible controls.
- ARIA labels for buttons.
- High contrast support.

## Extensibility
- Allow custom log levels via attribute/property.
- Support for grouping/collapsing log sections.
- Optionally support streaming logs from a source.

---
This design provides a robust, extensible, and user-friendly trace/log viewer for modern web applications.
