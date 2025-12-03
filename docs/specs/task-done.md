# Feature Specification: task-done

> **Status:** Ready
> **Author:** AI Assistant
> **Created:** 2025-12-03
> **Last Updated:** 2025-12-03
> **Appetite:** Small (1-2 hours)

## Overview

The `tf done` command for marking tasks as complete. This closes the task management loop — users can now add tasks, list them, and mark them done.

## Problem Statement

### The Problem
Users need to mark tasks as complete when they finish them. Without this, the task list would grow indefinitely and become useless.

### Current State
Tasks can be added with `tf add` and listed with `tf list`. But there's no way to mark them complete from the CLI.

### Impact
**High** — Core functionality. Completing tasks is essential to the task management workflow.

## Proposed Solution

### User Experience

Mark a task as complete:
```bash
tf done 1
```

### Command Syntax

```
tf done <id>

Arguments:
  id              Task ID to mark as complete (required)

Options:
  -h, --help      Show help for done command
```

### Output Format

**Success:**
```
✓ Completed task #1
  "Fix login bug" [high] → done
```

**Already complete:**
```
Task #1 was already complete
  "Fix login bug" [high]
```

**Task not found:**
```
Error: Task #1 not found

Run 'tf list --all' to see available tasks.
```

**No ID provided:**
```
Error: Task ID is required

Usage: tf done <id>

Example: tf done 1
```

**Invalid ID format:**
```
Error: Invalid task ID "abc"

Task ID must be a number.
```

## User Stories

### Story 1: Mark Task Complete
**As a** developer
**I want to** mark a task as done
**So that** I can track my progress

**Acceptance Criteria:**
- [ ] Given I run `tf done 1`, then task #1 status changes to "done"
- [ ] Given I run `tf done 1`, then task #1 completed date is set to today
- [ ] Given I run `tf done 1`, then I see confirmation with task details
- [ ] Given the task is marked done, then `tf list` no longer shows it

### Story 2: Handle Already Complete
**As a** developer
**I want to** not get an error if I accidentally mark the same task done twice
**So that** I don't have to remember what I've already done

**Acceptance Criteria:**
- [ ] Given task #1 is already done, when I run `tf done 1`, then I see a warning
- [ ] Given task #1 is already done, when I run `tf done 1`, then the command succeeds (exit 0)
- [ ] Given task #1 is already done, when I run `tf done 1`, then the completed date is not changed

### Story 3: Handle Invalid ID
**As a** developer
**I want to** see a helpful error when I use a wrong task ID
**So that** I can quickly fix my mistake

**Acceptance Criteria:**
- [ ] Given task #99 doesn't exist, when I run `tf done 99`, then I see "Task #99 not found"
- [ ] Given I run `tf done abc`, then I see "Invalid task ID"
- [ ] Given I run `tf done`, then I see "Task ID is required" with usage hint

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
│               Done Command Handler                   │
│              (src/commands/done.js)                  │
│  - Parse arguments                                   │
│  - Find task by ID                                   │
│  - Update status                                     │
│  - Save and output                                   │
└─────────────────────┬───────────────────────────────┘
                      │ uses
                      ▼
┌─────────────────────────────────────────────────────┐
│                 Storage Module                       │
│               (src/storage.js)                       │
│           loadTasks, saveTasks, getTodayDate         │
└─────────────────────────────────────────────────────┘
```

### Key Components

- **`src/commands/done.js`** — Done command handler
  - `parseDoneArgs(args)` — Parse CLI arguments
  - `validateTaskId(id)` — Validate ID is a number
  - `findTaskById(tasks, id)` — Find task in array
  - `markTaskDone(task)` — Update task status and completed date
  - `formatOutput(task, wasAlreadyDone)` — Format success/warning message
  - `runDone(args)` — Execute done command

### API Design

```javascript
// src/commands/done.js

/**
 * Run the done command
 * @param {string[]} args - Command line arguments after "done"
 * @returns {{ success: boolean, output: string, exitCode: number }}
 */
