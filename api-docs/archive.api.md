# 健康档案接口 (Archive API)

## 接口列表

| 接口 | 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|------|
| 提交健康档案 | POST | `/api/form2` | 提交完整健康评估表单 | JWT |
| 获取档案列表 | GET | `/api/form2` | 获取当前用户所有档案 | JWT |
| 获取档案详情 | GET | `/api/form2/:id` | 获取指定档案详情 | JWT |
| 更新档案 | PUT | `/api/form2/:id` | 更新档案（新增版本记录） | JWT |

---

## 1. 提交健康档案

用户提交完整的深度健康评估表单。

**请求**

```
POST /api/form2
Authorization: Bearer <token>
```

**请求体**

> 注：前端会将扁平的表单数据转换为后端要求的嵌套结构

**前端表单数据结构：**

```json
{
  "name": "张三",
  "phone": "13800138001",
  "emergencyContact": "李四 13900139000",
  "diseases": [
    { "name": "高血压", "date": "2023年5月" },
    { "name": "糖尿病前期", "date": "2024年1月" }
  ],
  "medications": [
    { "name": "络活喜", "dosage": "5mg/日" },
    { "name": "二甲双胍", "dosage": "500mg/日" }
  ],
  "surgery": { "has": "no", "detail": "" },
  "allergy": { "has": "yes", "detail": "青霉素过敏" },
  "vascular": { "qualified": "yes", "reason": "" },
  "familyHistory": ["心血管疾病", "糖尿病"],
  "familyHistoryOther": "",
  "familyHistoryNote": "父亲有冠心病史，母亲有糖尿病史",
  "dietModes": ["混合膳食", "轻断食"],
  "drinks": ["水", "咖啡", "茶"],
  "drinksOther": "",
  "mealFeeling": ["昏昏欲睡", "很快饥饿"],
  "mealFeelingOther": "",
  "dietRestriction": "少吃油腻食物",
  "exerciseTypes": ["散步", "游泳"],
  "exerciseFrequency": "3",
  "exerciseDuration": "45",
  "sleepDuration": "6-7 小时",
  "sleepQuality": "需要一段时间（15-30分钟），或易醒但能再次入睡",
  "wakeUpFeeling": ["需要一点时间\"开机\"，但白天状态尚可"],
  "stressLevel": 6,
  "anxietyFrequency": "few",
  "brainFog": ["记忆力下降", "注意力不集中"],
  "brainFogOther": "",
  "healthConcerns": "希望了解心血管疾病的预防措施"
}
```

**字段说明**

### 基本信息

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 姓名 |
| phone | string | 是 | 联系电话（11位） |
| emergencyContact | string | 是 | 紧急联系人/电话 |

### 深度生理健康背景

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| diseases | array | 否 | 当前疾病列表 |
| diseases[].name | string | - | 诊断名称 |
| diseases[].date | string | - | 确诊时间 |
| medications | array | 否 | 目前用药记录 |
| medications[].name | string | - | 药物名称 |
| medications[].dosage | string | - | 剂量/频率 |
| surgery.has | string | 是 | 手术史：yes/no |
| surgery.detail | string | 条件 | 手术说明（has=yes时必填） |
| allergy.has | string | 是 | 过敏史：yes/no |
| allergy.detail | string | 条件 | 过敏源说明（has=yes时必填） |
| vascular.qualified | string | 是 | 血管评估：yes/no |
| vascular.reason | string | 条件 | 不合格原因（qualified=no时必填） |
| familyHistory | string[] | 否 | 家族史：心血管疾病/糖尿病/阿尔兹海默症/肿瘤/其他 |
| familyHistoryOther | string | 条件 | 其他家族病史（familyHistory包含其他时） |
| familyHistoryNote | string | 否 | 体检疑问/诉求 |

### 精细化生活方式评估

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dietModes | string[] | 否 | 饮食模式：混合膳食/地中海饮食/生酮饮食/轻断食/素食/不规律 |
| drinks | string[] | 否 | 常饮饮品：水/咖啡/茶/酒精/含或无糖饮料/其他 |
| drinksOther | string | 条件 | 其他饮品说明 |
| mealFeeling | string[] | 否 | 餐后感受：精力充沛/昏昏欲睡/腹胀/很快饥饿/其他 |
| mealFeelingOther | string | 条件 | 其他餐后感受说明 |
| dietRestriction | string | 否 | 饮食忌口 |
| exerciseTypes | string[] | 否 | 运动类型：球类/跳绳/跑步/散步/游泳/登山/健身房 |
| exerciseFrequency | string | 否 | 运动频率（周/次） |
| exerciseDuration | string | 否 | 平均时长（分/次） |
| sleepDuration | string | 否 | 睡眠时长：< 6 小时/6-7 小时/7-8 小时/> 8 小时 |
| sleepQuality | string | 否 | 睡眠质量描述 |
| wakeUpFeeling | string[] | 否 | 醒后感受选项 |
| stressLevel | number | 是 | 压力水平（1-10） |
| anxietyFrequency | string | 否 | 焦虑频率：none/few/half/daily |
| brainFog | string[] | 否 | 脑雾症状：记忆力下降/注意力不集中/思维迟缓/其他 |
| brainFogOther | string | 条件 | 其他脑雾症状说明 |
| healthConcerns | string | 否 | 健康关注点 |

**响应**

```json
{
  "success": true,
  "message": "提交成功",
  "data": {
    "id": 1,
    "orderNo": "HA20260328001",
    "submittedAt": "2026-03-28T10:00:00Z",
    "versionNumber": 1
  }
}
```

---

## 2. 获取档案列表

获取当前用户的所有健康档案记录。

**请求**

```
GET /api/form2
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |

**响应**

```json
{
  "success": true,
  "data": {
    "total": 5,
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

## 3. 获取档案详情

获取指定健康档案的详细信息。

**请求**

```
GET /api/form2/:id
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 档案ID |

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
    "formData": { ... }
  }
}
```

---

## 4. 更新档案

更新健康档案信息，会生成新的版本记录。

**请求**

```
PUT /api/form2/:id
Authorization: Bearer <token>
```

**请求体**

同提交接口，所有字段均为可选。

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
