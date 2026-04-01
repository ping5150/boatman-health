import request from './request';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

interface PaginatedResult<T> {
  total: number;
  page: number;
  limit: number;
  list: T[];
}

interface Form2ListItem {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

interface HealthFormData {
  name: string;
  phone: string;
  emergencyContact: string;
  diseases: { name: string; date: string }[];
  medications: { name: string; dosage: string }[];
  surgery: { has: string; detail: string };
  allergy: { has: string; detail: string };
  vascular: { qualified: string; reason: string };
  familyHistory: string[];
  familyHistoryOther: string;
  familyHistoryNote: string;
  dietModes: string[];
  drinks: string[];
  drinksOther: string;
  mealFeeling: string[];
  mealFeelingOther: string;
  dietRestriction: string;
  exerciseTypes: string[];
  exerciseFrequency: string;
  exerciseDuration: string;
  sleepDuration: string;
  sleepQuality: string;
  wakeUpFeeling: string[];
  stressLevel: number;
  anxietyFrequency: string;
  brainFog: string[];
  brainFogOther: string;
  healthConcerns: string;
  uploadedFiles?: { name: string; size: number; url: string; type: string }[];
}

interface Form2Detail {
  id: number;
  orderNo: string;
  userId: string;
  name: string;
  phone: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuRecordId: string | null;
  feishuSyncStatus: string;
  formData: HealthFormData;
}

export const form2Api = {
  /**
   * 获取档案列表
   */
  async getList(params: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<PaginatedResult<Form2ListItem>>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    return request.get(`/admin/form2/list?${query.toString()}`);
  },

  /**
   * 获取档案详情
   */
  async getDetail(id: number): Promise<ApiResponse<Form2Detail>> {
    return request.get(`/admin/form2/${id}`);
  },

  /**
   * 更新档案
   */
  async update(id: number, data: Partial<Form2Detail>): Promise<ApiResponse<Form2Detail>> {
    return request.put(`/admin/form2/${id}`, data);
  },
};

export type { Form2ListItem, Form2Detail, HealthFormData };
