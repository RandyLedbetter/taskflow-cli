# /orchestrate - Parallel Implementation with Cloud Agents

> Use this prompt to orchestrate multiple Cloud Agents for parallel task implementation.

## What This Does

Instead of implementing tasks yourself, you act as the **orchestrator**:
1. Analyze the sprint for independent tasks
2. Spawn specialized Cloud Agents for each task
3. Monitor their progress
4. Present results to the user for review

## Prerequisites

Before using this command:
1. Ensure your project is connected to GitHub
2. Set up `CURSOR_API_KEY` environment variable
3. Have a specification with tasks in `docs/sprint.yaml`

## Instructions

I'll help you orchestrate parallel implementation using Cursor Cloud Agents.

## Process

### 1. Analyze Current Sprint
First, I'll read `docs/sprint.yaml` to identify tasks for the current spec:

```yaml
# docs/sprint.yaml structure
specs:
  [spec-name]:
    status: in-progress
    tasks:
      - id: task-001
        name: Setup database models
        status: pending
        depends_on: []
      - id: task-002
        name: Create API endpoints
        status: pending
        depends_on: [task-001]
      - id: task-003
        name: Add validation
        status: pending
        depends_on: []
```

### 2. Identify Independent Tasks
I'll analyze task dependencies to find tasks that can run in parallel:
- Tasks with no dependencies (`depends_on: []`)
- Tasks whose dependencies are already complete

### 3. Generate Agent Instructions
For each independent task, I'll prepare clear instructions including:
- The specific task to implement
- Reference to the spec file
- Coding standards to follow
- Files to create/modify
- Acceptance criteria

### 4. Launch Cloud Agents
With your approval, I'll launch agents via the Cloud Agents API:

```javascript
// Each agent gets:
{
  instructions: "Implement [task-name]...",
  repository: "github.com/[your-repo]",
  ref: "main",
  target: {
    autoCreatePr: true,
    branchName: "feature/[task-id]"
  }
}
```

## Example Workflow

```
You: /orchestrate

AI: 📋 Analyzing sprint.yaml...

    Current spec: user-authentication
    
    📊 Task Analysis:
    ├── task-001: Setup models ✅ (done)
    ├── task-002: API endpoints ⏳ (depends on task-001 ✓)
    ├── task-003: Validation ⏳ (no dependencies)
    └── task-004: Tests ⏳ (depends on task-002, task-003)
    
    🚀 Ready to orchestrate 2 agents in parallel:
    1. task-002: Create API endpoints
    2. task-003: Add validation
    
    Each agent will:
    - Create a feature branch
    - Implement the task following specs
    - Open a PR for review
    
    Proceed? [Y/n]

You: y

AI: ☁️ Launching Cloud Agents...
    
    ✅ Agent launched: task-002 (agent-abc123)
    ✅ Agent launched: task-003 (agent-def456)
    
    Monitor progress:
    - npx cursor-agent-os agents list
    - npx cursor-agent-os agents status agent-abc123
    
    PRs will be created automatically when complete.
```

## /implement vs /orchestrate

| Command | Who does the work | How |
|---------|------------------|-----|
| `/implement [task]` | Main agent (you) | Sequential, one task at a time |
| `/orchestrate` | Cloud Agents | Parallel, multiple tasks simultaneously |

Use `/implement` for:
- Single tasks
- Tasks requiring careful human oversight
- When Cloud Agents aren't configured

Use `/orchestrate` for:
- Multiple independent tasks
- Faster parallel implementation
- When you want to review PRs rather than code directly

## Safety Features

- **Approval Required:** Agents won't launch without your confirmation
- **Independent Tasks Only:** Only tasks without pending dependencies
- **One PR per Task:** Each agent creates a separate PR for review
- **Spec-Driven:** Agents follow the specification exactly

## Managing Agents

After launching, you can:

```bash
# List all running agents
npx cursor-agent-os agents list

# Check specific agent status
npx cursor-agent-os agents status <agent-id>

# Verify API key is working
npx cursor-agent-os agents verify
```

## After Completion

When agents complete:
1. Review the PRs they created
2. Merge approved PRs
3. Update `docs/sprint.yaml` to mark tasks as done
4. Run `/orchestrate` again for dependent tasks

## Configuration

Cloud Agents settings in `.cursor/agent-os-config.yaml`:

```yaml
cloud_agents:
  enabled: true
  max_parallel: 4          # Max simultaneous agents
  auto_launch: false       # Require approval
  require_approval: true   # Confirm before each launch
```

---

*Cloud Agents require a GitHub repository and Cursor API key.*
