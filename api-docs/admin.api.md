# 管理后台接口 (Admin API)

## 接口列表

| 接口 | 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|------|
| 管理员登录 | POST | `/admin/auth/login` | 管理员登录 | 否 |
| 获取用户信息 | GET | `/admin/auth/me` | 获取当前管理员信息 | JWT |
| 仪表盘统计 | GET | `/admin/dashboard` | 获取统计数据概览 | JWT |
| 预约列表 | GET | `/admin/form1/list` | 分页获取预约列表 | JWT |
| 预约详情 | GET | `/admin/form1/:id` | 获取预约详细信息 | JWT |
| 更新预约 | PUT | `/admin/form1/:id` | 管理员更新预约 | JWT |
| 档案列表 | GET | `/admin/form2/list` | 分页获取档案列表 | JWT |
| 档案详情 | GET | `/admin/form2/:id` | 获取档案详细信息 | JWT |
| 更新档案 | PUT | `/admin/form2/:id` | 管理员更新档案 | JWT |
| 用户列表 | GET | `/admin/users` | 分页获取用户列表 | JWT |
| 用户详情 | GET | `/admin/users/:id` | 获取用户详细信息 | JWT |
| 更新用户 | PUT | `/admin/users/:id` | 管理员更新用户信息 | JWT |
| 同步失败列表 | GET | `/admin/sync/failed` | 获取飞书同步失败记录 | JWT |
| 重试同步 | POST | `/admin/sync/retry` | 重试同步失败记录 | JWT |

---

## 1. 管理员登录

**请求**

```
POST /admin/auth/login
```

**请求体**

```json
{
  "phone": "13800138000",
  "password": "admin123"
}
```

**响应**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "phone": "13800138000",
  "role": "admin"
}
```

---

## 2. 仪表盘统计

获取仪表盘统计数据。

**请求**

```
GET /admin/dashboard
Authorization: Bearer <token>
```

**响应**

```json
{
  "success": true,
  "data": {
    "userTotal": 100,
    "userToday": 5,
    "userGrowthRate": 12.5,
    "bookingTotal": 50,
    "bookingToday": 3,
    "bookingGrowthRate": 8.3,
    "archiveTotal": 30,
    "archiveToday": 2,
    "archiveGrowthRate": 6.7,
    "bookingStatusDistribution": {
      "submitted": 10,
      "processing": 15,
      "completed": 20,
      "cancelled": 5
    }
  }
}
```

---

## 3. 预约列表

分页获取预约记录列表。

**请求**

```
GET /admin/form1/list
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |
| search | string | 否 | 搜索关键词（订单号/姓名/手机号） |
| status | string | 否 | 同步状态筛选：success/pending/failed |

**响应**

```json
{
  "success": true,
  "data": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "list": [
      {
        "id": 1,
        "orderNo": "BH20260328001",
        "name": "张三",
        "phone": "13800138001",
        "consultationType": "重疾咨询",
        "submittedAt": "2026-03-28T10:00:00Z",
        "updatedAt": "2026-03-28T10:00:00Z",
        "submittedBy": "张三",
        "versionNumber": 1,
        "feishuSyncStatus": "success"
      }
    ]
  }
}
```

---

## 4. 预约详情

获取预约详细信息。

**请求**

```
GET /admin/form1/:id
Authorization: Bearer <token>
```

