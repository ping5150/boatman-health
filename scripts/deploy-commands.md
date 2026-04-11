# ==================== 测试环境部署命令 ====================
# 请按顺序执行每个步骤的命令

## 第二步：初始化服务器目录

# 2.1 上传初始化脚本到服务器
scp f:/全栈项目/boatman-health/scripts/setup-test-env.sh root@118.145.239.169:/tmp/

# 2.2 SSH 登录服务器并执行初始化
ssh root@118.145.239.169 "bash /tmp/setup-test-env.sh"

# 验证目录创建成功
ssh root@118.145.239.169 "ls -la /www/server/boatman-health-test/"

## 第三步：部署后端代码

# 3.1 打包后端代码（在本地执行）
cd f:/全栈项目/boatman-health/server
tar -cf ../server-test.tar --exclude="node_modules" --exclude="*.db" --exclude="*.db-journal" --exclude=".env" --exclude="dist" .

# 3.2 上传到服务器
scp ../server-test.tar root@118.145.239.169:/www/server/boatman-health-test/server/

# 3.3 在服务器解压并安装
ssh root@118.145.239.169 "cd /www/server/boatman-health-test/server && tar -xf server-test.tar && npm install --production && npx prisma generate && npx prisma migrate deploy && npm run build"

# 3.4 上传环境变量文件
scp f:/全栈项目/boatman-health/server/.env.test root@118.145.239.169:/www/server/boatman-health-test/server/.env

## 第四步：启动 PM2 测试进程

# 4.1 上传 ecosystem.config.js
scp f:/全栈项目/boatman-health/ecosystem.config.js root@118.145.239.169:/www/server/boatman-health-test/

# 4.2 启动测试服务
ssh root@118.145.239.169 "cd /www/server/boatman-health-test && pm2 start ecosystem.config.js --only server-test && pm2 save"

# 4.3 查看状态
ssh root@118.145.239.169 "pm2 list"

## 第五步：部署前端代码

# 5.1 在本地构建前端
cd f:/全栈项目/boatman-health
npm run build

# 5.2 打包前端产物
cd dist
tar -cf ../../frontend-test.tar .

# 5.3 上传到服务器
scp ../../frontend-test.tar root@118.145.239.169:/www/server/boatman-health-test/client/

# 5.4 在服务器解压
ssh root@118.145.239.169 "cd /www/server/boatman-health-test/client && tar -xf frontend-test.tar"

## 第六步：配置 Nginx

# 6.1 上传 Nginx 配置
scp f:/全栈项目/boatman-health/scripts/nginx-test.conf root@118.145.239.169:/etc/nginx/conf.d/boatman-health-test.conf

# 6.2 测试并重载 Nginx
ssh root@118.145.239.169 "nginx -t && nginx -s reload"

## 第七步：验证部署

# 7.1 检查后端健康
ssh root@118.145.239.169 "curl http://localhost:3001/health"

# 7.2 查看日志
ssh root@118.145.239.169 "pm2 logs server-test --lines 20 --nostream"
