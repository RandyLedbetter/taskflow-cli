# Feature Specification: task-add

> **Status:** Ready
> **Author:** AI Assistant
> **Created:** 2025-12-03
> **Last Updated:** 2025-12-03
> **Appetite:** Small (2-3 hours)

## Overview

The `tf add` command for quickly capturing tasks from the terminal. This is the primary way users create tasks in TaskFlow.

## Problem Statement

### The Problem
Developers need to capture tasks instantly without context-switching away from their terminal. Every second spent managing tasks is a second not spent coding.

### Current State
The storage layer (`task-storage`) is complete. Users can programmatically create and save tasks, but there's no CLI interface yet.

### Impact
**High** — This is the primary entry point for task creation. Without it, users can't add tasks.

## Proposed Solution

### User Experience

Add a task in one line:
```bash
tf add "Fix login bug"
```

Add with options:
```bash
tf add "Write tests" --priority high
tf add "Refactor DB" -p low -t backend -t urgent
```

### Command Syntax

```
tf add <text> [options]

Arguments:
  text              Task description (required, quoted string)

Options:
  -p, --priority    Priority level: high, medium, low (default: medium)
  -t, --tag         Add a tag (can be used multiple times)
  -h, --help        Show help for add command
```

### Output Format

**Success (basic):**
```
✓ Added task #1
  "Fix login bug" [medium]
```

**Success (with tags):**
```
✓ Added task #3
  "Refactor DB" [low] #backend #urgent
```

**Error (no text):**
```
Error: Task text is required

Usage: tf add <text> [options]

Example: tf add "Fix the login bug" -p high
```

**Error (empty text):**
```
Error: Task text cannot be empty
```

**Error (invalid priority):**
```
Error: Invalid priority "critical"

Valid priorities: high, medium, low
```

## User Stories

### Story 1: Basic Task Addition
**As a** developer
**I want to** quickly add a task from the command line
**So that** I can capture ideas without breaking my flow

**Acceptance Criteria:**
- [ ] Given I run `tf add "Fix bug"`, then a task is created with text "Fix bug"
- [ ] Given I run `tf add "Fix bug"`, then the task gets the next available ID
- [ ] Given I run `tf add "Fix bug"`, then I see confirmation with task ID and text
- [ ] Given no `.taskflow.yaml` exists, when I run `tf add "First task"`, then the file is created

### Story 2: Add Task with Priority
**As a** developer
**I want to** set priority when adding a task
**So that** I can mark urgent items immediately

**Acceptance Criteria:**
- [ ] Given I run `tf add "Task" --priority high`, then task has priority "high"
- [ ] Given I run `tf add "Task" -p low`, then task has priority "low"
- [ ] Given I run `tf add "Task"` (no priority), then task has priority "medium"
- [ ] Given I run `tf add "Task" -p invalid`, then I see an error with valid options

### Story 3: Add Task with Tags
**As a** developer
**I want to** add tags when creating a task
**So that** I can organize tasks from the start

**Acceptance Criteria:**
- [ ] Given I run `tf add "Task" --tag bug`, then task has tags ["bug"]
- [ ] Given I run `tf add "Task" -t bug -t urgent`, then task has tags ["bug", "urgent"]
- [ ] Given I run `tf add "Task"` (no tags), then task has empty tags []

### Story 4: Error Handling
**As a** developer
**I want to** see clear error messages
**So that** I can fix my input quickly

**Acceptance Criteria:**
- [ ] Given I run `tf add` (no arguments), then I see an error with usage hint
- [ ] Given I run `tf add ""`, then I see "Task text cannot be empty"
- [ ] Given I run `tf add "Task" -p wrong`, then I see valid priority options

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLI Entry                         │
│                  (src/index.js)                      │
└─────────────────────┬───────────────────────────────┘
                      │ routes to
                      ▼
┌─────────────────────────────────────────────────────┐
│               Add Command Handler                    │
│               (src/commands/add.js)                  │
│  - Parse arguments                                   │
│  - Validate input                                    │
│  - Create task                                       │
│  - Output result                                     │
└─────────────────────┬───────────────────────────────┘
                      │ uses
                      ▼
