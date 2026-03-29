# 认证接口 (Auth API)

## 接口列表

| 接口 | 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|------|
| 检查用户是否存在 | POST | `/api/auth/check-user` | 根据手机号判断新老用户 | 否 |
| 密码登录（老用户） | POST | `/api/auth/password-login` | 已注册用户密码登录 | 否 |
| 用户注册（新用户） | POST | `/api/auth/register` | 新用户注册并自动登录 | 否 |
| 发送验证码 | POST | `/api/auth/send-code` | 发送短信验证码 | 否 |
| 验证码登录 | POST | `/api/auth/login` | 使用验证码登录 | 否 |
| 获取当前用户信息 | GET | `/api/auth/me` | 获取登录用户的个人信息 | JWT |
| 更新当前用户信息 | PUT | `/api/auth/me` | 更新登录用户的个人信息 | JWT |

---

## 1. 检查用户是否存在

判断手机号是否已注册，用于登录页面区分新老用户流程。

**请求**

```
POST /api/auth/check-user
```

**请求体**

```json
{
  "phone": "13800138000"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 11位手机号 |

**响应**

```json
{
  "success": true,
  "data": {
    "exists": true,
    "username": "张三"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 请求是否成功 |
| data.exists | boolean | 用户是否已注册 |
| data.username | string \| null | 已注册用户的用户名，新用户为null |

---

## 2. 密码登录

老用户使用手机号和密码登录。

**请求**

```
POST /api/auth/password-login
```

**请求体**

```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 11位手机号 |
| password | string | 是 | 密码（至少6位） |

**响应**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "phone": "13800138000",
    "username": "张三",
    "role": "user"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 登录是否成功 |
| token | string | JWT Token |
| user | object | 用户信息 |
| user.id | string | 用户ID |
| user.phone | string | 手机号 |
| user.username | string | 用户名 |
| user.role | string | 角色（user/admin） |

---

## 3. 用户注册

新用户注册并自动登录。

**请求**

```
POST /api/auth/register
```

**请求体**

```json
{
  "phone": "13800138000",
  "username": "张三",
  "password": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 11位手机号 |
| username | string | 是 | 用户名（2-20位） |
| password | string | 是 | 密码（至少6位） |

**响应**

同密码登录响应。

---

## 4. 发送验证码

发送短信验证码，用于验证码登录。

**请求**

```
POST /api/auth/send-code
```

**请求体**

```json
{
  "phone": "13800138000"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 11位手机号 |

**响应**

```json
{
  "success": true,
  "message": "验证码已发送"
}
```

---

## 5. 验证码登录

使用手机号和验证码登录。

**请求**

```
POST /api/auth/login
```

**请求体**

```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 11位手机号 |
| code | string | 是 | 6位验证码 |

**响应**

同密码登录响应。

---

## 6. 获取当前用户信息

获取登录用户的详细信息，包括个人资料和紧急联系人。

**请求**

```
GET /api/auth/me
Authorization: Bearer <token>
```

**响应**

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "张三",
    "phone": "13800138000",
    "gender": "男",
    "birthDate": "1985-06-15",
    "emergencyName": "李四",
    "emergencyRelation": "配偶",
    "emergencyPhone": "13900139000",
    "role": "user"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 用户ID |
| username | string | 用户名 |
| phone | string | 手机号 |
| gender | string | 性别 |
| birthDate | string | 出生日期 |
| emergencyName | string | 紧急联系人姓名 |
| emergencyRelation | string | 紧急联系人关系 |
| emergencyPhone | string | 紧急联系人电话 |
| role | string | 角色（user/admin） |

---

## 7. 更新当前用户信息

更新登录用户的个人信息。所有字段均为可选，只更新传入的字段。

**请求**

```
PUT /api/auth/me
Authorization: Bearer <token>
```

**请求体**

```json
{
  "username": "张三",
  "gender": "男",
  "birthDate": "1985-06-15",
  "emergencyName": "李四",
  "emergencyRelation": "配偶",
  "emergencyPhone": "13900139000"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 否 | 用户名（2-20位） |
| gender | string | 否 | 性别 |
| birthDate | string | 否 | 出生日期 |
| emergencyName | string | 否 | 紧急联系人姓名 |
| emergencyRelation | string | 否 | 紧急联系人关系 |
| emergencyPhone | string | 否 | 紧急联系人电话 |

**响应**

```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "张三",
    "gender": "男",
    "birthDate": "1985-06-15",
    "emergencyName": "李四",
    "emergencyRelation": "配偶",
    "emergencyPhone": "13900139000",
    "updatedAt": "2026-03-29T10:00:00Z"
  }
}
```
