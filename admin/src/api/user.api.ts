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
  updatedAt: string;
}

interface UserListResult {
  total: number;
  page: number;
  limit: number;
  list: UserItem[];
}

interface UserDetail {
  id: number;
  username: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  gender: string | null;
  birthDate: string | null;
  emergencyName: string | null;
  emergencyRelation: string | null;
  emergencyPhone: string | null;
}

interface UserUpdateData {
  username?: string;
  gender?: string;
  birthDate?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
}

export const userApi = {
  /**
   * 获取用户列表
   */
  async getList(params: { page?: number; limit?: number; search?: string; role?: string }): Promise<ApiResponse<UserListResult>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.role) query.set('role', params.role);
    return request.get(`/admin/users?${query.toString()}`);
  },

  /**
   * 获取用户详情
   */
  async getDetail(id: number): Promise<ApiResponse<UserDetail>> {
    return request.get(`/admin/users/${id}`);
  },

  /**
   * 更新用户信息
   */
  async update(id: number, data: UserUpdateData): Promise<ApiResponse<UserDetail>> {
    return request.put(`/admin/users/${id}`, data);
  },
};

export type { UserItem, UserDetail, UserUpdateData };
