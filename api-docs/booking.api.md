# 预约/咨询表单接口 (Booking API)

## 接口列表

| 接口 | 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|------|
| 提交预约 | POST | `/api/form1` | 提交预约咨询申请 | JWT |
| 获取预约列表 | GET | `/api/form1` | 获取当前用户所有预约 | JWT |
| 获取预约详情 | GET | `/api/form1/:id` | 获取指定预约详情 | JWT |
| 更新预约 | PUT | `/api/form1/:id` | 更新预约（新增版本记录） | JWT |

---

## 1. 提交预约

用户提交新的预约咨询申请。

**请求**

```
POST /api/form1
Authorization: Bearer <token>
```

**请求体**

```json
{
  "name": "张三",
  "phone": "13800138000",
  "consultationType": "重疾咨询",
  "preferredDate": "2026-03-30",
  "preferredTime": "14:00",
  "brief": "想咨询一下关于肺癌早期筛查的相关问题"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 姓名 |
| phone | string | 是 | 联系电话（11位） |
| consultationType | string | 是 | 咨询类型：重疾咨询/慢病管理/健康资产规划/其他 |
| preferredDate | string | 是 | 首选联系日期（YYYY-MM-DD） |
| preferredTime | string | 是 | 首选联系时间（HH:mm） |
| brief | string | 否 | 简要病史说明 |

**响应**

```json
{
  "success": true,
  "message": "提交成功",
  "data": {
    "id": 1,
    "orderNo": "BH20260328001",
    "submittedAt": "2026-03-28T10:00:00Z",
    "versionNumber": 1,
    "consultationType": "重疾咨询",
    "preferredDate": "2026-03-30",
    "preferredTime": "14:00"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 提交是否成功 |
| message | string | 响应消息 |
| data.id | number | 预约ID |
| data.orderNo | string | 订单编号（BH + 日期 + 序号） |
| data.submittedAt | string | 提交时间（ISO格式） |
| data.versionNumber | number | 版本号（初始为1） |

---

## 2. 获取预约列表

获取当前用户的所有预约记录。

**请求**

```
GET /api/form1
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |
| status | string | 否 | 状态筛选 |

**响应**

```json
{
  "success": true,
  "data": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "list": [
      {
        "id": 1,
        "orderNo": "BH20260328001",
        "name": "张三",
        "phone": "13800138000",
        "consultationType": "重疾咨询",
        "preferredDate": "2026-03-30",
        "preferredTime": "14:00",
        "brief": "想咨询一下关于肺癌早期筛查的相关问题",
        "submittedAt": "2026-03-28T10:00:00Z",
        "updatedAt": "2026-03-28T10:00:00Z",
        "versionNumber": 1,
        "feishuSyncStatus": "success"
      }
    ]
  }
}
```

---

## 3. 获取预约详情

获取指定预约的详细信息。

**请求**

```
GET /api/form1/:id
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 预约ID |

**响应**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNo": "BH20260328001",
    "userId": 100,
    "name": "张三",
    "phone": "13800138000",
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

## 4. 更新预约

更新预约信息，会生成新的版本记录。

**请求**

```
PUT /api/form1/:id
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 预约ID |

**请求体**

```json
{
  "preferredDate": "2026-04-01",
  "preferredTime": "10:00",
  "brief": "更新后的说明"
}
```

> 所有字段均为可选，只更新传入的字段。

**响应**

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": 1,
    "versionNumber": 2,
    "updatedAt": "2026-03-29T15:00:00Z"
  }
}
```
