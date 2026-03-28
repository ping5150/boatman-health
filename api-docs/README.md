# Boatman Health API 接口文档

## 目录结构

```
api-docs/
├── README.md           # 本文档
├── interfaces.ts       # TypeScript 类型定义
├── auth.api.md         # 认证相关接口
├── booking.api.md      # 预约/咨询表单接口
├── archive.api.md      # 健康档案接口
└── admin.api.md        # 管理后台接口
```

## 基础信息

- **Base URL**: `http://43.139.240.74:3000/api`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 认证说明

除登录注册接口外，其他接口均需要在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

## 通用响应格式

```typescript
interface ApiResponse<T = unknown> {
  code: number;      // 0 表示成功，非0表示失败
  message: string;   // 响应消息
  data?: T;          // 响应数据
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token失效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
