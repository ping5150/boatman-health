# 船夫健康 — 环境配置说明

> 📅 更新时间：2026-04-12
> 🎯 目的：确保测试环境与生产环境完全隔离，本地开发默认连接测试环境

---

## 📊 环境总览

| 环境类型 | 后端端口 | 前端访问 | 数据库 | 用途 |
|---------|---------|---------|--------|------|
| **本地开发** | localhost:3000 | localhost:5174 | dev.db | 本地开发调试 |
| **测试环境** | 118.145.239.169:3003 | 118.145.239.169:3002 | test.db | 测试验证 |
| **生产环境** | 118.145.239.169:3001 | 118.145.239.169:80 | prod.db | 线上生产 |

---

## 🔧 环境详细配置

### 1. 生产环境（Production）

#### 基本信息
- **服务器 IP**：`118.145.239.169`
- **代码目录**：`/opt/boatman-health-A4-server/`
- **PM2 进程名**：`boatman-health-A4`
- **进程 PID**：876884
- **运行时长**：7 天+
- **重启次数**：31 次

#### 端口配置
- **后端服务端口**：`3001`
- **Nginx 监听端口**：`80`, `8080`

#### 访问地址
- **用户端**：
  - http://118.145.239.169/
  - http://118.145.239.169:8080/
  - http://boatman-health.ziya.site/
- **管理后台**：
  - http://118.145.239.169/admin/
  - http://118.145.239.169:8080/admin/

#### 数据库配置
- **数据库类型**：SQLite
- **数据库文件**：`/opt/boatman-health-A4-server/prisma/prisma/prod.db`
- **数据库大小**：108K
- **最后更新**：2026-04-12 13:28

#### 飞书表格配置
```bash
FEISHU_APP_ID=cli_a9f73a62fbf99cb0
FEISHU_APP_SECRET=wiWZPN1D0sbybJPwoYnJReL86zEbGtdn

# Form1（咨询预约表单）
FORM1_APP_TOKEN=EuHObRA2laxT2osbdjxcvCbHn7c
FORM1_TABLE_ID=tbloo8eMo2lh19w6

# Form2（健康评估表单）
FORM2_APP_TOKEN=EuHObRA2laxT2osbdjxcvCbHn7c
FORM2_TABLE_ID=tblR5jTrJZnxsj91
```

#### Nginx 配置文件
- 文件位置：`/etc/nginx/conf.d/boatman-health-A4.conf`
- 代理配置：
  - `/api/*` → `http://127.0.0.1:3001`
  - `/admin/(auth|dashboard|form1|form2|users|sync)` → `http://127.0.0.1:3001`

---

### 2. 测试环境（Test）

#### 基本信息
- **服务器 IP**：`118.145.239.169`
- **代码目录**：`/www/server/boatman-health-test/`
- **PM2 进程名**：`server-test`
- **进程 PID**：1314809
- **运行时长**：14 小时
- **重启次数**：19 次

#### 端口配置
- **后端服务端口**：`3003`
- **Nginx 监听端口**：`3002`

#### 访问地址
- **用户端**：http://118.145.239.169:3002/
- **管理后台**：http://118.145.239.169:3002/admin/

#### 数据库配置
- **数据库类型**：SQLite
- **数据库文件**：`/www/server/boatman-health-test/server/prisma/test.db`
- **数据库大小**：96K
- **最后更新**：2026-04-11 22:44

#### 飞书表格配置
```bash
FEISHU_APP_ID=cli_a9f73a62fbf99cb0
FEISHU_APP_SECRET=wiWZPN1D0sbybJPwoYnJReL86zEbGtdn

# Form1（咨询预约表单）
FORM1_APP_TOKEN=FQYXbHdHia9TEysbsH9coF9mnfg
FORM1_TABLE_ID=tblA02sKspYGGMOH

# Form2（健康评估表单）
FORM2_APP_TOKEN=FQYXbHdHia9TEysbsH9coF9mnfg
FORM2_TABLE_ID=tbl1Nc1TtNyLUcZ2
```

#### Nginx 配置文件
- 文件位置：`/etc/nginx/conf.d/boatman-health-test.conf`
- 代理配置：
  - `/api/*` → `http://127.0.0.1:3003`
  - `/admin/(auth|dashboard|form1|form2|users|sync|surveys)` → `http://127.0.0.1:3003`

---

### 3. 本地开发环境（Development）

#### 基本信息
- **代码目录**：本地项目根目录
- **前端端口**：`5174`（Vite Dev Server）
- **后端端口**：`3000`（可选，本地运行）

#### 默认连接环境
🎯 **本地开发默认连接测试环境**（`118.145.239.169:3002`）

#### 访问地址
- **用户端**：http://localhost:5174/
- **管理后台**：http://localhost:5174/#/admin（需修改路由）

#### 数据库配置（本地后端）
- **数据库类型**：SQLite
- **数据库文件**：`server/prisma/dev.db`
- **验证码**：`123456`（开发环境固定）

