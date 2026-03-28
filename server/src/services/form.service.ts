import prisma from '../config/database';
import { Form2Data } from '../models/common.types';
import { logger } from '../utils/logger';
import { feishuService } from './feishu.service';

// 生成订单编号：BH + 日期 + 4位序号
async function generateOrderNo(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await prisma.form1Submission.count({
    where: {
      submittedAt: {
        gte: today,
      },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `BH${dateStr}${seq}`;
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
    const versionNumber = await this.getNextVersion(userId, 'form1');
    const orderNo = await generateOrderNo();

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
  async getForm1List(userId: number) {
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
        submittedAt: true,
        versionNumber: true,
      },
    });

    return list.map((item) => ({
      id: item.id,
      orderNo: item.orderNo,
      name: item.name,
      phone: item.phone,
      consultationType: item.consultationType,
      preferredDate: item.preferredDate,
      preferredTime: item.preferredTime,
      brief: item.brief,
      submittedAt: item.submittedAt.toISOString(),
      versionNumber: item.versionNumber,
    }));
  },

  /**
   * 获取单个预约详情
   */
  async getForm1Detail(userId: number, id: number) {
    const submission = await prisma.form1Submission.findFirst({
      where: { id, userId },
    });

    if (!submission) {
      throw { code: 404, message: '预约记录不存在' };
    }

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      name: submission.name,
      phone: submission.phone,
      consultationType: submission.consultationType,
      preferredDate: submission.preferredDate,
      preferredTime: submission.preferredTime,
      brief: submission.brief,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
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
    const orderNo = await generateOrderNo();

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
  async submitForm2(userId: number, formData: Form2Data) {
    const versionNumber = await this.getNextVersion(userId, 'form2');

    const submission = await prisma.form2Submission.create({
      data: {
        userId,
        formData: JSON.stringify(formData),
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('FORM', `Form2 submitted: userId=${userId}, version=${versionNumber}, id=${submission.id}`);

    // 异步触发飞书同步（不阻塞响应）
    feishuService.syncForm2(submission).catch((err) => {
      logger.error('FEISHU', `Async sync form2 failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      versionNumber: submission.versionNumber,
      feishuSyncStatus: submission.feishuSyncStatus,
    };
  },
};
