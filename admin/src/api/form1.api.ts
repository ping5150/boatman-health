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
  orderNo: string;
  name: string;
  phone: string;
  consultationType: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

interface Form1Detail {
  id: number;
  orderNo: string;
  userId: number;
  name: string;
  phone: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  brief: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuRecordId: string | null;
  feishuSyncStatus: string;
}

export const form1Api = {
  /**
   * 获取预约列表
   */
  async getList(params: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<PaginatedResult<Form1ListItem>>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    return request.get(`/admin/form1/list?${query.toString()}`);
  },

  /**
   * 获取预约详情
   */
  async getDetail(id: number): Promise<ApiResponse<Form1Detail>> {
    return request.get(`/admin/form1/${id}`);
  },

  /**
   * 更新预约
   */
  async update(id: number, data: Partial<Form1Detail>): Promise<ApiResponse<Form1Detail>> {
    return request.put(`/admin/form1/${id}`, data);
  },
};
