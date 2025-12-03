# Feature Specification: task-list

> **Status:** Ready
> **Author:** AI Assistant
> **Created:** 2025-12-03
> **Last Updated:** 2025-12-03
> **Appetite:** Small (2-3 hours)

## Overview

The `tf list` command for displaying tasks with filtering options. This is the primary way users view and review their tasks.

## Problem Statement

### The Problem
Users need to see their tasks at a glance to decide what to work on next. Without a list command, they'd have to read the raw YAML file.

### Current State
Tasks can be added with `tf add`. The storage layer can load tasks. But there's no way to view them from the CLI.

### Impact
**High** — Core functionality. Users can't use TaskFlow effectively without seeing their tasks.

## Proposed Solution

### User Experience

List all open tasks:
```bash
tf list
```

Filter by status, priority, or tag:
```bash
tf list --done              # Completed tasks
tf list --all               # All tasks
tf list --priority high     # High priority only
tf list --tag backend       # Tagged "backend"
tf list -p high -t api      # Combine filters (AND logic)
```

### Command Syntax

```
tf list [options]

Options:
  --done              Show completed tasks only
  -a, --all           Show all tasks (open + done)
  -p, --priority      Filter by priority: high, medium, low
  -t, --tag           Filter by tag (can combine with other filters)
  -h, --help          Show help for list command
```

### Output Format

**Open tasks (default):**
```
🔴 #1 Fix login bug [high]
🟡 #2 Write tests [medium] #api
🟢 #3 Refactor DB [low] #backend
```

**Priority indicators:**
- 🔴 = high
- 🟡 = medium  
- 🟢 = low

**Completed tasks (with --done or --all):**
```
✅ #4 Setup project [medium] (done)
```

**With tags:**
```
🔴 #1 Fix login bug [high] #urgent #auth
```

**Empty states:**
```
No open tasks. Use 'tf add "task"' to create one.
```

```
No high priority tasks found.
```

```
No tasks with tag "backend" found.
```

### Sort Order

Tasks are sorted by priority (high → medium → low), then by ID within each priority level.

## User Stories

### Story 1: List Open Tasks
**As a** developer
**I want to** see all my open tasks
**So that** I can decide what to work on

**Acceptance Criteria:**
- [ ] Given I run `tf list`, then I see all open tasks
- [ ] Given I run `tf list`, then completed tasks are hidden
- [ ] Given tasks exist, then they are sorted by priority (high first)
- [ ] Given no tasks exist, then I see a helpful message

### Story 2: List Completed Tasks
**As a** developer
**I want to** see my completed tasks
**So that** I can review what I've done

**Acceptance Criteria:**
- [ ] Given I run `tf list --done`, then I see only completed tasks
- [ ] Given I run `tf list --all`, then I see both open and completed tasks
- [ ] Given completed tasks are shown, then they display with ✅ indicator

### Story 3: Filter by Priority
**As a** developer
**I want to** filter tasks by priority
**So that** I can focus on urgent items

**Acceptance Criteria:**
- [ ] Given I run `tf list -p high`, then I see only high priority tasks
- [ ] Given I run `tf list --priority medium`, then I see only medium priority
- [ ] Given no tasks match, then I see "No high priority tasks found."

### Story 4: Filter by Tag
**As a** developer
**I want to** filter tasks by tag
**So that** I can focus on a specific area

**Acceptance Criteria:**
- [ ] Given I run `tf list -t backend`, then I see only tasks with "backend" tag
- [ ] Given I run `tf list --tag api`, then I see only tasks with "api" tag
- [ ] Given no tasks have the tag, then I see "No tasks with tag 'api' found."

### Story 5: Combine Filters
**As a** developer
**I want to** combine multiple filters
**So that** I can narrow down my task view

**Acceptance Criteria:**
- [ ] Given I run `tf list -p high -t api`, then I see high priority API tasks
- [ ] Given I run `tf list --done -t backend`, then I see completed backend tasks
- [ ] Filters use AND logic (all conditions must match)

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
│               List Command Handler                   │
│              (src/commands/list.js)                  │
│  - Parse arguments                                   │
│  - Filter tasks                                      │
│  - Format output                                     │
└─────────────────────┬───────────────────────────────┘
                      │ uses
                      ▼
