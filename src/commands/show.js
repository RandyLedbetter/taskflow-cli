/**
 * TaskFlow Show Command
 * Handles the "tf show" command for displaying task details
 */

const { loadTasks } = require('../storage');

/**
 * Parse show command arguments
 * @param {string[]} args - Raw command line arguments after "show"
 * @returns {{ id: string|null, help: boolean }}
 */
function parseShowArgs(args) {
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
      error: 'Task ID is required\n\nUsage: tf show <id>\n\nExample: tf show 1'
    };
  }

  // Check for empty string
  if (idStr.trim() === '') {
    return {
      valid: false,
      id: null,
      error: 'Task ID is required\n\nUsage: tf show <id>\n\nExample: tf show 1'
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
 * Format task details for display
 * @param {Object} task - Task to format
 * @returns {string} Formatted multi-line output
 */
function formatTaskDetails(task) {
  const lines = [];

  // Header
  lines.push(`Task #${task.id}`);

  // Text
  lines.push(`  Text:     ${task.text}`);

  // Priority
  lines.push(`  Priority: ${task.priority}`);

  // Status (with checkmark for done)
  if (task.status === 'done') {
    lines.push(`  Status:   done ✓`);
  } else {
    lines.push(`  Status:   ${task.status}`);
  }

  // Tags (only if present)
  if (task.tags && task.tags.length > 0) {
    const tagStr = task.tags.map(t => `#${t}`).join(' ');
    lines.push(`  Tags:     ${tagStr}`);
  }

  // Created
  if (task.created) {
    lines.push(`  Created:  ${task.created}`);
  }

  // Completed (only for done tasks)
  if (task.status === 'done' && task.completed) {
    lines.push(`  Completed: ${task.completed}`);
  }

  return lines.join('\n');
}

/**
 * Get help text for show command
 * @returns {string} Help text
 */
function getHelpText() {
  return `
Usage: tf show <id>

Display detailed information about a task.

Arguments:
  id              Task ID to display (required)

Options:
  -h, --help      Show this help message

Examples:
  tf show 1       # Show details of task #1
  tf show 42      # Show details of task #42
`.trim();
}

/**
 * Run the show command
 * @param {string[]} args - Command line arguments after "show"
 * @returns {{ success: boolean, output: string, exitCode: number }}
 */
function runShow(args) {
  // Parse arguments
  const parsed = parseShowArgs(args);

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

  // Return formatted output
  return {
    success: true,
    output: formatTaskDetails(task),
    exitCode: 0
  };
}

module.exports = {
  parseShowArgs,
  validateTaskId,
  findTaskById,
  formatTaskDetails,
  getHelpText,
  runShow
};

