# 船夫健康 — 服务器部署说明

> 最后更新：2026-04-24

## 服务器信息

| 项目 | 值 |
|------|----|
| 服务器 IP | `118.145.239.169` |
| 登录用户 | `root` |
| 域名 | `boatman-health.ziya.site` |

---

## 环境总览

| 环境类型 | 后端端口 | 前端访问端口 | 数据库 | PM2 进程名 |
|---------|---------|------------|--------|-----------|
| **生产环境** | 3001 | 80, 8080 | prod.db | boatman-health-A4 |
| **测试环境** | 3003 | 3002 | test.db | server-test |
| **本地开发** | 3000 | 5174(client), 5173(admin) | dev.db | - |

---

## 访问地址

### 生产环境

| 端点 | 地址 |
|------|------|
| 用户端 | `http://118.145.239.169/` 或 `http://boatman-health.ziya.site/` |
| 管理后台 | `http://118.145.239.169/admin/` 或 `http://boatman-health.ziya.site/admin/` |
| 后端 API | `http://118.145.239.169/api/` |
| 备用端口 | `http://118.145.239.169:8080/` |

### 测试环境

| 端点 | 地址 |
|------|------|
| 用户端 | `http://118.145.239.169:3002/` |
| 管理后台 | `http://118.145.239.169:3002/admin/` |
| 后端 API | `http://118.145.239.169:3003/api/` |

---

## 服务器目录结构

### 生产环境

#### 前端静态文件（Nginx 托管）

| 路径 | 说明 |
|------|------|
| `/var/www/boatman-health-A4/` | 用户端前端（Nginx root 目录） |
| `/var/www/boatman-health-A4/admin/` | 管理后台前端（Nginx alias 目录） |

#### 后端服务（PM2 管理）

| 路径 | 说明 |
|------|------|
| `/opt/boatman-health/` | Git 仓库克隆目录（用于 git pull 拉取最新代码） |
| `/opt/boatman-health-A4-server/` | 后端运行根目录 |
| `/opt/boatman-health-A4-server/dist/` | 后端编译产物（PM2 从此启动 app.js） |
| `/opt/boatman-health-A4-server/prisma/prisma/prod.db` | 生产数据库文件 |

#### Nginx 配置

| 文件 | 说明 |
|------|------|
| `/etc/nginx/conf.d/boatman-health-A4.conf` | 生产环境 Nginx 配置（前端 + API 反向代理） |

### 测试环境

#### 前端静态文件（Nginx 托管）

| 路径 | 说明 |
|------|------|
| `/www/server/boatman-health-test/client/` | 测试环境用户端前端 |
| `/www/server/boatman-health-test/admin/` | 测试环境管理后台前端 |

#### 后端服务（PM2 管理）

| 路径 | 说明 |
|------|------|
| `/www/server/boatman-health-test/server/` | 测试环境后端代码目录 |
| `/www/server/boatman-health-test/server/prisma/test.db` | 测试数据库文件 |
| `/www/server/boatman-health-test/server/.env` | 测试环境变量（从 .env.test 复制） |

#### Nginx 配置

| 文件 | 说明 |
|------|------|
| `/etc/nginx/conf.d/boatman-health-test.conf` | 测试环境 Nginx 配置 |

#### PM2 日志

| 文件 | 说明 |
|------|------|
| `/www/logs/boatman-health/test-error.log` | 测试环境错误日志 |
| `/www/logs/boatman-health/test-out.log` | 测试环境输出日志 |

---

## 操作规范

> **⚠️ 重要约束**：AI 不得主动执行任何服务器操作（构建、上传、部署、重启等）。
> 每次操作必须等待用户明确指令，且每条指令只允许执行一次。

---

## 部署架构

```
用户浏览器
    │
    ▼
Nginx（腾讯云轻量服务器 118.145.239.169）
├── :80 / :8080 → 生产环境
│   ├── / → 用户端 SPA（/var/www/boatman-health-A4/）
│   ├── /admin/ → 管理后台 SPA（/var/www/boatman-health-A4/admin/）
│   ├── /api/* → proxy_pass http://127.0.0.1:3001
│   └── /admin/(auth|dashboard|...) → proxy_pass http://127.0.0.1:3001
│
└── :3002 → 测试环境
    ├── / → 用户端 SPA（/www/server/boatman-health-test/client/）
    ├── /admin/ → 管理后台 SPA（/www/server/boatman-health-test/admin/）
    ├── /api/* → proxy_pass http://127.0.0.1:3003
    └── /admin/(auth|dashboard|...) → proxy_pass http://127.0.0.1:3003
    │
    ▼
PM2 进程管理
├── boatman-health-A4 → Node.js Express :3001（生产）
└── server-test → Node.js Express :3003（测试）
    │
    ▼
Prisma ORM → SQLite
├── /opt/boatman-health-A4-server/prisma/prisma/prod.db（生产）
└── /www/server/boatman-health-test/server/prisma/test.db（测试）
```

