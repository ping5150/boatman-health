import prisma from '../config/database';
import { PaginatedResult } from '../models/common.types';
import { logger } from '../utils/logger';

export const adminService = {
  /**
   * 仪表盘统计
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      form1Total,
      form1Today,
      form2Total,
      form2Today,
      syncFailedForm1,
      syncFailedForm2,
    ] = await Promise.all([
      prisma.form1Submission.count(),
      prisma.form1Submission.count({
        where: { submittedAt: { gte: today } },
      }),
      prisma.form2Submission.count(),
      prisma.form2Submission.count({
        where: { submittedAt: { gte: today } },
      }),
      prisma.form1Submission.count({
        where: { feishuSyncStatus: 'failed' },
      }),
      prisma.form2Submission.count({
        where: { feishuSyncStatus: 'failed' },
      }),
    ]);

    return {
      form1Total,
      form1Today,
      form2Total,
      form2Today,
      syncFailedTotal: syncFailedForm1 + syncFailedForm2,
    };
  },

  /**
   * 表单1列表（分页 + 搜索）
   */
  async getForm1List(page: number, limit: number, search?: string): Promise<PaginatedResult<unknown>> {
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [total, list] = await Promise.all([
      prisma.form1Submission.count({ where }),
      prisma.form1Submission.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          phone: true,
          consultationType: true,
          submittedAt: true,
          versionNumber: true,
          feishuSyncStatus: true,
        },
      }),
    ]);

    return { total, page, limit, list };
  },

  /**
   * 表单2列表（分页 + 搜索）
   */
  async getForm2List(page: number, limit: number, search?: string): Promise<PaginatedResult<unknown>> {
    // 由于 form2 使用 JSON 存储，搜索需要在应用层过滤
    // SQLite 不支持 JSON 路径查询，所以获取所有记录后在内存中过滤
    const allSubmissions = await prisma.form2Submission.findMany({
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        formData: true,
        submittedAt: true,
        versionNumber: true,
        feishuSyncStatus: true,
      },
    });

    // 转换并过滤
    const transformed = allSubmissions.map((item) => {
      const formData = JSON.parse(item.formData);
      return {
        id: item.id,
        name: formData.basicInfo?.name ?? '',
        customerId: formData.basicInfo?.customerId ?? '',
        phone: formData.basicInfo?.phone ?? '',
        submittedAt: item.submittedAt,
        versionNumber: item.versionNumber,
        feishuSyncStatus: item.feishuSyncStatus,
      };
    });

    const filtered = search
      ? transformed.filter(
          (item) =>
            item.name.includes(search) || item.customerId.includes(search),
        )
      : transformed;

    const total = filtered.length;
    const list = filtered.slice((page - 1) * limit, page * limit);

    return { total, page, limit, list };
  },

  /**
   * 表单1详情
   */
  async getForm1Detail(id: number) {
    const submission = await prisma.form1Submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw { code: 404, message: '记录不存在' };
    }

    return submission;
  },

  /**
   * 表单2详情
   */
  async getForm2Detail(id: number) {
    const submission = await prisma.form2Submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw { code: 404, message: '记录不存在' };
    }

    return {
      ...submission,
      formData: JSON.parse(submission.formData),
    };
  },

  /**
   * 获取同步失败记录列表
   */
  async getSyncFailedList() {
    const [form1Failed, form2Failed] = await Promise.all([
      prisma.form1Submission.findMany({
        where: { feishuSyncStatus: 'failed' },
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
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
          formData: true,
          submittedAt: true,
          feishuSyncStatus: true,
        },
      }),
    ]);

    const form2Transformed = form2Failed.map((item) => {
      const formData = JSON.parse(item.formData);
      return {
        id: item.id,
        name: formData.basicInfo?.name ?? '',
        phone: formData.basicInfo?.phone ?? '',
        submittedAt: item.submittedAt,
        feishuSyncStatus: item.feishuSyncStatus,
      };
    });

    return {
      form1: form1Failed,
      form2: form2Transformed,
    };
  },
};
