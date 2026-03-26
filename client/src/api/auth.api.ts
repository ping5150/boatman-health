// =============================================
// Mock 模式 - 不依赖后端即可跑通全流程
// 切换回真实接口：将下方注释打开，删除 mock 实现
// =============================================

// import api from '@/lib/axios';

interface SendCodeRequest {
  phone: string;
}

interface SendCodeResponse {
  success: boolean;
  message: string;
}

interface RegisterRequest {
  phone: string;
  name: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

interface LoginRequest {
  phone: string;
  code: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    phone: string;
    name: string;
    role: string;
  };
}

// 模拟网络延迟
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock: 保存注册信息，用于登录时回显
let mockUserName = '张先生';

// 发送验证码 (Mock)
export const sendCode = async (_data: SendCodeRequest): Promise<SendCodeResponse> => {
  await delay(300);
  return { success: true, message: '验证码已发送（Mock 模式，任意 6 位数字即可登录）' };
};

// 注册 (Mock)
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  await delay(200);
  mockUserName = data.name;
  return { success: true, message: '注册成功' };
};

// 登录 (Mock) - 任意 6 位验证码即可
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  await delay(400);
  if (data.code.length < 6) {
    throw { response: { data: { message: '验证码错误' } } };
  }
  return {
    success: true,
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: 'mock-user-001',
      phone: data.phone,
      name: mockUserName,
      role: 'user',
    },
  };
};
