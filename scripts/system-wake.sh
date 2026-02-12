#!/bin/bash

# Orkwork v2 System Wake Script
# Restores services after system wake

echo "Starting orkwork v2 system wake procedure..."

# Log the wake event
echo "$(date): System wake initiated" >> /var/log/orkwork-sleep.log

# Restart services that were stopped
echo "Restarting services..."
systemctl start uptime-kuma.service || true
systemctl start telegram-bot.service || true

# Check system health
echo "Checking system health..."
systemctl status orkwork-v2-api.service
systemctl status orkwork-v2-web.service

echo "System wake procedure completed."