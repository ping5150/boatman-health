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
  name: string;
  customerId: string;
  phone: string;
  submittedAt: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

interface Form2Detail {
  id: number;
  userId: number;
  formData: Record<string, unknown>;
  submittedAt: string;
  versionNumber: number;
  feishuRecordId: string | null;
  feishuSyncStatus: string;
}

export const form2Api = {
  /**
   * 获取表单2列表
   */
  getList(params: { page: number; limit: number; search?: string }): Promise<ApiResponse<PaginatedResult<Form2ListItem>>> {
    return request.get('/admin/form2/list', { params });
  },

  /**
   * 获取表单2详情
   */
  getDetail(id: number): Promise<ApiResponse<Form2Detail>> {
    return request.get(`/admin/form2/${id}`);
  },
};
