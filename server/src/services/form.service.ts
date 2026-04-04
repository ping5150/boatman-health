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
  async getNextVersion(userId: string, formType: 'form1' | 'form2'): Promise<number> {
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
    userId: string,
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
  async getForm1List(userId: string): Promise<BookingListItem[]> {
    const list = await prisma.form1Submission.findMany({
      where: { userId, status: { not: 'cancelled' } },
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
        status: true,
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
      status: (item.status || 'active') as 'active' | 'cancelled',
    }));
  },

  /**
   * 获取单个预约详情
   */
  async getForm1Detail(userId: string, id: number): Promise<BookingDetail> {
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
      status: (submission.status || 'active') as 'active' | 'cancelled',
      cancelledAt: submission.cancelledAt?.toISOString() || null,
    };
  },

  /**
   * 取消预约
   */
  async cancelForm1(userId: string, id: number): Promise<{ id: number; orderNo: string; status: string }> {
    const submission = await prisma.form1Submission.findFirst({
      where: { id, userId },
    });

    if (!submission) {
      throw { code: 404, message: '预约记录不存在' };
    }

    if (submission.status === 'cancelled') {
      throw { code: 400, message: '预约已取消' };
    }

    const updated = await prisma.form1Submission.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    logger.info('FORM', `Form1 cancelled: userId=${userId}, orderNo=${submission.orderNo}, id=${id}`);

    return {
      id: updated.id,
      orderNo: updated.orderNo,
      status: updated.status,
    };
  },

  /**
   * 更新预约（原地修改，以订单编号为维度）
   */
  async updateForm1(
    userId: string,
    id: number,
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
      where: { id, userId },
    });

    if (!original) {
      throw { code: 404, message: '预约记录不存在' };
    }

    if (original.status === 'cancelled') {
      throw { code: 400, message: '已取消的预约不可编辑' };
    }

    // 构建更新数据（仅更新传入的字段）
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.consultationType !== undefined) updateData.consultationType = data.consultationType;
    if (data.preferredDate !== undefined) updateData.preferredDate = data.preferredDate;
    if (data.preferredTime !== undefined) updateData.preferredTime = data.preferredTime;
    if (data.brief !== undefined) updateData.brief = data.brief;

    // 原地更新记录，保持 id、orderNo、versionNumber 不变
    const submission = await prisma.form1Submission.update({
      where: { id },
      data: updateData,
    });

    logger.info('FORM', `Form1 updated (in-place): userId=${userId}, orderNo=${original.orderNo}, id=${id}`);

    // 异步触发飞书同步（已有飞书记录则更新，否则新建）
    feishuService.updateForm1(submission).catch((err) => {
      logger.error('FEISHU', `Async update form1 failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      versionNumber: submission.versionNumber,
      consultationType: submission.consultationType,
      preferredDate: submission.preferredDate,
      preferredTime: submission.preferredTime,
    };
  },

  /**
   * 提交健康评估表单（表单2）
   */
  async submitForm2(userId: string, formData: HealthFormData) {
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
   * 保存草稿（查找已有档案则覆盖更新，否则创建新记录）
   */
  async saveDraft(userId: string, formData: Partial<HealthFormData>) {
    // 先查找用户是否已有档案记录
    const existing = await prisma.form2Submission.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    if (existing) {
      // 已有档案：合并数据后原地更新，保持 id 和 orderNo 不变
      const existingFormData = JSON.parse(existing.formData) as HealthFormData;
      const mergedFormData = { ...existingFormData, ...formData };
      const name = mergedFormData.name || existing.name;
      const phone = mergedFormData.phone || existing.phone;

      const updated = await prisma.form2Submission.update({
        where: { id: existing.id },
        data: {
          name,
          phone,
          formData: JSON.stringify(mergedFormData),
        },
      });

      logger.info('FORM', `Form2 draft updated: userId=${userId}, id=${updated.id}, orderNo=${updated.orderNo}`);

      // 异步触发飞书同步（不阻塞响应）
      feishuService.updateForm2(updated).catch((err) => {
        logger.error('FEISHU', `Async sync form2 draft failed: id=${updated.id}`, err);
      });

      return {
        id: updated.id,
        orderNo: updated.orderNo,
        submittedAt: updated.submittedAt.toISOString(),
        versionNumber: updated.versionNumber,
      };
    }

    // 无已有档案：创建新记录
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

    logger.info('FORM', `Form2 draft created: userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, id=${submission.id}`);

    // 异步触发飞书同步（不阻塞响应）
    feishuService.syncForm2(submission).catch((err) => {
      logger.error('FEISHU', `Async sync form2 draft failed: id=${submission.id}`, err);
    });

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
  async getForm2List(userId: string): Promise<ArchiveListItem[]> {
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
  async getForm2Detail(userId: string, id: number): Promise<ArchiveDetail> {
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
  async getForm2Latest(userId: string): Promise<ArchiveDetail | null> {
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
   * 更新档案（原地覆盖更新，保持 id 和 orderNo 不变）
   */
  async updateForm2(userId: string, id: number, data: Partial<HealthFormData>) {
    const original = await prisma.form2Submission.findFirst({
      where: { id, userId },
    });

    if (!original) {
      throw { code: 404, message: '档案记录不存在' };
    }

    const existingFormData = JSON.parse(original.formData) as HealthFormData;
    const updatedFormData = { ...existingFormData, ...data };

    // 原地更新记录，保持 id、orderNo、versionNumber 不变
    const submission = await prisma.form2Submission.update({
      where: { id },
      data: {
        name: updatedFormData.name,
        phone: updatedFormData.phone,
        formData: JSON.stringify(updatedFormData),
      },
    });

    logger.info('FORM', `Form2 updated (in-place): userId=${userId}, id=${id}, orderNo=${submission.orderNo}`);

    // 异步触发飞书同步（已有飞书记录则更新，否则新建）
    feishuService.updateForm2(submission).catch((err) => {
      logger.error('FEISHU', `Async update form2 failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
    };
  },
};