function runDone(args) { }

/**
 * Parse done command arguments
 * @param {string[]} args - Raw arguments
 * @returns {{ id: number|null, help: boolean }}
 */
function parseDoneArgs(args) { }

/**
 * Validate task ID
 * @param {string} idStr - ID string from command line
 * @returns {{ valid: boolean, id: number|null, error: string|null }}
 */
function validateTaskId(idStr) { }

/**
 * Find a task by ID
 * @param {Array} tasks - All tasks
 * @param {number} id - Task ID to find
 * @returns {Object|null} Task or null if not found
 */
function findTaskById(tasks, id) { }

/**
 * Mark a task as done
 * @param {Object} task - Task to mark done
 * @returns {boolean} True if status changed, false if already done
 */
function markTaskDone(task) { }

/**
 * Format success/warning output
 * @param {Object} task - The task
 * @param {boolean} wasAlreadyDone - Whether it was already complete
 * @returns {string} Formatted output
 */
function formatOutput(task, wasAlreadyDone) { }
```

### Dependencies

- **Existing:** `src/storage.js` (loadTasks, saveTasks, getTodayDate)

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| `tf done` (no ID) | Error: "Task ID is required" + usage |
| `tf done abc` | Error: "Invalid task ID" |
| `tf done 0` | Error: "Task #0 not found" (IDs start at 1) |
| `tf done -1` | Error: "Invalid task ID" |
| `tf done 1.5` | Error: "Invalid task ID" (must be integer) |
| `tf done 999` | Error: "Task #999 not found" + suggestion |
| `tf done 1` (already done) | Warning: "Task #1 was already complete" |
| `tf done 1` (open task) | Success: mark done, set completed date |
| No `.taskflow.yaml` | Error: "Task #1 not found" |

## Out of Scope

- [ ] Undo/reopen tasks (`tf undone`)
- [ ] Multiple IDs at once (`tf done 1 2 3`)
- [ ] ID ranges (`tf done 1-5`)
- [ ] Mark as cancelled/won't do
- [ ] Delete tasks (different from done)
- [ ] Confirmation prompt

## Open Questions

All resolved during shaping:
- [x] ~~Multiple IDs~~ → Single ID only (for now)
- [x] ~~Already done behavior~~ → Warn but succeed
- [x] ~~Output format~~ → Show task details

## Implementation Tasks

Generated by `/create-tasks` on 2025-12-03:

| ID | Task | Estimate | Status |
|----|------|----------|--------|
| `task-done-1` | Create done command with validation and output | 1h | pending |
| `task-done-2` | Wire up CLI routing for done command | 0.5h | pending |

**Total:** 1.5 hours (within 1-2h appetite)

See `docs/sprint.yaml` for full task details.

---

## Test Cases

### Unit Tests

```javascript
describe('done command', () => {
  describe('parseDoneArgs', () => {
    it('parses task ID');
    it('returns null ID for empty args');
    it('parses --help flag');
  });

  describe('validateTaskId', () => {
    it('accepts valid integer');
    it('rejects non-numeric string');
    it('rejects negative numbers');
    it('rejects decimals');
    it('rejects zero');
  });

  describe('findTaskById', () => {
    it('finds task by ID');
    it('returns null for non-existent ID');
    it('returns null for empty array');
  });

  describe('markTaskDone', () => {
    it('sets status to done');
    it('sets completed date');
    it('returns true for status change');
    it('returns false if already done');
    it('does not change completed date if already done');
  });

  describe('formatOutput', () => {
    it('formats success message');
    it('formats already-done warning');
    it('includes task details');
  });

  describe('runDone', () => {
    it('marks task complete');
    it('handles already-done task');
    it('returns error for missing ID');
    it('returns error for invalid ID');
    it('returns error for non-existent task');
    it('persists change to file');
  });
});
```

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | AI Assistant | Initial spec from shaping session |