┌─────────────────────────────────────────────────────┐
│                 Storage Module                       │
│               (src/storage.js)                       │
│  loadTasks, saveTasks, createTask, getNextId        │
└─────────────────────────────────────────────────────┘
```

### Key Components

- **`src/commands/add.js`** — Add command handler
  - `parseAddArgs(args)` — Parse CLI arguments
  - `validateAddInput(text, priority)` — Validate inputs
  - `runAdd(args)` — Execute add command
  - `formatOutput(task)` — Format success message

- **`src/index.js`** — Route `add` command to handler

### Argument Parsing

```javascript
// Input: ["Fix bug", "-p", "high", "-t", "backend", "-t", "urgent"]
// Output: { text: "Fix bug", priority: "high", tags: ["backend", "urgent"] }

function parseAddArgs(args) {
  // Manual parsing or use commander/yargs
}
```

### Dependencies

- **Existing:** `src/storage.js` (loadTasks, saveTasks, createTask, getNextId)
- **New:** `chalk` for colored output (optional, can add later)

### API Design

```javascript
// src/commands/add.js

/**
 * Run the add command
 * @param {string[]} args - Command line arguments after "add"
 * @returns {void}
 */
function runAdd(args) { }

/**
 * Parse add command arguments
 * @param {string[]} args - Raw arguments
 * @returns {{ text: string, priority: string, tags: string[] }}
 */
function parseAddArgs(args) { }

/**
 * Validate add command input
 * @param {string} text - Task text
 * @param {string} priority - Priority level
 * @throws {Error} If validation fails
 */
function validateAddInput(text, priority) { }

/**
 * Format success output for added task
 * @param {Object} task - The created task
 * @returns {string} Formatted output string
 */
function formatOutput(task) { }
```

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| `tf add` (no args) | Error + usage hint |
| `tf add ""` | Error: "Task text cannot be empty" |
| `tf add "   "` (whitespace only) | Error: "Task text cannot be empty" |
| `tf add "Task" -p INVALID` | Error: list valid priorities |
| `tf add "Task" -p HIGH` | Accept (case-insensitive) |
| `tf add "Task" -t ""` | Ignore empty tag |
| `tf add "Task with 'quotes'"` | Handle correctly |
| `tf add Task without quotes` | Treat "Task" as text, rest as unknown args → error |
| Very long task text | Allow (no limit) |
| First task ever | Auto-create `.taskflow.yaml`, ID = 1 |

## Out of Scope

- [ ] Interactive mode (prompts for text/priority)
- [ ] Due dates (future feature)
- [ ] Edit immediately after create
- [ ] Bulk add (multiple tasks at once)
- [ ] Task templates
- [ ] Reading text from stdin/file

## Open Questions

All resolved during shaping:
- [x] ~~Flag style~~ → Both long and short flags
- [x] ~~Multiple tags~~ → Repeat the flag
- [x] ~~Output format~~ → Show task ID + text + priority + tags
- [x] ~~Default priority~~ → medium

## Implementation Tasks

Generated by `/create-tasks` on 2025-12-03:

| ID | Task | Estimate | Status |
|----|------|----------|--------|
| `task-add-1` | Create add command with argument parsing | 1.5h | ✅ done |
| `task-add-2` | Wire up CLI routing and error handling | 1h | ✅ done |

**Total:** 2.5 hours (within 2-3h appetite) — **COMPLETE**

See `docs/sprint.yaml` for full task details.

---

## Test Cases

### Unit Tests

```javascript
describe('add command', () => {
  describe('parseAddArgs', () => {
    it('parses text only');
    it('parses text with --priority');
    it('parses text with -p short flag');
    it('parses multiple --tag flags');
    it('parses mixed flags -p and -t');
    it('returns default priority when not specified');
    it('returns empty tags when not specified');
  });

  describe('validateAddInput', () => {
    it('accepts valid text and priority');
    it('throws for empty text');
    it('throws for whitespace-only text');
    it('throws for invalid priority');
    it('accepts priority case-insensitively');
  });

  describe('runAdd', () => {
    it('creates task with defaults');
    it('creates task with priority');
    it('creates task with tags');
    it('auto-creates file if missing');
    it('assigns correct ID');
  });

  describe('formatOutput', () => {
    it('formats basic task');
    it('formats task with tags');
    it('shows correct priority');
  });
});
```

### Integration Tests

```javascript
describe('tf add integration', () => {
  it('end-to-end: add task and verify in file');
  it('end-to-end: add multiple tasks, IDs increment');
});
```

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | AI Assistant | Initial spec from shaping session |

