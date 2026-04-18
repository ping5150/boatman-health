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

interface SurveyListItem {
  id: number;
  orderNo: string;
  userId: string;
  name: string;
  phone: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuSyncStatus: 'success' | 'pending' | 'failed';
}

interface SurveyDetail extends SurveyListItem {
  feishuRecordId: string | null;
  formData: Record<string, unknown>;
}

export const sleepSurveyApi = {
  async getList(params: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<PaginatedResult<SurveyListItem>>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return request.get(`/admin/sleep-surveys/list?${query.toString()}`);
  },

  async getDetail(id: number): Promise<ApiResponse<SurveyDetail>> {
    return request.get(`/admin/sleep-surveys/${id}`);
  },
};

export const nutritionSurveyApi = {
  async getList(params: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<PaginatedResult<SurveyListItem>>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return request.get(`/admin/nutrition-surveys/list?${query.toString()}`);
  },

  async getDetail(id: number): Promise<ApiResponse<SurveyDetail>> {
    return request.get(`/admin/nutrition-surveys/${id}`);
  },
};

export type { SurveyListItem, SurveyDetail };