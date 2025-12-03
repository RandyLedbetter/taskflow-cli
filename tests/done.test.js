/**
 * Done Command Tests
 * Tests for parseDoneArgs, validateTaskId, findTaskById, markTaskDone, and runDone
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  parseDoneArgs,
  validateTaskId,
  findTaskById,
  markTaskDone,
  formatOutput,
  getHelpText,
  runDone
} = require('../src/commands/done.js');

const { TASK_FILE_NAME, saveTasks, loadTasks } = require('../src/storage.js');

// Test in a temporary directory
let testDir;
let originalCwd;

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-done-test-'));
  originalCwd = process.cwd();
  process.chdir(testDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(testDir, { recursive: true, force: true });
});

// Sample tasks for testing
const createSampleTasks = () => [
  { id: 1, text: 'Open task', priority: 'high', tags: ['urgent'], status: 'open', created: '2025-12-03', completed: null },
  { id: 2, text: 'Another open', priority: 'medium', tags: ['api'], status: 'open', created: '2025-12-03', completed: null },
  { id: 3, text: 'Done task', priority: 'low', tags: [], status: 'done', created: '2025-12-02', completed: '2025-12-03' }
];

// ============================================
// parseDoneArgs Tests
// ============================================

describe('parseDoneArgs', () => {
  it('returns null ID for empty args', () => {
    const result = parseDoneArgs([]);
    assert.strictEqual(result.id, null);
    assert.strictEqual(result.help, false);
  });

  it('parses task ID', () => {
    const result = parseDoneArgs(['1']);
    assert.strictEqual(result.id, '1');
  });

  it('parses multi-digit ID', () => {
    const result = parseDoneArgs(['42']);
    assert.strictEqual(result.id, '42');
  });

  it('parses --help flag', () => {
    const result = parseDoneArgs(['--help']);
    assert.strictEqual(result.help, true);
  });

  it('parses -h short flag', () => {
    const result = parseDoneArgs(['-h']);
    assert.strictEqual(result.help, true);
  });

  it('parses ID with help flag', () => {
    const result = parseDoneArgs(['1', '--help']);
    assert.strictEqual(result.id, '1');
    assert.strictEqual(result.help, true);
  });

  it('ignores unknown flags', () => {
    const result = parseDoneArgs(['--unknown', '5']);
    assert.strictEqual(result.id, '5');
  });
});

// ============================================
// validateTaskId Tests
// ============================================

describe('validateTaskId', () => {
  it('accepts valid integer string', () => {
    const result = validateTaskId('1');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.id, 1);
    assert.strictEqual(result.error, null);
  });

  it('accepts multi-digit integer', () => {
    const result = validateTaskId('123');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.id, 123);
  });

  it('rejects null', () => {
    const result = validateTaskId(null);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('required'));
  });

  it('rejects undefined', () => {
    const result = validateTaskId(undefined);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('required'));
  });

  it('rejects empty string', () => {
    const result = validateTaskId('');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('required'));
  });

  it('rejects non-numeric string', () => {
    const result = validateTaskId('abc');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('must be a number'));
  });

  it('rejects mixed string', () => {
    const result = validateTaskId('1abc');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('must be a number'));
  });

  it('rejects decimal', () => {
    const result = validateTaskId('1.5');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('whole number'));
  });

  it('rejects zero', () => {
    const result = validateTaskId('0');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('positive'));
  });

  it('rejects negative number', () => {
    const result = validateTaskId('-1');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('positive'));
  });

  it('rejects negative decimal', () => {
    const result = validateTaskId('-1.5');
    assert.strictEqual(result.valid, false);
  });
});

// ============================================
// findTaskById Tests
// ============================================

describe('findTaskById', () => {
  it('finds task by ID', () => {
    const tasks = createSampleTasks();
    const task = findTaskById(tasks, 1);
    assert.ok(task);
    assert.strictEqual(task.id, 1);
    assert.strictEqual(task.text, 'Open task');
  });

  it('finds task with different ID', () => {
    const tasks = createSampleTasks();
    const task = findTaskById(tasks, 2);
    assert.ok(task);
    assert.strictEqual(task.id, 2);
  });

  it('returns null for non-existent ID', () => {
    const tasks = createSampleTasks();
    const task = findTaskById(tasks, 99);
    assert.strictEqual(task, null);
  });

  it('returns null for empty array', () => {
    const task = findTaskById([], 1);
    assert.strictEqual(task, null);
  });

  it('returns null for null tasks', () => {
    const task = findTaskById(null, 1);
    assert.strictEqual(task, null);
  });

  it('returns null for undefined tasks', () => {
    const task = findTaskById(undefined, 1);
    assert.strictEqual(task, null);
  });
});

// ============================================
// markTaskDone Tests
// ============================================

describe('markTaskDone', () => {
  it('sets status to done', () => {
    const task = { id: 1, status: 'open', completed: null };
    markTaskDone(task);
    assert.strictEqual(task.status, 'done');
  });

  it('sets completed date', () => {
    const task = { id: 1, status: 'open', completed: null };
    markTaskDone(task);
    assert.ok(task.completed);
    assert.match(task.completed, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns true for status change', () => {
    const task = { id: 1, status: 'open', completed: null };
    const changed = markTaskDone(task);
    assert.strictEqual(changed, true);
  });

  it('returns false if already done', () => {
    const task = { id: 1, status: 'done', completed: '2025-12-01' };
    const changed = markTaskDone(task);
    assert.strictEqual(changed, false);
  });

  it('does not change completed date if already done', () => {
    const originalDate = '2025-12-01';
    const task = { id: 1, status: 'done', completed: originalDate };
    markTaskDone(task);
    assert.strictEqual(task.completed, originalDate);
  });

  it('does not change status if already done', () => {
    const task = { id: 1, status: 'done', completed: '2025-12-01' };
    markTaskDone(task);
    assert.strictEqual(task.status, 'done');
  });
});

// ============================================
// formatOutput Tests
// ============================================

describe('formatOutput', () => {
  it('formats success message', () => {
    const task = { id: 1, text: 'Test task', priority: 'high', tags: [] };
    const output = formatOutput(task, false);
    assert.ok(output.includes('✓ Completed task #1'));
    assert.ok(output.includes('"Test task"'));
    assert.ok(output.includes('[high]'));
    assert.ok(output.includes('→ done'));
  });

  it('formats already-done warning', () => {
    const task = { id: 1, text: 'Test task', priority: 'high', tags: [] };
    const output = formatOutput(task, true);
    assert.ok(output.includes('was already complete'));
    assert.ok(output.includes('#1'));
    assert.ok(!output.includes('→ done'));
  });

  it('includes task details', () => {
    const task = { id: 5, text: 'My task', priority: 'low', tags: ['api'] };
    const output = formatOutput(task, false);
    assert.ok(output.includes('#5'));
    assert.ok(output.includes('My task'));
    assert.ok(output.includes('[low]'));
  });

  it('includes tags when present', () => {
    const task = { id: 1, text: 'Test', priority: 'high', tags: ['urgent', 'bug'] };
    const output = formatOutput(task, false);
    assert.ok(output.includes('#urgent'));
    assert.ok(output.includes('#bug'));
  });

  it('omits tags when empty', () => {
    const task = { id: 1, text: 'Test', priority: 'high', tags: [] };
    const output = formatOutput(task, false);
    // Should not have extra # after priority
    assert.ok(!output.includes('[high] #'));
  });
});

// ============================================
// getHelpText Tests
// ============================================

describe('getHelpText', () => {
  it('includes usage information', () => {
    const help = getHelpText();
    assert.ok(help.includes('Usage:'));
    assert.ok(help.includes('tf done'));
  });

  it('includes id argument', () => {
    const help = getHelpText();
    assert.ok(help.includes('id'));
  });

  it('includes examples', () => {
    const help = getHelpText();
    assert.ok(help.includes('Examples:'));
    assert.ok(help.includes('tf done 1'));
  });
});

// ============================================
// runDone Tests
// ============================================

describe('runDone', () => {
  it('marks task complete', () => {
    saveTasks(createSampleTasks());
    const result = runDone(['1']);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output.includes('Completed task #1'));
    
    // Verify task is actually done
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === 1);
    assert.strictEqual(task.status, 'done');
  });

  it('handles already-done task', () => {
    saveTasks(createSampleTasks());
    const result = runDone(['3']); // Task 3 is already done
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output.includes('already complete'));
  });

  it('does not change completed date for already-done task', () => {
    const tasks = createSampleTasks();
    const originalDate = tasks[2].completed;
    saveTasks(tasks);
    
    runDone(['3']); // Task 3 is already done
    
    const updatedTasks = loadTasks();
    const task = updatedTasks.find(t => t.id === 3);
    assert.strictEqual(task.completed, originalDate);
  });

  it('returns error for missing ID', () => {
    saveTasks(createSampleTasks());
    const result = runDone([]);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('required'));
  });

  it('returns error for invalid ID', () => {
    saveTasks(createSampleTasks());
    const result = runDone(['abc']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('must be a number'));
  });

  it('returns error for non-existent task', () => {
    saveTasks(createSampleTasks());
    const result = runDone(['99']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('not found'));
    assert.ok(result.output.includes("tf list"));
  });

  it('returns error for zero ID', () => {
    saveTasks(createSampleTasks());
    const result = runDone(['0']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
  });

  it('returns error for negative ID', () => {
    saveTasks(createSampleTasks());
    const result = runDone(['-1']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
  });

  it('shows help with --help', () => {
    const result = runDone(['--help']);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output.includes('Usage:'));
  });

  it('shows help with -h', () => {
    const result = runDone(['-h']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('Usage:'));
  });

  it('persists change to file', () => {
    saveTasks(createSampleTasks());
    runDone(['1']);
    
    // Re-read from file
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === 1);
    assert.strictEqual(task.status, 'done');
    assert.ok(task.completed);
  });

  it('handles no task file', () => {
    const result = runDone(['1']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('not found'));
  });
});

// ============================================
// Integration Tests
// ============================================

describe('runDone integration', () => {
  it('task no longer appears in default list after done', () => {
    saveTasks(createSampleTasks());
    
    // Mark task 1 as done
    runDone(['1']);
    
    // Load and filter for open tasks
    const tasks = loadTasks();
    const openTasks = tasks.filter(t => t.status === 'open');
    
    // Task 1 should not be in open tasks
    assert.ok(!openTasks.some(t => t.id === 1));
  });

  it('sets completed date to today', () => {
    saveTasks(createSampleTasks());
    runDone(['1']);
    
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === 1);
    const today = new Date().toISOString().split('T')[0];
    
    assert.strictEqual(task.completed, today);
  });
});