┌─────────────────────────────────────────────────────┐
│                 Storage Module                       │
│               (src/storage.js)                       │
│                   loadTasks                          │
└─────────────────────────────────────────────────────┘
```

### Key Components

- **`src/commands/list.js`** — List command handler
  - `parseListArgs(args)` — Parse CLI arguments
  - `filterTasks(tasks, filters)` — Apply filters to tasks
  - `sortTasks(tasks)` — Sort by priority then ID
  - `formatTaskList(tasks, filters)` — Format output with colors
  - `runList(args)` — Execute list command

### Filter Logic

```javascript
function filterTasks(tasks, filters) {
  return tasks.filter(task => {
    // Status filter
    if (filters.done && task.status !== 'done') return false;
    if (!filters.done && !filters.all && task.status === 'done') return false;
    
    // Priority filter
    if (filters.priority && task.priority !== filters.priority) return false;
    
    // Tag filter
    if (filters.tag && !task.tags.includes(filters.tag)) return false;
    
    return true;
  });
}
```

### Sort Logic

```javascript
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.id - b.id;
  });
}
```

### API Design

```javascript
// src/commands/list.js

/**
 * Run the list command
 * @param {string[]} args - Command line arguments after "list"
 * @returns {{ success: boolean, output: string, exitCode: number }}
 */
function runList(args) { }

/**
 * Parse list command arguments
 * @param {string[]} args - Raw arguments
 * @returns {{ done: boolean, all: boolean, priority: string|null, tag: string|null, help: boolean }}
 */
function parseListArgs(args) { }

/**
 * Filter tasks based on criteria
 * @param {Array} tasks - All tasks
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered tasks
 */
function filterTasks(tasks, filters) { }

/**
 * Sort tasks by priority then ID
 * @param {Array} tasks - Tasks to sort
 * @returns {Array} Sorted tasks
 */
function sortTasks(tasks) { }

/**
 * Format a single task for display
 * @param {Object} task - Task to format
 * @returns {string} Formatted line
 */
function formatTask(task) { }

/**
 * Format the full task list output
 * @param {Array} tasks - Filtered and sorted tasks
 * @param {Object} filters - Active filters (for empty state messages)
 * @returns {string} Complete output
 */
function formatTaskList(tasks, filters) { }
```

### Dependencies

- **Existing:** `src/storage.js` (loadTasks)
- **Optional:** `chalk` for colors (can use Unicode for now)

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| No `.taskflow.yaml` | "No open tasks. Use 'tf add \"task\"' to create one." |
| Empty task file | Same as above |
| All tasks done | "No open tasks..." (with `tf list`) |
| No matches for filter | Context-aware message |
| Invalid priority | Error: "Invalid priority. Use: high, medium, low" |
| Unknown flag | Error + show help |
| `--done` with `-p` | Filter completed tasks by priority |
| Task has no tags | Don't show tag section |
| Task has multiple tags | Show all: `#tag1 #tag2` |

## Out of Scope

- [ ] Pagination for large task lists
- [ ] Full-text search
- [ ] Interactive task selection
- [ ] Export to markdown/file
- [ ] Custom sort order flag
- [ ] Multiple tag filters (`-t bug -t urgent` = OR)
- [ ] Negation filters (`--not-tag`)

## Open Questions

All resolved during shaping:
- [x] ~~Default view~~ → Open tasks only
- [x] ~~Sort order~~ → Priority (high→low), then ID
- [x] ~~Filter logic~~ → AND (all must match)
- [x] ~~Output format~~ → Emoji indicators + brackets

## Implementation Tasks

Generated by `/create-tasks` on 2025-12-03:

| ID | Task | Estimate | Status |
|----|------|----------|--------|
| `task-list-1` | Create list command with filtering and formatting | 1.5h | ✅ done |
| `task-list-2` | Wire up CLI routing for list command | 0.5h | ✅ done |

**Total:** 2 hours (within 2-3h appetite) — **COMPLETE**

See `docs/sprint.yaml` for full task details.

---

## Test Cases

### Unit Tests

```javascript
describe('list command', () => {
  describe('parseListArgs', () => {
    it('parses --done flag');
    it('parses --all / -a flag');
    it('parses --priority / -p with value');
    it('parses --tag / -t with value');
    it('parses combined flags');
    it('returns defaults when no flags');
  });

  describe('filterTasks', () => {
    it('filters out done tasks by default');
    it('shows only done tasks with done filter');
    it('shows all tasks with all filter');
    it('filters by priority');
    it('filters by tag');
    it('combines filters with AND logic');
  });

  describe('sortTasks', () => {
    it('sorts by priority (high first)');
    it('sorts by ID within same priority');
    it('handles empty array');
  });

  describe('formatTask', () => {
    it('formats high priority with red indicator');
    it('formats medium priority with yellow indicator');
    it('formats low priority with green indicator');
    it('formats done task with checkmark');
    it('includes tags when present');
    it('omits tags section when empty');
  });

  describe('formatTaskList', () => {
    it('formats multiple tasks');
    it('shows empty state for no tasks');
    it('shows context-aware empty state for filters');
  });

  describe('runList', () => {
    it('lists open tasks');
    it('lists done tasks');
    it('filters by priority');
    it('filters by tag');
    it('shows help with --help');
  });
});
```

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | AI Assistant | Initial spec from shaping session |

