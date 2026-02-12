#!/bin/bash
# orkwork v2 — lightweight monitoring script
# Runs via cron every 5 min, posts alerts to chat

API="http://localhost:3010/api"
AUTH="Authorization: Bearer ork_b802644303fbe34ddbaeb4f8a584d6177ba54fb5"
ALERT_FILE="/tmp/orkwork-monitor-alerts"
ALERTS=""

add_alert() {
  ALERTS="${ALERTS}| $1 "
}

# 1. Check API health
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$API/health")
if [ "$HTTP_CODE" != "200" ]; then
  add_alert "API health failed (HTTP $HTTP_CODE)"
fi

# 2. Check web (Next.js)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "http://localhost:3020")
if [ "$HTTP_CODE" != "200" ]; then
  add_alert "Web server down (HTTP $HTTP_CODE)"
fi

# 3. Check systemd services
for svc in orkwork-v2-api orkwork-v2-web; do
  if ! systemctl is-active --quiet "$svc"; then
    add_alert "Service $svc is down - restarting"
    systemctl restart "$svc" 2>/dev/null
  fi
done

# 4. Check PostgreSQL
if ! pg_isready -q 2>/dev/null; then
  add_alert "PostgreSQL not ready"
fi

# 5. Disk usage
DISK_PCT=$(df / | awk 'NR==2 {sub(/%/,""); print $5}')
if [ "$DISK_PCT" -gt 85 ]; then
  add_alert "Disk usage ${DISK_PCT}%"
fi

# 6. Memory usage
MEM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
MEM_USED=$(free -m | awk '/Mem:/ {print $3}')
MEM_PCT=$((MEM_USED * 100 / MEM_TOTAL))
if [ "$MEM_PCT" -gt 90 ]; then
  add_alert "Memory usage ${MEM_PCT}%"
fi

# Send alerts if any
if [ -n "$ALERTS" ]; then
  HASH=$(echo "$ALERTS" | md5sum | cut -d" " -f1)
  LAST_HASH=$(cat "$ALERT_FILE" 2>/dev/null)
  
  if [ "$HASH" != "$LAST_HASH" ]; then
    echo "$HASH" > "$ALERT_FILE"
    TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    # Post to chat bugs channel
    curl -s -X POST "$API/v2/chat/a255063c-b283-4496-a1bf-639f43fbf159/messages" \
      -H "$AUTH" -H "Content-Type: application/json" \
      -d "{\"content\": \"MONITOR ALERT [$TIMESTAMP]: $ALERTS\"}" > /dev/null
  fi
fi
