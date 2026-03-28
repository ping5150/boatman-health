import api from '@/lib/axios';

interface CheckUserRequest {
  phone: string;
}

interface CheckUserResponse {
  success: boolean;
  data: {
    exists: boolean;
    username: string | null;
  };
}

interface PasswordLoginRequest {
  phone: string;
  password: string;
}

interface RegisterRequest {
  phone: string;
  username: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    phone: string;
    username: string;
    role: string;
  };
}

interface SendCodeRequest {
  phone: string;
}

interface SendCodeResponse {
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
    username: string;
    role: string;
  };
}

// 检查用户是否存在
export const checkUser = async (data: CheckUserRequest): Promise<CheckUserResponse> => {
  const res = await api.post('/auth/check-user', { phone: data.phone });
  return res.data;
};

// 密码登录（老用户）
export const passwordLogin = async (data: PasswordLoginRequest): Promise<AuthResponse> => {
  const res = await api.post('/auth/password-login', { phone: data.phone, password: data.password });
  const result = res.data.data;
  return {
    success: true,
    token: result.token,
    user: {
      id: String(result.userId),
      phone: result.phone,
      username: result.username || '用户',
      role: result.role,
    },
  };
};

// 注册（新用户）
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', {
    phone: data.phone,
    username: data.username,
    password: data.password,
  });
  const result = res.data.data;
  return {
    success: true,
    token: result.token,
    user: {
      id: String(result.userId),
      phone: result.phone,
      username: result.username || '用户',
      role: result.role,
    },
  };
};

// 发送验证码
export const sendCode = async (data: SendCodeRequest): Promise<SendCodeResponse> => {
  const res = await api.post('/auth/send-code', { phone: data.phone });
  return { success: true, message: res.data.message || '验证码已发送' };
};

// 验证码登录
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post('/auth/login', { phone: data.phone, code: data.code });
  const result = res.data.data;
  return {
    success: true,
    token: result.token,
    user: {
      id: String(result.userId),
      phone: result.phone,
      username: result.username || '用户',
      role: result.role,
    },
  };
};
