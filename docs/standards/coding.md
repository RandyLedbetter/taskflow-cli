# Coding Standards - taskflow-cli

> Last Updated: 2025-12-03
> Standards Level: default

## General Principles

1. **Clarity over Cleverness** - Write code that's easy to read and understand
2. **Consistency** - Follow established patterns in the codebase
3. **Simplicity** - Don't over-engineer; build what's needed
4. **Documentation** - Complex logic should be explained

## Code Style

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Functions | camelCase | `getUserById()`, `calculateTotal()` |
| Classes | PascalCase | `UserService`, `DataProcessor` |
| Constants | UPPER_SNAKE | `MAX_RETRIES`, `API_BASE_URL` |
| Files | kebab-case | `user-service.js`, `api-client.ts` |

### Structure

- Keep functions focused (single responsibility)
- Maximum function length: ~50 lines (guideline, not rule)
- Maximum nesting depth: 3 levels
- Extract complex conditions into well-named variables

### Comments

```javascript
// Good: Explains WHY
// We retry 3 times because the external API has occasional hiccups
const MAX_RETRIES = 3;

// Bad: Explains WHAT (code already shows this)
// Set max retries to 3
const MAX_RETRIES = 3;
```

## Error Handling

1. **Fail Fast** - Validate inputs early
2. **Be Specific** - Use appropriate error types
3. **Provide Context** - Include helpful error messages
4. **Log Appropriately** - Log errors with context for debugging

```javascript
// Good
if (!userId) {
  throw new Error('userId is required to fetch user profile');
}

// Bad
if (!userId) {
  throw new Error('Invalid input');
}
```

## File Organization

```
src/
├── components/     # UI components
├── services/       # Business logic
├── utils/          # Utility functions
├── types/          # Type definitions
├── hooks/          # Custom hooks (React)
└── config/         # Configuration
```

## Testing Standards

- Test file next to source: `user-service.ts` → `user-service.test.ts`
- Describe what, not how: `it('returns user when found')` not `it('calls database')`
- One assertion per test when possible
- Use meaningful test data

## Git Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Example: `feat(auth): add password reset flow`

## Code Review Checklist

Before requesting review:
- [ ] Code compiles without warnings
- [ ] Tests pass
- [ ] Self-reviewed the diff
- [ ] Follows these standards
- [ ] Updated relevant documentation

---

*Update these standards as the project evolves and patterns emerge.*

