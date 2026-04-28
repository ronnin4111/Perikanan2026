#!/bin/bash

# Script untuk menjalankan Next.js dev server dengan auto-restart

cd /home/z/my-project

echo "Starting Next.js Dev Server..."
echo "Server akan berjalan di http://localhost:3000"
echo "Tekan Ctrl+C untuk menghentikan server"
echo ""

while true; do
  echo "[$(date)] Starting server..."
  bun run dev > /tmp/dev-server.log 2>&1 &
  SERVER_PID=$!

  # Tunggu beberapa detik untuk memastikan server berjalan
  sleep 5

  # Cek apakah server masih berjalan
  if ps -p $SERVER_PID > /dev/null; then
    echo "[$(date)] Server is running (PID: $SERVER_PID)"

    # Tunggu sampai server mati
    wait $SERVER_PID 2>/dev/null
    EXIT_CODE=$?

    if [ $EXIT_CODE -ne 0 ]; then
      echo "[$(date)] Server exited with code: $EXIT_CODE"
    fi
  else
    echo "[$(date)] Failed to start server"
  fi

  echo "[$(date)] Restarting in 3 seconds..."
  sleep 3
done
