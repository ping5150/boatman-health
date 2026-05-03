# 部署命令参考

> 📅 更新时间：2026-05-03

## 生产环境部署

### 前端部署

```bash
# 本地构建
cd client && npm run build
cd admin && npm run build

# 上传到服务器
rsync -avz --delete client/dist/ root@106.53.64.33:/www/boatman-health/client/
rsync -avz --delete admin/dist/  root@106.53.64.33:/www/boatman-health/admin/
```

### 后端部署

```bash
# 本地构建
cd server && npm run build

# 上传到服务器（排除 node_modules 和 .env）
rsync -avz --delete --exclude='node_modules' --exclude='.env' server/ root@106.53.64.33:/www/boatman-health/server/

# 在服务器上安装依赖并重启
ssh root@106.53.64.33 "cd /www/boatman-health/server && npm install --production && npx prisma generate && pm2 restart boatman-health --update-env"
```

### 服务管理

```bash
# SSH 登录
ssh root@106.53.64.33

# 查看服务状态
pm2 list

# 查看日志
pm2 logs boatman-health --lines 100

# 重启服务
pm2 restart boatman-health --update-env

# 健康检查
curl http://localhost:3000/health
```

### Nginx 管理

```bash
# 检查配置
nginx -t

# 重载配置
systemctl reload nginx

# 查看配置文件
cat /etc/nginx/conf.d/boatman-health.conf
```

### 数据库管理

```bash
# 在服务器上
cd /www/boatman-health/server

# 运行迁移
npx prisma migrate deploy

# 查看数据库
npx prisma studio

# 备份数据库
cp prisma/prod.db prisma/prod.db.backup-$(date +%Y%m%d)
```

### SSL 证书

```bash
# 查看证书状态
certbot certificates

# 手动续期
certbot renew

# 查看自动续期定时任务
systemctl list-timers | grep certbot
```
