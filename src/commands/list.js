/**
 * TaskFlow List Command
 * Handles the "tf list" command for displaying tasks
 */

const { loadTasks } = require('../storage');

// Priority order for sorting (lower = higher priority)
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// Priority indicators (emoji)
const PRIORITY_INDICATORS = {
  high: '🔴',
  medium: '🟡',
  low: '🟢'
};

// Done indicator
const DONE_INDICATOR = '✅';

// Valid priorities for validation
const VALID_PRIORITIES = ['high', 'medium', 'low'];

/**
 * Parse list command arguments
 * @param {string[]} args - Raw command line arguments after "list"
 * @returns {{ done: boolean, all: boolean, priority: string|null, tag: string|null, help: boolean }}
 */
function parseListArgs(args) {
  const result = {
    done: false,
    all: false,
    priority: null,
    tag: null,
    help: false
  };

  if (!args || args.length === 0) {
    return result;
  }

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    // Handle --done
    if (arg === '--done') {
      result.done = true;
      i++;
      continue;
    }

    // Handle --all or -a
    if (arg === '--all' || arg === '-a') {
      result.all = true;
      i++;
      continue;
    }

    // Handle --priority or -p
    if (arg === '--priority' || arg === '-p') {
      if (i + 1 < args.length) {
        result.priority = args[i + 1].toLowerCase();
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    // Handle --tag or -t
    if (arg === '--tag' || arg === '-t') {
      if (i + 1 < args.length) {
        result.tag = args[i + 1].trim();
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

    // Unknown argument - skip
    i++;
  }

  return result;
}

/**
 * Validate list command filters
 * @param {Object} filters - Parsed filters
 * @throws {Error} If validation fails
 */
function validateFilters(filters) {
  if (filters.priority && !VALID_PRIORITIES.includes(filters.priority)) {
    const error = new Error(
      `Invalid priority "${filters.priority}"\n\nValid priorities: ${VALID_PRIORITIES.join(', ')}`
    );
    error.code = 'INVALID_PRIORITY';
    throw error;
  }
}

/**
 * Filter tasks based on criteria
 * @param {Array} tasks - All tasks
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered tasks
 */
function filterTasks(tasks, filters) {
  return tasks.filter(task => {
    // Status filter
    if (filters.done) {
      // Show only done tasks
      if (task.status !== 'done') return false;
    } else if (!filters.all) {
      // Default: show only open tasks
      if (task.status === 'done') return false;
    }
    // If filters.all is true, show all regardless of status

    // Priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    // Tag filter
    if (filters.tag) {
      if (!task.tags || !task.tags.includes(filters.tag)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort tasks by priority (high→medium→low) then by ID
 * @param {Array} tasks - Tasks to sort
 * @returns {Array} Sorted tasks (new array)
 */
function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    // Sort by priority first
    const priorityA = PRIORITY_ORDER[a.priority] ?? 999;
    const priorityB = PRIORITY_ORDER[b.priority] ?? 999;
    const priorityDiff = priorityA - priorityB;
    
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    // Then by ID
    return (a.id || 0) - (b.id || 0);
  });
}

/**
 * Format a single task for display
 * @param {Object} task - Task to format
 * @returns {string} Formatted line
 */
function formatTask(task) {
  const isDone = task.status === 'done';
  
  // Choose indicator
  const indicator = isDone 
    ? DONE_INDICATOR 
    : (PRIORITY_INDICATORS[task.priority] || '⚪');
  
  // Build the line
  let line = `${indicator} #${task.id} ${task.text} [${task.priority}]`;
  
  // Add tags if present
  if (task.tags && task.tags.length > 0) {
    const tagStr = task.tags.map(t => `#${t}`).join(' ');
    line += ` ${tagStr}`;
  }
  
  // Add done indicator text
  if (isDone) {
    line += ' (done)';
  }
  
  return line;
}

/**
 * Get context-aware empty state message
 * @param {Object} filters - Active filters
 * @returns {string} Empty state message
 */
function getEmptyMessage(filters) {
  if (filters.done) {
    if (filters.priority) {
      return `No completed ${filters.priority} priority tasks found.`;
    }
    if (filters.tag) {
      return `No completed tasks with tag "${filters.tag}" found.`;
    }
    return 'No completed tasks.';
  }
  
  if (filters.priority && filters.tag) {
    return `No ${filters.priority} priority tasks with tag "${filters.tag}" found.`;
  }
  
  if (filters.priority) {
    return `No ${filters.priority} priority tasks found.`;
  }
  
  if (filters.tag) {
    return `No tasks with tag "${filters.tag}" found.`;
  }
  
  if (filters.all) {
    return 'No tasks found. Use \'tf add "task"\' to create one.';
  }
  
  return 'No open tasks. Use \'tf add "task"\' to create one.';
}

/**
 * Format the full task list output
 * @param {Array} tasks - Filtered and sorted tasks
 * @param {Object} filters - Active filters (for empty state messages)
 * @returns {string} Complete output
 */
function formatTaskList(tasks, filters) {
  if (!tasks || tasks.length === 0) {
    return getEmptyMessage(filters);
  }
  
  return tasks.map(formatTask).join('\n');
}

/**
 * Get help text for list command
 * @returns {string} Help text
 */
function getHelpText() {
  return `
Usage: tf list [options]

List and filter your tasks.

Options:
  --done              Show completed tasks only
  -a, --all           Show all tasks (open + done)
  -p, --priority      Filter by priority: high, medium, low
  -t, --tag           Filter by tag
  -h, --help          Show this help message

Examples:
  tf list                     # Show open tasks
  tf list --done              # Show completed tasks
  tf list --all               # Show all tasks
  tf list -p high             # Show high priority tasks
  tf list -t backend          # Show tasks tagged "backend"
  tf list -p high -t api      # Combine filters

Output:
  🔴 = high priority
  🟡 = medium priority
  🟢 = low priority
  ✅ = completed
`.trim();
}

/**
 * Run the list command
 * @param {string[]} args - Command line arguments after "list"
 * @returns {{ success: boolean, output: string, exitCode: number }}
 */
function runList(args) {
  // Parse arguments
  const filters = parseListArgs(args);

  // Show help if requested
  if (filters.help) {
    return {
      success: true,
      output: getHelpText(),
      exitCode: 0
    };
  }

  // Validate filters
  try {
    validateFilters(filters);
  } catch (err) {
    return {
      success: false,
      output: `Error: ${err.message}`,
      exitCode: 1
    };
  }

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

  // Filter tasks
  const filteredTasks = filterTasks(tasks, filters);

  // Sort tasks
  const sortedTasks = sortTasks(filteredTasks);

  // Format output
  const output = formatTaskList(sortedTasks, filters);

  return {
    success: true,
    output,
    exitCode: 0
  };
}

module.exports = {
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
};

