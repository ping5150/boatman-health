import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { logger } from '../utils/logger';

// 开发阶段固定验证码
const DEV_CODE = '123456';

// 存储验证码（开发阶段使用内存，生产环境替换为 Redis）
const codeStore = new Map<string, { code: string; expiresAt: number }>();

export const authService = {
  /**
   * 检查用户是否存在
   */
  async checkUser(phone: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    return {
      exists: !!user,
      username: user?.username || null,
    };
  },

  /**
   * 密码登录（老用户）
   */
  async passwordLogin(phone: string, password: string) {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw { code: 1002, message: '用户不存在，请先注册' };
    }

    // 验证密码
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw { code: 1001, message: '密码错误' };
    }

    // 签发 Token
    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role as 'user' | 'admin',
    });

    logger.info('AUTH', `User logged in with password: userId=${user.id}`);

    return {
      token,
      userId: user.id,
      phone: user.phone,
      username: user.username,
      role: user.role,
    };
  },

  /**
   * 用户注册（新用户）
   */
  async register(phone: string, username: string, password: string) {
    // 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw { code: 409, message: '该手机号已注册' };
    }

    // 判断是否为第一个用户（自动设为管理员）
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'admin' : 'user';

    // 创建用户
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        phone,
        passwordHash,
        role,
      },
    });

    logger.info('AUTH', `User registered: userId=${user.id}, phone=${phone}, role=${role}`);

    // 注册成功后自动登录，签发 Token
    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role as 'user' | 'admin',
    });

    return {
      token,
      userId: user.id,
      phone: user.phone,
      username: user.username,
      role: user.role,
    };
  },

  /**
   * 发送验证码
   */
  async sendCode(phone: string) {
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw { code: 1002, message: '用户不存在，请先注册' };
    }

    // 开发阶段：固定验证码
    codeStore.set(phone, {
      code: DEV_CODE,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 分钟有效
    });

    logger.info('AUTH', `Verification code sent to ${phone} (dev mode: ${DEV_CODE})`);

    return true;
  },

  /**
   * 验证码登录
   */
  async login(phone: string, code: string) {
    // 校验验证码
    const stored = codeStore.get(phone);
    const isDevMode = process.env.NODE_ENV === 'development';

    // 开发模式允许固定验证码
    if (isDevMode && code === DEV_CODE) {
      // 验证通过
    } else if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
      throw { code: 1001, message: '验证码错误或已过期' };
    }

    // 清除已使用的验证码
    codeStore.delete(phone);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw { code: 1002, message: '用户不存在' };
    }

    // 签发 Token
    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role as 'user' | 'admin',
    });

    logger.info('AUTH', `User logged in: userId=${user.id}`);

    return {
      token,
      userId: user.id,
      phone: user.phone,
      role: user.role,
    };
  },
};
