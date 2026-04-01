import request from './request';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

interface LoginResult {
  token: string;
  userId: string;
  phone: string;
  username?: string;
  role: string;
}

interface RegisterResult {
  token: string;
  userId: string;
  phone: string;
  username: string;
  role: string;
}

interface AdminInfo {
  id: string;
  phone: string;
  role: string;
}

export const authApi = {
  /**
   * 管理员登录（手机号+密码）
   */
  async login(phone: string, password: string): Promise<ApiResponse<LoginResult>> {
    return request.post('/admin/auth/login', { phone, password });
  },

  /**
   * 管理员注册
   */
  async register(phone: string, username: string, password: string): Promise<ApiResponse<RegisterResult>> {
    return request.post('/admin/auth/register', { phone, username, password });
  },

  /**
   * 获取当前管理员信息
   */
  async getMe(): Promise<ApiResponse<AdminInfo>> {
    return request.get('/admin/auth/me');
  },
};
