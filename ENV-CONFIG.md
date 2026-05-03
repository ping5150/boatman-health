# 船夫健康 — 环境配置说明

> 📅 更新时间：2026-05-03
> 🎯 目的：确保测试环境与生产环境完全隔离，本地开发默认连接本地后端

---

## 📊 环境总览

| 环境类型 | 后端端口 | 前端访问 | 数据库 | 用途 |
|---------|---------|---------|--------|------|
| **本地开发** | localhost:3000 | localhost:5173 / 5174 | dev.db | 本地开发调试 |
| **生产环境** | 106.53.64.33:3000 | https://www.boatmanhealth.com | prod.db | 线上生产 |

---

## 🔧 环境详细配置

### 1. 生产环境（Production）

#### 基本信息
- **服务器 IP**：`106.53.64.33`
- **代码目录**：`/www/boatman-health/server/`
- **PM2 进程名**：`boatman-health`
- **Node.js版本**：v20.20.2

#### 端口配置
- **后端服务端口**：`3000`
- **Nginx 监听端口**：`80`（HTTP，自动跳转 HTTPS）、`443`（HTTPS）

#### 访问地址
- **用户端**：https://www.boatmanhealth.com/
- **管理后台**：https://www.boatmanhealth.com/admin/

#### 数据库配置
- **数据库类型**：SQLite
- **数据库文件**：`/www/boatman-health/server/prisma/prod.db`
- **DATABASE_URL**：`file:./prisma/prod.db`

#### 飞书表格配置
```bash
FEISHU_APP_ID=cli_a97c4a4129781bdf
FEISHU_APP_SECRET=NERYqZERdjLmn3QuCpaaqgVf6eza8nUG

# 用户表（USER）
USER_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
USER_TABLE_ID=tbl1U4Mosd7dzvHD

# Form1（咨询预约表单）
FORM1_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
FORM1_TABLE_ID=tbl1g5VYg6nJKUAj

# Form2（健康评估表单）
FORM2_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
FORM2_TABLE_ID=tbl5sonmjYfbEibo

# Sleep（睡眠问卷表）
SLEEP_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
SLEEP_TABLE_ID=tbl54plrv4NXtCRS
SLEEP_SURVEY_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
SLEEP_SURVEY_TABLE_ID=tbl54plrv4NXtCRS

# Nutrition（营养问卷表）
NUTRITION_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
NUTRITION_TABLE_ID=tbl1GMdpnljuWQcI
NUTRITION_SURVEY_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
NUTRITION_SURVEY_TABLE_ID=tbl1GMdpnljuWQcI
```

#### Nginx 配置文件
- 文件位置：`/etc/nginx/conf.d/boatman-health.conf`
- SSL 证书：Let's Encrypt，自动续期
- 代理配置：
  - `/api/*` → `http://127.0.0.1:3000`
  - `/admin-api/*` → `http://127.0.0.1:3000/admin/`

---

### 2. 本地开发环境（Development）

#### 基本信息
- **代码目录**：本地项目根目录
- **前端端口**：`5173`（client）/ `5174`（admin）
- **后端端口**：`3000`

#### 默认连接环境
🎯 **本地开发默认连接本地后端**（`localhost:3000`）

#### 访问地址
- **用户端**：http://localhost:5173/
- **管理后台**：http://localhost:5174/

#### 数据库配置（本地后端）
- **数据库类型**：SQLite
- **数据库文件**：`server/prisma/dev.db`
- **验证码**：`123456`（开发环境固定）

#### Vite 代理配置
```typescript
// client/vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    '/admin': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

#### Admin 代理配置
```typescript
// admin/vite.config.ts
server: {
  port: 5174,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
    '/admin': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

---

## 🛡️ 安全注意事项

### ⚠️ 生产环境保护

1. **本地开发默认连接本地后端**，避免误操作生产数据
2. **生产环境数据库**：`prod.db` - 真实用户数据
3. **飞书表格**：生产环境使用独立表格

### ✅ 最佳实践

- ✅ 本地开发使用本地后端
- ✅ 只有正式发布时才部署到生产环境
- ✅ 定期备份生产环境数据库
- ✅ 部署前先在本地验证

---

## 📝 常用命令

### 查看生产环境状态

```bash
# 登录服务器
ssh root@106.53.64.33

# 查看 PM2 进程
pm2 list

# 查看生产环境日志
pm2 logs boatman-health

# 重启服务
pm2 restart boatman-health --update-env

# 查看数据库文件
ls -lh /www/boatman-health/server/prisma/prod.db
```

### 本地开发命令

```bash
# 启动后端
npm run dev:server

# 启动用户端前端
npm run dev:client

# 启动管理后台前端
npm run dev:admin

# 构建生产版本
npm run build
```

### 前端部署到生产环境

```bash
# 本地构建
cd client && npm run build
cd admin && npm run build

# 上传到服务器
rsync -avz --delete client/dist/ root@106.53.64.33:/www/boatman-health/client/
rsync -avz --delete admin/dist/  root@106.53.64.33:/www/boatman-health/admin/
```

### 后端部署到生产环境

```bash
# 本地构建
cd server && npm run build

# 上传到服务器
rsync -avz --delete --exclude='node_modules' --exclude='.env' server/ root@106.53.64.33:/www/boatman-health/server/

# 在服务器上安装依赖并重启
ssh root@106.53.64.33 "cd /www/boatman-health/server && npm install --production && pm2 restart boatman-health --update-env"
```

---

**最后更新**：2026-05-03
**文档维护**：开发团队
