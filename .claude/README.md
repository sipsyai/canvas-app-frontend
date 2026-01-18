# Canvas App Frontend - Claude Code Agent Setup

This directory contains custom Claude Code agents, skills, and configurations for the Canvas App Frontend project.

## 📁 Directory Structure

```
.claude/
├── agents/
│   └── playwright-test-reviewer.md    # Playwright test automation expert agent
├── skills/
│   └── playwright-best-practices.md   # Testing patterns and best practices
├── hooks/
│   ├── validate-test-command.sh       # Pre-execution validation
│   └── log-test-results.sh            # Post-execution logging
├── logs/
│   ├── test-execution.log             # Detailed test logs
│   └── test-metrics.json              # Metrics history
├── .mcp.json                          # Playwright MCP configuration
└── README.md                          # This file
```

---

## 🎭 Playwright Test Reviewer Agent

### What It Does

The `playwright-test-reviewer` agent is a specialized AI assistant that:

1. **Analyzes test files** for quality, reliability, and best practices
2. **Executes tests** using Playwright MCP (browser automation)
3. **Provides detailed feedback** with prioritized recommendations
4. **Identifies issues**:
   - Critical: Flaky tests, missing waits, security vulnerabilities
   - Warnings: Missing coverage, accessibility issues
   - Suggestions: Performance improvements, code refactoring
5. **Offers to fix** identified problems automatically

### When to Use

The agent is designed to be used **proactively** whenever you:

- ✅ Write new test files
- ✅ Modify existing tests
- ✅ Change authentication flows (`src/features/auth/`)
- ✅ Update API integrations (`src/lib/api/`)
- ✅ Add new UI components (`src/components/`)
- ✅ Need to debug flaky tests
- ✅ Want to improve test coverage

### How to Use

#### Option 1: Direct Invocation

```bash
# Start Claude Code CLI
cd /Users/ali/Documents/Projects/canvas-app-frontend
claude

# In the conversation
> Use the playwright-test-reviewer agent to review my test suite
```

#### Option 2: Automatic Activation

The agent is configured to activate automatically when it detects test-related work. Just mention testing in your conversation:

```
> I need help with testing the login flow
> Can you check if my tests are reliable?
> Review the authentication tests
```

#### Option 3: Task-Specific Agent

```bash
# In Claude Code conversation
> @playwright-test-reviewer analyze tests/auth/login.spec.ts
```

---

## 🔧 Configuration

### Playwright MCP Server

