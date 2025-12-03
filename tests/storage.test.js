/**
 * Storage Module Tests
 * Tests for loadTasks, saveTasks, and getTaskFilePath
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  loadTasks,
  saveTasks,
  getTaskFilePath,
  getNextId,
  createTask,
  getTodayDate,
  TASK_FILE_NAME,
  SCHEMA_VERSION,
  DEFAULTS
} = require('../src/storage.js');

// Test in a temporary directory to avoid polluting the project
let testDir;
let originalCwd;

beforeEach(() => {
  // Create a temp directory for each test
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-test-'));
  originalCwd = process.cwd();
  process.chdir(testDir);
});

afterEach(() => {
  // Restore original directory and clean up
  process.chdir(originalCwd);
  fs.rmSync(testDir, { recursive: true, force: true });
});

// ============================================
// getTaskFilePath Tests
// ============================================

describe('getTaskFilePath', () => {
  it('returns absolute path to .taskflow.yaml in cwd', () => {
    const result = getTaskFilePath();
    const expected = path.join(testDir, TASK_FILE_NAME);
    assert.strictEqual(result, expected);
  });

  it('returns path with correct filename', () => {
    const result = getTaskFilePath();
    assert.ok(result.endsWith('.taskflow.yaml'));
  });
});

// ============================================
// loadTasks Tests
// ============================================

describe('loadTasks', () => {
  it('returns empty array when file does not exist', () => {
    const tasks = loadTasks();
    assert.deepStrictEqual(tasks, []);
  });

  it('returns empty array when file is empty', () => {
    fs.writeFileSync(path.join(testDir, TASK_FILE_NAME), '', 'utf8');
    const tasks = loadTasks();
    assert.deepStrictEqual(tasks, []);
  });

  it('returns empty array when file contains only whitespace', () => {
    fs.writeFileSync(path.join(testDir, TASK_FILE_NAME), '   \n\n  ', 'utf8');
    const tasks = loadTasks();
    assert.deepStrictEqual(tasks, []);
  });

  it('returns empty array when tasks is null', () => {
    fs.writeFileSync(
      path.join(testDir, TASK_FILE_NAME),
      'version: 1\ntasks: null',
      'utf8'
    );
    const tasks = loadTasks();
    assert.deepStrictEqual(tasks, []);
  });

  it('returns empty array when tasks key is missing', () => {
    fs.writeFileSync(
      path.join(testDir, TASK_FILE_NAME),
      'version: 1',
      'utf8'
    );
    const tasks = loadTasks();
    assert.deepStrictEqual(tasks, []);
  });

  it('returns tasks when file has valid content', () => {
    const yamlContent = `version: 1
tasks:
  - id: 1
    text: Test task
    priority: high
    tags: []
    status: open
    created: "2025-12-03"
    completed: null
`;
    fs.writeFileSync(path.join(testDir, TASK_FILE_NAME), yamlContent, 'utf8');
    
    const tasks = loadTasks();
    
    assert.strictEqual(tasks.length, 1);
    assert.strictEqual(tasks[0].id, 1);
    assert.strictEqual(tasks[0].text, 'Test task');
    assert.strictEqual(tasks[0].priority, 'high');
    assert.strictEqual(tasks[0].status, 'open');
  });

  it('returns multiple tasks correctly', () => {
    const yamlContent = `version: 1
tasks:
  - id: 1
    text: First task
    priority: high
    tags: []
    status: open
    created: "2025-12-03"
    completed: null
  - id: 2
    text: Second task
    priority: low
    tags:
      - bug
    status: done
    created: "2025-12-02"
    completed: "2025-12-03"
`;
    fs.writeFileSync(path.join(testDir, TASK_FILE_NAME), yamlContent, 'utf8');
    
    const tasks = loadTasks();
    
    assert.strictEqual(tasks.length, 2);
    assert.strictEqual(tasks[0].id, 1);
    assert.strictEqual(tasks[1].id, 2);
    assert.deepStrictEqual(tasks[1].tags, ['bug']);
  });

  it('throws error for invalid YAML', () => {
    fs.writeFileSync(
      path.join(testDir, TASK_FILE_NAME),
      'invalid: yaml: content: [[[',
      'utf8'
    );
    
    assert.throws(
      () => loadTasks(),
      (err) => {
        assert.ok(err.message.includes('Invalid .taskflow.yaml'));
        return true;
      }
    );
  });
});

// ============================================
// saveTasks Tests
// ============================================

describe('saveTasks', () => {
  it('creates file if it does not exist', () => {
    const filePath = path.join(testDir, TASK_FILE_NAME);
    assert.ok(!fs.existsSync(filePath), 'File should not exist before save');
    
    saveTasks([]);
    
    assert.ok(fs.existsSync(filePath), 'File should exist after save');
  });

  it('writes valid YAML format', () => {
    saveTasks([]);
    
    const content = fs.readFileSync(
      path.join(testDir, TASK_FILE_NAME),
      'utf8'
    );
    
    // Should not throw when parsing
    const data = require('js-yaml').load(content);
    assert.ok(data, 'Should parse as valid YAML');
  });

  it('includes version and tasks keys', () => {
    saveTasks([]);
    
    const content = fs.readFileSync(
      path.join(testDir, TASK_FILE_NAME),
      'utf8'
    );
    const data = require('js-yaml').load(content);
    
    assert.strictEqual(data.version, SCHEMA_VERSION);
    assert.ok(Array.isArray(data.tasks));
  });

  it('writes empty tasks array correctly', () => {
    saveTasks([]);
    
    const content = fs.readFileSync(
      path.join(testDir, TASK_FILE_NAME),
      'utf8'
    );
    const data = require('js-yaml').load(content);
    
    assert.deepStrictEqual(data.tasks, []);
  });

  it('preserves all task fields', () => {
    const tasks = [
      {
        id: 1,
        text: 'Test task',
        priority: 'high',
        tags: ['bug', 'urgent'],
        status: 'open',
        created: '2025-12-03',
        completed: null
      }
    ];
    
    saveTasks(tasks);
    
    const content = fs.readFileSync(
      path.join(testDir, TASK_FILE_NAME),
      'utf8'
    );
    const data = require('js-yaml').load(content);
    
    assert.strictEqual(data.tasks[0].id, 1);
    assert.strictEqual(data.tasks[0].text, 'Test task');
    assert.strictEqual(data.tasks[0].priority, 'high');
    assert.deepStrictEqual(data.tasks[0].tags, ['bug', 'urgent']);
    assert.strictEqual(data.tasks[0].status, 'open');
    assert.strictEqual(data.tasks[0].created, '2025-12-03');
    assert.strictEqual(data.tasks[0].completed, null);
  });

  it('overwrites existing file', () => {
    // Write initial content
    saveTasks([{ id: 1, text: 'Original' }]);
    
    // Overwrite
    saveTasks([{ id: 2, text: 'Updated' }]);
    
    const tasks = loadTasks();
    assert.strictEqual(tasks.length, 1);
    assert.strictEqual(tasks[0].id, 2);
    assert.strictEqual(tasks[0].text, 'Updated');
  });

  it('handles null input gracefully', () => {
    saveTasks(null);
    
    const content = fs.readFileSync(
      path.join(testDir, TASK_FILE_NAME),
      'utf8'
    );
    const data = require('js-yaml').load(content);
    
    assert.deepStrictEqual(data.tasks, []);
  });
});

// ============================================
// Integration: Round-trip Test
// ============================================

describe('loadTasks + saveTasks integration', () => {
  it('round-trips tasks correctly', () => {
    const originalTasks = [
      {
        id: 1,
        text: 'First task',
        priority: 'high',
        tags: ['important'],
        status: 'open',
        created: '2025-12-03',
        completed: null
      },
      {
        id: 2,
        text: 'Second task',
        priority: 'medium',
        tags: [],
        status: 'done',
        created: '2025-12-02',
        completed: '2025-12-03'
      }
    ];
    
    // Save and reload
    saveTasks(originalTasks);
    const loadedTasks = loadTasks();
    
    assert.deepStrictEqual(loadedTasks, originalTasks);
  });
});

// ============================================
// getNextId Tests
// ============================================

describe('getNextId', () => {
  it('returns 1 for empty array', () => {
    const result = getNextId([]);
    assert.strictEqual(result, 1);
  });

  it('returns 1 for null input', () => {
    const result = getNextId(null);
    assert.strictEqual(result, 1);
  });

  it('returns 1 for undefined input', () => {
    const result = getNextId(undefined);
    assert.strictEqual(result, 1);
  });

  it('returns max + 1 for sequential IDs', () => {
    const tasks = [
      { id: 1, text: 'Task 1' },
      { id: 2, text: 'Task 2' }
    ];
    const result = getNextId(tasks);
    assert.strictEqual(result, 3);
  });

  it('handles gaps in IDs (returns max + 1, not fills gap)', () => {
    const tasks = [
      { id: 1, text: 'Task 1' },
      { id: 5, text: 'Task 5' }
    ];
    const result = getNextId(tasks);
    assert.strictEqual(result, 6);
  });

  it('handles single task', () => {
    const tasks = [{ id: 1, text: 'Only task' }];
    const result = getNextId(tasks);
    assert.strictEqual(result, 2);
  });

  it('handles tasks with high IDs', () => {
    const tasks = [
      { id: 100, text: 'Task 100' },
      { id: 50, text: 'Task 50' }
    ];
    const result = getNextId(tasks);
    assert.strictEqual(result, 101);
  });

  it('handles tasks without id field', () => {
    const tasks = [
      { id: 1, text: 'Has ID' },
      { text: 'No ID' }
    ];
    const result = getNextId(tasks);
    assert.strictEqual(result, 2);
  });
});

// ============================================
// createTask Tests
// ============================================

describe('createTask', () => {
  it('creates task with text', () => {
    const task = createTask('Test task');
    assert.strictEqual(task.text, 'Test task');
  });

  it('trims whitespace from text', () => {
    const task = createTask('  Trimmed task  ');
    assert.strictEqual(task.text, 'Trimmed task');
  });

  it('applies default priority (medium)', () => {
    const task = createTask('Test task');
    assert.strictEqual(task.priority, DEFAULTS.priority);
    assert.strictEqual(task.priority, 'medium');
  });

  it('applies default tags (empty array)', () => {
    const task = createTask('Test task');
    assert.deepStrictEqual(task.tags, DEFAULTS.tags);
    assert.deepStrictEqual(task.tags, []);
  });

  it('applies default status (open)', () => {
    const task = createTask('Test task');
    assert.strictEqual(task.status, DEFAULTS.status);
    assert.strictEqual(task.status, 'open');
  });

  it('sets created to today date', () => {
    const task = createTask('Test task');
    const today = getTodayDate();
    assert.strictEqual(task.created, today);
  });

  it('sets completed to null by default', () => {
    const task = createTask('Test task');
    assert.strictEqual(task.completed, null);
  });

  it('sets id to null by default (caller should set)', () => {
    const task = createTask('Test task');
    assert.strictEqual(task.id, null);
  });

  it('allows overriding priority', () => {
    const task = createTask('Test task', { priority: 'high' });
    assert.strictEqual(task.priority, 'high');
  });

  it('allows overriding tags', () => {
    const task = createTask('Test task', { tags: ['bug', 'urgent'] });
    assert.deepStrictEqual(task.tags, ['bug', 'urgent']);
  });

  it('allows overriding status', () => {
    const task = createTask('Test task', { status: 'done' });
    assert.strictEqual(task.status, 'done');
  });

  it('allows overriding created date', () => {
    const task = createTask('Test task', { created: '2025-01-01' });
    assert.strictEqual(task.created, '2025-01-01');
  });

  it('allows setting completed date', () => {
    const task = createTask('Test task', { completed: '2025-12-03' });
    assert.strictEqual(task.completed, '2025-12-03');
  });

  it('allows setting id', () => {
    const task = createTask('Test task', { id: 5 });
    assert.strictEqual(task.id, 5);
  });

  it('creates independent copy of tags array', () => {
    const originalTags = ['bug'];
    const task = createTask('Test task', { tags: originalTags });
    
    // Modify original array
    originalTags.push('modified');
    
    // Task tags should not be affected
    assert.deepStrictEqual(task.tags, ['bug']);
  });

  it('throws error for empty text', () => {
    assert.throws(
      () => createTask(''),
      (err) => {
        assert.ok(err.message.includes('Task text is required'));
        return true;
      }
    );
  });

  it('throws error for null text', () => {
    assert.throws(
      () => createTask(null),
      (err) => {
        assert.ok(err.message.includes('Task text is required'));
        return true;
      }
    );
  });

  it('throws error for non-string text', () => {
    assert.throws(
      () => createTask(123),
      (err) => {
        assert.ok(err.message.includes('must be a string'));
        return true;
      }
    );
  });
});

// ============================================
// getTodayDate Tests
// ============================================

describe('getTodayDate', () => {
  it('returns date in YYYY-MM-DD format', () => {
    const result = getTodayDate();
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns current date', () => {
    const result = getTodayDate();
    const now = new Date();
    const expected = now.toISOString().split('T')[0];
    assert.strictEqual(result, expected);
  });
});

