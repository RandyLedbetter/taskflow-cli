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
  TASK_FILE_NAME,
  SCHEMA_VERSION
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

