/**
 * Add Command Tests
 * Tests for parseAddArgs, validateAddInput, formatOutput, and runAdd
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  parseAddArgs,
  validateAddInput,
  formatOutput,
  getHelpText,
  runAdd,
  VALID_PRIORITIES
} = require('../src/commands/add.js');

const { TASK_FILE_NAME } = require('../src/storage.js');

// Test in a temporary directory to avoid polluting the project
let testDir;
let originalCwd;

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-add-test-'));
  originalCwd = process.cwd();
  process.chdir(testDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(testDir, { recursive: true, force: true });
});

// ============================================
// parseAddArgs Tests
// ============================================

describe('parseAddArgs', () => {
  it('returns null text for empty args', () => {
    const result = parseAddArgs([]);
    assert.strictEqual(result.text, null);
  });

  it('parses text only', () => {
    const result = parseAddArgs(['Fix the bug']);
    assert.strictEqual(result.text, 'Fix the bug');
    assert.strictEqual(result.priority, null);
    assert.deepStrictEqual(result.tags, []);
  });

  it('parses text with --priority flag', () => {
    const result = parseAddArgs(['Fix bug', '--priority', 'high']);
    assert.strictEqual(result.text, 'Fix bug');
    assert.strictEqual(result.priority, 'high');
  });

  it('parses text with -p short flag', () => {
    const result = parseAddArgs(['Fix bug', '-p', 'low']);
    assert.strictEqual(result.text, 'Fix bug');
    assert.strictEqual(result.priority, 'low');
  });

  it('parses text with --tag flag', () => {
    const result = parseAddArgs(['Fix bug', '--tag', 'backend']);
    assert.strictEqual(result.text, 'Fix bug');
    assert.deepStrictEqual(result.tags, ['backend']);
  });

  it('parses text with -t short flag', () => {
    const result = parseAddArgs(['Fix bug', '-t', 'urgent']);
    assert.strictEqual(result.text, 'Fix bug');
    assert.deepStrictEqual(result.tags, ['urgent']);
  });

  it('parses multiple --tag flags', () => {
    const result = parseAddArgs(['Fix bug', '--tag', 'backend', '--tag', 'urgent']);
    assert.deepStrictEqual(result.tags, ['backend', 'urgent']);
  });

  it('parses multiple -t flags', () => {
    const result = parseAddArgs(['Fix bug', '-t', 'bug', '-t', 'critical']);
    assert.deepStrictEqual(result.tags, ['bug', 'critical']);
  });

  it('parses mixed flags', () => {
    const result = parseAddArgs(['Task', '-p', 'high', '-t', 'bug', '--tag', 'api']);
    assert.strictEqual(result.text, 'Task');
    assert.strictEqual(result.priority, 'high');
    assert.deepStrictEqual(result.tags, ['bug', 'api']);
  });

  it('returns default priority (null) when not specified', () => {
    const result = parseAddArgs(['Fix bug']);
    assert.strictEqual(result.priority, null);
  });

  it('returns empty tags when not specified', () => {
    const result = parseAddArgs(['Fix bug']);
    assert.deepStrictEqual(result.tags, []);
  });

  it('ignores empty tag values', () => {
    const result = parseAddArgs(['Task', '-t', '', '-t', 'valid']);
    assert.deepStrictEqual(result.tags, ['valid']);
  });

  it('handles --help flag', () => {
    const result = parseAddArgs(['--help']);
    assert.strictEqual(result.help, true);
  });

  it('handles -h flag', () => {
    const result = parseAddArgs(['-h']);
    assert.strictEqual(result.help, true);
  });

  it('handles text before flags', () => {
    const result = parseAddArgs(['My task', '-p', 'high']);
    assert.strictEqual(result.text, 'My task');
    assert.strictEqual(result.priority, 'high');
  });
});

// ============================================
// validateAddInput Tests
// ============================================

describe('validateAddInput', () => {
  it('accepts valid text and priority', () => {
    assert.doesNotThrow(() => validateAddInput('Valid task', 'high'));
  });

  it('accepts text with null priority', () => {
    assert.doesNotThrow(() => validateAddInput('Valid task', null));
  });

  it('throws for null text', () => {
    assert.throws(
      () => validateAddInput(null, null),
      (err) => {
        assert.strictEqual(err.code, 'MISSING_TEXT');
        assert.ok(err.message.includes('required'));
        return true;
      }
    );
  });

  it('throws for undefined text', () => {
    assert.throws(
      () => validateAddInput(undefined, null),
      (err) => {
        assert.strictEqual(err.code, 'MISSING_TEXT');
        return true;
      }
    );
  });

  it('throws for empty text', () => {
    assert.throws(
      () => validateAddInput('', null),
      (err) => {
        assert.strictEqual(err.code, 'EMPTY_TEXT');
        assert.ok(err.message.includes('cannot be empty'));
        return true;
      }
    );
  });

  it('throws for whitespace-only text', () => {
    assert.throws(
      () => validateAddInput('   ', null),
      (err) => {
        assert.strictEqual(err.code, 'EMPTY_TEXT');
        return true;
      }
    );
  });

  it('throws for invalid priority', () => {
    assert.throws(
      () => validateAddInput('Task', 'invalid'),
      (err) => {
        assert.strictEqual(err.code, 'INVALID_PRIORITY');
        assert.ok(err.message.includes('Invalid priority'));
        assert.ok(err.message.includes('high'));
        assert.ok(err.message.includes('medium'));
        assert.ok(err.message.includes('low'));
        return true;
      }
    );
  });

  it('accepts priority case-insensitively (HIGH)', () => {
    assert.doesNotThrow(() => validateAddInput('Task', 'HIGH'));
  });

  it('accepts priority case-insensitively (High)', () => {
    assert.doesNotThrow(() => validateAddInput('Task', 'High'));
  });

  it('accepts priority case-insensitively (MEDIUM)', () => {
    assert.doesNotThrow(() => validateAddInput('Task', 'MEDIUM'));
  });

  it('accepts all valid priorities', () => {
    for (const priority of VALID_PRIORITIES) {
      assert.doesNotThrow(() => validateAddInput('Task', priority));
    }
  });
});

// ============================================
// formatOutput Tests
// ============================================

describe('formatOutput', () => {
  it('formats basic task', () => {
    const task = { id: 1, text: 'Fix bug', priority: 'medium', tags: [] };
    const output = formatOutput(task);
    assert.ok(output.includes('✓ Added task #1'));
    assert.ok(output.includes('"Fix bug"'));
    assert.ok(output.includes('[medium]'));
  });

  it('formats task with high priority', () => {
    const task = { id: 5, text: 'Urgent fix', priority: 'high', tags: [] };
    const output = formatOutput(task);
    assert.ok(output.includes('#5'));
    assert.ok(output.includes('[high]'));
  });

  it('formats task with tags', () => {
    const task = { id: 1, text: 'Task', priority: 'low', tags: ['bug', 'urgent'] };
    const output = formatOutput(task);
    assert.ok(output.includes('#bug'));
    assert.ok(output.includes('#urgent'));
  });

  it('formats task with single tag', () => {
    const task = { id: 1, text: 'Task', priority: 'medium', tags: ['backend'] };
    const output = formatOutput(task);
    assert.ok(output.includes('#backend'));
  });

  it('does not show tags section when tags is empty', () => {
    const task = { id: 1, text: 'Task', priority: 'medium', tags: [] };
    const output = formatOutput(task);
    // Output should have #1 (task ID) but not any tag markers like #bug
    // The format is: "Task" [medium] #tag1 #tag2
    // So check it ends with the priority bracket, not tags
    assert.ok(output.includes('[medium]'));
    assert.ok(!output.includes('[medium] #')); // No tags after priority
  });
});

// ============================================
// getHelpText Tests
// ============================================

describe('getHelpText', () => {
  it('includes usage information', () => {
    const help = getHelpText();
    assert.ok(help.includes('Usage:'));
    assert.ok(help.includes('tf add'));
  });

  it('includes priority option', () => {
    const help = getHelpText();
    assert.ok(help.includes('--priority'));
    assert.ok(help.includes('-p'));
  });

  it('includes tag option', () => {
    const help = getHelpText();
    assert.ok(help.includes('--tag'));
    assert.ok(help.includes('-t'));
  });

  it('includes examples', () => {
    const help = getHelpText();
    assert.ok(help.includes('Examples:'));
  });
});

// ============================================
// runAdd Tests
// ============================================

describe('runAdd', () => {
  it('creates task with defaults', () => {
    const result = runAdd(['Fix the bug']);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output.includes('Added task #1'));
    assert.ok(result.output.includes('[medium]'));
  });

  it('creates task with priority', () => {
    const result = runAdd(['Urgent task', '-p', 'high']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('[high]'));
  });

  it('creates task with tags', () => {
    const result = runAdd(['Backend task', '-t', 'api', '-t', 'backend']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('#api'));
    assert.ok(result.output.includes('#backend'));
  });

  it('creates task with priority and tags', () => {
    const result = runAdd(['Complex task', '-p', 'low', '-t', 'refactor']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('[low]'));
    assert.ok(result.output.includes('#refactor'));
  });

  it('auto-creates file if missing', () => {
    const filePath = path.join(testDir, TASK_FILE_NAME);
    assert.ok(!fs.existsSync(filePath));
    
    runAdd(['First task']);
    
    assert.ok(fs.existsSync(filePath));
  });

  it('assigns correct ID (first task)', () => {
    const result = runAdd(['First task']);
    assert.ok(result.output.includes('#1'));
  });

  it('assigns correct ID (second task)', () => {
    runAdd(['First task']);
    const result = runAdd(['Second task']);
    assert.ok(result.output.includes('#2'));
  });

  it('assigns correct ID (third task)', () => {
    runAdd(['First']);
    runAdd(['Second']);
    const result = runAdd(['Third']);
    assert.ok(result.output.includes('#3'));
  });

  it('returns error for missing text', () => {
    const result = runAdd([]);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('Error'));
    assert.ok(result.output.includes('required'));
  });

  it('returns error for empty text', () => {
    const result = runAdd(['']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('cannot be empty'));
  });

  it('returns error for invalid priority', () => {
    const result = runAdd(['Task', '-p', 'invalid']);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.output.includes('Invalid priority'));
  });

  it('shows help when --help is passed', () => {
    const result = runAdd(['--help']);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output.includes('Usage:'));
  });

  it('shows help when -h is passed', () => {
    const result = runAdd(['-h']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('Usage:'));
  });

  it('normalizes priority to lowercase', () => {
    const result = runAdd(['Task', '-p', 'HIGH']);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes('[high]'));
  });

  it('persists task to file', () => {
    runAdd(['Persistent task', '-p', 'high', '-t', 'important']);
    
    const filePath = path.join(testDir, TASK_FILE_NAME);
    const content = fs.readFileSync(filePath, 'utf8');
    
    assert.ok(content.includes('Persistent task'));
    assert.ok(content.includes('high'));
    assert.ok(content.includes('important'));
  });
});

// ============================================
// Integration Tests
// ============================================

describe('runAdd integration', () => {
  it('multiple tasks have incrementing IDs', () => {
    runAdd(['Task 1']);
    runAdd(['Task 2']);
    runAdd(['Task 3']);
    
    const filePath = path.join(testDir, TASK_FILE_NAME);
    const content = fs.readFileSync(filePath, 'utf8');
    const yaml = require('js-yaml');
    const data = yaml.load(content);
    
    assert.strictEqual(data.tasks.length, 3);
    assert.strictEqual(data.tasks[0].id, 1);
    assert.strictEqual(data.tasks[1].id, 2);
    assert.strictEqual(data.tasks[2].id, 3);
  });

  it('tasks preserve all fields', () => {
    runAdd(['Full task', '-p', 'high', '-t', 'bug', '-t', 'urgent']);
    
    const filePath = path.join(testDir, TASK_FILE_NAME);
    const content = fs.readFileSync(filePath, 'utf8');
    const yaml = require('js-yaml');
    const data = yaml.load(content);
    
    const task = data.tasks[0];
    assert.strictEqual(task.id, 1);
    assert.strictEqual(task.text, 'Full task');
    assert.strictEqual(task.priority, 'high');
    assert.deepStrictEqual(task.tags, ['bug', 'urgent']);
    assert.strictEqual(task.status, 'open');
    assert.ok(task.created); // Should have a date
    assert.strictEqual(task.completed, null);
  });
});

