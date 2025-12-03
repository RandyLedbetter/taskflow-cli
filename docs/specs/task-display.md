# Feature Specification: task-display

> **Status:** Ready
> **Author:** AI Assistant
> **Created:** 2025-12-03
> **Last Updated:** 2025-12-03
> **Appetite:** Small (1-2 hours)

## Overview

The `tf show` command for displaying detailed information about a single task. This provides visibility into all task fields and completes the core task management workflow.

## Problem Statement

### The Problem
Users need to view full details of a specific task. The `tf list` command shows a summary, but sometimes you need to see all fields (like creation date, tags, completion date).

### Current State
`tf list` shows tasks in a compact format. There's no way to inspect a single task in detail.

### Impact
**Medium** — Nice to have for visibility. Most info is visible in list, but dates and full details are not.

## Proposed Solution

### User Experience

View task details:
```bash
tf show 1
```

### Command Syntax

```
tf show <id>

Arguments:
  id              Task ID to display (required)

Options:
  -h, --help      Show help for show command
```

### Output Format

**Open task:**
```
Task #1
  Text:     Fix login bug
  Priority: high
  Status:   open
  Tags:     #backend #urgent
  Created:  2025-12-03
```

**Completed task:**
```
Task #3
  Text:     Set up CI pipeline
  Priority: medium
  Status:   done ✓
  Tags:     #devops
  Created:  2025-12-01
  Completed: 2025-12-03
```

**Task with no tags:**
```
Task #2
  Text:     Review PR
  Priority: low
  Status:   open
  Created:  2025-12-03
```

### Error Messages

**Task not found:**
```
Error: Task #99 not found

Run 'tf list --all' to see available tasks.
```

**No ID provided:**
```
Error: Task ID is required

Usage: tf show <id>

Example: tf show 1
```

**Invalid ID format:**
```
Error: Invalid task ID "abc"

Task ID must be a number.
```

## User Stories

### Story 1: View Task Details
**As a** developer
**I want to** see all details of a specific task
**So that** I can understand its full context

**Acceptance Criteria:**
- [ ] Given I run `tf show 1`, then I see task #1's full details
- [ ] Given task has tags, then tags are displayed with # prefix
- [ ] Given task has no tags, then Tags line is omitted
- [ ] Given task is done, then Completed date is shown
- [ ] Given task is open, then Completed line is omitted

### Story 2: Handle Invalid ID
**As a** developer
**I want to** see a helpful error when I use a wrong task ID
**So that** I can quickly fix my mistake

**Acceptance Criteria:**
- [ ] Given task #99 doesn't exist, when I run `tf show 99`, then I see "Task #99 not found"
- [ ] Given I run `tf show abc`, then I see "Invalid task ID"
- [ ] Given I run `tf show`, then I see "Task ID is required" with usage hint

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
│               Show Command Handler                   │
│              (src/commands/show.js)                  │
│  - Parse arguments                                   │
│  - Find task by ID                                   │
│  - Format output                                     │
└─────────────────────┬───────────────────────────────┘
                      │ uses
                      ▼
┌─────────────────────────────────────────────────────┐
│                 Storage Module                       │
│               (src/storage.js)                       │
│              loadTasks                               │
└─────────────────────────────────────────────────────┘
```

### Key Components

- **`src/commands/show.js`** — Show command handler
  - `parseShowArgs(args)` — Parse CLI arguments (reuse pattern from done)
  - `formatTaskDetails(task)` — Format task for detailed display
  - `runShow(args)` — Execute show command

### Reusable Components

From `src/commands/done.js`:
- `validateTaskId()` — Same ID validation logic
- `findTaskById()` — Same task lookup logic

### API Design

```javascript
// src/commands/show.js

/**
 * Run the show command
 * @param {string[]} args - Command line arguments after "show"
 * @returns {{ success: boolean, output: string, exitCode: number }}
 */
function runShow(args) { }

/**
 * Parse show command arguments
 * @param {string[]} args - Raw arguments
 * @returns {{ id: string|null, help: boolean }}
 */
function parseShowArgs(args) { }

/**
 * Format task details for display
 * @param {Object} task - Task to format
 * @returns {string} Formatted multi-line output
 */
function formatTaskDetails(task) { }
```

### Dependencies

- **Existing:** `src/storage.js` (loadTasks)
- **Reuse from done.js:** validateTaskId, findTaskById patterns

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| `tf show` (no ID) | Error: "Task ID is required" + usage |
| `tf show abc` | Error: "Invalid task ID" |
| `tf show 0` | Error: "Task #0 not found" |
| `tf show -1` | Error: "Invalid task ID" |
| `tf show 999` | Error: "Task #999 not found" + suggestion |
| `tf show 1` (open task) | Show details without Completed line |
| `tf show 1` (done task) | Show details with Completed line |
| `tf show 1` (no tags) | Omit Tags line |
| No `.taskflow.yaml` | Error: "Task #1 not found" |

## Out of Scope

- [ ] Edit task inline (`tf show 1 --edit`)
- [ ] JSON output (`tf show 1 --json`)
- [ ] Multiple tasks (`tf show 1 2 3`)
- [ ] Task history/changelog
- [ ] Colored output (keep it simple)

## Open Questions

All resolved during shaping:
- [x] ~~Command name~~ → `show`
- [x] ~~Output format~~ → Compact, field per line
- [x] ~~Which fields~~ → Conditional based on task state

## Implementation Tasks

Generated by `/create-tasks` on 2025-12-03:

| ID | Task | Estimate | Status |
|----|------|----------|--------|
| `task-display-1` | Create show command with formatting | 1h | pending |
| `task-display-2` | Wire up CLI routing for show command | 0.5h | pending |

**Total:** 1.5 hours (within 1-2h appetite)

See `docs/sprint.yaml` for full task details.

---

## Test Cases

### Unit Tests

```javascript
describe('show command', () => {
  describe('parseShowArgs', () => {
    it('parses task ID');
    it('returns null ID for empty args');
    it('parses --help flag');
  });

  describe('formatTaskDetails', () => {
    it('formats open task');
    it('formats done task with completed date');
    it('includes tags when present');
    it('omits tags when empty');
    it('shows status with checkmark for done');
  });

  describe('runShow', () => {
    it('displays task details');
    it('returns error for missing ID');
    it('returns error for invalid ID');
    it('returns error for non-existent task');
    it('shows help with --help');
  });
});
```

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | AI Assistant | Initial spec from shaping session |

