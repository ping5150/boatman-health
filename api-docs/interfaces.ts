/**
 * Boatman Health API 接口类型定义
 * 生成时间: 2026-03-28
 */

// ==================== 通用类型 ====================

/** 统一API响应格式 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

/** 分页查询参数 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

/** 分页结果 */
export interface PaginatedResult<T> {
  total: number;
  page: number;
  limit: number;
  list: T[];
}

// ==================== 用户相关 ====================

/** 用户角色 */
export type UserRole = 'user' | 'admin';

/** 基础用户信息 */
export interface BaseUser {
  id: string | number;
  phone: string;
  username: string;
  role: UserRole;
}

/** 客户端用户 */
export interface ClientUser {
  id: string;
  phone: string;
  name: string;
  role: string;
  avatar?: string;
}

/** 管理端用户信息 */
export interface AdminUserInfo {
  userId: number;
  phone: string;
  role: UserRole;
  token: string;
}

/** 用户详情（管理端） */
export interface UserDetail {
  id: number;
  username: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  // 基本信息
  gender: string;
  birthDate: string;
  // 紧急联系人
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

/** 用户列表项 */
export interface UserListItem {
  id: number;
  username: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ==================== 认证接口 ====================

/** 检查用户是否存在 - 请求 */
export interface CheckUserRequest {
  phone: string;
}

/** 检查用户是否存在 - 响应 */
export interface CheckUserResponse {
  success: boolean;
  data: {
    exists: boolean;
    username: string | null;
  };
}

/** 密码登录 - 请求 */
export interface PasswordLoginRequest {
  phone: string;
  password: string;
}

/** 用户注册 - 请求 */
export interface RegisterRequest {
  phone: string;
  username: string;
  password: string;
}

/** 发送验证码 - 请求 */
export interface SendCodeRequest {
  phone: string;
}

/** 发送验证码 - 响应 */
export interface SendCodeResponse {
  success: boolean;
  message: string;
}

/** 验证码登录 - 请求 */
export interface CodeLoginRequest {
  phone: string;
  code: string;
}

/** 认证响应 */
export interface AuthResponse {
  success: boolean;
  token: string;
  user: BaseUser;
}

/** 登录结果（管理端） */
export interface LoginResult {
  token: string;
  userId: number;
  phone: string;
  role: string;
}

// ==================== 预约/咨询表单 (Form1) ====================

/** 咨询类型 */
export type ConsultationType = '重疾咨询' | '慢病管理' | '健康资产规划' | '其他';

/** 同步状态 */
export type SyncStatus = 'success' | 'pending' | 'failed';

/** 预约提交 - 请求 */
export interface BookingSubmitRequest {
  name: string;
  phone: string;
  consultationType: ConsultationType;
  preferredDate: string;
  preferredTime: string;
  brief: string;
}

/** 预约更新 - 请求 */
export interface BookingUpdateRequest extends Partial<BookingSubmitRequest> {}

/** 预约提交 - 响应 */
export interface BookingSubmitResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    orderNo: string;
    submittedAt: string;
    versionNumber: number;
    consultationType: string;
    preferredDate: string;
    preferredTime: string;
  };
}

/** 预约数据 */
export interface BookingData {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  consultationType: ConsultationType;
  preferredDate: string;
  preferredTime: string;
  brief: string;
  submittedAt: string;
  updatedAt: string;
  versionNumber: number;
}

/** 预约列表项 */
export interface BookingListItem extends BookingData {
  submittedBy: string;
  feishuSyncStatus: SyncStatus;
}

/** 预约详情 */
export interface BookingDetail extends BookingData {
  userId: number;
  submittedBy: string;
  feishuRecordId: string | null;
  feishuSyncStatus: SyncStatus;
}

// ==================== 健康档案 (Form2) ====================

/** 上传文件 */
export interface UploadedFile {
  name: string;
  size: number;
  url: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
}

/** 健康档案表单数据（前端） */
export interface HealthFormData {
  // 基本信息
  name: string;
  phone: string;
  emergencyContact: string;
  // 健康背景
  diseases: Array<{ name: string; date: string }>;
  medications: Array<{ name: string; dosage: string }>;
  surgery: { has: string; detail: string };
  allergy: { has: string; detail: string };
  vascular: { qualified: string; reason: string };
  familyHistory: string[];
  familyHistoryOther: string;
  familyHistoryNote: string;
  // 饮食模式
  dietModes: string[];
  drinks: string[];
  drinksOther: string;
  mealFeeling: string[];
  mealFeelingOther: string;
  dietRestriction: string;
  // 运动
  exerciseTypes: string[];
  exerciseFrequency: string;
  exerciseDuration: string;
  // 睡眠
  sleepDuration: string;
  sleepQuality: string;
  wakeUpFeeling: string[];
  // 压力情绪
  stressLevel: number;
  anxietyFrequency: string;
  brainFog: string[];
  brainFogOther: string;
  // 其他
  healthConcerns: string;
  uploadedFiles?: UploadedFile[];
}

/** 健康档案表单数据（后端嵌套结构） */
export interface Form2Data {
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
    currentDiseases: Array<{
      diagnosis: string;
      diagnosedAt: string;
    }>;
    medications: Array<{
      name: string;
      dosage: string;
    }>;
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

/** 档案列表项 */
export interface ArchiveListItem {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuSyncStatus: SyncStatus;
}

/** 档案详情 */
export interface ArchiveDetail {
  id: number;
  orderNo: string;
  userId: number;
  name: string;
  phone: string;
  submittedBy: string;
  versionNumber: number;
  submittedAt: string;
  updatedAt: string;
  feishuSyncStatus: SyncStatus;
  feishuRecordId: string | null;
  formData: HealthFormData;
}

// ==================== 管理后台 ====================

/** 仪表盘统计 */
export interface DashboardStats {
  userTotal: number;
  userToday: number;
  userGrowthRate: number;
  bookingTotal: number;
  bookingToday: number;
  bookingGrowthRate: number;
  archiveTotal: number;
  archiveToday: number;
  archiveGrowthRate: number;
  bookingStatusDistribution: {
    submitted: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
}

/** 同步失败项 */
export interface SyncFailedItem {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: SyncStatus;
}

/** 同步失败列表 */
export interface SyncFailedList {
  booking: SyncFailedItem[];
  archive: SyncFailedItem[];
}

/** 同步重试 - 请求 */
export interface SyncRetryRequest {
  table: 'booking' | 'archive';
  recordId: number;
}

/** 同步重试 - 响应 */
export interface SyncRetryResponse {
  success: boolean;
  syncStatus: SyncStatus;
  feishuRecordId: string | null;
}
