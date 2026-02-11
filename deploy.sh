#!/bin/bash
set -e

DEPLOY_DIR="/opt/orkwork-v2"
LOG="/var/log/orkwork-deploy.log"

echo "[$(date)] Deploy started" >> "$LOG"

cd "$DEPLOY_DIR"

# Pull latest
git pull >> "$LOG" 2>&1

# Install deps
cd packages/api && bun install >> "$LOG" 2>&1
cd ../web && bun install >> "$LOG" 2>&1

# Build frontend
bun run build >> "$LOG" 2>&1

# Restart services
systemctl restart orkwork-v2-api >> "$LOG" 2>&1
systemctl restart orkwork-v2-web >> "$LOG" 2>&1

echo "[$(date)] Deploy completed" >> "$LOG"
