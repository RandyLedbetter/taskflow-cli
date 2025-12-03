# /help - cursor-agent-os Command Reference

> Quick reference for all available workflow commands.

## Available Commands

### Planning & Design

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/plan-product` | Define product vision and roadmap | Starting a new project or major pivot |
| `/shape-spec` | Interview to shape a feature idea | Before writing detailed specs |
| `/write-spec` | Create detailed specification | After shaping, before implementing |

### Implementation

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/create-tasks` | Break spec into implementable tasks | After spec is written |
| `/implement [task-id]` | Implement a specific task (sequential) | When ready to code |
| `/orchestrate` | Orchestrate Cloud Agents for parallel work | For independent tasks |

### Verification

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/verify` | Check implementation against spec | After implementation |

---

## Workflow Overview

```
/plan-product  →  /shape-spec  →  /write-spec  →  /create-tasks  →  /implement   →  /verify
     ↑                                                            or /orchestrate      │
     └────────────────────────────────── iterate ──────────────────────────────────────┘
```

### /implement vs /orchestrate

| Mode | Who does the work | Best for |
|------|------------------|----------|
| `/implement [task]` | Main agent (sequential) | Single tasks, careful oversight |
| `/orchestrate` | Cloud Agents (parallel) | Multiple independent tasks, PR-based review |

---

## Examples

### Starting Fresh
```
You: /plan-product
AI: I'll help you define your product vision...
```

### Building a Feature
```
You: /shape-spec
AI: What feature would you like to build?
You: User authentication with social login
AI: [Asks clarifying questions, shapes the feature]

You: /write-spec
AI: [Creates docs/specs/user-auth.md with full specification]

You: /create-tasks  
AI: [Breaks into tasks: setup, login-form, oauth, session-management]

You: /implement user-auth-1
AI: [Implements the first task, updates sprint.yaml]
```

### Checking Progress
```bash
# From terminal
npx cursor-agent-os status
```

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/sprint.yaml` | Current sprint status and tasks |
| `docs/specs/*.md` | Feature specifications |
| `docs/product/vision.md` | Product vision |
| `docs/product/roadmap.md` | Feature roadmap |
| `docs/standards/coding.md` | Coding conventions |

---

## Tips

1. **Read specs before implementing** - Always reference `docs/specs/` 
2. **Update sprint.yaml** - Mark tasks done after completing
3. **Be specific** - Detailed specs = better implementations
4. **Iterate** - Build small, verify, repeat

---

## CLI Commands

```bash
npx cursor-agent-os status      # Show sprint status
npx cursor-agent-os list        # List all specs
npx cursor-agent-os validate    # Check for issues
npx cursor-agent-os new-spec    # Create new spec
npx cursor-agent-os help        # Show CLI help
```

---

*Type any command to get started!*

