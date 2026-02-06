#!/bin/bash

# Canvas App Frontend - Start Script
# ----------------------------------

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$PROJECT_DIR/.dev-server.pid"
LOG_DIR="$PROJECT_DIR/logs"
MAX_LOG_SIZE=1048576  # 1MB in bytes
MAX_LOG_FILES=10      # Keep last 10 log files

cd "$PROJECT_DIR"

# Create logs directory if not exists
mkdir -p "$LOG_DIR"

# Function to get current log file name
get_log_filename() {
    echo "$LOG_DIR/frontend-$(date +%Y%m%d-%H%M%S).log"
}

# Function to rotate logs if needed
rotate_log() {
    local current_log="$1"

    if [ -f "$current_log" ]; then
        local size=$(stat -f%z "$current_log" 2>/dev/null || stat -c%s "$current_log" 2>/dev/null)
        if [ "$size" -ge "$MAX_LOG_SIZE" ]; then
            return 0  # Need rotation
        fi
    fi
    return 1  # No rotation needed
}

# Function to cleanup old log files (keep only MAX_LOG_FILES)
cleanup_old_logs() {
    local log_count=$(ls -1 "$LOG_DIR"/frontend-*.log 2>/dev/null | wc -l)
    if [ "$log_count" -gt "$MAX_LOG_FILES" ]; then
        ls -1t "$LOG_DIR"/frontend-*.log | tail -n +$((MAX_LOG_FILES + 1)) | xargs rm -f
    fi
}

# Function to write logs with rotation
log_writer() {
    local current_log=$(get_log_filename)

    # Write header
    echo "========================================" >> "$current_log"
    echo "Canvas App Frontend - Dev Server Log" >> "$current_log"
    echo "Started: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$current_log"
    echo "========================================" >> "$current_log"

    while IFS= read -r line; do
        # Check if rotation needed
        if rotate_log "$current_log"; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] Log rotated - continuing in new file" >> "$current_log"
            cleanup_old_logs
            current_log=$(get_log_filename)
            echo "========================================" >> "$current_log"
            echo "Canvas App Frontend - Dev Server Log (continued)" >> "$current_log"
            echo "Rotated: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$current_log"
            echo "========================================" >> "$current_log"
        fi

        # Determine log level based on content
        local level="INFO"
        if echo "$line" | grep -qiE "error|failed|exception"; then
            level="ERROR"
        elif echo "$line" | grep -qiE "warn"; then
            level="WARN"
        elif echo "$line" | grep -qiE "debug"; then
            level="DEBUG"
        fi

        # Write timestamped log entry
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $line" >> "$current_log"
    done
}

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "Dev server is already running (PID: $PID)"
        echo "Use ./stop.sh to stop it first"
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Cleanup old logs before starting
cleanup_old_logs

# Start the dev server with log rotation
echo "Starting Canvas App Frontend..."
npm run dev > >(log_writer) 2>&1 &
DEV_PID=$!

# Save PID
echo $DEV_PID > "$PID_FILE"

# Wait a moment for server to start
sleep 2

# Check if server started successfully
if ps -p $DEV_PID > /dev/null 2>&1; then
    CURRENT_LOG=$(ls -1t "$LOG_DIR"/frontend-*.log 2>/dev/null | head -1)
    echo "Dev server started successfully (PID: $DEV_PID)"
    echo ""
    echo "Log directory: $LOG_DIR"
    echo "Current log:   $CURRENT_LOG"
    echo "Max log size:  1MB (auto-rotate)"
    echo ""
    echo "Frontend: http://localhost:5173"
    echo ""
    echo "Use ./stop.sh to stop the server"
    echo "Use 'tail -f $CURRENT_LOG' to watch logs"
else
    echo "Failed to start dev server. Check logs in: $LOG_DIR"
    rm -f "$PID_FILE"
    exit 1
fi
