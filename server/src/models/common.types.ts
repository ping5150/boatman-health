import { JwtPayload } from '../utils/jwt';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ==================== 通用类型 ====================

/** 用户角色 */
export type UserRole = 'user' | 'admin';

/** 同步状态 */
export type SyncStatus = 'success' | 'pending' | 'failed';

/** 咨询类型 */
export type ConsultationType = '重疾咨询' | '慢病管理' | '健康资产规划' | '其他';

// ==================== 分页 ====================

/** 分页参数 */
export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
}

/** 分页响应 */
export interface PaginatedResult<T> {
  total: number;
  page: number;
  limit: number;
  list: T[];
}

// ==================== 用户相关 ====================

/** 用户列表项 */
export interface UserListItem {
  id: string;
  username: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/** 用户详情（管理端） */
export interface UserDetail extends UserListItem {
  gender: string | null;
  birthDate: string | null;
  emergencyName: string | null;
  emergencyRelation: string | null;
  emergencyPhone: string | null;
}

/** 用户更新请求 */
export interface UserUpdateRequest {
  username?: string;
  gender?: string;
  birthDate?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
}

// ==================== 预约表单 (Form1) ====================

/** 预约提交请求 */
export interface BookingSubmitRequest {
  name: string;
  phone: string;
  consultationType: ConsultationType;
  preferredDate: string;
  preferredTime: string;
  brief: string;
}

/** 预约更新请求 */
export interface BookingUpdateRequest extends Partial<BookingSubmitRequest> {}

/** 预约列表项 */
export interface BookingListItem {
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
  submittedBy: string;
  versionNumber: number;
  feishuSyncStatus: SyncStatus;
  status: 'active' | 'cancelled';
}

/** 预约详情 */
export interface BookingDetail extends BookingListItem {
  userId: string;
  feishuRecordId: string | null;
  cancelledAt: string | null;
}

// ==================== 健康档案 (Form2) ====================

/** 上传文件 */
export interface UploadedFile {
  name: string;
  size: number;
  url: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
}

/** 健康档案表单数据（前端扁平结构） */
export interface HealthFormData {
  // 基本信息
  name: string;
  phone: string;
  age?: number; // 年龄
  gender?: string; // 性别：男/女
  height?: number; // 身高(cm)
  weight?: number; // 当前体重(kg)
  maxWeight?: number; // 成年后最高体重(kg)
  minWeight?: number; // 成年后最低体重(kg)
  emergencyName: string;
  emergencyPhone: string;
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
    currentDiseases: Array<{ diagnosis: string; diagnosedAt: string }>;
    medications: Array<{ name: string; dosage: string }>;
    surgeryHistory: { hasSurgery: boolean; details?: string };
    allergyHistory: { hasAllergy: boolean; details?: string };
    vascularAssessment: { result: '合格' | '不合格'; reason?: string };
    familyHistory: { selected: string[]; tumorType?: string; other?: string };
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
    stress: { stressScore: number };
    anxiety: { frequency: string };
    brainFog: { symptoms: string[]; other?: string };
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
export interface ArchiveDetail extends ArchiveListItem {
  userId: string;
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

/** 同步失败项（用户） */
export interface SyncFailedUserItem {
  id: string;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: SyncStatus;
}

/** 同步失败项 */
export interface SyncFailedItem {
  id: number;
  orderNo?: string;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: SyncStatus;
}

/** 同步失败列表 */
export interface SyncFailedList {
  user: SyncFailedUserItem[];
  booking: SyncFailedItem[];
  archive: SyncFailedItem[];
}

/** 同步统计 */
export interface SyncStats {
  user: { total: number; success: number; failed: number; pending: number };
  booking: { total: number; success: number; failed: number; pending: number };
  archive: { total: number; success: number; failed: number; pending: number };
}

/** 同步结果 */
export interface SyncResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

/** 同步重试请求 */
export interface SyncRetryRequest {
  table: 'user' | 'booking' | 'archive';
  recordId: string | number;
}

/** 同步重试响应 */
export interface SyncRetryResponse {
  success: boolean;
  syncStatus: SyncStatus;
  feishuRecordId: string | null;
}
