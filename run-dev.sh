#!/bin/bash
cd /home/z/my-project
while true; do
  echo "Starting Next.js dev server..."
  bun run dev
  echo "Next.js dev server exited. Restarting in 5 seconds..."
  sleep 5
done
