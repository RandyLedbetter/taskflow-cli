/**
 * TaskFlow Storage Module
 * Handles reading and writing tasks to .taskflow.yaml
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Constants
const TASK_FILE_NAME = '.taskflow.yaml';
const SCHEMA_VERSION = 1;

/**
 * Get the path to the task file in the current directory
 * @returns {string} Absolute path to .taskflow.yaml
 */
function getTaskFilePath() {
  return path.join(process.cwd(), TASK_FILE_NAME);
}

/**
 * Load tasks from .taskflow.yaml
 * @returns {Array} Array of tasks (empty if file doesn't exist)
 * @throws {Error} If file exists but contains invalid YAML
 */
function loadTasks() {
  const filePath = getTaskFilePath();

  // Return empty array if file doesn't exist
  if (!fs.existsSync(filePath)) {
    return [];
  }

  // Read file contents
  const contents = fs.readFileSync(filePath, 'utf8');

  // Return empty array if file is empty
  if (!contents || contents.trim() === '') {
    return [];
  }

  // Parse YAML
  let data;
  try {
    data = yaml.load(contents);
  } catch (err) {
    throw new Error(`Invalid .taskflow.yaml: ${err.message}`);
  }

  // Handle null/undefined data (empty YAML)
  if (!data) {
    return [];
  }

  // Handle missing or null tasks array
  if (!data.tasks || !Array.isArray(data.tasks)) {
    return [];
  }

  return data.tasks;
}

/**
 * Save tasks to .taskflow.yaml
 * @param {Array} tasks - Array of tasks to save
 */
function saveTasks(tasks) {
  const filePath = getTaskFilePath();

  const data = {
    version: SCHEMA_VERSION,
    tasks: tasks || []
  };

  // Convert to YAML with nice formatting
  const yamlContent = yaml.dump(data, {
    indent: 2,
    lineWidth: -1, // Don't wrap lines
    noRefs: true,  // Don't use YAML references
    sortKeys: false // Preserve key order
  });

  // Write to file (creates if doesn't exist)
  fs.writeFileSync(filePath, yamlContent, 'utf8');
}

/**
 * Get the next available task ID
 * @param {Array} tasks - Current tasks array
 * @returns {number} Next ID (max existing ID + 1, or 1 if empty)
 */
function getNextId(tasks) {
  // TODO: Implement in task-storage-3
  if (!tasks || tasks.length === 0) {
    return 1;
  }
  const maxId = Math.max(...tasks.map(t => t.id || 0));
  return maxId + 1;
}

/**
 * Create a new task with defaults applied
 * @param {string} text - Task description
 * @param {Object} options - Optional overrides (priority, tags, etc.)
 * @returns {Object} Complete task object with all fields
 */
function createTask(text, options = {}) {
  // TODO: Implement in task-storage-3
  return { text };
}

module.exports = {
  getTaskFilePath,
  loadTasks,
  saveTasks,
  getNextId,
  createTask,
  TASK_FILE_NAME,
  SCHEMA_VERSION
};
