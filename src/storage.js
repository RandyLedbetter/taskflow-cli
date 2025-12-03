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
  // TODO: Implement in task-storage-2
  return [];
}

/**
 * Save tasks to .taskflow.yaml
 * @param {Array} tasks - Array of tasks to save
 */
function saveTasks(tasks) {
  // TODO: Implement in task-storage-2
}

/**
 * Get the next available task ID
 * @param {Array} tasks - Current tasks array
 * @returns {number} Next ID (max existing ID + 1, or 1 if empty)
 */
function getNextId(tasks) {
  // TODO: Implement in task-storage-3
  return 1;
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

