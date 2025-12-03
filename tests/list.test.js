/**
 * List Command Tests
 * Tests for parseListArgs, filterTasks, sortTasks, formatTask, and runList
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  parseListArgs,
  validateFilters,
  filterTasks,
  sortTasks,
  formatTask,
  formatTaskList,
  getEmptyMessage,
  getHelpText,
  runList,
  PRIORITY_ORDER,
  PRIORITY_INDICATORS,
  VALID_PRIORITIES
} = require('../src/commands/list.js');

const { TASK_FILE_NAME, saveTasks } = require('../src/storage.js');

// Test in a temporary directory
let testDir;
let originalCwd;

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-list-test-'));
  originalCwd = process.cwd();
  process.chdir(testDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(testDir, { recursive: true, force: true });
});

// Sample tasks for testing
const sampleTasks = [
  { id: 1, text: 'High priority task', priority: 'high', tags: ['urgent'], status: 'open' },
  { id: 2, text: 'Medium task', priority: 'medium', tags: ['api'], status: 'open' },
  { id: 3, text: 'Low priority task', priority: 'low', tags: ['backend'], status: 'open' },
  { id: 4, text: 'Done task', priority: 'medium', tags: ['api'], status: 'done' },
  { id: 5, text: 'Another high', priority: 'high', tags: [], status: 'open' },
  { id: 6, text: 'Done high', priority: 'high', tags: ['urgent'], status: 'done' }
];

// ============================================
// parseListArgs Tests
// ============================================

describe('parseListArgs', () => {
  it('returns defaults for empty args', () => {
    const result = parseListArgs([]);
    assert.strictEqual(result.done, false);
    assert.strictEqual(result.all, false);
    assert.strictEqual(result.priority, null);
    assert.strictEqual(result.tag, null);
    assert.strictEqual(result.help, false);
  });

  it('parses --done flag', () => {
    const result = parseListArgs(['--done']);
    assert.strictEqual(result.done, true);
  });

  it('parses --all flag', () => {
    const result = parseListArgs(['--all']);
    assert.strictEqual(result.all, true);
  });

  it('parses -a short flag', () => {
    const result = parseListArgs(['-a']);
    assert.strictEqual(result.all, true);
  });

  it('parses --priority with value', () => {
    const result = parseListArgs(['--priority', 'high']);
    assert.strictEqual(result.priority, 'high');
  });

  it('parses -p short flag with value', () => {
    const result = parseListArgs(['-p', 'low']);
    assert.strictEqual(result.priority, 'low');
  });

  it('normalizes priority to lowercase', () => {
    const result = parseListArgs(['-p', 'HIGH']);
    assert.strictEqual(result.priority, 'high');
  });

  it('parses --tag with value', () => {
    const result = parseListArgs(['--tag', 'backend']);
    assert.strictEqual(result.tag, 'backend');
  });

  it('parses -t short flag with value', () => {
    const result = parseListArgs(['-t', 'api']);
    assert.strictEqual(result.tag, 'api');
  });

  it('parses --help flag', () => {
    const result = parseListArgs(['--help']);
    assert.strictEqual(result.help, true);
  });

  it('parses -h short flag', () => {
    const result = parseListArgs(['-h']);
    assert.strictEqual(result.help, true);
  });

  it('parses combined flags', () => {
    const result = parseListArgs(['--done', '-p', 'high', '-t', 'urgent']);
    assert.strictEqual(result.done, true);
    assert.strictEqual(result.priority, 'high');
    assert.strictEqual(result.tag, 'urgent');
  });

  it('parses --all with filters', () => {
    const result = parseListArgs(['-a', '-p', 'medium']);
    assert.strictEqual(result.all, true);
    assert.strictEqual(result.priority, 'medium');
  });
});

// ============================================
// validateFilters Tests
// ============================================

describe('validateFilters', () => {
  it('accepts valid priority', () => {
    assert.doesNotThrow(() => validateFilters({ priority: 'high' }));
    assert.doesNotThrow(() => validateFilters({ priority: 'medium' }));
    assert.doesNotThrow(() => validateFilters({ priority: 'low' }));
  });

  it('accepts null priority', () => {
    assert.doesNotThrow(() => validateFilters({ priority: null }));
  });

  it('throws for invalid priority', () => {
    assert.throws(
      () => validateFilters({ priority: 'invalid' }),
      (err) => {
        assert.strictEqual(err.code, 'INVALID_PRIORITY');
        assert.ok(err.message.includes('Invalid priority'));
        return true;
      }
    );
  });
});

// ============================================
// filterTasks Tests
// ============================================

describe('filterTasks', () => {
  it('filters out done tasks by default', () => {
    const result = filterTasks(sampleTasks, {});
    assert.ok(result.every(t => t.status !== 'done'));
    assert.strictEqual(result.length, 4); // 4 open tasks
  });

  it('shows only done tasks with done filter', () => {
    const result = filterTasks(sampleTasks, { done: true });
    assert.ok(result.every(t => t.status === 'done'));
    assert.strictEqual(result.length, 2); // 2 done tasks
  });

  it('shows all tasks with all filter', () => {
    const result = filterTasks(sampleTasks, { all: true });
    assert.strictEqual(result.length, 6); // All tasks
  });

  it('filters by priority', () => {
    const result = filterTasks(sampleTasks, { priority: 'high' });
    assert.ok(result.every(t => t.priority === 'high'));
    assert.strictEqual(result.length, 2); // 2 open high priority
  });

  it('filters by tag', () => {
    const result = filterTasks(sampleTasks, { tag: 'api' });
    assert.ok(result.every(t => t.tags.includes('api')));
    assert.strictEqual(result.length, 1); // 1 open api task
  });

  it('combines priority and tag filters (AND logic)', () => {
    const result = filterTasks(sampleTasks, { priority: 'high', tag: 'urgent' });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 1);
  });

  it('combines done and tag filters', () => {
    const result = filterTasks(sampleTasks, { done: true, tag: 'api' });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 4);
  });

  it('combines done and priority filters', () => {
    const result = filterTasks(sampleTasks, { done: true, priority: 'high' });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 6);
  });

  it('combines all filters', () => {
    const result = filterTasks(sampleTasks, { all: true, priority: 'high' });
    assert.strictEqual(result.length, 3); // All high priority (open + done)
  });

  it('returns empty array when no matches', () => {
    const result = filterTasks(sampleTasks, { tag: 'nonexistent' });
    assert.deepStrictEqual(result, []);
  });

  it('handles tasks without tags', () => {
    const result = filterTasks(sampleTasks, { tag: 'urgent' });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 1);
  });
});

// ============================================
// sortTasks Tests
// ============================================

describe('sortTasks', () => {
  it('sorts by priority (high first)', () => {
    const unsorted = [
      { id: 1, priority: 'low' },
      { id: 2, priority: 'high' },
      { id: 3, priority: 'medium' }
    ];
    const result = sortTasks(unsorted);
    assert.strictEqual(result[0].priority, 'high');
    assert.strictEqual(result[1].priority, 'medium');
    assert.strictEqual(result[2].priority, 'low');
  });

  it('sorts by ID within same priority', () => {
    const unsorted = [
      { id: 5, priority: 'high' },
      { id: 1, priority: 'high' },
      { id: 3, priority: 'high' }
    ];
    const result = sortTasks(unsorted);
    assert.strictEqual(result[0].id, 1);
    assert.strictEqual(result[1].id, 3);
    assert.strictEqual(result[2].id, 5);
  });

  it('handles empty array', () => {
    const result = sortTasks([]);
    assert.deepStrictEqual(result, []);
  });

  it('does not mutate original array', () => {
    const original = [
      { id: 2, priority: 'low' },
      { id: 1, priority: 'high' }
    ];
    const result = sortTasks(original);
    assert.strictEqual(original[0].id, 2); // Original unchanged
    assert.strictEqual(result[0].id, 1);   // Result sorted
  });

  it('handles mixed priorities correctly', () => {
    const unsorted = [
      { id: 1, priority: 'medium' },
      { id: 2, priority: 'low' },
      { id: 3, priority: 'high' },
      { id: 4, priority: 'medium' }
    ];
    const result = sortTasks(unsorted);
    assert.deepStrictEqual(
      result.map(t => t.id),
      [3, 1, 4, 2]
    );
  });
});

// ============================================
// formatTask Tests
// ============================================

describe('formatTask', () => {
  it('formats high priority task with red indicator', () => {
    const task = { id: 1, text: 'Test', priority: 'high', tags: [], status: 'open' };
    const output = formatTask(task);
    assert.ok(output.includes('🔴'));
    assert.ok(output.includes('#1'));
    assert.ok(output.includes('Test'));
    assert.ok(output.includes('[high]'));
  });

  it('formats medium priority task with yellow indicator', () => {
    const task = { id: 2, text: 'Test', priority: 'medium', tags: [], status: 'open' };
    const output = formatTask(task);
    assert.ok(output.includes('🟡'));
    assert.ok(output.includes('[medium]'));
  });

  it('formats low priority task with green indicator', () => {
    const task = { id: 3, text: 'Test', priority: 'low', tags: [], status: 'open' };
    const output = formatTask(task);
    assert.ok(output.includes('🟢'));
    assert.ok(output.includes('[low]'));
  });

  it('formats done task with checkmark', () => {
    const task = { id: 1, text: 'Test', priority: 'medium', tags: [], status: 'done' };
    const output = formatTask(task);
    assert.ok(output.includes('✅'));
    assert.ok(output.includes('(done)'));
  });

  it('includes tags when present', () => {
    const task = { id: 1, text: 'Test', priority: 'high', tags: ['api', 'urgent'], status: 'open' };
    const output = formatTask(task);
    assert.ok(output.includes('#api'));
    assert.ok(output.includes('#urgent'));
  });

  it('omits tags section when empty', () => {
    const task = { id: 1, text: 'Test', priority: 'high', tags: [], status: 'open' };
    const output = formatTask(task);
    // Should not have tag markers after priority
    assert.ok(!output.includes('[high] #'));
  });

  it('includes task text', () => {
    const task = { id: 1, text: 'My important task', priority: 'high', tags: [], status: 'open' };
    const output = formatTask(task);
    assert.ok(output.includes('My important task'));
  });
});

// ============================================
// getEmptyMessage Tests
// ============================================

describe('getEmptyMessage', () => {
  it('returns default message for no filters', () => {
    const msg = getEmptyMessage({});
    assert.ok(msg.includes('No open tasks'));
    assert.ok(msg.includes('tf add'));
  });

  it('returns done-specific message', () => {
    const msg = getEmptyMessage({ done: true });
    assert.ok(msg.includes('No completed tasks'));
  });

  it('returns priority-specific message', () => {
    const msg = getEmptyMessage({ priority: 'high' });
    assert.ok(msg.includes('high priority'));
  });

  it('returns tag-specific message', () => {
    const msg = getEmptyMessage({ tag: 'backend' });
    assert.ok(msg.includes('backend'));
  });

  it('returns combined message for done + priority', () => {
    const msg = getEmptyMessage({ done: true, priority: 'high' });
    assert.ok(msg.includes('completed'));
    assert.ok(msg.includes('high priority'));
  });

  it('returns combined message for done + tag', () => {
    const msg = getEmptyMessage({ done: true, tag: 'api' });
    assert.ok(msg.includes('completed'));
    assert.ok(msg.includes('api'));
  });

  it('returns combined message for priority + tag', () => {
    const msg = getEmptyMessage({ priority: 'high', tag: 'api' });
    assert.ok(msg.includes('high priority'));
    assert.ok(msg.includes('api'));
  });

  it('returns all-tasks message', () => {
    const msg = getEmptyMessage({ all: true });
    assert.ok(msg.includes('No tasks found'));
  });
});

// ============================================
// formatTaskList Tests
// ============================================

describe('formatTaskList', () => {
  it('formats multiple tasks', () => {
    const tasks = [
      { id: 1, text: 'Task 1', priority: 'high', tags: [], status: 'open' },
      { id: 2, text: 'Task 2', priority: 'low', tags: [], status: 'open' }
    ];
    const output = formatTaskList(tasks, {});
    assert.ok(output.includes('Task 1'));
    assert.ok(output.includes('Task 2'));
    assert.ok(output.includes('\n')); // Multiple lines
  });

  it('shows empty state for no tasks', () => {
    const output = formatTaskList([], {});
    assert.ok(output.includes('No open tasks'));
  });

  it('shows context-aware empty state for priority filter', () => {
    const output = formatTaskList([], { priority: 'high' });
    assert.ok(output.includes('high priority'));
  });

  it('handles null tasks', () => {
    const output = formatTaskList(null, {});
    assert.ok(output.includes('No open tasks'));
  });
});

// ============================================
// getHelpText Tests
// ============================================

describe('getHelpText', () => {
  it('includes usage information', () => {
    const help = getHelpText();
    assert.ok(help.includes('Usage:'));
    assert.ok(help.includes('tf list'));
  });

  it('includes all flags', () => {
    const help = getHelpText();
    assert.ok(help.includes('--done'));
    assert.ok(help.includes('--all'));
    assert.ok(help.includes('--priority'));
    assert.ok(help.includes('--tag'));
  });

  it('includes examples', () => {
    const help = getHelpText();
    assert.ok(help.includes('Examples:'));
  });

  it('includes indicator legend', () => {
    const help = getHelpText();
    assert.ok(help.includes('🔴'));
    assert.ok(help.includes('🟡'));
    assert.ok(help.includes('🟢'));
  });
});

// ============================================
// runList Tests
// ============================================

describe('runList', () => {
  it('lists open tasks', () => {
    saveTasks(sampleTasks);
    const result = runList([]);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output.includes('High priority task'));
    assert.ok(!result.output.includes('Done task'));
  });

  it('lists done tasks with --done', () => {
    saveTasks(sampleTasks);
    const result = runList(['--done']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('Done task'));
    assert.ok(result.output.includes('✅'));
  });

  it('lists all tasks with --all', () => {
    saveTasks(sampleTasks);
    const result = runList(['--all']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('High priority task'));
    assert.ok(result.output.includes('Done task'));
  });

  it('filters by priority', () => {
    saveTasks(sampleTasks);
    const result = runList(['-p', 'high']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('High priority task'));
    assert.ok(!result.output.includes('Medium task'));
  });

  it('filters by tag', () => {
    saveTasks(sampleTasks);
    const result = runList(['-t', 'api']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('Medium task'));
    assert.ok(!result.output.includes('backend'));
  });

  it('shows empty state when no tasks', () => {
    const result = runList([]);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('No open tasks'));
  });

  it('shows empty state for no matches', () => {
    saveTasks(sampleTasks);
    const result = runList(['-t', 'nonexistent']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('No tasks with tag'));
  });

  it('shows help with --help', () => {
    const result = runList(['--help']);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output.includes('Usage:'));
  });

  it('returns error for invalid priority', () => {
    const result = runList(['-p', 'invalid']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('Invalid priority'));
  });

  it('sorts tasks by priority', () => {
    saveTasks(sampleTasks);
    const result = runList([]);
    
    const lines = result.output.split('\n');
    // First task should be high priority
    assert.ok(lines[0].includes('🔴') || lines[0].includes('high'));
  });

  it('combines filters correctly', () => {
    saveTasks(sampleTasks);
    const result = runList(['--done', '-p', 'high']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('Done high'));
    assert.ok(!result.output.includes('Done task')); // medium priority
  });
});

// ============================================
// Integration Tests
// ============================================

describe('runList integration', () => {
  it('displays tasks in priority order', () => {
    const tasks = [
      { id: 1, text: 'Low', priority: 'low', tags: [], status: 'open' },
      { id: 2, text: 'High', priority: 'high', tags: [], status: 'open' },
      { id: 3, text: 'Medium', priority: 'medium', tags: [], status: 'open' }
    ];
    saveTasks(tasks);
    
    const result = runList([]);
    const lines = result.output.split('\n');
    
    // High should be first
    assert.ok(lines[0].includes('High'));
    // Medium second
    assert.ok(lines[1].includes('Medium'));
    // Low last
    assert.ok(lines[2].includes('Low'));
  });

  it('handles complex filtering scenario', () => {
    const tasks = [
      { id: 1, text: 'Open high api', priority: 'high', tags: ['api'], status: 'open' },
      { id: 2, text: 'Open high backend', priority: 'high', tags: ['backend'], status: 'open' },
      { id: 3, text: 'Done high api', priority: 'high', tags: ['api'], status: 'done' },
      { id: 4, text: 'Open low api', priority: 'low', tags: ['api'], status: 'open' }
    ];
    saveTasks(tasks);
    
    // Filter: high priority api tasks (open only)
    const result = runList(['-p', 'high', '-t', 'api']);
    
    assert.ok(result.output.includes('Open high api'));
    assert.ok(!result.output.includes('backend'));
    assert.ok(!result.output.includes('Done'));
    assert.ok(!result.output.includes('low'));
  });
});

