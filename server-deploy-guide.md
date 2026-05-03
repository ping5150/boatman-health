# 船夫健康 — 服务器部署说明

> 最后更新：2026-05-03

## 服务器信息

| 项目 | 值 |
|------|----|
| 服务器 IP | `106.53.64.33` |
| 登录用户 | `root` |
| 域名 | `www.boatmanhealth.com` |
| SSL | Let's Encrypt（自动续期） |

---

## 环境总览

| 环境类型 | 后端端口 | 前端访问 | 数据库 | PM2 进程名 |
|---------|---------|---------|--------|-----------|
| **生产环境** | 3000 | https://www.boatmanhealth.com | prod.db | boatman-health |
| **本地开发** | 3000 | localhost:5173 / 5174 | dev.db | - |

---

## 访问地址

### 生产环境

| 端点 | 地址 |
|------|------|
| 用户端 | `https://www.boatmanhealth.com/` |
| 管理后台 | `https://www.boatmanhealth.com/admin/` |
| 后端 API | `https://www.boatmanhealth.com/api/` |
| 健康检查 | `https://www.boatmanhealth.com/health` |

---

## 服务器目录结构

### 前端静态文件（Nginx 托管）

| 路径 | 说明 |
|------|------|
| `/www/boatman-health/client/` | 用户端前端（Nginx root 目录） |
| `/www/boatman-health/admin/` | 管理后台前端（Nginx alias 目录） |

### 后端服务（PM2 管理）

| 路径 | 说明 |
|------|------|
| `/www/boatman-health/server/` | 后端运行根目录 |
| `/www/boatman-health/server/dist/` | 后端编译产物（PM2 从此启动 app.js） |
| `/www/boatman-health/server/prisma/prod.db` | 生产数据库文件 |
| `/www/boatman-health/server/.env` | 生产环境变量 |

### Nginx 配置

| 文件 | 说明 |
|------|------|
| `/etc/nginx/conf.d/boatman-health.conf` | 生产环境 Nginx 配置（前端 + API 反向代理 + SSL） |

---

## 部署架构

```
用户浏览器
    │
    ▼
Nginx（腾讯云服务器 106.53.64.33）
├── :80 → HTTP 自动跳转 HTTPS
├── :443 → HTTPS（SSL by Let's Encrypt）
│   ├── / → 用户端 SPA（/www/boatman-health/client/）
│   ├── /admin/ → 管理后台 SPA（/www/boatman-health/admin/）
│   ├── /api/* → proxy_pass http://127.0.0.1:3000
│   └── /admin-api/* → proxy_pass http://127.0.0.1:3000/admin/
    │
    ▼
PM2 → Node.js Express (port 3000)
    ├── Prisma ORM → SQLite (/www/boatman-health/server/prisma/prod.db)
    ├── axios → 飞书开放平台 API
    └── 火山引擎 TOS → 文件存储
```

---

## 部署命令

### 后端部署

```bash
# 本地构建
cd server && npm run build

# 上传到服务器
rsync -avz --delete --exclude='node_modules' --exclude='.env' server/ root@106.53.64.33:/www/boatman-health/server/

# 在服务器上安装依赖并重启
ssh root@106.53.64.33 "cd /www/boatman-health/server && npm install --production && npx prisma generate && pm2 restart boatman-health --update-env"
```

### 前端部署

```bash
# 本地构建
cd client && npm run build
cd admin && npm run build

# 上传到服务器
rsync -avz --delete client/dist/ root@106.53.64.33:/www/boatman-health/client/
rsync -avz --delete admin/dist/  root@106.53.64.33:/www/boatman-health/admin/
```

---

## PM2 进程信息

| 字段 | 值 |
|------|----|
| 进程名 | `boatman-health` |
| 模式 | `fork` |
| 启动文件 | `/www/boatman-health/server/dist/app.js` |
| 服务端口 | `3000` |
| 运行环境 | `production` |
| Node.js 版本 | `v20.20.2` |

---

## Nginx 路由规则

| 匹配规则 | 代理目标 | 说明 |
|----------|----------|------|
| `/api/*` | `http://127.0.0.1:3000` | 后端 API |
| `/admin-api/*` | `http://127.0.0.1:3000/admin/` | 管理后台 API |
| `/health` | `http://127.0.0.1:3000` | 健康检查 |
| `/admin/*` | SPA fallback → `/admin/index.html` | 管理后台前端 |
| `/*` | SPA fallback → `/index.html` | 用户端前端 |

---

## 常用命令

```bash
# SSH 登录
ssh root@106.53.64.33

# 查看 PM2 进程
pm2 list

# 查看日志
pm2 logs boatman-health --lines 100

# 重启服务
pm2 restart boatman-health --update-env

# 健康检查
curl http://localhost:3000/health

# 检查端口占用
netstat -tlnp | grep 3000

# 测试并重载 Nginx
nginx -t && systemctl reload nginx

# 备份数据库
cp /www/boatman-health/server/prisma/prod.db /www/boatman-health/server/prisma/prod.db.backup-$(date +%Y%m%d)
```
