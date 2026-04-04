# 船夫健康 — 服务器部署说明

## 服务器信息

| 项目 | 值 |
|------|----|
| 服务器 IP | `118.145.239.169` |
| 登录用户 | `root` |
| 后端端口 | `3000` |

---

## 目录结构

### 前端静态文件（Nginx 托管）

| 路径 | 说明 |
|------|------|
| `/var/www/boatman-health-A4/` | **船夫健康前端（当前生效，直接解压部署到此）** |

### 后端服务（PM2 管理）

| 路径 | 说明 |
|------|------|
| `/opt/boatman-health/` | Git 仓库克隆目录（用于 git pull 拉取最新代码） |
| `/opt/boatman-health-A4-server/dist/` | **后端运行目录（编译产物，PM2 从此启动）** |

### Nginx 配置

| 文件 | 说明 |
|------|------|
| `/etc/nginx/conf.d/boatman-health-A4.conf` | 船夫健康 Nginx 配置（前端 + API 反向代理） |

---

## 部署规范

### 后端部署流程

```bash
# 1. 拉取最新代码
cd /opt/boatman-health && git pull origin main

# 2. 编译 TypeScript
cd server && npx tsc

# 3. 同步编译产物到运行目录
cp -r /opt/boatman-health/server/dist/* /opt/boatman-health-A4-server/dist/

# 4. 重启 PM2 进程
pm2 restart boatman-health-A4
```

### 前端部署流程

```bash
# 本地执行（Mac）

# 1. 构建前端
cd /path/to/project && npm run build

# 2. 打包 dist/
tar -cf frontend-dist.tar -C dist .

# 3. 上传到服务器
scp frontend-dist.tar remote-setup.sh root@118.145.239.169:/tmp/

# 4. 服务器执行部署脚本（直接解压到 /var/www/boatman-health-A4/，无需中转）
ssh root@118.145.239.169 "bash /tmp/remote-setup.sh"
```

### PM2 进程信息

| 字段 | 值 |
|------|----|
| 进程名 | `boatman-health-A4` |
| id | `1` |
| 模式 | `fork` |
| 启动目录 | `/opt/boatman-health-A4-server/dist/app.js` |

---

## 访问地址

| 端点 | 地址 |
|------|------|
| 用户端 | `http://118.145.239.169/` |
| 管理后台 | `http://118.145.239.169/admin/` |
| 后端 API | `http://118.145.239.169/api/` |

---

## Nginx 路由规则

| 匹配规则 | 代理目标 | 说明 |
|----------|----------|------|
| `/api/*` | `http://127.0.0.1:3000` | 后端 API |
| `/admin/(auth\|dashboard\|form1\|form2\|users\|sync)` | `http://127.0.0.1:3000` | 管理后台 API |
| `/admin/*` | SPA fallback → `/admin/index.html` | 管理后台前端 |
| `/*` | SPA fallback → `/index.html` | 用户端前端 |
