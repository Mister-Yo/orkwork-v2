#!/bin/bash

# Orkwork v2 System Sleep Script
# Gracefully puts the system into a low-power state

echo "Starting orkwork v2 system sleep procedure..."

# Log the sleep initiation
echo "$(date): System sleep initiated" >> /var/log/orkwork-sleep.log

# Gracefully stop non-critical services
echo "Stopping non-critical services..."
systemctl stop uptime-kuma.service || true
systemctl stop telegram-bot.service || true

# Save current state
echo "Saving system state..."
sync

# Put system into suspend mode (S3 sleep state)
echo "Entering sleep mode..."
systemctl suspend

echo "System sleep procedure completed."