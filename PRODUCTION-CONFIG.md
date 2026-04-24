# 生产环境配置文档

> ⚠️ **重要规则：在没有明确授权的情况下，严禁修改生产环境配置！**

---

## 一、服务器信息

| 配置项 | 值 |
|--------|-----|
| 服务器IP | 118.145.239.169 |
| 用户端域名 | http://boatman-health.ziya.site |
| 管理端域名 | http://boatman-health.ziya.site/admin/ |
| IP备用访问 | http://118.145.239.169:8080 |

---

## 二、后端服务配置

| 配置项 | 值 |
|--------|-----|
| 服务路径 | `/opt/boatman-health-A4-server` |
| PM2进程名 | `boatman-health-A4` |
| 服务端口 | **3001** |
| 运行环境 | `production` |
| Node.js版本 | v20.20.2 |

### 常用命令

```bash
# SSH 登录
ssh root@118.145.239.169

# 查看服务状态
pm2 list
pm2 show boatman-health-A4

# 查看日志
pm2 logs boatman-health-A4 --lines 100

# 重启服务
pm2 restart boatman-health-A4

# 健康检查
curl http://localhost:3001/health
```

---

## 三、数据库配置

| 配置项 | 值 |
|--------|-----|
| 数据库类型 | SQLite |
| 数据库路径 | `/opt/boatman-health-A4-server/prisma/prisma/prod.db` |
| DATABASE_URL | `file:./prisma/prod.db` |

---

## 四、飞书多维表格配置

| 表格名称 | APP_TOKEN | TABLE_ID |
|----------|-----------|----------|
| 预约表单(Form1) | `EuHObRA2laxT2osbdjxcvCbHn7c` | `tbloo8eMo2lh19w6` |
| 健康档案(Form2) | `EuHObRA2laxT2osbdjxcvCbHn7c` | `tblR5jTrJZnxsj91` |
| 用户表(USER) | `EuHObRA2laxT2osbdjxcvCbHn7c` | `tblnNp0A16c7VcpG` |
| 睡眠问卷(Sleep) | `EuHObRA2laxT2osbdjxcvCbHn7c` | `tblIDRTapjexVXrC` |
| 营养问卷(Nutrition) | `EuHObRA2laxT2osbdjxcvCbHn7c` | `tblQfYXQls5gErkk` |

### 飞书应用凭证

```
FEISHU_APP_ID=cli_a9f73a62fbf99cb0
FEISHU_APP_SECRET=wiWZPN1D0sbybJPwoYnJReL86zEbGtdn
```

---

## 五、火山引擎对象存储（TOS）

| 配置项 | 值 |
|--------|-----|
| BUCKET | `boatman-health-2026` |
| REGION | `cn-guangzhou` |
| ENDPOINT | `tos-cn-guangzhou.volces.com` |
| 公共访问URL | `https://boatman-health-2026.tos-cn-guangzhou.volces.com` |

---

## 六、完整环境变量

