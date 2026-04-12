import prisma from '../config/database';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { feishuService } from './feishu.service';
import { logger } from '../utils/logger';
import {
  PaginatedResult,
  UserListItem,
  UserDetail,
  BookingListItem,
  BookingDetail,
  ArchiveListItem,
  ArchiveDetail,
  DashboardStats,
  SyncFailedList,
  HealthFormData,
} from '../models/common.types';
import { generateUserId } from './auth.service';

// 角色类型定义
type UserRole = 'user' | 'salesman' | 'admin';

/**
 * 检查用户是否有管理后台访问权限（admin 或 salesman）
 */
function hasAdminAccess(roleString: string): boolean {
  const roles = roleString.split(',').map(r => r.trim() as UserRole);
  return roles.includes('admin') || roles.includes('salesman');
}

export const adminService = {
  /**
   * 管理员登录
   * 只有拥有 admin 或 salesman 角色的用户才能登录管理后台
   */
  async login(phone: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw { code: 1002, message: '账号不存在' };
    }

    // 检查是否有管理后台访问权限
    if (!hasAdminAccess(user.role)) {
      throw { code: 1003, message: '该账号无管理后台访问权限，仅管理员或业务员可登录' };
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw { code: 1001, message: '密码错误' };
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    logger.info('ADMIN', `Admin logged in: userId=${user.id}, roles=${user.role}`);

    return {
      token,
      userId: user.id,
      phone: user.phone,
      username: user.username,
      role: user.role,
    };
  },

  /**
   * 管理员注册
   * 注意：只有数据库为空时允许注册（第一个用户自动成为管理员）
   */
  async register(phone: string, username: string, password: string) {
    // 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw { code: 409, message: '该手机号已注册' };
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findFirst({
      where: { username },
    });

    if (existingUsername) {
      throw { code: 409, message: '该用户名已被使用' };
    }

    // 管理后台注册的用户直接赋予管理员角色
    const role = 'admin';

    // 创建用户账号
    const passwordHash = await hashPassword(password);
    const userId = await generateUserId();
    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        phone,
        passwordHash,
        role,
      },
    });

    logger.info('ADMIN', `Admin registered: userId=${user.id}, phone=${phone}, role=${role}`);

    // 注册成功后自动登录，签发 Token
    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
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
   * 获取当前管理员信息
   */
  async getCurrentAdmin(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw { code: 404, message: '用户不存在' };
    }

    return {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    };
  },

  /**
   * 仪表盘统计
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      userTotal,
      userToday,
      userYesterday,
      bookingTotal,
      bookingToday,
      bookingYesterday,
      archiveTotal,
      archiveToday,
      archiveYesterday,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { role: 'user', createdAt: { gte: today } } }),
      prisma.user.count({ where: { role: 'user', createdAt: { gte: yesterday, lt: today } } }),
      prisma.form1Submission.count(),
      prisma.form1Submission.count({ where: { submittedAt: { gte: today } } }),
      prisma.form1Submission.count({ where: { submittedAt: { gte: yesterday, lt: today } } }),
      prisma.form2Submission.count(),
      prisma.form2Submission.count({ where: { submittedAt: { gte: today } } }),
      prisma.form2Submission.count({ where: { submittedAt: { gte: yesterday, lt: today } } }),
    ]);

    // 计算增长率
    const calcGrowthRate = (today: number, yesterday: number) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return Number(((today - yesterday) / yesterday * 100).toFixed(1));
    };

    return {
      userTotal,
      userToday,
      userGrowthRate: calcGrowthRate(userToday, userYesterday),
      bookingTotal,
      bookingToday,
      bookingGrowthRate: calcGrowthRate(bookingToday, bookingYesterday),
      archiveTotal,
      archiveToday,
      archiveGrowthRate: calcGrowthRate(archiveToday, archiveYesterday),
      bookingStatusDistribution: {
        submitted: bookingTotal,
        processing: 0,
        completed: 0,
        cancelled: 0,
      },
    };
  },

  /**
   * 表单1列表（预约列表）
   */
  async getForm1List(
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<PaginatedResult<BookingListItem>> {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { orderNo: { contains: search } },
      ];
    }

    if (status) {
      where.feishuSyncStatus = status;
    }

    const [total, list] = await Promise.all([
      prisma.form1Submission.count({ where }),
      prisma.form1Submission.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          orderNo: true,
          name: true,
          phone: true,
          consultationType: true,
          preferredDate: true,
          preferredTime: true,
          brief: true,
          submittedBy: true,
          submittedAt: true,
          updatedAt: true,
          versionNumber: true,
          feishuSyncStatus: true,
          status: true,
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      list: list.map((item) => ({
        id: item.id,
        orderNo: item.orderNo,
        name: item.name,
        phone: item.phone,
        consultationType: item.consultationType as BookingListItem['consultationType'],
        preferredDate: item.preferredDate,
        preferredTime: item.preferredTime,
        brief: item.brief,
        submittedAt: item.submittedAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        submittedBy: item.submittedBy,
        versionNumber: item.versionNumber,
        feishuSyncStatus: item.feishuSyncStatus as BookingListItem['feishuSyncStatus'],
        status: (item.status || 'active') as 'active' | 'cancelled',
      })),
    };
  },

  /**
   * 表单2列表（档案列表）
   */
  async getForm2List(
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<PaginatedResult<ArchiveListItem>> {
    const where: Record<string, unknown> = {};

    if (status) {
      where.feishuSyncStatus = status;
    }

    const allSubmissions = await prisma.form2Submission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        orderNo: true,
        formData: true,
        submittedBy: true,
        submittedAt: true,
        updatedAt: true,
        versionNumber: true,
        feishuSyncStatus: true,
      },
    });

    const transformed = allSubmissions.map((item) => {
      const formData = JSON.parse(item.formData) as HealthFormData;
      return {
        id: item.id,
        orderNo: item.orderNo,
        name: formData.name || '',
        phone: formData.phone || '',
        submittedAt: item.submittedAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        submittedBy: item.submittedBy,
        versionNumber: item.versionNumber,
        feishuSyncStatus: item.feishuSyncStatus as ArchiveListItem['feishuSyncStatus'],
      };
    });

    const filtered = search
      ? transformed.filter(
          (item) =>
            item.name.includes(search) ||
            item.phone.includes(search) ||
            item.orderNo.includes(search),
        )
      : transformed;

    const total = filtered.length;
    const list = filtered.slice((page - 1) * limit, page * limit);

    return { total, page, limit, list };
  },

  /**
   * 表单1详情（预约详情）
   */
  async getForm1Detail(id: number): Promise<BookingDetail> {
    const submission = await prisma.form1Submission.findUnique({
      where: { id },
      include: { user: { select: { username: true } } },
    });

    if (!submission) {
      throw { code: 404, message: '记录不存在' };
    }

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      userId: submission.userId,
      name: submission.name,
      phone: submission.phone,
      consultationType: submission.consultationType as BookingDetail['consultationType'],
      preferredDate: submission.preferredDate,
      preferredTime: submission.preferredTime,
      brief: submission.brief,
      submittedAt: submission.submittedAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      submittedBy: submission.submittedBy,
      versionNumber: submission.versionNumber,
      feishuSyncStatus: submission.feishuSyncStatus as BookingDetail['feishuSyncStatus'],
      feishuRecordId: submission.feishuRecordId,
      status: (submission.status || 'active') as 'active' | 'cancelled',
      cancelledAt: submission.cancelledAt?.toISOString() || null,
    };
  },

  /**
   * 更新预约
   */
  async updateForm1(id: number, data: Record<string, unknown>) {
    const submission = await prisma.form1Submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw { code: 404, message: '记录不存在' };
    }

    const updateData: Record<string, unknown> = {};
    if (data.preferredDate !== undefined) updateData.preferredDate = data.preferredDate;
    if (data.preferredTime !== undefined) updateData.preferredTime = data.preferredTime;
    if (data.brief !== undefined) updateData.brief = data.brief;
    if (data.consultationType !== undefined) updateData.consultationType = data.consultationType;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;

    const updated = await prisma.form1Submission.update({
      where: { id },
      data: updateData,
    });

    logger.info('ADMIN', `Form1 updated: id=${id}`);

    return {
      id: updated.id,
      versionNumber: updated.versionNumber,
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  /**
   * 表单2详情（档案详情）
   */
  async getForm2Detail(id: number): Promise<ArchiveDetail> {
    const submission = await prisma.form2Submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw { code: 404, message: '记录不存在' };
    }

    const formData = JSON.parse(submission.formData) as HealthFormData;

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      userId: submission.userId,
      name: formData.name || '',
      phone: formData.phone || '',
      submittedAt: submission.submittedAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      submittedBy: submission.submittedBy,
      versionNumber: submission.versionNumber,
      feishuSyncStatus: submission.feishuSyncStatus as ArchiveDetail['feishuSyncStatus'],
      feishuRecordId: submission.feishuRecordId,
      formData,
    };
  },

  /**
   * 更新档案
   */
  async updateForm2(id: number, data: Record<string, unknown>) {
    const submission = await prisma.form2Submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw { code: 404, message: '记录不存在' };
    }

    const existingFormData = JSON.parse(submission.formData) as HealthFormData;
    const updatedFormData = { ...existingFormData, ...data };

    const updated = await prisma.form2Submission.update({
      where: { id },
      data: {
        formData: JSON.stringify(updatedFormData),
        name: updatedFormData.name,
        phone: updatedFormData.phone,
      },
    });

    logger.info('ADMIN', `Form2 updated: id=${id}`);

    return {
      id: updated.id,
      versionNumber: updated.versionNumber,
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  /**
   * 获取同步失败记录列表
   * 用户失败列表只查普通用户（role=user）
   */
  async getSyncFailedList(): Promise<SyncFailedList> {
    const [usersFailed, form1Failed, form2Failed] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'user', feishuSyncStatus: 'failed' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          phone: true,
          createdAt: true,
          feishuSyncStatus: true,
        },
      }),
      prisma.form1Submission.findMany({
        where: { feishuSyncStatus: 'failed' },
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          orderNo: true,
          name: true,
          phone: true,
          submittedAt: true,
          feishuSyncStatus: true,
        },
      }),
      prisma.form2Submission.findMany({
        where: { feishuSyncStatus: 'failed' },
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          orderNo: true,
          formData: true,
          submittedAt: true,
          feishuSyncStatus: true,
        },
      }),
    ]);

    const form2Transformed = form2Failed.map((item) => {
      const formData = JSON.parse(item.formData) as HealthFormData;
      return {
        id: item.id,
        orderNo: item.orderNo,
        name: formData.name || '',
        phone: formData.phone || '',
        submittedAt: item.submittedAt.toISOString(),
        feishuSyncStatus: item.feishuSyncStatus as SyncFailedList['archive'][0]['feishuSyncStatus'],
      };
    });

    return {
      user: usersFailed.map((item) => ({
        id: item.id,
        name: item.username,
        phone: item.phone,
        submittedAt: item.createdAt.toISOString(),
        feishuSyncStatus: item.feishuSyncStatus as SyncFailedList['user'][0]['feishuSyncStatus'],
      })),
      booking: form1Failed.map((item) => ({
        id: item.id,
        orderNo: item.orderNo,
        name: item.name,
        phone: item.phone,
        submittedAt: item.submittedAt.toISOString(),
        feishuSyncStatus: item.feishuSyncStatus as SyncFailedList['booking'][0]['feishuSyncStatus'],
      })),
      archive: form2Transformed,
    };
  },

  /**
   * 获取同步统计
   * 用户统计只统计普通用户（role包含user）
   */
  async getSyncStats() {
    const [userTotal, userSuccess, userFailed, userPending,
      bookingTotal, bookingSuccess, bookingFailed, bookingPending,
      archiveTotal, archiveSuccess, archiveFailed, archivePending] = await Promise.all([
      // 用户统计：只统计普通用户（role包含user，不含admin/salesman）
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { role: 'user', feishuSyncStatus: 'success' } }),
      prisma.user.count({ where: { role: 'user', feishuSyncStatus: 'failed' } }),
      prisma.user.count({ where: { role: 'user', feishuSyncStatus: 'pending' } }),
      // 预约统计
      prisma.form1Submission.count(),
      prisma.form1Submission.count({ where: { feishuSyncStatus: 'success' } }),
      prisma.form1Submission.count({ where: { feishuSyncStatus: 'failed' } }),
      prisma.form1Submission.count({ where: { feishuSyncStatus: 'pending' } }),
      // 档案统计
      prisma.form2Submission.count(),
      prisma.form2Submission.count({ where: { feishuSyncStatus: 'success' } }),
      prisma.form2Submission.count({ where: { feishuSyncStatus: 'failed' } }),
      prisma.form2Submission.count({ where: { feishuSyncStatus: 'pending' } }),
    ]);

    return {
      user: { total: userTotal, success: userSuccess, failed: userFailed, pending: userPending },
      booking: { total: bookingTotal, success: bookingSuccess, failed: bookingFailed, pending: bookingPending },
      archive: { total: archiveTotal, success: archiveSuccess, failed: archiveFailed, pending: archivePending },
    };
  },

  /**
   * 获取用户列表（分页 + 搜索 + 角色筛选）
   * 角色筛选支持多角色匹配（如筛选 admin 会匹配到 "admin" 和 "user,admin"）
   */
  async getUserList(
    page: number,
    limit: number,
    search?: string,
    role?: string,
  ): Promise<PaginatedResult<UserListItem>> {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    // 角色筛选：使用 contains 支持多角色匹配
    if (role) {
      where.role = { contains: role };
    }

    const [total, list] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          username: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      list: list.map((user) => ({
        id: user.id,
        username: user.username,
        phone: user.phone,
        role: user.role as UserListItem['role'],
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
    };
  },

  /**
   * 获取用户详情
   */
  async getUserDetail(id: string): Promise<UserDetail> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        phone: true,
        role: true,
        gender: true,
        birthDate: true,
        emergencyName: true,
        emergencyRelation: true,
        emergencyPhone: true,
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
      role: user.role as UserDetail['role'],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      gender: user.gender,
      birthDate: user.birthDate,
      emergencyName: user.emergencyName,
      emergencyRelation: user.emergencyRelation,
      emergencyPhone: user.emergencyPhone,
    };
  },

  /**
   * 更新用户（包括角色）
   * 只有管理员才能更新角色字段
   */
  async updateUser(id: string, data: Record<string, unknown>, isAdmin: boolean = false) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw { code: 404, message: '用户不存在' };
    }

    const updateData: Record<string, unknown> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;
    if (data.emergencyName !== undefined) updateData.emergencyName = data.emergencyName;
    if (data.emergencyRelation !== undefined) updateData.emergencyRelation = data.emergencyRelation;
    if (data.emergencyPhone !== undefined) updateData.emergencyPhone = data.emergencyPhone;
    
    // 只有管理员才能更新角色
    if (data.role !== undefined && isAdmin) {
      // 验证角色格式
      const validRoles = ['user', 'salesman', 'admin'];
      const roles = (data.role as string).split(',').map((r: string) => r.trim());
      const isValidRoles = roles.every((r: string) => validRoles.includes(r));
      if (!isValidRoles) {
        throw { code: 400, message: '无效的角色类型，有效角色：user、salesman、admin' };
      }
      updateData.role = data.role;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    logger.info('ADMIN', `User updated: id=${id}, role=${updated.role}`);

    // 异步触发飞书用户更新（不阻塞响应）
    feishuService.updateUser(updated).catch((err) => {
      logger.error('FEISHU', `Async update user failed: id=${id}`, err);
    });

    return {
      id: updated.id,
      username: updated.username,
      role: updated.role,
      updatedAt: updated.updatedAt.toISOString(),
    };
  },
};
