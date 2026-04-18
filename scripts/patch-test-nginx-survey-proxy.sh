#!/bin/bash
set -e

SERVER="root@118.145.239.169"
CONF="/etc/nginx/conf.d/boatman-health-test.conf"

ssh "$SERVER" 'bash -s' <<'EOSSH'
set -e
CONF="/etc/nginx/conf.d/boatman-health-test.conf"
cp -a "$CONF" "$CONF.bak-$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path
p = Path('/etc/nginx/conf.d/boatman-health-test.conf')
s = p.read_text()
if '/admin/sleep-surveys' not in s:
    block = '''    location /admin/sleep-surveys {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /admin/nutrition-surveys {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

'''
    s = s.replace('    # 健康检查', block + '    # 健康检查')
    p.write_text(s)
PY

nginx -t
nginx -s reload
grep -n '/admin/sleep-surveys\|/admin/nutrition-surveys' "$CONF"
EOSSH
