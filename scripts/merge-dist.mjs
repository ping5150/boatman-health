/**
 * 构建合并脚本
 * 将 client/dist 和 admin/dist 合并到根目录 dist/
 *
 * 最终目录结构：
 * dist/
 * ├── index.html          (用户端)
 * ├── assets/              (用户端静态资源)
 * ├── _redirects           (统一路由回退)
 * └── admin/
 *     ├── index.html       (管理后台)
 *     └── assets/          (管理后台静态资源)
 */
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const distDir = resolve(root, 'dist');
const clientDist = resolve(root, 'client', 'dist');
const adminDist = resolve(root, 'admin', 'dist');

// 检查源目录是否存在
if (!existsSync(clientDist)) {
  console.error('❌ client/dist 不存在，请先构建 client');
  process.exit(1);
}
if (!existsSync(adminDist)) {
  console.error('❌ admin/dist 不存在，请先构建 admin');
  process.exit(1);
}

// 1. 清理旧的 dist
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });

// 2. 使用 robocopy 复制文件（Windows 更稳健）
const isWindows = process.platform === 'win32';

if (isWindows) {
  // robocopy 返回值 < 8 表示成功
  try {
    execSync(`robocopy "${clientDist}" "${distDir}" /E /NFL /NDL /NJH /NJS /NC /NS`, { stdio: 'pipe' });
  } catch (e) {
    // robocopy exit code < 8 是正常的
    if (e.status >= 8) {
      throw e;
    }
  }

  const adminTarget = resolve(distDir, 'admin');
  mkdirSync(adminTarget, { recursive: true });
  try {
    execSync(`robocopy "${adminDist}" "${adminTarget}" /E /NFL /NDL /NJH /NJS /NC /NS`, { stdio: 'pipe' });
  } catch (e) {
    if (e.status >= 8) {
      throw e;
    }
  }
} else {
  execSync(`cp -r "${clientDist}/." "${distDir}/"`, { stdio: 'pipe' });
  execSync(`cp -r "${adminDist}" "${distDir}/admin"`, { stdio: 'pipe' });
}

console.log('✅ 构建产物合并完成！');
console.log('   用户端  → dist/');
console.log('   管理后台 → dist/admin/');
