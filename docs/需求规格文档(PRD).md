# 用户表单系统 + 管理后台 — 产品需求规格文档 (PRD)

> **版本**：v1.0  
> **创建日期**：2026-03-26  
> **状态**：初稿

---

## 一、项目概述

### 1.1 项目背景

搭建一个全栈应用，支持用户注册/登录、两个复杂表单（咨询表单、健康评估表单）的提交与历史记录管理、数据单向同步至飞书多维表格，并为管理员提供后台管理界面。

### 1.2 核心目标

| 目标 | 说明 |
|------|------|
| 用户侧 | 用户注册、登录后可提交两种表单，每次提交保留历史版本 |
| 数据侧 | 数据库为主数据源，飞书多维表格为数据副本，单向同步 |
| 管理侧 | 管理员可查看/搜索/分页浏览所有表单记录，并管理飞书同步失败的数据 |

### 1.3 用户角色

| 角色 | 说明 |
|------|------|
| **普通用户** (`user`) | 注册/登录后提交表单，查看自己的历史记录 |
| **管理员** (`admin`) | 第一个注册的用户自动成为管理员，可访问后台管理所有数据 |

---

## 二、核心功能模块

### 2.1 用户认证与权限

#### 2.1.1 用户注册

- **注册字段**：手机号、密码
- **密码存储**：使用 bcrypt 哈希存储
- **角色分配**：
  - 第一个注册的用户自动设为 `admin`
  - 后续用户默认为 `user`
- **唯一性校验**：手机号不可重复

#### 2.1.2 手机验证码登录

- **开发阶段**：使用固定验证码 `123456`
- **生产环境**：替换为真实短信服务（如阿里云短信、腾讯云短信）
- **登录成功**：返回 JWT Token，有效期 **7 天**
- **Token 内容**：包含 `userId`、`role`、`phone` 等基本信息

#### 2.1.3 权限控制

| 接口类型 | 权限要求 |
|----------|----------|
| 用户表单提交 | JWT 认证（任意角色） |
| 管理后台接口 | JWT 认证 + `role = admin` |

---

### 2.2 表单提交

#### 2.2.1 表单1：咨询表单

- **接口**：`POST /api/form1`
- **认证**：需 JWT Token
- **请求体**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 姓名 |
| phone | string | ✅ | 联系电话 |
| consultationType | string | ✅ | 枚举值：`病历咨询` / `体检咨询` |
| preferredTime | string | ✅ | 首选联系时间 |
| brief | string | ✅ | 简要说明 |

#### 2.2.2 表单2：健康评估表单

- **接口**：`POST /api/form2`
- **认证**：需 JWT Token
- **请求体**：采用嵌套 JSON 结构，包含以下模块：

| 模块 | 说明 |
|------|------|
| `basicInfo` | 基本信息（姓名、客户号、电话、紧急联系人） |
| `healthBackground` | 健康背景（现有疾病、用药、手术史、过敏史、血管评估、家族史） |
| `lifestyle` | 生活方式（饮食、运动、睡眠、压力、焦虑、脑雾症状） |

> 完整 TypeScript 接口定义见附录 A

---

### 2.3 数据存储与历史版本

| 规则 | 说明 |
|------|------|
| 存储策略 | 每次提交均新增一条记录，保留完整历史 |
| 版本号规则 | 同一用户对同一表单类型每次提交时，版本号从 1 开始递增 |
| 同步状态字段 | `feishu_sync_status`：`pending` → `success` / `failed` |
| 飞书记录 ID | 存储飞书返回的 `record_id`，用于可能的更新操作 |

---

### 2.4 飞书多维表格同步

#### 同步方向

**单向**：数据库 → 飞书多维表格

#### 同步时机

1. 用户提交表单
2. 数据先写入数据库
3. 异步调用飞书 API 写入记录

#### 失败处理

- 飞书写入失败时 **不阻塞** 接口响应
- 仅标记同步状态为 `failed`
- 管理后台可手动重试

#### 表格配置

| 表单 | 飞书表格 | 说明 |
|------|----------|------|
| 表单1 | 独立多维表格 | 由 `FORM1_APP_TOKEN` + `FORM1_TABLE_ID` 确定 |
| 表单2 | 独立多维表格 | 由 `FORM2_APP_TOKEN` + `FORM2_TABLE_ID` 确定 |

#### 表单1 → 飞书字段映射

| 飞书列名 | 数据来源 | 飞书字段类型 |
|----------|----------|-------------|
| 用户ID | `user_id` | 文本 |
| 姓名 | `name` | 文本 |
| 联系电话 | `phone` | 文本 |
| 咨询需求 | `consultation_type` | 单选 |
| 首选联系时间 | `preferred_time` | 文本 |
| 简要说明 | `brief` | 多行文本 |
| 提交时间 | 当前时间 | 日期 |
| 版本号 | `version_number` | 数字 |
| 完整数据 | 整个请求体 JSON 字符串 | 多行文本 |

#### 表单2 → 飞书字段映射

