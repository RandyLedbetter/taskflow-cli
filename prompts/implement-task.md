# /implement [task-id] - Task Implementation Workflow

> Use this prompt to implement a specific task from the sprint.

## Instructions

I need help implementing a task for **taskflow-cli**.

## Before Starting

1. **Identify the Task**
   Check `docs/sprint.yaml` for the task details:
   - Task ID and description
   - Files to create/modify
   - Acceptance criteria
   - Dependencies

2. **Read the Spec**
   Review the relevant specification in `docs/specs/`

3. **Check Standards**
   Review `docs/standards/coding.md` for patterns

4. **Verify Dependencies**
   Ensure dependent tasks are complete

## Implementation Steps

1. **Plan the Change**
   - List files to create/modify
   - Outline the approach
   - Identify any questions

2. **Implement Incrementally**
   - Make small, focused changes
   - Test as you go
   - Commit logical units

3. **Verify Acceptance Criteria**
   - Check each criterion
   - Write/update tests
   - Handle edge cases

4. **Update Documentation**
   - Update task status in sprint.yaml
   - Note any spec deviations
   - Update code comments

## Task Context

To implement a task, I need:
- The task ID from sprint.yaml
- Or describe what you want to implement

I will:
1. Read the task details from sprint.yaml
2. Review the relevant spec
3. Plan the implementation
4. Execute the changes
5. Update the task status

## After Implementation

Mark the task complete in `docs/sprint.yaml`:

```yaml
tasks:
  - id: task-001
    name: [task name]
    status: done  # Update this
    completed: 2025-12-03
```

## Quality Checklist

- [ ] Code follows project standards
- [ ] All acceptance criteria met
- [ ] Tests added/updated
- [ ] No regressions introduced
- [ ] Task marked complete

