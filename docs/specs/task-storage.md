# Feature Specification: task-storage

> **Status:** Ready
> **Author:** AI Assistant
> **Created:** 2025-12-03
> **Last Updated:** 2025-12-03
> **Appetite:** Small-Medium (4-6 hours)

## Overview

The storage layer for TaskFlow CLI. Handles reading and writing tasks to a local `.taskflow.yaml` file. This is the foundation that all other features (add, list, done, etc.) depend on.

## Problem Statement

### The Problem
TaskFlow needs persistent storage to save tasks between CLI invocations. Without this, tasks would be lost when the terminal closes.

### Current State
This is greenfield — no storage exists yet. This spec defines the foundational layer.

### Impact
**Critical** — No other feature can be built until storage works. This unblocks the entire MVP.

## Proposed Solution

### User Experience
Storage is invisible to users — they interact via commands like `tf add` and `tf list`. The storage layer silently:
- Creates `.taskflow.yaml` when first task is added
- Loads tasks when any command runs
- Saves tasks after modifications

### File Location
Tasks are stored in `.taskflow.yaml` in the **current working directory**. This enables:
- One task list per project
- Version control alongside code
- No global configuration needed

### File Format

```yaml
version: 1
tasks:
  - id: 1
    text: "Fix login bug"
    priority: high
    tags:
      - bug
      - auth
    status: open
    created: "2025-12-03"
    completed: null

  - id: 2
    text: "Write unit tests"
    priority: medium
    tags: []
    status: done
    created: "2025-12-02"
    completed: "2025-12-03"
```

## User Stories

### Story 1: Auto-Create Task File
**As a** developer
**I want** TaskFlow to automatically create a task file
**So that** I can start adding tasks without any setup

**Acceptance Criteria:**
- [ ] Given no `.taskflow.yaml` exists, when I add a task, then the file is created automatically
- [ ] Given no `.taskflow.yaml` exists, when I list tasks, then an empty list is returned (no error)
- [ ] Given the file is created, then it contains `version: 1` and an empty `tasks: []` array

### Story 2: Load Tasks
**As a** developer
**I want** to load all tasks from the file
**So that** I can display and manipulate them

**Acceptance Criteria:**
- [ ] Given a valid `.taskflow.yaml`, when I load tasks, then all tasks are returned as an array
- [ ] Given an empty file, when I load tasks, then an empty array is returned
- [ ] Given a file with `tasks: []`, when I load tasks, then an empty array is returned
- [ ] Given a corrupted/invalid YAML file, when I load tasks, then a helpful error message is shown

### Story 3: Save Tasks
**As a** developer
**I want** to save tasks back to the file
**So that** changes persist between sessions

**Acceptance Criteria:**
- [ ] Given a list of tasks, when I save, then the file is written with correct YAML format
- [ ] Given tasks are saved, when I reload, then the same tasks are returned
- [ ] Given the file doesn't exist, when I save, then it is created

### Story 4: Generate Task IDs
**As a** developer
**I want** each task to have a unique ID
**So that** I can reference tasks by number

**Acceptance Criteria:**
- [ ] Given no tasks exist, when I add a task, then it gets ID 1
- [ ] Given tasks with IDs 1, 2, 3 exist, when I add a task, then it gets ID 4
- [ ] Given tasks with IDs 1, 3 exist (2 was deleted), when I add a task, then it gets ID 4 (not 2)
- [ ] Given a task file was manually edited with ID 100, when I add a task, then it gets ID 101

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLI Commands                       │
│              (add, list, done, etc.)                │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                 Storage Module                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────────┐   │
│  │  loadTasks │  │ saveTasks │  │ generateNextId│   │
│  └───────────┘  └───────────┘  └───────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│               .taskflow.yaml                         │
└─────────────────────────────────────────────────────┘
```

### Key Components

- **`storage.js`** — Main module exposing storage functions
  - `loadTasks()` — Read and parse task file
  - `saveTasks(tasks)` — Write tasks to file
  - `getNextId(tasks)` — Calculate next available ID
  - `getTaskFilePath()` — Return path to `.taskflow.yaml`

### Data Model

```typescript
interface Task {
  id: number;           // Auto-incrementing integer, starting at 1
  text: string;         // Task description (required)
  priority: Priority;   // 'high' | 'medium' | 'low'
  tags: string[];       // Array of tag strings
  status: Status;       // 'open' | 'done'
  created: string;      // ISO date string 'YYYY-MM-DD'
  completed: string | null; // ISO date or null if not done
}