```env
# 数据库
DATABASE_URL=file:./prisma/prod.db

# JWT
JWT_SECRET=e66d6d69433b9bb9223366234e239344ca94727c9c7670d6ea3899b945c551db

# 服务端口
PORT=3001

# 运行环境
NODE_ENV=production

# 飞书集成
FEISHU_APP_ID=cli_a9f73a62fbf99cb0
FEISHU_APP_SECRET=wiWZPN1D0sbybJPwoYnJReL86zEbGtdn

# 表单1 飞书多维表格（咨询表单）
FORM1_APP_TOKEN=EuHObRA2laxT2osbdjxcvCbHn7c
FORM1_TABLE_ID=tbloo8eMo2lh19w6

# 表单2 飞书多维表格（健康评估表单）
FORM2_APP_TOKEN=EuHObRA2laxT2osbdjxcvCbHn7c
FORM2_TABLE_ID=tblR5jTrJZnxsj91

# 睡眠问卷表
SLEEP_APP_TOKEN=EuHObRA2laxT2osbdjxcvCbHn7c
SLEEP_TABLE_ID=tblIDRTapjexVXrC

# 营养问卷表
NUTRITION_APP_TOKEN=EuHObRA2laxT2osbdjxcvCbHn7c
NUTRITION_TABLE_ID=tblQfYXQls5gErkk

# 用户表 飞书多维表格
USER_APP_TOKEN=EuHObRA2laxT2osbdjxcvCbHn7c
USER_TABLE_ID=tblnNp0A16c7VcpG

# 火山引擎对象存储（TOS）
TOS_ACCESS_KEY_ID=<your-access-key-id>
TOS_ACCESS_KEY_SECRET=<your-access-key-secret>
TOS_REGION=cn-guangzhou
TOS_ENDPOINT=tos-cn-guangzhou.volces.com
TOS_BUCKET=boatman-health-2026
TOS_PUBLIC_BASE_URL=https://boatman-health-2026.tos-cn-guangzhou.volces.com
```

---

## 七、测试环境配置（供参考）

| 配置项 | 值 |
|--------|-----|
| 服务路径 | `/www/server/boatman-health-test/server` |
| PM2进程名 | `server-test` |
| 服务端口 | **3003** |
| 前端端口（nginx） | **3002** |
| 数据库 | `/www/server/boatman-health-test/server/prisma/dev.db` |

---

## 八、前端静态文件目录

| 子项目 | 生产目录 | 说明 |
|--------|----------|------|
| 用户端（client） | `/var/www/boatman-health-A4/` | nginx root 目录 |
| 管理后台（admin） | `/var/www/boatman-health-A4/admin/` | nginx admin 静态文件目录 |

### 前端部署命令

```bash
# 本地构建
cd client && npm run build        # 构建用户端
cd admin && npm run build         # 构建管理后台

# 上传到生产服务器
rsync -avz --delete client/dist/ root@118.145.239.169:/var/www/boatman-health-A4/
rsync -avz --delete admin/dist/  root@118.145.239.169:/var/www/boatman-health-A4/admin/
```

### nginx 配置说明

nginx 配置文件：`/etc/nginx/conf.d/boatman-health-A4.conf`

Admin API 路由白名单（正则匹配）：
```nginx
location ~ ^/admin/(auth|dashboard|form1|form2|users|sync|sleep-surveys|nutrition-surveys) {
    proxy_pass http://127.0.0.1:3001;
}
```

> ⚠️ **注意**：新增 admin API 路由时，需同步更新上述正则白名单，否则新接口会被 nginx 当作前端页面请求处理（返回 HTML）。

---

## 九、部署架构图

```
用户浏览器
    │
    ▼
Nginx（腾讯云轻量服务器 118.145.239.169）
├── :80 / :8080 → 生产环境
│   ├── / → 用户端 SPA（/var/www/boatman-health-A4/）
│   ├── /admin/ → 管理后台 SPA（/var/www/boatman-health-A4/admin/）
│   ├── /api/* → proxy_pass http://127.0.0.1:3001
│   └── /admin/(auth|dashboard|...) → proxy_pass http://127.0.0.1:3001
    │
    ▼
PM2 → Node.js Express (port 3001)
    ├── Prisma ORM → SQLite (/opt/boatman-health-A4-server/prisma/prisma/prod.db)
    ├── axios → 飞书开放平台 API
    └── 火山引擎 TOS → 文件存储
```

---

## 九、注意事项

1. **所有配置变更必须先在本地或测试环境验证**
2. **修改生产环境前必须获得明确授权**
3. **数据库备份定期执行**
4. **敏感信息（JWT_SECRET、飞书密钥等）严禁泄露**
5. **服务重启使用 `pm2 restart boatman-health-A4 --update-env` 确保环境变量生效**

---

*文档更新时间：2026-04-24*