| 飞书列名 | 数据来源 | 飞书字段类型 |
|----------|----------|-------------|
| 用户ID | `user_id` | 文本 |
| 姓名 | `form_data.basicInfo.name` | 文本 |
| 联系电话 | `form_data.basicInfo.phone` | 文本 |
| 客户号 | `form_data.basicInfo.customerId` | 文本 |
| 紧急联系人 | `form_data.basicInfo.emergencyContact.name` | 文本 |
| 紧急联系电话 | `form_data.basicInfo.emergencyContact.phone` | 文本 |
| 主要疾病 | `form_data.healthBackground.currentDiseases[].diagnosis` 逗号拼接 | 文本 |
| 过敏史 | `form_data.healthBackground.allergyHistory.details` | 文本 |
| 血管评估结果 | `form_data.healthBackground.vascularAssessment.result` | 单选 |
| 压力自评 | `form_data.lifestyle.stress.stressScore` | 数字 |
| 提交时间 | 当前时间 | 日期 |
| 版本号 | `version_number` | 数字 |
| 完整数据 | 整个请求体 JSON 字符串 | 多行文本 |

---

### 2.5 管理后台

#### 2.5.1 访问控制

- 复用用户登录接口
- 仅 `role = 'admin'` 的用户可进入后台
- 前端路由守卫 + 后端接口双重校验

#### 2.5.2 功能页面

| 页面 | 功能说明 |
|------|----------|
| **登录页** | 管理员登录入口 |
| **仪表盘** | 统计两个表单的提交总数、今日提交数 |
| **表单1列表** | 表格展示：姓名、电话、咨询需求、提交时间；支持分页 + 按姓名/手机号搜索 |
| **表单2列表** | 表格展示：姓名、客户号、联系电话、提交时间；支持分页 + 按姓名/客户号搜索 |
| **详情页** | 展示单条记录的完整原始数据（JSON 格式化） |
| **同步管理** | 列出 `sync_status = 'failed'` 的记录，提供"重试同步"按钮 |

#### 2.5.3 管理后台 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/admin/form1/list` | GET | 分页获取表单1记录，支持 `page`、`limit`、`search` |
| `/admin/form2/list` | GET | 分页获取表单2记录，支持 `page`、`limit`、`search` |
| `/admin/form1/:id` | GET | 获取表单1单条记录详情 |
| `/admin/form2/:id` | GET | 获取表单2单条记录详情 |
| `/admin/sync/retry` | POST | 重试失败的飞书同步，body: `{ table, recordId }` |

---

## 三、非功能性要求

| 类别 | 要求 |
|------|------|
| **错误处理** | 飞书同步失败不影响用户提交成功响应；需记录详细错误日志 |
| **安全性** | JWT 用于认证；管理员接口额外校验 `role`；密码 bcrypt 哈希存储 |
| **部署** | 提供部署说明，包含环境变量配置 |
| **文档** | 后端 API 提供 Swagger 文档或 Postman 集合 |

---

## 四、附录

### 附录 A：表单2完整 JSON 结构（TypeScript 接口）

```typescript
interface Form2Data {
  basicInfo: {
    name: string;
    customerId: string;
    phone: string;
    emergencyContact: {
      name: string;
      phone: string;
    };
  };
  healthBackground: {
    currentDiseases: Array<{ diagnosis: string; diagnosedAt: string }>;
    medications: Array<{ name: string; dosage: string }>;
    surgeryHistory: {
      hasSurgery: boolean;
      details?: string;
    };
    allergyHistory: {
      hasAllergy: boolean;
      details?: string;
    };
    vascularAssessment: {
      result: '合格' | '不合格';
      reason?: string;
    };
    familyHistory: {
      selected: string[];
      tumorType?: string;
      other?: string;
    };
    medicalQuestions: string;
  };
  lifestyle: {
    diet: {
      dietPatterns: string[];
      beverages: string[];
      beverageOther?: string;
      postMealFeelings: string[];
      postMealOther?: string;
      foodRestrictions: string;
    };
    exercise: {
      types: string[];
      frequencyPerWeek: number;
      durationMinutes: number;
    };
    sleep: {
      avgHours: string;
      fallAsleep: string;
      morningFeeling: string;
    };
    stress: {
      stressScore: number;
    };
    anxiety: {
      frequency: string;
    };
    brainFog: {
      symptoms: string[];
      other?: string;
    };
  };
}
```

### 附录 B：飞书表格字段配置建议

为确保字段映射正确，飞书多维表格的列名必须与上述映射表中的"飞书列名"**完全一致**（包括空格、大小写）。

推荐字段类型：

| 飞书字段类型 | 适用列 |
|-------------|--------|
| 文本 | 所有普通文本列 |
| 单选 | 咨询需求、血管评估结果 |
| 日期 | 提交时间 |
| 数字 | 版本号、压力自评 |
| 多行文本 | 简要说明、完整数据 |

### 附录 C：环境变量清单

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://user:pass@localhost:5432/formdb` |
| `JWT_SECRET` | JWT 签名密钥 | `your-super-secret-key` |
| `FEISHU_APP_ID` | 飞书自建应用 App ID | `cli_xxxxxxx` |
| `FEISHU_APP_SECRET` | 飞书自建应用 App Secret | `xxxxxxxxxxxxxxx` |
| `FORM1_APP_TOKEN` | 表单1对应飞书表格的 app_token | `bascnxxxxxxx` |
| `FORM1_TABLE_ID` | 表单1对应飞书表格的 table_id | `tblxxxxxxx` |
| `FORM2_APP_TOKEN` | 表单2对应飞书表格的 app_token | `bascnxxxxxxx` |
| `FORM2_TABLE_ID` | 表单2对应飞书表格的 table_id | `tblxxxxxxx` |
| `PORT` | 服务端口号 | `3000` |
