# cursor-agent-os Manual Testing Guide

Welcome! This guide walks you through testing **cursor-agent-os** - a spec-driven development system for Cursor IDE.

---

## Prerequisites

- Node.js 18+ installed
- Cursor IDE
- This folder open in Cursor

---

## Installation

Since the package isn't published to npm yet, we'll run it directly from the source.

### Setup (One-time)

Create a shell alias that points to the local source:

```bash
alias cursor-agent-os='node /c/dev/cursor-agent-os/bin/cli.js'
```

Verify it works:
```bash
cursor-agent-os --help
```

You should see the help output with commands and options.

### Make It Permanent (Optional)

Add to your `~/.bashrc` or `~/.bash_profile`:
```bash
echo "alias cursor-agent-os='node /c/dev/cursor-agent-os/bin/cli.js'" >> ~/.bashrc
```

---

**For this guide, we'll use `cursor-agent-os` (the alias you just created).**

---

## Testing Phases

Each phase builds on the previous. Follow them in order.

---

### Phase 1: Pre-Installation Verification

**Goal:** Verify the CLI works before initializing anything.

#### Test 1.1: Check Help Output
```bash
cursor-agent-os --help
```

**Expected:** Clean help output showing:
- Available commands (init, status, list, validate, etc.)
- Options (--yes, --dry-run, --force)
- Examples

**Questions to consider:**
- Is the help clear and well-organized?
- Are the command descriptions understandable?

#### Test 1.2: Check Version
```bash
cursor-agent-os --version
```

**Expected:** Version number (e.g., `0.2.0`)

#### Test 1.3: Check Status on Empty Folder
```bash
cursor-agent-os status
```

**Expected:** 
- "❌ Not initialized" message
- Suggestion to run `cursor-agent-os init`

This confirms commands gracefully handle uninitialized projects.

---

### Phase 2: Dry Run Preview

**Goal:** See what files would be created WITHOUT creating them.

#### Test 2.1: Preview File Generation
```bash
cursor-agent-os init --dry-run
```

**Expected:** 
- List of ~20 files that would be created
- **No actual files created** (verify with `ls -la`)
- Total file count shown

**Verify nothing was created:**
```bash
ls -la
```
Should show only the README.md file.

**Questions to consider:**
- Is the file list helpful for understanding what the tool does?
- Would you feel confident proceeding after seeing this preview?

---

### Phase 3: Initialize the Project

**Goal:** Actually initialize the project with defaults.

#### Test 3.1: Initialize with Defaults
```bash
cursor-agent-os init --yes
```

**Expected:**
- Project analysis message
- Configuration summary (project name, type, team size)
- Note about CURSOR_API_KEY (enabled if env var set, otherwise disabled)
- File creation progress with checkmarks
- Success message with next steps

#### Test 3.1b (Alternative): Interactive Mode
If you want to test the full interactive experience:
```bash
# First remove init files to start fresh
rm -rf .cursorrules .cursor docs prompts QUICKSTART.md .cursor-agent-os.yaml .gitignore

# Run interactive init
cursor-agent-os init
```

**Interactive prompts you'll see:**
1. Project name confirmation
2. Project type selection (if not auto-detected)
3. Team size selection
4. Coding standards level
5. Enable Cloud Agents? (Yes/No)
6. **If Yes:** Paste your Cursor API key (or press Enter to skip)

This is how users configure their API key during setup.

#### Test 3.2: Verify Files Were Created
```bash
ls -la
```

**Expected files/folders:**
- `.cursorrules` - Main AI instructions
- `.cursor/` - Cursor-specific rules
- `docs/` - Documentation structure
- `prompts/` - Workflow command prompts
- `QUICKSTART.md` - Getting started guide

```bash
ls docs/
```

**Expected:**
- `product/` - Vision and roadmap
- `specs/` - Feature specifications
- `standards/` - Coding standards
- `sprint.yaml` - Sprint tracking

```bash
ls prompts/
```

**Expected:** Workflow prompts (plan-product.md, shape-spec.md, etc.)

**Questions to consider:**
- Was the output informative but not overwhelming?
- Did the "Next steps" guidance make sense?

---

### Phase 4: Explore Generated Content

**Goal:** Review what was generated.

#### Test 4.1: Read the Quickstart Guide
```bash
cat QUICKSTART.md
```

Or open it in Cursor. This is what users see after init.

#### Test 4.2: Review .cursorrules
```bash
cat .cursorrules
```

This is the main AI instruction file that Cursor reads.

#### Test 4.3: Check a Workflow Prompt
```bash
cat prompts/help.md
```

