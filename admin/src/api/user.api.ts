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
  role: string; // 逗号分隔的多角色，如 "user,salesman"
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
  role: string; // 逗号分隔的多角色
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
  role?: string; // 逗号分隔的多角色
}

// 角色类型
type UserRole = 'user' | 'salesman' | 'admin';

// 角色显示名称映射
const roleNames: Record<UserRole, string> = {
  user: '用户',
  salesman: '业务员',
  admin: '管理员',
};

// 角色颜色映射
const roleColors: Record<UserRole, string> = {
  user: 'blue',
  salesman: 'green',
  admin: 'gold',
};

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

export type { UserItem, UserDetail, UserUpdateData, UserRole };
export { roleNames, roleColors };
