import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { feishuService } from './feishu.service';

// 开发阶段固定验证码
const DEV_CODE = '123456';

// 存储验证码（开发阶段使用内存，生产环境替换为 Redis）
const codeStore = new Map<string, { code: string; expiresAt: number }>();

// 生成用户ID：CF + 日期 + 4位序号 + 4位随机数（防止并发冲突）
export async function generateUserId(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await prisma.user.count({
    where: { createdAt: { gte: today } },
  });

  const seq = String(count + 1).padStart(4, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `CF${dateStr}${seq}${random}`;
}

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

    // 生成用户 ID
    const userId = await generateUserId();

    // 创建用户
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        phone,
        passwordHash,
        role,
      },
    });

    logger.info('AUTH', `User registered: userId=${user.id}, phone=${phone}, role=${role}`);

    // 异步触发飞书用户同步（不阻塞响应）
    feishuService.syncUser(user).catch((err) => {
      logger.error('FEISHU', `Async sync user failed: userId=${user.id}`, err);
    });

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

  /**
   * 获取用户信息
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        phone: true,
        gender: true,
        birthDate: true,
        emergencyName: true,
        emergencyRelation: true,
        emergencyPhone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw { code: 404, message: '用户不存在' };
    }

    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      gender: user.gender || '',
      birthDate: user.birthDate || '',
      emergencyName: user.emergencyName || '',
      emergencyRelation: user.emergencyRelation || '',
      emergencyPhone: user.emergencyPhone || '',
      role: user.role,
    };
  },

  /**
   * 更新用户信息
   */
  async updateProfile(userId: string, data: Record<string, unknown>) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { code: 404, message: '用户不存在' };
    }

    // 如果要更新手机号，检查是否已被其他用户使用
    if (data.phone !== undefined && data.phone !== user.phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: data.phone as string,
          id: { not: userId },
        },
      });
      if (existingUser) {
        throw { code: 400, message: '该手机号已被其他账号绑定' };
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;
    if (data.emergencyName !== undefined) updateData.emergencyName = data.emergencyName;
    if (data.emergencyRelation !== undefined) updateData.emergencyRelation = data.emergencyRelation;
    if (data.emergencyPhone !== undefined) updateData.emergencyPhone = data.emergencyPhone;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    logger.info('AUTH', `User profile updated: userId=${userId}`);

    // 异步触发飞书用户更新（不阻塞响应）
    feishuService.updateUser(updated).catch((err) => {
      logger.error('FEISHU', `Async update user failed: userId=${userId}`, err);
    });

    return {
      id: updated.id,
      username: updated.username,
      phone: updated.phone,
      gender: updated.gender || '',
      birthDate: updated.birthDate || '',
      emergencyName: updated.emergencyName || '',
      emergencyRelation: updated.emergencyRelation || '',
      emergencyPhone: updated.emergencyPhone || '',
      updatedAt: updated.updatedAt.toISOString(),
    };
  },
};