This is what the AI sees when you type `/help` in chat.

---

### Phase 5: CLI Commands on Initialized Project

**Goal:** Test commands that query project state.

#### Test 5.1: Check Status
```bash
cursor-agent-os status
```

**Expected:**
- "✅ Initialized" indicator with version
- Sprint name and phase (planning)
- Message about no specs yet

#### Test 5.2: List Specifications
```bash
cursor-agent-os list
```

**Expected:**
- "No specifications found" message (we haven't created any yet)

#### Test 5.3: Validate Project
```bash
cursor-agent-os validate
```

**Expected:**
- "Checking required files..." with green checkmarks
- "Validating sprint.yaml..." passes
- "All checks passed!" at the end

#### Test 5.4: Show Quickstart via CLI
```bash
cursor-agent-os quickstart
```

**Expected:**
- Contents of QUICKSTART.md displayed in terminal

---

### Phase 6: Creating Specifications

**Goal:** Test the spec creation workflow.

#### Test 6.1: Create a New Spec
```bash
cursor-agent-os new-spec user-authentication
```

**Expected:**
- "✅ Created: docs/specs/user-authentication.md"
- Next steps guidance

#### Test 6.2: Verify Spec Was Created
```bash
cat docs/specs/user-authentication.md
```

Should show the spec template with "user-authentication" as the feature name.

#### Test 6.3: Check List Now Shows the Spec
```bash
cursor-agent-os list
```

**Expected:**
- "user-authentication" appears with "⏳ pending" status

#### Test 6.4: Check Status Shows the Spec
```bash
cursor-agent-os status
```

**Expected:**
- Specifications section now shows user-authentication

#### Test 6.5: Try Creating Duplicate Spec
```bash
cursor-agent-os new-spec user-authentication
```

**Expected:**
- Warning that spec already exists
- No overwrite

#### Test 6.6: Create Another Spec
```bash
cursor-agent-os new-spec dashboard-widgets
```

Now `list` should show both specs.

---

### Phase 7: Validation Testing

**Goal:** Test that validation catches real issues.

#### Test 7.1: Create a Spec Missing Acceptance Criteria

Create a file `docs/specs/bad-feature.md` with this content:

```bash
cat > docs/specs/bad-feature.md << 'EOF'
# Bad Feature

This spec has no AC section.

## Overview
Just some overview text here without proper structure.
EOF
```

#### Test 7.2: Run Validation
```bash
cursor-agent-os validate
```

**Expected:**
- Warning: "bad-feature.md: No acceptance criteria found"
- Other specs should pass

---

### Phase 8: AI Chat Commands in Cursor

**Goal:** Test the workflow prompts with Cursor's AI.

Open Cursor's AI chat panel (Cmd/Ctrl + L).

#### Test 8.1: Help Command
Type in the chat:
```
@prompts/help.md explain this
```

Or simply ask:
```
Read prompts/help.md and explain the available commands
```

**Expected:** The AI explains the workflow commands.

#### Test 8.2: Plan Product Workflow
Type in chat:
```
Let's do /plan-product - read prompts/plan-product.md and guide me through it
```

**Expected:** The AI guides you through defining product vision. This is interactive - answer its questions to see the full workflow.

#### Test 8.3: Shape a Spec
Type in chat:
```
Let's do /shape-spec - I want to build a user profile feature
```

**Expected:** Interactive conversation to shape the feature idea into a structured spec.

#### Test 8.4: Write a Spec
Type in chat:
```
Read prompts/write-spec.md and help me complete docs/specs/user-authentication.md
```

**Expected:** The AI helps fill in the spec template.

---

### Phase 9: Update Command

**Goal:** Test template updates preserve user content.

#### Test 9.1: Modify a User File
Edit `docs/product/vision.md` and add some custom content:
```bash
echo -e "\n\n## My Custom Vision\n\nThis is my project's unique vision." >> docs/product/vision.md
```

#### Test 9.2: Run Update
```bash
cursor-agent-os update
```

**Expected:**
- Shows which files are safe to update vs preserved
- User content in vision.md should NOT be overwritten
- Prompts and rules may be updated

#### Test 9.3: Verify Custom Content Preserved
```bash
cat docs/product/vision.md
```

Your custom content should still be there.

---

### Phase 10: Cloud Agents & API Key Configuration

**Goal:** Test Cloud Agents configuration and API key handling.

#### Test 10.1: Check the Config File
```bash
cat .cursor-agent-os.yaml
```

**Expected:**
- Config file with `cursor_api_key: ''` (empty if you didn't provide one)
- Cloud agents settings
- Helpful comments about where to get the API key

#### Test 10.2: Check .gitignore Includes Config
```bash
cat .gitignore
```

**Expected:**
- `.cursor-agent-os.yaml` should be listed (protects API key from commits)

#### Test 10.3: Check Agent Help
```bash
cursor-agent-os agents
```

**Expected:**
- Shows Cloud Agents subcommands (list, status, verify)
- If no API key: shows instructions to add one to `.cursor-agent-os.yaml`

#### Test 10.4: Check Status Shows API Key Status
```bash
cursor-agent-os status
```

**Expected:**
- Shows whether API key is configured
- If missing: "⚠ Add API key to .cursor-agent-os.yaml"

#### Test 10.5 (Optional): Add an API Key
If you have a Cursor API key, edit `.cursor-agent-os.yaml`:
```bash
# Get your key from: Cursor → Settings → Cloud Agents → API Keys
# Then edit the file and paste your key:
nano .cursor-agent-os.yaml
```

Run agents verify:
```bash
cursor-agent-os agents verify
```

**Expected (with valid key):**
- "✅ API key valid"
- Key name and email shown

---

### Phase 11: Re-initialization Protection

**Goal:** Verify the tool protects existing projects.

#### Test 11.1: Try to Re-initialize
```bash
cursor-agent-os init --yes
```

**Expected:**
- Warning that project is already initialized
- Asks for confirmation or suggests using --force

#### Test 11.2: Force Re-initialize (if you want to test)
```bash
cursor-agent-os init --yes --force
```

**Expected:**
- Overwrites existing files
- Fresh initialization

---

## Bonus: Tech Stack Detection

Test that the tool detects and adapts to different tech stacks.

### Create a React Project Test
```bash
# Create a separate test folder
mkdir ../cursor-agent-os-react-test
cd ../cursor-agent-os-react-test

# Simulate React project
echo '{"name":"react-app","dependencies":{"react":"^18.0.0"}}' > package.json
mkdir src && echo 'export default function App() {}' > src/App.jsx

# Initialize
cursor-agent-os init --yes
```

**Expected:**
- Detects React framework in output
- Creates `docs/standards/react.md` (React-specific coding standards)

### Create a Python Project Test
```bash
mkdir ../cursor-agent-os-python-test
cd ../cursor-agent-os-python-test

# Simulate Python project
echo -e "flask==2.0.0\nrequests==2.28.0" > requirements.txt
mkdir src && echo 'print("hello")' > src/main.py

# Initialize
cursor-agent-os init --yes
```

**Expected:**
- Detects Python runtime
- Creates `docs/standards/python.md`

---

## Evaluation Checklist

After testing, consider these questions:

### Installation & First Run
- [ ] Was `cursor-agent-os` easy to run?
- [ ] Was `--help` clear and complete?
- [ ] Did `--dry-run` build confidence before committing?

### Initialization
- [ ] Was the init output informative but not overwhelming?
- [ ] Did the generated files make sense?
- [ ] Was QUICKSTART.md helpful?

### Day-to-Day Commands
- [ ] Is `status` informative at a glance?
- [ ] Is spec creation straightforward?
- [ ] Does validation catch real issues?
- [ ] Are error messages helpful?

### AI Integration
- [ ] Do the prompts guide the AI effectively?
- [ ] Does the workflow feel natural in Cursor?
- [ ] Would you actually use these commands?

### Overall
- [ ] Would you use this for a real project?
- [ ] What's missing or confusing?
- [ ] What would make it better?

---

## Quick Reference

| Command | What it does |
|---------|--------------|
| `cursor-agent-os --help` | Show all commands |
| `cursor-agent-os --version` | Show version |
| `cursor-agent-os init` | Initialize (interactive) |
| `cursor-agent-os init --yes` | Initialize with defaults |
| `cursor-agent-os init --dry-run` | Preview without creating |
| `cursor-agent-os status` | Show project status |
| `cursor-agent-os list` | List all specs |
| `cursor-agent-os new-spec <name>` | Create new spec |
| `cursor-agent-os validate` | Check for issues |
| `cursor-agent-os quickstart` | Show quickstart guide |
| `cursor-agent-os update` | Update templates |
| `cursor-agent-os agents` | Cloud Agents commands |

---

## Clean Up

When done testing:
```bash
cd /c/dev
rm -rf cursor-agent-os-testing
rm -rf cursor-agent-os-react-test
rm -rf cursor-agent-os-python-test
```

---

Happy testing! 🚀
