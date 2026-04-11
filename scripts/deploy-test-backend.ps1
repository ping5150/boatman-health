# ==================== 测试环境后端部署脚本 ====================
# 执行方法：.\scripts\deploy-test-backend.ps1

$ErrorActionPreference = "Continue"
$SERVER = "118.145.239.169"
$USER = "root"
$TEST_DIR = "/www/server/boatman-health-test"
$LOCAL_SERVER_DIR = "f:\全栈项目\boatman-health\server"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  测试环境后端部署" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1：检查服务器目录
Write-Host "[步骤 1/8] 检查服务器目录..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} "ls -la $TEST_DIR/server/" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 测试目录存在" -ForegroundColor Green
} else {
    Write-Host "✗ 测试目录不存在，请先执行初始化" -ForegroundColor Red
    exit 1
}

# 步骤 2：检查生产环境代码位置
Write-Host "[步骤 2/8] 检查生产环境代码..." -ForegroundColor Yellow
$prodCode = ssh ${USER}@${SERVER} "ls /opt/boatman-health-A4-server/package.json 2>/dev/null || ls /www/server/boatman-health/server/package.json 2>/dev/null || echo 'NOT_FOUND'"
if ($prodCode -ne "NOT_FOUND") {
    Write-Host "✓ 找到生产环境代码" -ForegroundColor Green
} else {
    Write-Host "⚠ 未找到生产环境代码，将从本地上传" -ForegroundColor Yellow
}

# 步骤 3：复制或上传后端代码
Write-Host "[步骤 3/8] 部署后端代码..." -ForegroundColor Yellow

if ($prodCode -ne "NOT_FOUND") {
    # 方案 A：从服务器复制
    Write-Host "  从生产环境复制代码..." -ForegroundColor Gray
    if ($prodCode -like "*opt*") {
        ssh ${USER}@${SERVER} "cp -r /opt/boatman-health-A4-server/* $TEST_DIR/server/"
    } else {
        ssh ${USER}@${SERVER} "cp -r /www/server/boatman-health/server/* $TEST_DIR/server/"
    }
    Write-Host "✓ 代码复制完成" -ForegroundColor Green
} else {
    # 方案 B：从本地上传
    Write-Host "  从本地上传代码..." -ForegroundColor Gray
    
    # 先生成 Prisma Client
    Set-Location $LOCAL_SERVER_DIR
    Write-Host "  生成 Prisma Client..." -ForegroundColor Gray
    npx prisma generate
    
    # 打包（排除有问题的文件）
    Write-Host "  打包后端代码..." -ForegroundColor Gray
    tar -cf ..\server-test.tar `
        --exclude="node_modules" `
        --exclude="*.db" `
        --exclude="*.db-journal" `
        --exclude=".env" `
        --exclude="dist" `
        --exclude="src/services/survey.service.ts" `
        --exclude="src/services/upload.service.ts" `
        --exclude="src/controllers/nutrition-survey.controller.ts" `
        --exclude="src/controllers/sleep-survey.controller.ts" `
        --exclude="src/routes/nutrition-survey.routes.ts" `
        --exclude="src/routes/sleep-survey.routes.ts" `
        --exclude="src/routes/upload.routes.ts" `
        --exclude="src/controllers/upload.controller.ts" `
        .
    
    # 上传
    Write-Host "  上传到服务器..." -ForegroundColor Gray
    scp ..\server-test.tar ${USER}@${SERVER}:${TEST_DIR}/server/
    
    # 解压
    Write-Host "  解压文件..." -ForegroundColor Gray
    ssh ${USER}@${SERVER} "cd $TEST_DIR/server && tar -xf server-test.tar && rm server-test.tar"
    
    # 清理本地临时文件
    Remove-Item ..\server-test.tar -ErrorAction SilentlyContinue
    
    Write-Host "✓ 代码上传完成" -ForegroundColor Green
}

# 步骤 4：清理旧配置
Write-Host "[步骤 4/8] 清理旧配置..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} "cd $TEST_DIR/server && rm -f .env prisma/*.db prisma/*.db-journal 2>/dev/null"
Write-Host "✓ 清理完成" -ForegroundColor Green

# 步骤 5：上传测试环境配置
Write-Host "[步骤 5/8] 上传环境配置..." -ForegroundColor Yellow
scp $LOCAL_SERVER_DIR\.env.test ${USER}@${SERVER}:${TEST_DIR}/server/.env
Write-Host "✓ 配置上传完成" -ForegroundColor Green

# 步骤 6：安装依赖
Write-Host "[步骤 6/8] 安装依赖（可能需要 2-3 分钟）..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} "cd $TEST_DIR/server && npm install --production"
Write-Host "✓ 依赖安装完成" -ForegroundColor Green

# 步骤 7：初始化数据库
Write-Host "[步骤 7/8] 初始化数据库..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} "cd $TEST_DIR/server && ./node_modules/.bin/prisma generate && ./node_modules/.bin/prisma migrate deploy"
Write-Host "✓ 数据库初始化完成" -ForegroundColor Green

# 步骤 8：启动 PM2 服务
Write-Host "[步骤 8/8] 启动测试服务..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} "pm2 delete server-test 2>/dev/null; cd $TEST_DIR && pm2 start ecosystem.config.js --only server-test && pm2 save"
Write-Host "✓ 服务启动完成" -ForegroundColor Green

# 验证
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ✅ 后端部署完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "验证部署：" -ForegroundColor Cyan
Write-Host "  ssh ${USER}@${SERVER} 'pm2 list'" -ForegroundColor Gray
Write-Host "  ssh ${USER}@${SERVER} 'curl http://localhost:3001/health'" -ForegroundColor Gray
Write-Host ""
Write-Host "查看日志：" -ForegroundColor Cyan
Write-Host "  ssh ${USER}@${SERVER} 'pm2 logs server-test --lines 50'" -ForegroundColor Gray
Write-Host ""
