/**
 * TaskFlow Done Command
 * Handles the "tf done" command for marking tasks as complete
 */

const { loadTasks, saveTasks, getTodayDate } = require('../storage');

/**
 * Parse done command arguments
 * @param {string[]} args - Raw command line arguments after "done"
 * @returns {{ id: string|null, help: boolean }}
 */
function parseDoneArgs(args) {
  const result = {
    id: null,
    help: false
  };

  if (!args || args.length === 0) {
    return result;
  }

  for (const arg of args) {
    // Handle --help or -h
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      continue;
    }

    // First non-flag argument is the task ID
    if (result.id === null && !arg.startsWith('-')) {
      result.id = arg;
    }
  }

  return result;
}

/**
 * Validate task ID
 * @param {string} idStr - ID string from command line
 * @returns {{ valid: boolean, id: number|null, error: string|null }}
 */
function validateTaskId(idStr) {
  // Check for missing ID
  if (idStr === null || idStr === undefined) {
    return {
      valid: false,
      id: null,
      error: 'Task ID is required\n\nUsage: tf done <id>\n\nExample: tf done 1'
    };
  }

  // Check for empty string
  if (idStr.trim() === '') {
    return {
      valid: false,
      id: null,
      error: 'Task ID is required\n\nUsage: tf done <id>\n\nExample: tf done 1'
    };
  }

  // Parse as number
  const id = Number(idStr);

  // Check for non-numeric
  if (isNaN(id)) {
    return {
      valid: false,
      id: null,
      error: `Invalid task ID "${idStr}"\n\nTask ID must be a number.`
    };
  }

  // Check for decimal
  if (!Number.isInteger(id)) {
    return {
      valid: false,
      id: null,
      error: `Invalid task ID "${idStr}"\n\nTask ID must be a whole number.`
    };
  }

  // Check for zero or negative
  if (id <= 0) {
    return {
      valid: false,
      id: null,
      error: `Invalid task ID "${idStr}"\n\nTask ID must be a positive number.`
    };
  }

  return {
    valid: true,
    id: id,
    error: null
  };
}

/**
 * Find a task by ID
 * @param {Array} tasks - All tasks
 * @param {number} id - Task ID to find
 * @returns {Object|null} Task or null if not found
 */
function findTaskById(tasks, id) {
  if (!tasks || !Array.isArray(tasks)) {
    return null;
  }
  return tasks.find(task => task.id === id) || null;
}

/**
 * Mark a task as done
 * @param {Object} task - Task to mark done
 * @returns {boolean} True if status changed, false if already done
 */
function markTaskDone(task) {
  if (task.status === 'done') {
    return false; // Already done, no change
  }

  task.status = 'done';
  task.completed = getTodayDate();
  return true;
}

/**
 * Format success/warning output
 * @param {Object} task - The task
 * @param {boolean} wasAlreadyDone - Whether it was already complete
 * @returns {string} Formatted output
 */
function formatOutput(task, wasAlreadyDone) {
  const tagStr = task.tags && task.tags.length > 0
    ? ' ' + task.tags.map(t => `#${t}`).join(' ')
    : '';

  if (wasAlreadyDone) {
    return `Task #${task.id} was already complete\n  "${task.text}" [${task.priority}]${tagStr}`;
  }

  return `✓ Completed task #${task.id}\n  "${task.text}" [${task.priority}]${tagStr} → done`;
}

/**
 * Get help text for done command
 * @returns {string} Help text
 */
function getHelpText() {
  return `
Usage: tf done <id>

Mark a task as complete.

Arguments:
  id              Task ID to mark as complete (required)

Options:
  -h, --help      Show this help message

Examples:
  tf done 1       # Mark task #1 as complete
  tf done 42      # Mark task #42 as complete
`.trim();
}

/**
 * Run the done command
 * @param {string[]} args - Command line arguments after "done"
 * @returns {{ success: boolean, output: string, exitCode: number }}
 */
function runDone(args) {
  // Parse arguments
  const parsed = parseDoneArgs(args);

  // Show help if requested
  if (parsed.help) {
    return {
      success: true,
      output: getHelpText(),
      exitCode: 0
    };
  }

  // Validate ID
  const validation = validateTaskId(parsed.id);
  if (!validation.valid) {
    return {
      success: false,
      output: `Error: ${validation.error}`,
      exitCode: 1
    };
  }

  const taskId = validation.id;

  // Load tasks
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

  // Find the task
  const task = findTaskById(tasks, taskId);
  if (!task) {
    return {
      success: false,
      output: `Error: Task #${taskId} not found\n\nRun 'tf list --all' to see available tasks.`,
      exitCode: 1
    };
  }

  // Check if already done
  const wasAlreadyDone = task.status === 'done';

  // Mark as done (if not already)
  if (!wasAlreadyDone) {
    markTaskDone(task);

    // Save tasks
    try {
      saveTasks(tasks);
    } catch (err) {
      return {
        success: false,
        output: `Error saving tasks: ${err.message}`,
        exitCode: 1
      };
    }
  }

  // Return success (or warning for already done)
  return {
    success: true,
    output: formatOutput(task, wasAlreadyDone),
    exitCode: 0
  };
}

module.exports = {
  parseDoneArgs,
  validateTaskId,
  findTaskById,
  markTaskDone,
  formatOutput,
  getHelpText,
  runDone
};