#### Vite 代理配置
```typescript
// client/vite.config.ts
server: {
  port: 5174,
  proxy: {
    '/api': {
      target: 'http://118.145.239.169:3002',  // ✅ 默认连接测试环境
      changeOrigin: true,
      secure: false,
    },
    '/admin': {
      target: 'http://118.145.239.169:3002',  // ✅ 默认连接测试环境
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
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://118.145.239.169:3002',  // ✅ 默认连接测试环境
      changeOrigin: true,
    },
    '/admin/auth': {
      target: 'http://118.145.239.169:3002',  // ✅ 默认连接测试环境
      changeOrigin: true,
    },
    // ... 其他管理后台路由
  },
}
```

---

## 🔒 环境隔离验证

### 数据隔离

| 隔离项 | 生产环境 | 测试环境 | 本地开发 | 状态 |
|--------|---------|---------|---------|------|
| **数据库文件** | prod.db (108K) | test.db (96K) | dev.db | ✅ 完全隔离 |
| **飞书表格** | 不同 Token | 不同 Token | - | ✅ 完全隔离 |
| **后端服务端口** | 3001 | 3003 | 3000 | ✅ 完全隔离 |
| **前端访问端口** | 80, 8080 | 3002 | 5174 | ✅ 完全隔离 |

### 飞书表格对比

| 表单类型 | 生产环境 Table ID | 测试环境 Table ID | 是否隔离 |
|---------|------------------|------------------|---------|
| **Form1（咨询预约）** | tbloo8eMo2lh19w6 | tblA02sKspYGGMOH | ✅ 不同表格 |
| **Form2（健康评估）** | tblR5jTrJZnxsj91 | tbl1Nc1TtNyLUcZ2 | ✅ 不同表格 |

---

## 🚀 本地开发指南

### 启动前端（默认连接测试环境）

```bash
# 启动用户端前端
npm run dev:client

# 启动管理后台前端
npm run dev:admin
```

**访问地址**：
- 用户端：http://localhost:5174/
- 管理后台：http://localhost:5173/

**连接环境**：✅ 自动连接测试环境（118.145.239.169:3002）

---

### 启动本地后端（可选）

如果需要在本地运行后端服务：

```bash
# 启动后端
npm run dev:server

# 修改前端代理为本地后端
# client/vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',  // 改为本地后端
    changeOrigin: true,
  }
}
```

**验证码**：`123456`（开发环境固定）

---

### 切换环境

#### 切换到测试环境
```typescript
// client/vite.config.ts
proxy: {
  '/api': {
    target: 'http://118.145.239.169:3002',  // 测试环境
    changeOrigin: true,
  }
}
```

#### 切换到生产环境（⚠️ 谨慎操作）
```typescript
// client/vite.config.ts
proxy: {
  '/api': {
    target: 'http://118.145.239.169',  // 生产环境
    changeOrigin: true,
  }
}
```

---

## 🛡️ 安全注意事项

### ⚠️ 生产环境保护

1. **本地开发默认连接测试环境**，避免误操作生产数据
2. **生产环境数据库**：`prod.db` - 真实用户数据
3. **测试环境数据库**：`test.db` - 测试数据，可随时清理
4. **飞书表格**：生产环境和测试环境使用不同的表格

### ✅ 最佳实践

- ✅ 本地开发使用测试环境
- ✅ 测试验证使用测试环境
- ✅ 只有正式发布时才连接生产环境
- ✅ 定期备份生产环境数据库
- ✅ 测试环境数据库可随时重置

---

## 📝 常用命令

### 查看服务器环境状态

```bash
# 登录服务器
ssh root@118.145.239.169

# 查看 PM2 进程
pm2 list

# 查看生产环境日志
pm2 logs boatman-health-A4

# 查看测试环境日志
pm2 logs server-test

# 查看端口占用
netstat -tlnp | grep -E '3001|3002|3003'

# 查看数据库文件
ls -lh /opt/boatman-health-A4-server/prisma/prisma/prod.db
ls -lh /www/server/boatman-health-test/server/prisma/test.db
```

### 本地开发命令

```bash
# 启动前端（默认测试环境）
npm run dev:client

# 启动管理后台（默认测试环境）
npm run dev:admin

# 启动本地后端（可选）
npm run dev:server

# 构建生产版本
npm run build
```

---

## 🔄 环境切换流程

### 本地开发 → 测试环境
✅ **默认配置**，无需修改

### 本地开发 → 生产环境
⚠️ **需要手动修改配置**

1. 修改 `client/vite.config.ts`：
```typescript
target: 'http://118.145.239.169'  // 改为生产环境
```

2. 修改 `admin/vite.config.ts`：
```typescript
target: 'http://118.145.239.169'  // 改为生产环境
```

3. 重启前端服务

---

## 📞 联系方式

如有问题，请联系项目负责人。

---

**最后更新**：2026-04-12 13:33
**文档维护**：开发团队
