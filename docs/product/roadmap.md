# Product Roadmap - TaskFlow CLI

> Last Updated: 2025-12-03

## Overview

TaskFlow is built incrementally, starting with core task operations and expanding to richer features. Each milestone delivers a usable tool.

---

## 🎯 MVP (v0.1.0) — Core Task Management

The minimum viable product that delivers real value.

| Feature | Priority | Complexity | Spec |
|---------|----------|------------|------|
| **task-storage** | 🔴 Critical | Low | Storage layer & data model |
| **task-add** | 🔴 Critical | Low | Quick task capture |
| **task-list** | 🔴 Critical | Medium | List and filter tasks |
| **task-done** | 🔴 Critical | Low | Mark tasks complete |
| **task-display** | 🟡 High | Medium | Beautiful terminal UI |

### MVP Definition of Done
- [ ] `tf add "task"` creates a task
- [ ] `tf list` shows all open tasks
- [ ] `tf done <id>` marks a task complete
- [ ] Tasks persist in `.taskflow.yaml`
- [ ] Output is colorized and readable

---

## 🚀 v0.2.0 — Enhanced Workflow

Quality-of-life improvements for daily use.

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **task-edit** | High | Medium | Edit task text/priority/tags |
| **task-delete** | High | Low | Remove tasks |
| **task-move** | Medium | Low | Change priority |
| **init command** | Medium | Low | Create .taskflow.yaml interactively |

---

## 🌟 v0.3.0 — Power Features

Features for power users.

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| **task-search** | Medium | Medium | Full-text search across tasks |
| **git-integration** | Medium | Medium | Auto-reference tasks in commits |
| **task-export** | Low | Low | Export to markdown |
| **due-dates** | Low | Medium | Add optional due dates |

---

## 🧊 Icebox

Features we've decided not to pursue (for now).

| Feature | Reason |
|---------|--------|
| Cloud sync | Conflicts with local-first principle; use git instead |
| Web UI | Out of scope; terminal-only focus |
| Team features | Designed for solo/small team; not a collaboration tool |
| Notifications | Would require background process; keep it simple |

---

## Dependency Graph

```
task-storage (foundation)
    ├── task-add
    ├── task-list
    │       └── task-display (enhances list output)
    ├── task-done
    ├── task-edit
    └── task-delete

git-integration (independent, after MVP)
```

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | Node.js | Easy npm distribution, good CLI libraries |
| Storage | YAML | Human-readable, git-friendly, no database |
| CLI Framework | TBD | Evaluate commander, yargs, or oclif |
| Styling | chalk | Lightweight, widely used |
| YAML Parser | js-yaml | Standard, well-maintained |

---

## Sprint Planning

See `docs/sprint.yaml` for current sprint status.

### Suggested First Sprint
1. `task-storage` — Foundation (must be first)
2. `task-add` — Core capture functionality
3. `task-list` — Core retrieval functionality
4. `task-done` — Complete the basic loop

---

*Use `/shape-spec` to begin specifying individual features.*
