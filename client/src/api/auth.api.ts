import api from '@/lib/axios';

// ==================== 类型定义 ====================

/** 用户角色 */
export type UserRole = 'user' | 'admin';

/** 检查用户是否存在 - 请求 */
export interface CheckUserRequest {
  phone: string;
}

/** 检查用户是否存在 - 响应 */
export interface CheckUserResponse {
  success: boolean;
  data: {
    exists: boolean;
    username: string | null;
  };
}

/** 密码登录 - 请求 */
export interface PasswordLoginRequest {
  phone: string;
  password: string;
}

/** 用户注册 - 请求 */
export interface RegisterRequest {
  phone: string;
  username: string;
  password: string;
}

/** 发送验证码 - 请求 */
export interface SendCodeRequest {
  phone: string;
}

/** 发送验证码 - 响应 */
export interface SendCodeResponse {
  success: boolean;
  message: string;
}

/** 验证码登录 - 请求 */
export interface CodeLoginRequest {
  phone: string;
  code: string;
}

/** 认证响应 */
export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    phone: string;
    username: string;
    role: UserRole;
  };
}

/** 用户信息 */
export interface UserProfile {
  id: number;
  username: string;
  phone: string;
  gender: string;
  birthDate: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  role: string;
}

/** 更新用户信息 - 请求 */
export interface UpdateProfileRequest {
  username?: string;
  gender?: string;
  birthDate?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
}

// ==================== API 方法 ====================

/**
 * 检查用户是否存在
 */
export const checkUser = async (data: CheckUserRequest): Promise<CheckUserResponse> => {
  const res = await api.post('/auth/check-user', { phone: data.phone });
  return res.data;
};

/**
 * 密码登录（老用户）
 */
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

/**
 * 用户注册（新用户）
 */
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

/**
 * 发送验证码
 */
export const sendCode = async (data: SendCodeRequest): Promise<SendCodeResponse> => {
  const res = await api.post('/auth/send-code', { phone: data.phone });
  return { success: true, message: res.data.message || '验证码已发送' };
};

/**
 * 验证码登录
 */
export const login = async (data: CodeLoginRequest): Promise<AuthResponse> => {
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

/**
 * 获取当前用户信息
 */
export const getProfile = async (): Promise<{ success: boolean; data: UserProfile }> => {
  const res = await api.get('/auth/me');
  return { success: true, data: res.data.data };
};

/**
 * 更新当前用户信息
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<{ success: boolean; data: Partial<UserProfile> }> => {
  const res = await api.put('/auth/me', data);
  return { success: true, data: res.data.data };
};
