#!/usr/bin/env node

/**
 * TaskFlow CLI - Entry Point
 * A minimalist task manager for developers
 */

const packageJson = require('../package.json');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Handle --version flag
if (command === '--version' || command === '-v') {
  console.log(`taskflow-cli v${packageJson.version}`);
  process.exit(0);
}

// Handle --help flag
if (command === '--help' || command === '-h' || !command) {
  console.log(`
TaskFlow CLI v${packageJson.version}
A minimalist task manager for developers

Usage:
  tf <command> [options]

Commands:
  add <text>       Add a new task
  list             List all tasks
  done <id>        Mark a task as complete
  
Options:
  --version, -v    Show version number
  --help, -h       Show help

Examples:
  tf add "Fix login bug"
  tf list
  tf done 1
`);
  process.exit(0);
}

// Command not recognized
console.log(`Unknown command: ${command}`);
console.log('Run "tf --help" for usage information.');
process.exit(1);

