#!/bin/bash
# ==================== 测试环境部署脚本 ====================
# 使用方法: bash deploy-test.sh

set -e

echo "=========================================="
echo "  开始部署测试环境"
echo "=========================================="

# 配置
TEST_DIR="/www/server/boatman-health-test"
LOGS_DIR="/www/logs/boatman-health"
GIT_REPO="your-git-repo-url"  # 替换为实际 Git 仓库地址

# 创建目录
echo "[1/6] 创建目录..."
mkdir -p $TEST_DIR
mkdir -p $LOGS_DIR

# 拉取代码
echo "[2/6] 拉取最新代码..."
if [ -d "$TEST_DIR/.git" ]; then
  cd $TEST_DIR
  git pull origin main
else
  git clone $GIT_REPO $TEST_DIR
  cd $TEST_DIR
fi

# 复制测试环境配置
echo "[3/6] 配置环境变量..."
if [ -f "server/.env.test" ]; then
  cp server/.env.test server/.env
  echo "已使用 .env.test 配置"
else
  echo "警告: server/.env.test 不存在，请手动配置"
fi

# 安装依赖
echo "[4/6] 安装依赖..."
cd server
npm install
npm run prisma:generate

# 运行数据库迁移
echo "[5/6] 运行数据库迁移..."
npx prisma migrate deploy

# 构建后端
echo "[6/6] 构建后端..."
npm run build

# 重启服务
echo "[7/6] 重启测试服务..."
pm2 restart server-test || pm2 start ../ecosystem.config.js --only server-test

# 保存 PM2 配置
pm2 save

echo "=========================================="
echo "  测试环境部署完成！"
echo "=========================================="
echo ""
echo "测试后端地址: http://118.145.239.169:3001"
echo "测试数据库: $TEST_DIR/server/prisma/test.db"
echo ""
echo "查看日志: pm2 logs server-test"
echo "重启服务: pm2 restart server-test"