**响应**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNo": "BH20260328001",
    "userId": 100,
    "name": "张三",
    "phone": "13800138001",
    "consultationType": "重疾咨询",
    "preferredDate": "2026-03-30",
    "preferredTime": "14:00",
    "brief": "想咨询一下关于肺癌早期筛查的相关问题",
    "submittedAt": "2026-03-28T10:00:00Z",
    "updatedAt": "2026-03-28T10:00:00Z",
    "versionNumber": 1,
    "submittedBy": "张三",
    "feishuSyncStatus": "success",
    "feishuRecordId": "recXXXXXX"
  }
}
```

---

## 5. 更新预约

管理员更新预约信息。

**请求**

```
PUT /admin/form1/:id
Authorization: Bearer <token>
```

**请求体**

```json
{
  "preferredDate": "2026-04-01",
  "preferredTime": "10:00"
}
```

---

## 6. 档案列表

分页获取健康档案列表。

**请求**

```
GET /admin/form2/list
Authorization: Bearer <token>
```

**查询参数**

同预约列表。

**响应**

```json
{
  "success": true,
  "data": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "list": [
      {
        "id": 1,
        "orderNo": "HA20260328001",
        "name": "张三",
        "phone": "13800138001",
        "submittedAt": "2026-03-28T10:00:00Z",
        "updatedAt": "2026-03-28T10:00:00Z",
        "submittedBy": "张三",
        "versionNumber": 1,
        "feishuSyncStatus": "success"
      }
    ]
  }
}
```

---

## 7. 档案详情

获取健康档案详细信息。

**请求**

```
GET /admin/form2/:id
Authorization: Bearer <token>
```

**响应**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNo": "HA20260328001",
    "userId": 100,
    "name": "张三",
    "phone": "13800138001",
    "submittedBy": "张三",
    "versionNumber": 1,
    "submittedAt": "2026-03-28T10:00:00Z",
    "updatedAt": "2026-03-28T10:00:00Z",
    "feishuSyncStatus": "success",
    "feishuRecordId": "recYYYYYY",
    "formData": {
      "name": "张三",
      "phone": "13800138001",
      "emergencyContact": "李四 13900139000",
      "diseases": [...],
      "medications": [...],
      "surgery": {...},
      "allergy": {...},
      "vascular": {...},
      "familyHistory": [...],
      "dietModes": [...],
      "drinks": [...],
      "mealFeeling": [...],
      "dietRestriction": "...",
      "exerciseTypes": [...],
      "exerciseFrequency": "...",
      "exerciseDuration": "...",
      "sleepDuration": "...",
      "sleepQuality": "...",
      "wakeUpFeeling": [...],
      "stressLevel": 6,
      "anxietyFrequency": "few",
      "brainFog": [...],
      "healthConcerns": "...",
      "uploadedFiles": [
        {
          "name": "体检报告2024.pdf",
          "size": 2048000,
          "url": "/uploads/xxx.pdf",
          "type": "pdf"
        }
      ]
    }
  }
}
```

---

## 8. 用户列表

分页获取用户列表。

**请求**

```
GET /admin/users
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |
| search | string | 否 | 搜索关键词（用户名/手机号） |
| role | string | 否 | 角色筛选：user/admin |

**响应**

```json
{
  "success": true,
  "data": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "list": [
      {
        "id": 1,
        "username": "张三",
        "phone": "13800138001",
        "role": "user",
        "createdAt": "2026-03-01T10:00:00Z",
        "updatedAt": "2026-03-15T14:30:00Z"
      }
    ]
  }
}
```

---

## 9. 用户详情

获取用户详细信息。

**请求**

```
GET /admin/users/:id
Authorization: Bearer <token>
```

**响应**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "张三",
    "phone": "13800138001",
    "role": "user",
    "createdAt": "2026-03-01T10:00:00Z",
    "updatedAt": "2026-03-15T14:30:00Z",
    "gender": "男",
    "birthDate": "1985-06-15",
    "emergencyName": "李美玲",
    "emergencyRelation": "配偶",
    "emergencyPhone": "13900139001"
  }
}
```

---

## 10. 更新用户

管理员更新用户信息。

**请求**

```
PUT /admin/users/:id
Authorization: Bearer <token>
```

**请求体**

```json
{
  "username": "张三",
  "gender": "男",
  "birthDate": "1985-06-15",
  "emergencyName": "李美玲",
  "emergencyRelation": "配偶",
  "emergencyPhone": "13900139001"
}
```

---

## 11. 同步失败列表

获取飞书同步失败的记录列表。

**请求**

```
GET /admin/sync/failed
Authorization: Bearer <token>
```

**响应**

```json
{
  "success": true,
  "data": {
    "booking": [
      {
        "id": 5,
        "orderNo": "BH20260325004",
        "name": "赵六",
        "phone": "13800138004",
        "submittedAt": "2026-03-25T16:45:00Z",
        "feishuSyncStatus": "failed"
      }
    ],
    "archive": [
      {
        "id": 3,
        "orderNo": "HA20260326003",
        "name": "王五",
        "phone": "13800138003",
        "submittedAt": "2026-03-26T09:15:00Z",
        "feishuSyncStatus": "failed"
      }
    ]
  }
}
```

---

## 12. 重试同步

重新尝试同步失败的记录。

**请求**

```
POST /admin/sync/retry
Authorization: Bearer <token>
```

**请求体**

```json
{
  "table": "booking",
  "recordId": 5
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| table | string | 是 | 表名：booking/archive |
| recordId | number | 是 | 记录ID |

**响应**

```json
{
  "success": true,
  "syncStatus": "success",
  "feishuRecordId": "recXXXXXX"
}
```
