#!/bin/bash

# Kill the process currently using port 3005
PID=$(lsof -t -i:3005)
if [ -n "$PID" ]; then
  echo "Killing process on port 3000 (PID: $PID)"
  kill -9 $PID
fi

# Start your application
npm run prod
