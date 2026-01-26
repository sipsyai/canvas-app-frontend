#!/bin/bash

# Canvas App Frontend - Stop Script
# ---------------------------------

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$PROJECT_DIR/.dev-server.pid"

cd "$PROJECT_DIR"

# Function to kill processes on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "Killing processes on port $port: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null
        return 0
    fi
    return 1
}

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
    else
        echo "Process $PID not found (already stopped)"
    fi

    rm -f "$PID_FILE"
fi

# Also kill any processes on ports 5173 and 5174
killed=0
kill_port 5173 && killed=1
kill_port 5174 && killed=1

# Try to find and kill any running vite processes for this project
VITE_PIDS=$(pgrep -f "vite.*canvas-app-frontend" 2>/dev/null)
if [ -n "$VITE_PIDS" ]; then
    echo "Found running Vite processes: $VITE_PIDS"
    kill -9 $VITE_PIDS 2>/dev/null
    killed=1
fi

if [ $killed -eq 1 ]; then
    echo "Dev server stopped"
else
    echo "No dev server running"
fi
