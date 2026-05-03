# 生产环境配置文档

> ⚠️ **重要规则：在没有明确授权的情况下，严禁修改生产环境配置！**

---

## 一、服务器信息

| 配置项 | 值 |
|--------|-----|
| 服务器IP | 106.53.64.33 |
| 用户端域名 | https://www.boatmanhealth.com |
| 管理端域名 | https://www.boatmanhealth.com/admin/ |
| IP备用访问 | http://106.53.64.33 |

---

## 二、后端服务配置

| 配置项 | 值 |
|--------|-----|
| 服务路径 | `/www/boatman-health/server` |
| PM2进程名 | `boatman-health` |
| 服务端口 | **3000** |
| 运行环境 | `production` |
| Node.js版本 | v20.20.2 |

### 常用命令

```bash
# SSH 登录
ssh root@106.53.64.33

# 查看服务状态
pm2 list
pm2 show boatman-health

# 查看日志
pm2 logs boatman-health --lines 100

# 重启服务
pm2 restart boatman-health --update-env

# 健康检查
curl http://localhost:3000/health
```

---

## 三、数据库配置

| 配置项 | 值 |
|--------|-----|
| 数据库类型 | SQLite |
| 数据库路径 | `/www/boatman-health/server/prisma/prod.db` |
| DATABASE_URL | `file:./prisma/prod.db` |

---

## 四、飞书多维表格配置

| 表格名称 | APP_TOKEN | TABLE_ID |
|----------|-----------|----------|
| 用户表(USER) | `HgJzwQMPkiNBiMkmEXMcmLF3nEc` | `tbl1U4Mosd7dzvHD` |
| 预约表单(Form1) | `HgJzwQMPkiNBiMkmEXMcmLF3nEc` | `tbl1g5VYg6nJKUAj` |
| 健康档案(Form2) | `HgJzwQMPkiNBiMkmEXMcmLF3nEc` | `tbl5sonmjYfbEibo` |
| 睡眠问卷(Sleep) | `HgJzwQMPkiNBiMkmEXMcmLF3nEc` | `tbl54plrv4NXtCRS` |
| 营养问卷(Nutrition) | `HgJzwQMPkiNBiMkmEXMcmLF3nEc` | `tbl1GMdpnljuWQcI` |

### 飞书应用凭证

```
FEISHU_APP_ID=cli_a97c4a4129781bdf
FEISHU_APP_SECRET=NERYqZERdjLmn3QuCpaaqgVf6eza8nUG
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
PORT=3000

# 运行环境
NODE_ENV=production

# 飞书集成
FEISHU_APP_ID=cli_a97c4a4129781bdf
FEISHU_APP_SECRET=NERYqZERdjLmn3QuCpaaqgVf6eza8nUG

# 用户表 飞书多维表格
USER_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
USER_TABLE_ID=tbl1U4Mosd7dzvHD

# 表单1 飞书多维表格（咨询表单）
FORM1_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
FORM1_TABLE_ID=tbl1g5VYg6nJKUAj

# 表单2 飞书多维表格（健康评估表单）
FORM2_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
FORM2_TABLE_ID=tbl5sonmjYfbEibo

# 睡眠问卷表
SLEEP_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
SLEEP_TABLE_ID=tbl54plrv4NXtCRS
SLEEP_SURVEY_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
SLEEP_SURVEY_TABLE_ID=tbl54plrv4NXtCRS

# 营养问卷表
NUTRITION_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
NUTRITION_TABLE_ID=tbl1GMdpnljuWQcI
NUTRITION_SURVEY_APP_TOKEN=HgJzwQMPkiNBiMkmEXMcmLF3nEc
NUTRITION_SURVEY_TABLE_ID=tbl1GMdpnljuWQcI

# 火山引擎对象存储（TOS）
TOS_ACCESS_KEY_ID=<your-access-key-id>
TOS_ACCESS_KEY_SECRET=<your-access-key-secret>
TOS_REGION=cn-guangzhou
TOS_ENDPOINT=tos-cn-guangzhou.volces.com
TOS_BUCKET=boatman-health-2026
TOS_PUBLIC_BASE_URL=https://boatman-health-2026.tos-cn-guangzhou.volces.com
```

---

## 七、前端静态文件目录

| 子项目 | 生产目录 | 说明 |
|--------|----------|------|
| 用户端（client） | `/www/boatman-health/client/` | nginx root 目录 |
| 管理后台（admin） | `/www/boatman-health/admin/` | nginx admin 静态文件目录 |

### 前端部署命令

```bash
# 本地构建
cd client && npm run build        # 构建用户端
cd admin && npm run build         # 构建管理后台

# 上传到生产服务器
rsync -avz --delete client/dist/ root@106.53.64.33:/www/boatman-health/client/
rsync -avz --delete admin/dist/  root@106.53.64.33:/www/boatman-health/admin/
```

### nginx 配置说明

nginx 配置文件：`/etc/nginx/conf.d/boatman-health.conf`

关键路由：
```nginx
location / { try_files $uri $uri/ /index.html; }           # 用户端 SPA
location /admin/ { alias /www/boatman-health/admin/; }     # 管理后台 SPA
location /api/ { proxy_pass http://127.0.0.1:3000; }       # API 代理
location /admin-api/ { proxy_pass http://127.0.0.1:3000/admin/; }  # 管理后台 API
```

SSL 证书通过 certbot 自动管理，有效期至 2026-08-01，自动续期。

---

## 八、部署架构图

```
用户浏览器
    │
    ▼
Nginx（腾讯云服务器 106.53.64.33）
├── :80 → HTTP 自动跳转 HTTPS
├── :443 → HTTPS（SSL by Let's Encrypt）
│   ├── / → 用户端 SPA（/www/boatman-health/client/）
│   ├── /admin/ → 管理后台 SPA（/www/boatman-health/admin/）
│   ├── /api/* → proxy_pass http://127.0.0.1:3000
│   └── /admin-api/* → proxy_pass http://127.0.0.1:3000/admin/
    │
    ▼
PM2 → Node.js Express (port 3000)
    ├── Prisma ORM → SQLite (/www/boatman-health/server/prisma/prod.db)
    ├── axios → 飞书开放平台 API
    └── 火山引擎 TOS → 文件存储
```

---

## 九、注意事项

1. **所有配置变更必须先在本地或测试环境验证**
2. **修改生产环境前必须获得明确授权**
3. **数据库备份定期执行**
4. **敏感信息（JWT_SECRET、飞书密钥等）严禁泄露**
5. **服务重启使用 `pm2 restart boatman-health --update-env` 确保环境变量生效**
6. **SSL 证书由 certbot 自动续期，无需手动操作**

---

*文档更新时间：2026-05-03*