---

## 部署规范

### 生产环境 - 后端部署

```bash
# 1. 拉取最新代码
cd /opt/boatman-health && git pull origin main

# 2. 编译 TypeScript
cd server && npx tsc

# 3. 同步编译产物到运行目录
cp -r /opt/boatman-health/server/dist/* /opt/boatman-health-A4-server/dist/

# 4. 如有依赖变更，安装依赖
cd /opt/boatman-health-A4-server && npm install --production

# 5. 如有数据库迁移
npx prisma migrate deploy --schema=./prisma/schema.prisma

# 6. 重启 PM2 进程
pm2 restart boatman-health-A4
```

### 生产环境 - 前端部署

```bash
# 本地执行（Mac）

# 1. 构建前端
cd /path/to/project && npm run build

# 2. 上传用户端到生产服务器
rsync -avz --delete client/dist/ root@118.145.239.169:/var/www/boatman-health-A4/

# 3. 上传管理后台到生产服务器
rsync -avz --delete admin/dist/ root@118.145.239.169:/var/www/boatman-health-A4/admin/
```

或者使用打包方式：

```bash
# 1. 构建前端
npm run build

# 2. 打包 dist/
tar -cf frontend-dist.tar -C dist .

# 3. 上传到服务器
scp frontend-dist.tar remote-setup.sh root@118.145.239.169:/tmp/

# 4. 服务器执行部署脚本
ssh root@118.145.239.169 "bash /tmp/remote-setup.sh"
```

### 测试环境部署

详见 `docs/测试环境部署指南.md` 或使用一键部署脚本：

```bash
bash scripts/deploy-test-full.sh
```

---

## PM2 进程信息

### 生产环境

| 字段 | 值 |
|------|----|
| 进程名 | `boatman-health-A4` |
| 模式 | `fork` |
| 启动文件 | `/opt/boatman-health-A4-server/dist/app.js` |
| 服务端口 | `3001` |
| 运行环境 | `production` |
| Node.js 版本 | `v20.20.2` |

### 测试环境

| 字段 | 值 |
|------|----|
| 进程名 | `server-test` |
| 模式 | `fork` |
| 启动文件 | `/www/server/boatman-health-test/server/dist/app.js` |
| 服务端口 | `3003` |
| 运行环境 | `test` |

---

## Nginx 路由规则

### 生产环境（:80, :8080）

| 匹配规则 | 代理目标 | 说明 |
|----------|----------|------|
| `/api/*` | `http://127.0.0.1:3001` | 后端 API |
| `/admin/(auth\|dashboard\|form1\|form2\|users\|sync\|sleep-surveys\|nutrition-surveys)` | `http://127.0.0.1:3001` | 管理后台 API |
| `/admin/*` | SPA fallback → `/admin/index.html` | 管理后台前端 |
| `/*` | SPA fallback → `/index.html` | 用户端前端 |

> ⚠️ **注意**：新增 admin API 路由时，需同步更新 Nginx 正则白名单，否则新接口会被当作前端页面请求处理（返回 HTML）。

### 测试环境（:3002）

| 匹配规则 | 代理目标 | 说明 |
|----------|----------|------|
| `/api/*` | `http://127.0.0.1:3003` | 后端 API |
| `/admin/(auth\|dashboard\|form1\|form2\|users\|sync\|surveys\|sleep-surveys\|nutrition-surveys)` | `http://127.0.0.1:3003` | 管理后台 API |
| `/admin/*` | SPA fallback → `/admin/index.html` | 管理后台前端 |
| `/*` | SPA fallback → `/index.html` | 用户端前端 |

---

## 常用命令

```bash
# SSH 登录
ssh root@118.145.239.169

# 查看 PM2 进程
pm2 list

# 查看生产环境日志
pm2 logs boatman-health-A4 --lines 100

# 查看测试环境日志
pm2 logs server-test --lines 100

# 检查端口占用
netstat -tlnp | grep -E '3001|3002|3003'

# 生产环境健康检查
curl http://localhost:3001/health

# 测试环境健康检查
curl http://localhost:3003/health

# 测试并重载 Nginx
nginx -t && nginx -s reload
```