The Playwright MCP (Model Context Protocol) server is configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "true",
        "PLAYWRIGHT_SLOW_MO": "0",
        "PLAYWRIGHT_TIMEOUT": "30000"
      }
    }
  }
}
```

**Configuration Options:**

- `PLAYWRIGHT_HEADLESS`: Run browser in headless mode (true for CI/CD)
- `PLAYWRIGHT_SLOW_MO`: Slow down operations by N milliseconds (useful for debugging)
- `PLAYWRIGHT_TIMEOUT`: Default timeout for operations (30 seconds)

To run tests in **headed mode** for debugging:

```json
"PLAYWRIGHT_HEADLESS": "false"
```

To **slow down** test execution:

```json
"PLAYWRIGHT_SLOW_MO": "500"
```

### Agent Permissions

The agent is configured with `permissionMode: acceptEdits`, meaning:

- ✅ Can automatically edit test files after approval
- ✅ Can run bash commands (tests, installations)
- ✅ Can read/write files in the project
- ⚠️  Will ask for permission before destructive operations

To **require approval** for all edits:

```markdown
permissionMode: askForEdits
```

---

## 🪝 Hooks

### Validation Hook (`validate-test-command.sh`)

Runs **before** every bash command to ensure safety:

**Blocks:**
- ❌ Destructive test operations (`rm`, `delete`, `truncate`)
- ❌ Direct database modifications in tests
- ❌ Production environment access

**Warns:**
- ⚠️  Headed browser mode (slower)
- ⚠️  Debug mode enabled

**Suggests:**
- 💡 Using JSON reporter for better analysis

### Logging Hook (`log-test-results.sh`)

Runs **after** every bash command to track test execution:

**Logs to:**
- `logs/test-execution.log` - Detailed text logs
- `logs/test-metrics.json` - Structured metrics (JSON)

**Captures:**
- Total tests run
- Passed/failed/flaky counts
- Execution duration
- Timestamps

**Example log entry:**

```json
{
  "timestamp": "2026-01-18T10:30:00Z",
  "tool": "Bash",
  "metrics": {
    "total": 15,
    "passed": 13,
    "failed": 1,
    "flaky": 1,
    "duration": "4.2s"
  }
}
```

---

## 📚 Skills

### Playwright Best Practices Skill

The `playwright-best-practices.md` skill provides:

- ✅ Recommended selector strategies (data-testid, roles, ARIA)
- ✅ Wait strategies (auto-waiting, explicit waits)
- ✅ React-specific patterns (hooks, state, forms)
- ✅ Authentication testing patterns
- ✅ API mocking and integration testing
- ✅ Accessibility testing (axe-playwright)
- ✅ Performance testing (Core Web Vitals)
- ✅ Visual regression testing
- ✅ Page Object Model examples
- ❌ Common anti-patterns to avoid

The agent automatically references this skill when reviewing tests.

---

## 🚀 Quick Start Guide

### 1. Install Playwright (if not already installed)

```bash
npm install -D @playwright/test
npx playwright install
```

### 2. Create a Simple Test

```bash
mkdir -p tests
cat > tests/example.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Canvas App/);
});
EOF
```

### 3. Ask Agent to Review

```bash
claude

> Use the playwright-test-reviewer agent to analyze tests/example.spec.ts
```

### 4. Implement Recommendations

The agent will provide detailed feedback like:

```markdown
## File: tests/example.spec.ts
Status: ✅ PASSING

### Recommendations
1. Add accessibility test with axe-playwright
2. Test responsive design on mobile viewport
3. Verify loading states

Would you like me to implement these improvements?
```

Respond: `Yes, please implement these improvements`

---

## 📊 Example Workflow

### Scenario: Testing Authentication Flow

```bash
# 1. Start development server
npm run dev

# 2. Start Claude Code
claude

# 3. Request test review
> Review my authentication tests and check for security issues

# 4. Agent analyzes tests
# - Reads all test files in tests/auth/
# - Executes tests with Playwright
# - Checks for:
#   - Flaky tests
#   - Missing edge cases
#   - Security vulnerabilities (XSS, CSRF)
#   - Accessibility issues
#   - Performance problems

# 5. Agent provides report
# Generates comprehensive markdown report with:
# - Executive summary
# - Per-file analysis
# - Code examples for fixes
# - Prioritized recommendations

# 6. Implement fixes
> Please implement the Critical and Warning level fixes

# 7. Verify fixes
> Run tests again to verify all fixes work correctly
```

---

## 🔍 Advanced Usage

### Custom Test Scenarios

Ask the agent to create specific test scenarios:

```
> Create an accessibility test for the login form that checks:
> - ARIA labels
> - Keyboard navigation
> - Color contrast
> - Screen reader announcements
```

### Performance Profiling

```
> Run performance tests for the dashboard page and verify:
> - Largest Contentful Paint < 2.5s
> - First Input Delay < 100ms
> - Cumulative Layout Shift < 0.1
```

### Visual Regression

```
> Set up visual regression testing for:
> - Homepage on desktop, tablet, mobile
> - Dashboard with different user roles
> - Forms in various states (empty, filled, error)
```

### API Integration Testing

```
> Test the user CRUD API with:
> - Successful creation
> - Validation errors
> - Network failures with retry logic
> - Concurrent requests
```

---

## 🛠️ Troubleshooting

### Playwright MCP Not Working

**Symptom:** Error message about Playwright not installed

**Solution:**
```bash
# Install Playwright globally
npm install -g @playwright/test

