#!/bin/bash

# Canvas App Frontend - Stop Script
# ---------------------------------

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$PROJECT_DIR/.dev-server.pid"

cd "$PROJECT_DIR"

# Check if PID file exists
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")

    if ps -p $PID > /dev/null 2>&1; then
        echo "Stopping dev server (PID: $PID)..."
        kill $PID 2>/dev/null

        # Wait for graceful shutdown
        sleep 2

        # Force kill if still running
        if ps -p $PID > /dev/null 2>&1; then
            echo "Force killing process..."
            kill -9 $PID 2>/dev/null
        fi

        echo "Dev server stopped"
    else
        echo "Process $PID not found (already stopped)"
    fi

    rm -f "$PID_FILE"
else
    # Try to find and kill any running vite processes for this project
    VITE_PIDS=$(pgrep -f "vite.*canvas-app-frontend" 2>/dev/null)

    if [ -n "$VITE_PIDS" ]; then
        echo "Found running Vite processes: $VITE_PIDS"
        echo "Stopping..."
        kill $VITE_PIDS 2>/dev/null
        sleep 1
        echo "Stopped"
    else
        echo "No dev server running"
    fi
fi

# Clean up log file (optional - uncomment if you want)
# rm -f "$PROJECT_DIR/.dev-server.log"
