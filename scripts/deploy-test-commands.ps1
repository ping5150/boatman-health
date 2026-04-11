# ==================== 测试环境后端部署命令 ====================
# 请逐条复制执行以下命令

# === 步骤 1：检查服务器目录 ===
ssh root@118.145.239.169 "ls -la /www/server/boatman-health-test/server/"

# === 步骤 2：检查生产环境代码位置 ===
ssh root@118.145.239.169 "ls /opt/boatman-health-A4-server/package.json 2>/dev/null && echo 'FOUND_IN_OPT' || ls /www/server/boatman-health/server/package.json 2>/dev/null && echo 'FOUND_IN_WWW' || echo 'NOT_FOUND'"

# === 步骤 3：复制生产环境代码（根据上一步结果选择） ===
# 如果输出包含 "FOUND_IN_OPT"，执行：
ssh root@118.145.239.169 "cp -r /opt/boatman-health-A4-server/* /www/server/boatman-health-test/server/"

# 如果输出包含 "FOUND_IN_WWW"，执行：
# ssh root@118.145.239.169 "cp -r /www/server/boatman-health/server/* /www/server/boatman-health-test/server/"

# === 步骤 4：清理旧配置 ===
ssh root@118.145.239.169 "cd /www/server/boatman-health-test/server && rm -f .env prisma/*.db prisma/*.db-journal"

# === 步骤 5：上传测试环境配置 ===
scp "f:\全栈项目\boatman-health\server\.env.test" root@118.145.239.169:/www/server/boatman-health-test/server/.env

# === 步骤 6：安装依赖（需要 2-3 分钟） ===
ssh root@118.145.239.169 "cd /www/server/boatman-health-test/server && npm install --production"

# === 步骤 7：初始化数据库 ===
ssh root@118.145.239.169 "cd /www/server/boatman-health-test/server && ./node_modules/.bin/prisma generate && ./node_modules/.bin/prisma migrate deploy"

# === 步骤 8：上传 ecosystem.config.js ===
scp "f:\全栈项目\boatman-health\ecosystem.config.js" root@118.145.239.169:/www/server/boatman-health-test/

# === 步骤 9：启动 PM2 服务 ===
ssh root@118.145.239.169 "pm2 delete server-test 2>/dev/null; cd /www/server/boatman-health-test && pm2 start ecosystem.config.js --only server-test && pm2 save"

# === 步骤 10：验证部署 ===
ssh root@118.145.239.169 "pm2 list"
ssh root@118.145.239.169 "curl http://localhost:3001/health"
