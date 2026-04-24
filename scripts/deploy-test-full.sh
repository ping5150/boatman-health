#!/bin/bash
# ==================== 测试环境一键部署脚本 ====================
# 使用方法：bash scripts/deploy-test-full.sh
# 注意：需要先配置好 SSH 免密登录

set -e

SERVER="118.145.239.169"
USER="root"
TEST_DIR="/www/server/boatman-health-test"

echo "=========================================="
echo "  测试环境一键部署"
echo "=========================================="
echo ""

# 第一步：初始化服务器目录
echo "[1/6] 初始化服务器目录..."
ssh $USER@$SERVER << 'ENDSSH'
mkdir -p /www/server/boatman-health-test/{server,client,admin}
mkdir -p /www/logs/boatman-health
touch /www/logs/boatman-health/test-error.log
touch /www/logs/boatman-health/test-out.log
ENDSSH

# 第二步：上传后端代码
echo "[2/6] 打包并上传后端代码..."
cd server
tar -cf ../server-test.tar \
  --exclude="node_modules" \
  --exclude="*.db" \
  --exclude="*.db-journal" \
  --exclude=".env" \
  --exclude="dist" \
  .
scp ../server-test.tar $USER@$SERVER:$TEST_DIR/server/
cd ..

# 第三步：上传前端代码
echo "[3/6] 构建并上传前端..."
npm run build
cd dist
tar -cf ../../frontend-test.tar .
cd ../..

scp frontend-test.tar $USER@$SERVER:$TEST_DIR/client/

# 第四步：在服务器安装和配置
echo "[4/6] 在服务器安装依赖和配置..."
ssh $USER@$SERVER << ENDSSH
set -e

# 解压后端
cd $TEST_DIR/server
tar -xf server-test.tar
rm server-test.tar

# 安装依赖
npm install --production
npx prisma generate

# 编译 TypeScript
npm run build

# 运行数据库迁移
npx prisma migrate deploy

# 解压前端
cd $TEST_DIR/client
tar -xf frontend-test.tar
rm frontend-test.tar

ENDSSH

# 第五步：上传环境变量文件
echo "[5/6] 上传环境变量..."
scp server/.env.test $USER@$SERVER:$TEST_DIR/server/.env

# 第六步：配置和启动服务
echo "[6/6] 配置 PM2 和 Nginx..."
ssh $USER@$SERVER << 'ENDSSH'
# 复制 ecosystem.config.js
cp /opt/boatman-health/ecosystem.config.js /www/server/boatman-health-test/

# 启动或重启 PM2
pm2 delete server-test 2>/dev/null || true
pm2 start /www/server/boatman-health-test/ecosystem.config.js --only server-test
pm2 save

# 检查 Nginx 配置
if [ ! -f /etc/nginx/conf.d/boatman-health-test.conf ]; then
  echo "请手动创建 Nginx 测试环境配置：/etc/nginx/conf.d/boatman-health-test.conf"
  echo "参考文档：docs/测试环境部署指南.md"
else
  nginx -t && nginx -s reload
fi
ENDSSH

# 清理本地临时文件
rm -f server-test.tar frontend-test.tar

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "测试环境地址："
echo "  - 用户端：http://$SERVER:3002/"
echo "  - 管理后台：http://$SERVER:3002/admin/"
echo "  - 后端 API：http://$SERVER:3003/api/"
echo ""
echo "查看日志："
echo "  ssh $USER@$SERVER 'pm2 logs server-test'"
echo ""
