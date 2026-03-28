import request from './request';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

interface UserItem {
  id: number;
  username: string;
  phone: string;
  role: string;
  createdAt: string;
  formCount: number;
}

interface UserListResult {
  total: number;
  page: number;
  limit: number;
  list: UserItem[];
}

export const userApi = {
  /**
   * 获取用户列表
   */
  async getList(params: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<UserListResult>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return request.get(`/admin/users?${query.toString()}`);
  },
};
