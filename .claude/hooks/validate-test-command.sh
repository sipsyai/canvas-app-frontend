#!/bin/bash
# Validate test commands before execution
# This hook prevents destructive operations and validates test safety

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

# If jq fails or command is empty, allow the command
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block destructive test operations
if echo "$COMMAND" | grep -iE '(rm|delete|drop|truncate).*(test|spec|e2e)' > /dev/null; then
  echo "🚫 Blocked: Destructive test operations detected" >&2
  echo "Command attempted: $COMMAND" >&2
  exit 2
fi

# Block direct database modifications in tests
if echo "$COMMAND" | grep -iE '(mysql|psql|mongo).*(drop|delete|truncate)' > /dev/null; then
  echo "🚫 Blocked: Direct database modification in tests" >&2
  echo "Use test fixtures or database seeds instead" >&2
  exit 2
fi

# Block production environment access
if echo "$COMMAND" | grep -iE 'NODE_ENV=production|PROD_' > /dev/null; then
  echo "🚫 Blocked: Production environment access detected" >&2
  echo "Tests should only run in development or test environments" >&2
  exit 2
fi

# Warn about non-headless browser tests (allow but warn)
if echo "$COMMAND" | grep -E 'playwright.*--headed' > /dev/null; then
  echo "⚠️  Warning: Running tests in headed mode (slower)" >&2
  echo "Consider using headless mode for CI/CD pipelines" >&2
fi

# Warn about debug mode
if echo "$COMMAND" | grep -E 'playwright.*--debug' > /dev/null; then
  echo "ℹ️  Info: Running tests in debug mode" >&2
fi

# Suggest using JSON reporter for better analysis
if echo "$COMMAND" | grep -E '^npx playwright test' > /dev/null; then
  if ! echo "$COMMAND" | grep -E '--reporter' > /dev/null; then
    echo "💡 Tip: Add --reporter=list,json for detailed test analysis" >&2
  fi
fi

# All checks passed
exit 0
