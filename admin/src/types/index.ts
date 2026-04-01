// 统一 API 响应
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

// 用户信息
export interface UserInfo {
  userId: string;
  phone: string;
  role: 'user' | 'admin';
  token: string;
}

// 登录响应
export interface LoginResult {
  token: string;
  userId: string;
  phone: string;
  role: string;
}

// 分页结果
export interface PaginatedResult<T> {
  total: number;
  page: number;
  limit: number;
  list: T[];
}

// 仪表盘统计
export interface DashboardStats {
  form1Total: number;
  form1Today: number;
  form2Total: number;
  form2Today: number;
  syncFailedTotal: number;
}

// 表单1列表项
export interface Form1ListItem {
  id: number;
  name: string;
  phone: string;
  consultationType: string;
  submittedAt: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

// 表单1详情
export interface Form1Detail {
  id: number;
  userId: string;
  name: string;
  phone: string;
  consultationType: string;
  preferredTime: string;
  brief: string;
  submittedAt: string;
  versionNumber: number;
  feishuRecordId: string | null;
  feishuSyncStatus: string;
}

// 表单2列表项
export interface Form2ListItem {
  id: number;
  name: string;
  customerId: string;
  phone: string;
  submittedAt: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

// 表单2详情
export interface Form2Detail {
  id: number;
  userId: string;
  formData: Record<string, unknown>;
  submittedAt: string;
  versionNumber: number;
  feishuRecordId: string | null;
  feishuSyncStatus: string;
}

// 同步失败列表项
export interface SyncFailedItem {
  id: number;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

// 同步失败列表
export interface SyncFailedList {
  form1: SyncFailedItem[];
  form2: SyncFailedItem[];
}

// 同步重试结果
export interface SyncRetryResult {
  syncStatus: string;
  feishuRecordId: string | null;
}
