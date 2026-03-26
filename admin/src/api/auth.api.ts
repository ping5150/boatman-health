import request from './request';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

interface LoginResult {
  token: string;
  userId: number;
  phone: string;
  role: string;
}

export const authApi = {
  /**
   * 发送验证码
   */
  sendCode(phone: string): Promise<ApiResponse> {
    return request.post('/api/auth/send-code', { phone });
  },

  /**
   * 验证码登录
   */
  login(phone: string, code: string): Promise<ApiResponse<LoginResult>> {
    return request.post('/api/auth/login', { phone, code });
  },
};
