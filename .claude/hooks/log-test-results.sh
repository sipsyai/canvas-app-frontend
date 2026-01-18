#!/bin/bash
# Log test execution results for audit trail and analysis

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
TOOL_RESPONSE=$(echo "$INPUT" | jq -r '.tool_response // empty' 2>/dev/null)

# If jq fails or response is empty, skip logging
if [ -z "$TOOL_RESPONSE" ]; then
  exit 0
fi

LOG_DIR=".claude/logs"
LOG_FILE="$LOG_DIR/test-execution.log"
METRICS_FILE="$LOG_DIR/test-metrics.json"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Check if response contains test results
if echo "$TOOL_RESPONSE" | grep -qE '(passed|failed|flaky|PASS|FAIL|test|spec)'; then
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Log to text file
  {
    echo "========================================="
    echo "Test Execution Log"
    echo "========================================="
    echo "Timestamp: $TIMESTAMP"
    echo "Tool: $TOOL_NAME"
    echo ""
    echo "Output:"
    echo "$TOOL_RESPONSE"
    echo ""
    echo "-----------------------------------------"
    echo ""
  } >> "$LOG_FILE"

  # Parse test results for metrics
  TOTAL_TESTS=$(echo "$TOOL_RESPONSE" | grep -oE '[0-9]+ (tests?|specs?)' | head -1 | grep -oE '[0-9]+' || echo "0")
  PASSED_TESTS=$(echo "$TOOL_RESPONSE" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo "0")
  FAILED_TESTS=$(echo "$TOOL_RESPONSE" | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo "0")
  FLAKY_TESTS=$(echo "$TOOL_RESPONSE" | grep -oE '[0-9]+ flaky' | grep -oE '[0-9]+' || echo "0")

  # Extract duration if available
  DURATION=$(echo "$TOOL_RESPONSE" | grep -oE '[0-9]+(\.[0-9]+)?(s|ms|m)' | head -1 || echo "N/A")

  # Append to metrics JSON
  if [ ! -f "$METRICS_FILE" ]; then
    echo "[]" > "$METRICS_FILE"
  fi

  # Create new metrics entry
  NEW_ENTRY=$(cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "tool": "$TOOL_NAME",
  "metrics": {
    "total": $TOTAL_TESTS,
    "passed": $PASSED_TESTS,
    "failed": $FAILED_TESTS,
    "flaky": $FLAKY_TESTS,
    "duration": "$DURATION"
  }
}
EOF
)

  # Append to JSON array (simple approach)
  TEMP_FILE="$METRICS_FILE.tmp"
  jq ". += [$NEW_ENTRY]" "$METRICS_FILE" > "$TEMP_FILE" 2>/dev/null && mv "$TEMP_FILE" "$METRICS_FILE" || true

  # Print summary to stderr (visible to agent)
  {
    echo ""
    echo "📊 Test Execution Summary:"
    echo "   Total: $TOTAL_TESTS | ✅ Passed: $PASSED_TESTS | ❌ Failed: $FAILED_TESTS | ⚠️  Flaky: $FLAKY_TESTS"
    echo "   Duration: $DURATION"
    echo "   Logged to: $LOG_FILE"
    echo ""
  } >&2
fi

# All done
exit 0
