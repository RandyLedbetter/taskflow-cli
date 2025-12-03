#!/usr/bin/env node

/**
 * TaskFlow CLI - Entry Point
 * A minimalist task manager for developers
 */

const packageJson = require('../package.json');
const { runAdd } = require('./commands/add');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

// Handle --version flag
if (command === '--version' || command === '-v') {
  console.log(`taskflow-cli v${packageJson.version}`);
  process.exit(0);
}

// Handle --help flag (global)
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
  tf add "Urgent task" -p high -t backend
  tf list
  tf done 1

Run 'tf <command> --help' for more information on a specific command.
`);
  process.exit(0);
}

// Route commands
switch (command) {
  case 'add': {
    const result = runAdd(commandArgs);
    console.log(result.output);
    process.exit(result.exitCode);
    break;
  }

  case 'list': {
    // TODO: Implement in task-list spec
    console.log('List command not yet implemented.');
    console.log('Coming soon!');
    process.exit(0);
    break;
  }

  case 'done': {
    // TODO: Implement in task-done spec
    console.log('Done command not yet implemented.');
    console.log('Coming soon!');
    process.exit(0);
    break;
  }

  default: {
    console.error(`Unknown command: ${command}`);
    console.error('');
    console.error('Run "tf --help" for usage information.');
    process.exit(1);
  }
}
