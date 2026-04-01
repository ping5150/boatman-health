import api from '@/lib/axios';

// ==================== 类型定义 ====================

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
  feishuSyncStatus: 'success' | 'pending' | 'failed';
}

/** 档案详情 */
export interface ArchiveDetail extends ArchiveListItem {
  userId: string;
  feishuRecordId: string | null;
  formData: HealthFormData;
}

/** 提交响应 */
interface Form2SubmitResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    orderNo: string;
    submittedAt: string;
    versionNumber: number;
  };
}

// ==================== API 方法 ====================

/**
 * 提交健康档案
 */
export const submitForm2 = async (data: HealthFormData): Promise<Form2SubmitResponse> => {
  const res = await api.post('/form2', data);
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '健康档案提交成功',
    data: {
      id: result.id,
      orderNo: result.orderNo,
      submittedAt: result.submittedAt,
      versionNumber: result.versionNumber,
    },
  };
};

/**
 * 获取用户档案列表
 */
export const getArchiveList = async (): Promise<ArchiveListItem[]> => {
  const res = await api.get('/form2');
  return res.data.data || [];
};

/**
 * 获取档案详情
 */
export const getArchiveDetail = async (id: number): Promise<ArchiveDetail> => {
  const res = await api.get(`/form2/${id}`);
  return res.data.data;
};

/**
 * 获取用户最新档案
 */
export const getLatestArchive = async (): Promise<ArchiveDetail | null> => {
  const res = await api.get('/form2/latest');
  return res.data.data;
};

/**
 * 更新档案
 */
export const updateArchive = async (
  id: number,
  data: Partial<HealthFormData>
): Promise<Form2SubmitResponse> => {
  const res = await api.put(`/form2/${id}`, data);
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '档案更新成功',
    data: {
      id: result.id,
      orderNo: result.orderNo,
      submittedAt: result.submittedAt,
      versionNumber: result.versionNumber,
    },
  };
};

/**
 * 保存草稿
 * 后端会自动查找用户已有档案：有则覆盖更新，无则创建新记录
 */
export const saveDraft = async (
  data: Partial<HealthFormData>,
  existingId?: number
): Promise<Form2SubmitResponse> => {
  if (existingId) {
    return updateArchive(existingId, data);
  }
  const res = await api.post('/form2/draft', data);
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '草稿保存成功',
    data: {
      id: result.id,
      orderNo: result.orderNo,
      submittedAt: result.submittedAt,
      versionNumber: result.versionNumber,
    },
  };
};
