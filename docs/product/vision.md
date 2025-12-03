# Product Vision - TaskFlow CLI

> Last Updated: 2025-12-03

## The Problem

Developers constantly context-switch between coding and task management:

- **Jira/Asana/Trello** require leaving the terminal and breaking flow
- **Sticky notes** get lost and can't be shared
- **Plain text files** lack structure, filtering, and visual clarity
- **Existing CLI tools** are either too simplistic or overengineered

The result: tasks slip through the cracks, and developers lose precious focus time.

## Target Users

- **Primary User:** Solo developers who spend most of their day in the terminal and want a fast, keyboard-driven way to track tasks alongside their code.

- **Secondary User:** Small development teams who want lightweight, git-friendly task tracking without the overhead of enterprise tools.

### User Characteristics
- Prefer keyboard over mouse
- Value simplicity over feature bloat
- Want tasks stored locally (no cloud dependency)
- Appreciate beautiful terminal UIs

## The Solution

**TaskFlow** is a CLI task manager that feels native to the developer workflow:

1. **Quick Capture** — Add tasks in seconds without leaving the terminal
2. **Local Storage** — Tasks live in `.taskflow.yaml`, version-controllable with your code
3. **Smart Filtering** — Find tasks by priority, tag, or status instantly
4. **Beautiful Display** — Rich terminal UI with colors and visual hierarchy
5. **Git-Friendly** — Optional integration for commit messages

## Success Metrics

- [ ] Users can add and complete a task in under 5 seconds
- [ ] Zero configuration required to get started
- [ ] Task file is human-readable without the CLI
- [ ] Works offline with no external dependencies

## What We're NOT Building

- **Cloud sync** — Tasks are local-first; sync via git
- **Team collaboration features** — No real-time updates, comments, or assignments
- **Mobile/web clients** — Terminal only
- **Project management** — No sprints, boards, or burndown charts
- **Integrations beyond git** — No Slack, email, or calendar sync

## Core Principles

1. **Speed Over Features:** Every interaction should be instant. If it takes more than a few keystrokes, it's too slow.

2. **Local First:** Your data stays on your machine in a format you control. No accounts, no servers, no lock-in.

3. **Unix Philosophy:** Do one thing well. Compose with other tools via pipes and scripts.

4. **Developer Ergonomics:** Designed for people who type `git status` 50 times a day. Familiar patterns, minimal learning curve.

---

*Use `/shape-spec` to start defining individual features.*
