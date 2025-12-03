# /create-tasks - Task Creation Workflow

> Use this prompt to break a specification into implementation tasks.

## Instructions

I need help creating implementation tasks for a feature in **taskflow-cli**.

## Process

1. **Read the Specification**
   - Review the spec in `docs/specs/`
   - Understand all acceptance criteria
   - Note any open questions

2. **Identify Work Units**
   Break the spec into tasks that are:
   - **Independent** - Can be worked on separately
   - **Sized Right** - Completable in 1-4 hours
   - **Testable** - Has clear completion criteria

3. **Sequence Tasks**
   Order by:
   - Dependencies (what must come first?)
   - Risk (tackle unknowns early)
   - Value (deliver user value incrementally)

4. **Define Each Task**
   For each task, specify:
   - Clear description
   - Files to create/modify
   - Acceptance criteria
   - Dependencies on other tasks

## Task Template

```yaml
- id: task-001
  name: [Brief descriptive name]
  description: |
    [What needs to be done]
  files:
    - [file paths to create/modify]
  acceptance_criteria:
    - [Specific, verifiable criteria]
    - [Another criteria]
  depends_on: []  # or [task-id]
  estimate: [1h/2h/4h]
  status: pending
```

## Output

Update `docs/sprint.yaml` with the task list:

```yaml
name: taskflow-cli - Sprint N
phase: implementing
current_spec: [spec-name]
specs:
  [spec-name]:
    status: in-progress
    tasks:
      - id: task-001
        name: ...
        status: pending
      - id: task-002
        ...
```

## Tips

- Start with scaffolding/setup tasks
- Group related changes together
- Include testing as part of each task, not separate
- Leave room for iteration
- Mark dependencies clearly

