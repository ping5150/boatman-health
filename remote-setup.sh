#!/bin/bash
set -e

DEPLOY_DIR="/var/www/boatman-health-A4"

echo ">>> 安装 Nginx（如未安装）..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get update -qq && sudo apt-get install -y -qq nginx
fi

echo ">>> 创建部署目录并解压..."
sudo mkdir -p $DEPLOY_DIR
sudo rm -rf ${DEPLOY_DIR}/*
sudo tar -xf /tmp/frontend-dist.tar -C $DEPLOY_DIR
rm -f /tmp/frontend-dist.tar

echo ">>> 文件列表："
ls -la $DEPLOY_DIR/

echo ">>> 写入 Nginx 配置..."
sudo mkdir -p /etc/nginx/conf.d
sudo tee /etc/nginx/conf.d/chuanfu-health.conf > /dev/null << 'NGINX_CONF'
server {
    listen 80;
    server_name _;

    root /home/chuanfu-health/frontend;
    index index.html;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /admin/assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 反向代理 → 本机后端服务
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_read_timeout 60s;
    }

    # Admin API 反向代理 → 本机后端服务
    location ~ ^/admin/(auth|dashboard|form1|form2|users|sync) {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_read_timeout 60s;
    }

    # 管理后台 SPA
    location /admin/ {
        try_files $uri $uri/ /admin/index.html;
    }

    # 用户端 SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONF

echo ">>> 禁用默认配置（如存在）..."
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

echo ">>> 测试并重启 Nginx..."
sudo nginx -t && sudo systemctl restart nginx && sudo systemctl enable nginx

echo ">>> 部署成功！"
echo ">>> 用户端: http://118.145.239.169/"
echo ">>> 管理后台: http://118.145.239.169/admin/"
