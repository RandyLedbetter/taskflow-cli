# Sample Project: TaskFlow CLI

A command-line task management tool for developers who live in the terminal.

---

## Project Vision

**TaskFlow** is a minimalist, keyboard-driven task manager built for developers. Unlike heavy GUI apps, TaskFlow lives in your terminal and integrates with your workflow.

### The Problem

Developers constantly switch between coding and task management:
- Jira/Asana require leaving the terminal
- Sticky notes get lost
- Text files lack structure
- Existing CLI tools are either too simple or too complex

### The Solution

A CLI tool that:
- Stores tasks in a local `.taskflow.yaml` file (version-controllable!)
- Supports quick capture without breaking flow
- Shows tasks in a beautiful terminal UI
- Integrates with git commits

---

## Target User

Solo developers and small teams who:
- Spend most of their day in the terminal
- Want tasks stored alongside code
- Prefer keyboard over mouse
- Value simplicity over features

---

## Core Features (MVP)

### 1. Quick Task Capture
```bash
tf add "Fix login bug"
tf add "Write tests for API" --priority high
tf add "Refactor database layer" --tag backend
```

### 2. List & Filter Tasks
```bash
tf list                    # All open tasks
tf list --done             # Completed tasks  
tf list --tag backend      # Filter by tag
tf list --priority high    # Filter by priority
```

### 3. Task Management
```bash
tf done 1                  # Mark task #1 complete
tf edit 2                  # Edit task #2
tf delete 3                # Delete task #3
tf move 1 --priority low   # Change priority
```

### 4. Beautiful Display
```
┌─────────────────────────────────────────────────┐
│  TaskFlow - 3 tasks                             │
├─────────────────────────────────────────────────┤
│  🔴 #1 Fix login bug                    [high]  │
│  🟡 #2 Write tests for API           [medium]  │
│  🟢 #3 Refactor database layer          [low]  │
└─────────────────────────────────────────────────┘
```

### 5. Git Integration (Nice to Have)
```bash
tf commit 1               # Git commit with task reference
# Creates: "fix: Fix login bug (closes #1)"
```

---

## Technical Constraints

- **Language:** Node.js (for easy npm distribution)
- **Storage:** YAML file (human-readable, git-friendly)
- **Dependencies:** Minimal (chalk for colors, js-yaml for parsing)
- **No server:** Everything local

---

## Version Control & Remote Repository

> ⚠️ **IMPORTANT:** Before starting development, ensure your local folder is synced to the remote repository.

### Remote Repository
- **URL:** https://github.com/RandyLedbetter/taskflow-cli.git

### Setup Instructions
```bash
# If starting fresh, clone the repository first:
git clone https://github.com/RandyLedbetter/taskflow-cli.git
cd taskflow-cli

# If you already have a local folder, add the remote:
git remote add origin https://github.com/RandyLedbetter/taskflow-cli.git
git fetch origin
git branch --set-upstream-to=origin/master master
```

### Incremental Push Requirement

**All development work must be pushed incrementally to the remote repository.** This means:

1. **Commit frequently** - Make small, focused commits after completing each logical unit of work
2. **Push after each feature/task** - Don't accumulate multiple features before pushing
3. **Use descriptive commit messages** - Follow conventional commit format (e.g., `feat:`, `fix:`, `docs:`)
4. **Sync before starting work** - Always `git pull` before beginning new work to avoid conflicts

```bash
# Example workflow for each task:
git pull origin master           # Sync with remote
# ... make changes ...
git add .
git commit -m "feat: add task list command"
git push origin master           # Push incrementally
```

### Why Incremental Pushes?
- Enables collaboration and code review
- Provides backup of work in progress
- Creates a clear history of development
- Allows rollback to specific features if needed

---

## Data Model

```yaml
# .taskflow.yaml
version: 1
tasks:
  - id: 1
    text: "Fix login bug"
    priority: high
    tags: [bug, auth]
    status: open
    created: 2025-01-15
    
  - id: 2
    text: "Write tests for API"
    priority: medium
    tags: [testing]
    status: done
    created: 2025-01-14
    completed: 2025-01-15
```

---

## Suggested Specs to Create

Use this project to test cursor-agent-os by creating these specs:

1. **task-storage** - YAML file storage and data model
2. **task-add** - Quick task capture command
3. **task-list** - List and filter tasks
4. **task-done** - Mark tasks complete
5. **task-display** - Beautiful terminal UI

---

## How to Test cursor-agent-os With This Project

### Step 1: Initialize
```bash
cd /c/dev/cursor-agent-os-testing
cursor-agent-os init --yes
```

### Step 2: Plan the Product
In Cursor chat:
```
Read SAMPLE_PROJECT.md and then let's do /plan-product
```

The AI will guide you through defining vision.md and roadmap.md based on this brief.

### Step 3: Shape Your First Spec
```
Let's do /shape-spec for the task-storage feature
```

### Step 4: Write the Spec
```
Now /write-spec to complete docs/specs/task-storage.md
```

### Step 5: Create Tasks
```
/create-tasks for task-storage
```

### Step 6: Implement
```
/implement task-storage-1
```

### Step 7: Repeat for Other Features
Work through task-add, task-list, etc.

---

## Expected Outcome

By the end, you should have:
- A working CLI tool structure
- Multiple specs in `docs/specs/`
- Tasks tracked in `docs/sprint.yaml`
- Actual code implementing the features

This exercises the full cursor-agent-os workflow!

---

## Stretch Goals (If Time Permits)

- **task-edit** - Edit existing tasks
- **task-search** - Full-text search
- **task-export** - Export to markdown
- **git-integration** - Auto-reference in commits

---

Happy building! 🚀

