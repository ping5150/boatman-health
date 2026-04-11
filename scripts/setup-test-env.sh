#!/bin/bash
# ==================== 测试环境初始化脚本 ====================
# 在服务器上执行：bash scripts/setup-test-env.sh

set -e

echo "=========================================="
echo "  初始化测试环境"
echo "=========================================="

# 配置
TEST_DIR="/www/server/boatman-health-test"
LOGS_DIR="/www/logs/boatman-health"

# 1. 创建目录结构
echo "[1/5] 创建目录结构..."
mkdir -p $TEST_DIR/server
mkdir -p $TEST_DIR/client
mkdir -p $TEST_DIR/admin
mkdir -p $LOGS_DIR

# 2. 创建测试环境数据库
echo "[2/5] 初始化测试数据库..."
cd $TEST_DIR/server
if [ ! -f "prisma/test.db" ]; then
  mkdir -p prisma
  touch prisma/test.db
  echo "已创建测试数据库文件"
fi

# 3. 创建 PM2 日志文件
echo "[3/5] 创建日志文件..."
touch $LOGS_DIR/test-error.log
touch $LOGS_DIR/test-out.log

# 4. 检查目录权限
echo "[4/5] 设置权限..."
chmod -R 755 $TEST_DIR
chmod -R 755 $LOGS_DIR

# 5. 输出信息
echo "[5/5] 初始化完成！"
echo ""
echo "目录结构："
echo "  - 后端代码: $TEST_DIR/server/"
echo "  - 前端代码: $TEST_DIR/client/"
echo "  - 管理后台: $TEST_DIR/admin/"
echo "  - 日志目录: $LOGS_DIR/"
echo ""
echo "下一步："
echo "  1. 上传后端代码到 $TEST_DIR/server/"
echo "  2. 上传前端代码到 $TEST_DIR/client/ 和 $TEST_DIR/admin/"
echo "  3. 配置 .env.test 文件"
echo "  4. 运行数据库迁移"
echo "  5. 配置 Nginx"
echo "  6. 启动 PM2 服务"