type Priority = 'high' | 'medium' | 'low';
type Status = 'open' | 'done';

interface TaskFile {
  version: number;      // Schema version, always 1 for now
  tasks: Task[];
}
```

### Default Values

| Field | Default Value |
|-------|---------------|
| `priority` | `'medium'` |
| `tags` | `[]` |
| `status` | `'open'` |
| `created` | Current date (`YYYY-MM-DD`) |
| `completed` | `null` |

### Dependencies

- **`js-yaml`** — YAML parsing and serialization
- **`fs`** (Node.js built-in) — File system operations
- **`path`** (Node.js built-in) — Path manipulation

### API Design

```javascript
// storage.js

/**
 * Load tasks from .taskflow.yaml in current directory
 * @returns {Task[]} Array of tasks (empty if file doesn't exist)
 * @throws {Error} If file exists but contains invalid YAML
 */
function loadTasks() { }

/**
 * Save tasks to .taskflow.yaml in current directory
 * @param {Task[]} tasks - Array of tasks to save
 */
function saveTasks(tasks) { }

/**
 * Get the next available task ID
 * @param {Task[]} tasks - Current tasks
 * @returns {number} Next ID (max existing ID + 1, or 1 if empty)
 */
function getNextId(tasks) { }

/**
 * Get path to task file in current directory
 * @returns {string} Absolute path to .taskflow.yaml
 */
function getTaskFilePath() { }

/**
 * Create a new task with defaults applied
 * @param {string} text - Task description
 * @param {Partial<Task>} options - Optional overrides
 * @returns {Task} Complete task object
 */
function createTask(text, options = {}) { }
```

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| File doesn't exist | Return empty array (loadTasks), create file (saveTasks) |
| File is empty (0 bytes) | Treat as empty task list |
| File has `tasks: null` | Treat as empty task list |
| File has invalid YAML | Throw error with message: "Invalid .taskflow.yaml: [parse error]" |
| File has wrong permissions | Let Node.js error propagate naturally |
| User manually set ID to 999 | Next ID is 1000 |
| User manually deleted middle IDs | Don't reuse — find max and increment |
| `text` field missing on a task | Skip that task with warning, or fail fast (TBD: fail fast) |
| Unknown fields in YAML | Ignore them (forward compatibility) |

## Out of Scope

Explicitly NOT included in this spec:

- [ ] Schema migrations (version upgrades)
- [ ] File locking for concurrent access
- [ ] Backup/recovery mechanisms
- [ ] Multiple task files per project
- [ ] Global task file (`~/.taskflow.yaml`)
- [ ] Encryption
- [ ] Task validation beyond required fields
- [ ] Archiving completed tasks to separate file

## Open Questions

All questions resolved during shaping:

- [x] ~~File location~~ → Current working directory
- [x] ~~Auto-initialize~~ → Yes, silently
- [x] ~~ID format~~ → Auto-incrementing integers
- [x] ~~Priority levels~~ → high, medium, low
- [x] ~~Default priority~~ → medium

## Implementation Tasks

Generated by `/create-tasks` on 2025-12-03:

| ID | Task | Estimate | Status |
|----|------|----------|--------|
| `task-storage-1` | Project scaffolding and dependencies | 1h | ✅ done |
| `task-storage-2` | Implement loadTasks and saveTasks | 2h | ✅ done |
| `task-storage-3` | Implement getNextId and createTask | 1.5h | ✅ done |

**Total:** 4.5 hours (within 4-6h appetite) — **COMPLETE**

See `docs/sprint.yaml` for full task details.

---

## Test Cases

### Unit Tests

```javascript
describe('storage', () => {
  describe('loadTasks', () => {
    it('returns empty array when file does not exist');
    it('returns empty array when file is empty');
    it('returns tasks when file has valid content');
    it('throws error when file has invalid YAML');
  });

  describe('saveTasks', () => {
    it('creates file if it does not exist');
    it('overwrites existing file');
    it('writes valid YAML format');
    it('preserves all task fields');
  });

  describe('getNextId', () => {
    it('returns 1 for empty array');
    it('returns max + 1 for existing tasks');
    it('handles gaps in IDs');
  });

  describe('createTask', () => {
    it('applies default values');
    it('allows overriding defaults');
    it('sets created date to today');
  });
});
```

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | AI Assistant | Initial spec from shaping session |

