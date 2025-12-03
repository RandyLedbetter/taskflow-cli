/**
 * Show Command Tests
 * Tests for parseShowArgs, validateTaskId, findTaskById, formatTaskDetails, and runShow
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  parseShowArgs,
  validateTaskId,
  findTaskById,
  formatTaskDetails,
  getHelpText,
  runShow
} = require('../src/commands/show.js');

const { TASK_FILE_NAME, saveTasks, loadTasks } = require('../src/storage.js');

// Test in a temporary directory
let testDir;
let originalCwd;

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-show-test-'));
  originalCwd = process.cwd();
  process.chdir(testDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(testDir, { recursive: true, force: true });
});

// Sample tasks for testing
const createSampleTasks = () => [
  { id: 1, text: 'Open task', priority: 'high', tags: ['urgent', 'backend'], status: 'open', created: '2025-12-03', completed: null },
  { id: 2, text: 'No tags task', priority: 'medium', tags: [], status: 'open', created: '2025-12-03', completed: null },
  { id: 3, text: 'Done task', priority: 'low', tags: ['devops'], status: 'done', created: '2025-12-01', completed: '2025-12-03' }
];

// ============================================
// parseShowArgs Tests
// ============================================

describe('parseShowArgs', () => {
  it('returns null ID for empty args', () => {
    const result = parseShowArgs([]);
    assert.strictEqual(result.id, null);
    assert.strictEqual(result.help, false);
  });

  it('parses task ID', () => {
    const result = parseShowArgs(['1']);
    assert.strictEqual(result.id, '1');
  });

  it('parses multi-digit ID', () => {
    const result = parseShowArgs(['42']);
    assert.strictEqual(result.id, '42');
  });

  it('parses --help flag', () => {
    const result = parseShowArgs(['--help']);
    assert.strictEqual(result.help, true);
  });

  it('parses -h short flag', () => {
    const result = parseShowArgs(['-h']);
    assert.strictEqual(result.help, true);
  });

  it('parses ID with help flag', () => {
    const result = parseShowArgs(['1', '--help']);
    assert.strictEqual(result.id, '1');
    assert.strictEqual(result.help, true);
  });

  it('handles null args', () => {
    const result = parseShowArgs(null);
    assert.strictEqual(result.id, null);
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

  it('includes usage hint in error', () => {
    const result = validateTaskId(null);
    assert.ok(result.error.includes('tf show'));
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
});

// ============================================
// formatTaskDetails Tests
// ============================================

describe('formatTaskDetails', () => {
  it('formats open task', () => {
    const task = { id: 1, text: 'Test task', priority: 'high', tags: [], status: 'open', created: '2025-12-03', completed: null };
    const output = formatTaskDetails(task);
    
    assert.ok(output.includes('Task #1'));
    assert.ok(output.includes('Text:     Test task'));
    assert.ok(output.includes('Priority: high'));
    assert.ok(output.includes('Status:   open'));
    assert.ok(output.includes('Created:  2025-12-03'));
  });

  it('formats done task with completed date', () => {
    const task = { id: 1, text: 'Done task', priority: 'low', tags: [], status: 'done', created: '2025-12-01', completed: '2025-12-03' };
    const output = formatTaskDetails(task);
    
    assert.ok(output.includes('Status:   done ✓'));
    assert.ok(output.includes('Completed: 2025-12-03'));
  });

  it('shows checkmark for done status', () => {
    const task = { id: 1, text: 'Done', priority: 'medium', tags: [], status: 'done', created: '2025-12-01', completed: '2025-12-03' };
    const output = formatTaskDetails(task);
    
    assert.ok(output.includes('done ✓'));
  });

  it('includes tags when present', () => {
    const task = { id: 1, text: 'Task', priority: 'high', tags: ['urgent', 'backend'], status: 'open', created: '2025-12-03', completed: null };
    const output = formatTaskDetails(task);
    
    assert.ok(output.includes('Tags:     #urgent #backend'));
  });

  it('omits tags line when empty', () => {
    const task = { id: 1, text: 'Task', priority: 'high', tags: [], status: 'open', created: '2025-12-03', completed: null };
    const output = formatTaskDetails(task);
    
    assert.ok(!output.includes('Tags:'));
  });

  it('omits completed line for open tasks', () => {
    const task = { id: 1, text: 'Task', priority: 'high', tags: [], status: 'open', created: '2025-12-03', completed: null };
    const output = formatTaskDetails(task);
    
    assert.ok(!output.includes('Completed:'));
  });

  it('handles single tag', () => {
    const task = { id: 1, text: 'Task', priority: 'high', tags: ['api'], status: 'open', created: '2025-12-03', completed: null };
    const output = formatTaskDetails(task);
    
    assert.ok(output.includes('Tags:     #api'));
  });

  it('preserves field alignment', () => {
    const task = { id: 1, text: 'Task', priority: 'high', tags: ['api'], status: 'open', created: '2025-12-03', completed: null };
    const output = formatTaskDetails(task);
    
    // All field labels should align
    assert.ok(output.includes('Text:     '));
    assert.ok(output.includes('Priority: '));
    assert.ok(output.includes('Status:   '));
    assert.ok(output.includes('Tags:     '));
    assert.ok(output.includes('Created:  '));
  });
});

// ============================================
// getHelpText Tests
// ============================================

describe('getHelpText', () => {
  it('includes usage information', () => {
    const help = getHelpText();
    assert.ok(help.includes('Usage:'));
    assert.ok(help.includes('tf show'));
  });

  it('includes id argument', () => {
    const help = getHelpText();
    assert.ok(help.includes('id'));
  });

  it('includes examples', () => {
    const help = getHelpText();
    assert.ok(help.includes('Examples:'));
    assert.ok(help.includes('tf show 1'));
  });
});

// ============================================
// runShow Tests
// ============================================

describe('runShow', () => {
  it('displays task details', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['1']);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output.includes('Task #1'));
    assert.ok(result.output.includes('Open task'));
  });

  it('displays done task with completed date', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['3']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('done ✓'));
    assert.ok(result.output.includes('Completed:'));
  });

  it('returns error for missing ID', () => {
    saveTasks(createSampleTasks());
    const result = runShow([]);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('required'));
  });

  it('returns error for invalid ID', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['abc']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('must be a number'));
  });

  it('returns error for non-existent task', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['99']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('not found'));
    assert.ok(result.output.includes("tf list"));
  });

  it('returns error for zero ID', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['0']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
  });

  it('returns error for negative ID', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['-1']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
  });

  it('shows help with --help', () => {
    const result = runShow(['--help']);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output.includes('Usage:'));
  });

  it('shows help with -h', () => {
    const result = runShow(['-h']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('Usage:'));
  });

  it('handles no task file', () => {
    const result = runShow(['1']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('not found'));
  });

  it('shows tags for task with tags', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['1']);
    
    assert.ok(result.output.includes('#urgent'));
    assert.ok(result.output.includes('#backend'));
  });

  it('omits tags line for task without tags', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['2']);
    
    assert.ok(!result.output.includes('Tags:'));
  });
});

// ============================================
// Integration Tests
// ============================================

describe('runShow integration', () => {
  it('shows all fields for complete task', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['1']);
    
    // Check all expected fields
    const output = result.output;
    assert.ok(output.includes('Task #1'));
    assert.ok(output.includes('Text:'));
    assert.ok(output.includes('Priority:'));
    assert.ok(output.includes('Status:'));
    assert.ok(output.includes('Tags:'));
    assert.ok(output.includes('Created:'));
  });

  it('output has consistent formatting', () => {
    saveTasks(createSampleTasks());
    const result = runShow(['1']);
    
    // Output should be multi-line
    const lines = result.output.split('\n');
    assert.ok(lines.length >= 5); // Header + at least 4 fields
    
    // First line is header
    assert.ok(lines[0].startsWith('Task #'));
    
    // Subsequent lines are indented
    for (let i = 1; i < lines.length; i++) {
      assert.ok(lines[i].startsWith('  '));
    }
  });
});

