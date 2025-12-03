/**
 * TaskFlow Add Command
 * Handles the "tf add" command for creating new tasks
 */

const { loadTasks, saveTasks, createTask, getNextId } = require('../storage');

// Valid priority levels
const VALID_PRIORITIES = ['high', 'medium', 'low'];

/**
 * Parse add command arguments
 * @param {string[]} args - Raw command line arguments after "add"
 * @returns {{ text: string|null, priority: string|null, tags: string[] }}
 */
function parseAddArgs(args) {
  const result = {
    text: null,
    priority: null,
    tags: []
  };

  if (!args || args.length === 0) {
    return result;
  }

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    // Handle --priority or -p
    if (arg === '--priority' || arg === '-p') {
      if (i + 1 < args.length) {
        result.priority = args[i + 1];
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    // Handle --tag or -t
    if (arg === '--tag' || arg === '-t') {
      if (i + 1 < args.length) {
        const tag = args[i + 1].trim();
        if (tag) {
          result.tags.push(tag);
        }
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    // Handle --help or -h
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      i++;
      continue;
    }

    // First non-flag argument is the task text
    if (result.text === null && !arg.startsWith('-')) {
      result.text = arg;
      i++;
      continue;
    }

    // Unknown argument
    i++;
  }

  return result;
}

/**
 * Validate add command input
 * @param {string} text - Task text
 * @param {string|null} priority - Priority level (or null for default)
 * @throws {Error} If validation fails
 */
function validateAddInput(text, priority) {
  // Check for missing text
  if (text === null || text === undefined) {
    const error = new Error('Task text is required');
    error.code = 'MISSING_TEXT';
    throw error;
  }

  // Check for empty or whitespace-only text
  if (typeof text !== 'string' || text.trim() === '') {
    const error = new Error('Task text cannot be empty');
    error.code = 'EMPTY_TEXT';
    throw error;
  }

  // Validate priority if provided
  if (priority !== null && priority !== undefined) {
    const normalizedPriority = priority.toLowerCase();
    if (!VALID_PRIORITIES.includes(normalizedPriority)) {
      const error = new Error(
        `Invalid priority "${priority}"\n\nValid priorities: ${VALID_PRIORITIES.join(', ')}`
      );
      error.code = 'INVALID_PRIORITY';
      throw error;
    }
  }
}

/**
 * Format success output for added task
 * @param {Object} task - The created task
 * @returns {string} Formatted output string
 */
function formatOutput(task) {
  let output = `✓ Added task #${task.id}\n`;
  output += `  "${task.text}" [${task.priority}]`;

  if (task.tags && task.tags.length > 0) {
    const tagStr = task.tags.map(t => `#${t}`).join(' ');
    output += ` ${tagStr}`;
  }

  return output;
}

/**
 * Get help text for add command
 * @returns {string} Help text
 */
function getHelpText() {
  return `
Usage: tf add <text> [options]

Add a new task to your task list.

Arguments:
  text              Task description (required, use quotes for multiple words)

Options:
  -p, --priority    Priority level: high, medium, low (default: medium)
  -t, --tag         Add a tag (can be used multiple times)
  -h, --help        Show this help message

Examples:
  tf add "Fix login bug"
  tf add "Write tests" -p high
  tf add "Refactor DB" --priority low -t backend -t urgent
`.trim();
}

/**
 * Run the add command
 * @param {string[]} args - Command line arguments after "add"
 * @returns {{ success: boolean, output: string, exitCode: number }}
 */
function runAdd(args) {
  // Parse arguments
  const parsed = parseAddArgs(args);

  // Show help if requested
  if (parsed.help) {
    return {
      success: true,
      output: getHelpText(),
      exitCode: 0
    };
  }

  // Validate input
  try {
    validateAddInput(parsed.text, parsed.priority);
  } catch (err) {
    let output = `Error: ${err.message}`;
    
    if (err.code === 'MISSING_TEXT') {
      output += '\n\nUsage: tf add <text> [options]\n\nExample: tf add "Fix the login bug" -p high';
    }

    return {
      success: false,
      output,
      exitCode: 1
    };
  }

  // Normalize priority (case-insensitive)
  const priority = parsed.priority 
    ? parsed.priority.toLowerCase() 
    : null;

  // Load existing tasks
  let tasks;
  try {
    tasks = loadTasks();
  } catch (err) {
    return {
      success: false,
      output: `Error loading tasks: ${err.message}`,
      exitCode: 1
    };
  }

  // Get next ID
  const nextId = getNextId(tasks);

  // Create the task
  const task = createTask(parsed.text, {
    id: nextId,
    priority: priority,
    tags: parsed.tags
  });

  // Add to tasks and save
  tasks.push(task);
  
  try {
    saveTasks(tasks);
  } catch (err) {
    return {
      success: false,
      output: `Error saving task: ${err.message}`,
      exitCode: 1
    };
  }

  // Return success
  return {
    success: true,
    output: formatOutput(task),
    exitCode: 0
  };
}

module.exports = {
  parseAddArgs,
  validateAddInput,
  formatOutput,
  getHelpText,
  runAdd,
  VALID_PRIORITIES
};

