#!/bin/bash
set -e

DEPLOY_DIR="/www/boatman-health"

echo ">>> 安装 Nginx（如未安装）..."
if ! command -v nginx &> /dev/null; then
    yum install -y nginx
fi

echo ">>> 创建部署目录..."
mkdir -p $DEPLOY_DIR/{client,admin,server}

echo ">>> 写入 Nginx 配置..."
mkdir -p /etc/nginx/conf.d
tee /etc/nginx/conf.d/boatman-health.conf > /dev/null << 'NGINX_CONF'
server {
    listen 80;
    server_name www.boatmanhealth.com boatmanhealth.com;

    # 用户端前端
    root /www/boatman-health/client;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;

    # 用户端 SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 管理后台 SPA
    location /admin/ {
        alias /www/boatman-health/admin/;
        try_files $uri $uri/ /admin/index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 120s;
    }

    # 管理后台 API 代理
    location /admin-api/ {
        proxy_pass http://127.0.0.1:3000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3000;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONF

echo ">>> 禁用默认配置（如存在）..."
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

echo ">>> 测试并重启 Nginx..."
nginx -t && systemctl enable nginx && systemctl start nginx

echo ">>> 部署成功！"
echo ">>> 用户端: https://www.boatmanhealth.com/"
echo ">>> 管理后台: https://www.boatmanhealth.com/admin/"
echo ">>> 注意：SSL 证书需要单独使用 certbot 申请"
