# deploy-frontend.ps1
# 前端部署脚本 - 部署 client + admin 到 43.139.240.74
# 用法: .\deploy-frontend.ps1

$SERVER = "43.139.240.74"
$USER = "ubuntu"

Write-Host "===== 船夫健康 - 前端部署 =====" -ForegroundColor Cyan

# Step 0: 将 remote-setup.sh 转为 LF 换行符
Write-Host "`n[0/3] 转换脚本换行符..." -ForegroundColor Yellow
$content = Get-Content -Path "remote-setup.sh" -Raw
$content = $content -replace "`r`n", "`n"
[System.IO.File]::WriteAllText("$PWD\remote-setup.sh", $content, [System.Text.UTF8Encoding]::new($false))
Write-Host "换行符转换完成" -ForegroundColor Green

# Step 1: 上传文件
Write-Host "`n[1/3] 上传构建产物和部署脚本到服务器..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no frontend-dist.tar remote-setup.sh "${USER}@${SERVER}:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "上传失败" -ForegroundColor Red
    exit 1
}
Write-Host "上传完成" -ForegroundColor Green

# Step 2: 远程执行部署脚本
Write-Host "`n[2/3] 在服务器上执行部署..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no "${USER}@${SERVER}" "bash /tmp/remote-setup.sh"
if ($LASTEXITCODE -ne 0) {
    Write-Host "远程部署失败" -ForegroundColor Red
    exit 1
}

# Step 3: 完成
Write-Host "`n[3/3] 清理远程临时文件..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no "${USER}@${SERVER}" "rm -f /tmp/remote-setup.sh"

Write-Host "`n===== 部署完成 =====" -ForegroundColor Green
Write-Host "用户端:   http://$SERVER/" -ForegroundColor Cyan
Write-Host "管理后台: http://$SERVER/admin/" -ForegroundColor Cyan
