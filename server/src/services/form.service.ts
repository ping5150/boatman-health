import prisma from '../config/database';
import {
  Form2Data,
  HealthFormData,
  BookingListItem,
  BookingDetail,
  ArchiveListItem,
  ArchiveDetail,
} from '../models/common.types';
import { logger } from '../utils/logger';
import { feishuService } from './feishu.service';

// 生成订单编号：BH/HA + 日期 + 4位序号
async function generateOrderNo(prefix: 'BH' | 'HA'): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = prefix === 'BH'
    ? await prisma.form1Submission.count({ where: { submittedAt: { gte: today } } })
    : await prisma.form2Submission.count({ where: { submittedAt: { gte: today } } });

  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}${dateStr}${seq}`;
}

export const formService = {
  /**
   * 获取下一个版本号
   */
  async getNextVersion(userId: number, formType: 'form1' | 'form2'): Promise<number> {
    if (formType === 'form1') {
      const last = await prisma.form1Submission.findFirst({
        where: { userId },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true },
      });
      return (last?.versionNumber ?? 0) + 1;
    } else {
      const last = await prisma.form2Submission.findFirst({
        where: { userId },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true },
      });
      return (last?.versionNumber ?? 0) + 1;
    }
  },

  /**
   * 提交咨询表单（表单1）
   */
  async submitForm1(
    userId: number,
    data: {
      name: string;
      phone: string;
      consultationType: string;
      preferredDate: string;
      preferredTime: string;
      brief: string;
    },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const versionNumber = await this.getNextVersion(userId, 'form1');
    const orderNo = await generateOrderNo('BH');
    const submittedBy = user?.username || data.name;

    const submission = await prisma.form1Submission.create({
      data: {
        userId,
        orderNo,
        name: data.name,
        phone: data.phone,
        consultationType: data.consultationType,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        brief: data.brief,
        submittedBy,
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('FORM', `Form1 submitted: userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, id=${submission.id}`);

    // 异步触发飞书同步（不阻塞响应）
    feishuService.syncForm1(submission).catch((err) => {
      logger.error('FEISHU', `Async sync form1 failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
      consultationType: submission.consultationType,
      preferredDate: submission.preferredDate,
      preferredTime: submission.preferredTime,
    };
  },

  /**
   * 获取用户预约列表
   */
  async getForm1List(userId: number): Promise<BookingListItem[]> {
    const list = await prisma.form1Submission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
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
      },
    });

    return list.map((item) => ({
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
    }));
  },

  /**
   * 获取单个预约详情
   */
  async getForm1Detail(userId: number, id: number): Promise<BookingDetail> {
    const submission = await prisma.form1Submission.findFirst({
      where: { id, userId },
    });

    if (!submission) {
      throw { code: 404, message: '预约记录不存在' };
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
    };
  },

  /**
   * 更新预约（新增记录，不覆盖原记录）
   */
  async updateForm1(
    userId: number,
    originalId: number,
    data: {
      name?: string;
      phone?: string;
      consultationType?: string;
      preferredDate?: string;
      preferredTime?: string;
      brief?: string;
    },
  ) {
    // 获取原记录
    const original = await prisma.form1Submission.findFirst({
      where: { id: originalId, userId },
    });

    if (!original) {
      throw { code: 404, message: '预约记录不存在' };
    }

    // 创建新记录（版本号+1）
    const versionNumber = await this.getNextVersion(userId, 'form1');
    const orderNo = await generateOrderNo('BH');

    const submission = await prisma.form1Submission.create({
      data: {
        userId,
        orderNo,
        name: data.name ?? original.name,
        phone: data.phone ?? original.phone,
        consultationType: data.consultationType ?? original.consultationType,
        preferredDate: data.preferredDate ?? original.preferredDate,
        preferredTime: data.preferredTime ?? original.preferredTime,
        brief: data.brief ?? original.brief,
        submittedBy: original.submittedBy,
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('FORM', `Form1 updated (new record): userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, originalId=${originalId}`);

    // 异步触发飞书同步
    feishuService.syncForm1(submission).catch((err) => {
      logger.error('FEISHU', `Async sync form1 failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
      consultationType: submission.consultationType,
      preferredDate: submission.preferredDate,
      preferredTime: submission.preferredTime,
      originalId,
    };
  },

  /**
   * 提交健康评估表单（表单2）
   */
  async submitForm2(userId: number, formData: HealthFormData) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const versionNumber = await this.getNextVersion(userId, 'form2');
    const orderNo = await generateOrderNo('HA');
    const submittedBy = user?.username || formData.name;
    const name = formData.name;
    const phone = formData.phone;

    const submission = await prisma.form2Submission.create({
      data: {
        userId,
        orderNo,
        name,
        phone,
        submittedBy,
        formData: JSON.stringify(formData),
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('FORM', `Form2 submitted: userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, id=${submission.id}`);

    // 异步触发飞书同步（不阻塞响应）
    feishuService.syncForm2(submission).catch((err) => {
      logger.error('FEISHU', `Async sync form2 failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
    };
  },

  /**
   * 保存草稿（创建新的草稿记录）
   */
  async saveDraft(userId: number, formData: Partial<HealthFormData>) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const versionNumber = await this.getNextVersion(userId, 'form2');
    const orderNo = await generateOrderNo('HA');
    const submittedBy = user?.username || formData.name || 'unknown';
    const name = formData.name || '';
    const phone = formData.phone || '';

    const submission = await prisma.form2Submission.create({
      data: {
        userId,
        orderNo,
        name,
        phone,
        submittedBy,
        formData: JSON.stringify(formData),
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('FORM', `Form2 draft saved: userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, id=${submission.id}`);

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
    };
  },

  /**
   * 获取用户档案列表
   */
  async getForm2List(userId: number): Promise<ArchiveListItem[]> {
    const list = await prisma.form2Submission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        orderNo: true,
        name: true,
        phone: true,
        submittedBy: true,
        submittedAt: true,
        updatedAt: true,
        versionNumber: true,
        feishuSyncStatus: true,
      },
    });

    return list.map((item) => ({
      id: item.id,
      orderNo: item.orderNo,
      name: item.name,
      phone: item.phone,
      submittedAt: item.submittedAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      submittedBy: item.submittedBy,
      versionNumber: item.versionNumber,
      feishuSyncStatus: item.feishuSyncStatus as ArchiveListItem['feishuSyncStatus'],
    }));
  },

  /**
   * 获取档案详情
   */
  async getForm2Detail(userId: number, id: number): Promise<ArchiveDetail> {
    const submission = await prisma.form2Submission.findFirst({
      where: { id, userId },
    });

    if (!submission) {
      throw { code: 404, message: '档案记录不存在' };
    }

    const formData = JSON.parse(submission.formData) as HealthFormData;

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      userId: submission.userId,
      name: submission.name,
      phone: submission.phone,
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
   * 获取用户最新档案
   */
  async getForm2Latest(userId: number): Promise<ArchiveDetail | null> {
    const submission = await prisma.form2Submission.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    if (!submission) {
      return null;
    }

    const formData = JSON.parse(submission.formData) as HealthFormData;

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      userId: submission.userId,
      name: submission.name,
      phone: submission.phone,
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
  async updateForm2(userId: number, id: number, data: Partial<HealthFormData>) {
    const original = await prisma.form2Submission.findFirst({
      where: { id, userId },
    });

    if (!original) {
      throw { code: 404, message: '档案记录不存在' };
    }

    const existingFormData = JSON.parse(original.formData) as HealthFormData;
    const updatedFormData = { ...existingFormData, ...data };

    // 创建新记录（版本号+1）
    const versionNumber = await this.getNextVersion(userId, 'form2');
    const orderNo = await generateOrderNo('HA');

    const submission = await prisma.form2Submission.create({
      data: {
        userId,
        orderNo,
        name: updatedFormData.name,
        phone: updatedFormData.phone,
        submittedBy: original.submittedBy,
        formData: JSON.stringify(updatedFormData),
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('FORM', `Form2 updated (new record): userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, originalId=${id}`);

    // 异步触发飞书同步
    feishuService.syncForm2(submission).catch((err) => {
      logger.error('FEISHU', `Async sync form2 failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
      originalId: id,
    };
  },
};
