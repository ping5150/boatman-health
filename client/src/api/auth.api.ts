import api from '@/lib/axios';

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

// 发送验证码
export const sendCode = async (data: SendCodeRequest): Promise<SendCodeResponse> => {
  const res = await api.post('/auth/send-code', { phone: data.phone });
  return { success: true, message: res.data.message || '验证码已发送' };
};

// 注册
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  await api.post('/auth/register', { phone: data.phone, password: data.name });
  return { success: true, message: '注册成功' };
};

// 登录
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post('/auth/login', { phone: data.phone, code: data.code });
  const result = res.data.data;
  return {
    success: true,
    token: result.token,
    user: {
      id: String(result.userId),
      phone: result.phone,
      name: result.name || '用户',
      role: result.role,
    },
  };
};
