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

interface Form1ListItem {
  id: number;
  name: string;
  phone: string;
  consultationType: string;
  submittedAt: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

interface Form1Detail {
  id: number;
  userId: number;
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

export const form1Api = {
  /**
   * 获取表单1列表
   */
  async getList(params: { page: number; limit: number; search?: string }): Promise<ApiResponse<PaginatedResult<Form1ListItem>>> {
    return request.get('/admin/form1/list', { params });
  },

  /**
   * 获取表单1详情
   */
  async getDetail(id: number): Promise<ApiResponse<Form1Detail>> {
    return request.get(`/admin/form1/${id}`);
  },
};
