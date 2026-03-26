import prisma from '../config/database';
import { Form2Data } from '../models/common.types';
import { logger } from '../utils/logger';
import { feishuService } from './feishu.service';

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
      preferredTime: string;
      brief: string;
    },
  ) {
    const versionNumber = await this.getNextVersion(userId, 'form1');

    const submission = await prisma.form1Submission.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        consultationType: data.consultationType,
        preferredTime: data.preferredTime,
        brief: data.brief,
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('FORM', `Form1 submitted: userId=${userId}, version=${versionNumber}, id=${submission.id}`);

    // 异步触发飞书同步（不阻塞响应）
    feishuService.syncForm1(submission).catch((err) => {
      logger.error('FEISHU', `Async sync form1 failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      versionNumber: submission.versionNumber,
      feishuSyncStatus: submission.feishuSyncStatus,
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