# Or install in project
npm install -D @playwright/test
npx playwright install
```

### Agent Not Activating

**Symptom:** Agent doesn't activate automatically

**Solution:**
```bash
# Explicitly invoke agent
> Use the playwright-test-reviewer agent

# Check agent is registered
claude agent list
```

### Hooks Not Running

**Symptom:** Validation/logging hooks not executing

**Solution:**
```bash
# Make hooks executable
chmod +x .claude/hooks/*.sh

# Test hook manually
cat sample-input.json | .claude/hooks/validate-test-command.sh
```

### Tests Fail in Headless Mode

**Symptom:** Tests pass in headed mode but fail in headless

**Solution:**
```bash
# Run in headed mode temporarily
# Edit .claude/.mcp.json:
"PLAYWRIGHT_HEADLESS": "false"

# Debug with traces
npx playwright test --trace on
npx playwright show-trace trace.zip
```

---

## 📖 Best Practices

### 1. Run Agent After Code Changes

```bash
# After modifying auth flow
git diff src/features/auth/

> Review my authentication changes and update tests accordingly
```

### 2. Use Agent for Test-Driven Development

```bash
# Before writing code
> I need to implement password reset. Create test cases for:
> - Request reset link
> - Validate reset token
> - Update password
> - Invalid token handling

# Agent creates tests first
# Then implement feature to make tests pass
```

### 3. Regular Test Audits

```bash
# Weekly or bi-weekly
> Audit all tests for flakiness, coverage, and reliability
> Generate a summary report
```

### 4. CI/CD Integration

The agent can help set up CI/CD:

```bash
> Set up GitHub Actions workflow to:
> - Run tests on pull requests
> - Generate coverage reports
> - Block merges on test failures
```

---

## 📈 Metrics & Analytics

### View Test Metrics

```bash
# View all test execution logs
cat .claude/logs/test-execution.log

# View metrics as JSON
cat .claude/logs/test-metrics.json | jq '.'

# Get summary of last 10 runs
cat .claude/logs/test-metrics.json | jq '.[-10:]'

# Calculate success rate
cat .claude/logs/test-metrics.json | jq '
  [.[] | select(.metrics.total > 0) | .metrics.passed / .metrics.total] |
  add / length * 100
'
```

### Track Test Coverage Over Time

```bash
> Analyze test metrics from the last week and show:
> - Total tests added
> - Pass rate trend
> - Most flaky tests
> - Average execution time
```

---

## 🤝 Contributing

### Adding New Agents

Create new agent files in `.claude/agents/`:

```markdown
---
name: my-custom-agent
description: Description of what the agent does
tools: Read, Write, Bash
model: sonnet
---

Agent instructions here...
```

### Adding New Skills

Create skill files in `.claude/skills/`:

```markdown
---
name: my-skill
description: Skill description
---

Skill content here...
```

### Modifying Hooks

Edit hook scripts in `.claude/hooks/`:

```bash
# Make changes
vim .claude/hooks/validate-test-command.sh

# Test locally
echo '{"tool_input":{"command":"npm test"}}' | ./.claude/hooks/validate-test-command.sh
```

---

## 📞 Support

### Get Help

```bash
# In Claude Code
> /help

# View agent documentation
> Show me the playwright-test-reviewer agent documentation

# Ask for examples
> Give me examples of using the test reviewer agent
```

### Report Issues

If you encounter issues:

1. Check logs: `.claude/logs/test-execution.log`
2. Verify configuration: `.claude/.mcp.json`
3. Test hooks manually: `.claude/hooks/*.sh`
4. Ask the agent: `> I'm having issues with [description]`

---

## 🎯 Next Steps

1. **Set up Playwright**: `npm install -D @playwright/test && npx playwright install`
2. **Create first test**: See "Quick Start Guide" above
3. **Run agent**: `> Use playwright-test-reviewer agent`
4. **Iterate**: Fix issues, add tests, re-run agent

Happy testing! 🎭✨
