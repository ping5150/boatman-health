// =============================================
// Mock 模式 - 不依赖后端即可跑通全流程
// 切换回真实接口时还原此文件
// =============================================

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

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  /**
   * 发送验证码 (Mock)
   */
  async sendCode(_phone: string): Promise<ApiResponse> {
    await delay(300);
    return { code: 0, message: '验证码已发送（Mock 模式，任意 6 位数字即可登录）' };
  },

  /**
   * 验证码登录 (Mock) - 任意 6 位验证码，自动获得 admin 角色
   */
  async login(phone: string, code: string): Promise<ApiResponse<LoginResult>> {
    await delay(400);
    if (code.length < 6) {
      return { code: 1, message: '验证码错误' };
    }
    return {
      code: 0,
      message: '登录成功',
      data: {
        token: 'mock-admin-token-' + Date.now(),
        userId: 1,
        phone,
        role: 'admin',
      },
    };
  },
};
