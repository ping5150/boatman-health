# ==================== 测试环境一键部署脚本 (PowerShell) ====================
# 使用方法：.\scripts\deploy-test-full.ps1
# 注意：需要先配置好 SSH 免密登录

$SERVER = "118.145.239.169"
$USER = "root"
$TEST_DIR = "/www/server/boatman-health-test"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  测试环境一键部署" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 第一步：初始化服务器目录
Write-Host "[1/6] 初始化服务器目录..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} @"
mkdir -p /www/server/boatman-health-test/{server,client,admin}
mkdir -p /www/logs/boatman-health
touch /www/logs/boatman-health/test-error.log
touch /www/logs/boatman-health/test-out.log
"@

# 第二步：打包后端
Write-Host "[2/6] 打包并上传后端代码..." -ForegroundColor Yellow
Set-Location server
tar -cf ../server-test.tar `
  --exclude="node_modules" `
  --exclude="*.db" `
  --exclude="*.db-journal" `
  --exclude=".env" `
  --exclude="dist" `
  .
Set-Location ..
scp server-test.tar ${USER}@${SERVER}:${TEST_DIR}/server/

# 第三步：构建并上传前端
Write-Host "[3/6] 构建并上传前端..." -ForegroundColor Yellow
npm run build
Set-Location dist
tar -cf ../../frontend-test.tar .
Set-Location ..
Set-Location ..
scp frontend-test.tar ${USER}@${SERVER}:${TEST_DIR}/client/

# 第四步：在服务器安装
Write-Host "[4/6] 在服务器安装依赖和配置..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} @"
set -e
cd $TEST_DIR/server
tar -xf server-test.tar
rm server-test.tar
npm install --production
npx prisma generate
npm run build
npx prisma migrate deploy
cd $TEST_DIR/client
tar -xf frontend-test.tar
rm frontend-test.tar
"@

# 第五步：上传环境变量
Write-Host "[5/6] 上传环境变量..." -ForegroundColor Yellow
scp server/.env.test ${USER}@${SERVER}:${TEST_DIR}/server/.env

# 第六步：启动服务
Write-Host "[6/6] 配置 PM2 和 Nginx..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} @"
pm2 delete server-test 2>/dev/null || true
pm2 start $TEST_DIR/ecosystem.config.js --only server-test
pm2 save

if [ -f /etc/nginx/conf.d/boatman-health-test.conf ]; then
  nginx -t && nginx -s reload
else
  echo '请手动创建 Nginx 测试环境配置'
fi
"@

# 清理
Remove-Item server-test.tar -ErrorAction SilentlyContinue
Remove-Item frontend-test.tar -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ✅ 部署完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "测试环境地址：" -ForegroundColor White
Write-Host "  - 用户端：http://${SERVER}:3002/" -ForegroundColor Cyan
Write-Host "  - 管理后台：http://${SERVER}:3002/admin/" -ForegroundColor Cyan
Write-Host "  - 后端 API：http://${SERVER}:3001/api/" -ForegroundColor Cyan
Write-Host ""
Write-Host "查看日志：" -ForegroundColor White
Write-Host "  ssh ${USER}@${SERVER} 'pm2 logs server-test'" -ForegroundColor Gray
Write-Host ""
