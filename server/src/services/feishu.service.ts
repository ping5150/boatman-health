import axios from 'axios';
import prisma from '../config/database';
import { feishuConfig } from '../config/feishu';
import { Form2Data } from '../models/common.types';
import { logger } from '../utils/logger';

/**
 * 飞书 Token 管理器
 * 缓存 tenant_access_token，2 小时有效，提前 5 分钟续期
 */
class FeishuTokenManager {
  private token: string | null = null;
  private expiresAt = 0;

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }

    const response = await axios.post(
      `${feishuConfig.baseUrl}/auth/v3/tenant_access_token/internal`,
      {
        app_id: feishuConfig.appId,
        app_secret: feishuConfig.appSecret,
      },
    );

    this.token = response.data.tenant_access_token;
    // 提前 5 分钟续期
    this.expiresAt = Date.now() + (response.data.expire - 300) * 1000;

    logger.info('FEISHU', 'Token refreshed successfully');
    return this.token!;
  }
}

const tokenManager = new FeishuTokenManager();

/**
 * 写入飞书多维表格记录
 */
const createRecord = async (
  appToken: string,
  tableId: string,
  fields: Record<string, unknown>,
): Promise<string> => {
  const token = await tokenManager.getToken();
  const response = await axios.post(
    `${feishuConfig.baseUrl}/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
    { fields },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data.data.record.record_id;
};

/**
 * 表单1字段映射：数据库记录 → 飞书表格字段
 */
const mapForm1ToFeishu = (submission: {
  userId: number;
  orderNo: string;
  name: string;
  phone: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  brief: string;
  submittedAt: Date;
  versionNumber: number;
}): Record<string, unknown> => ({
  '用户ID': String(submission.userId),
  '订单编号': submission.orderNo,
  '姓名': submission.name,
  '联系电话': submission.phone,
  '咨询类型': submission.consultationType,
  '预约日期': submission.preferredDate,
  '预约时间': submission.preferredTime,
  '简要说明': submission.brief,
  '提交时间': submission.submittedAt.getTime(),
  '版本号': submission.versionNumber,
  '完整数据': JSON.stringify(submission),
});

/**
 * 表单2字段映射：数据库记录 → 飞书表格字段
 */
const mapForm2ToFeishu = (submission: {
  userId: number;
  formData: string;
  submittedAt: Date;
  versionNumber: number;
}): Record<string, unknown> => {
  const formData: Form2Data = JSON.parse(submission.formData);
  return {
    '用户ID': String(submission.userId),
    '姓名': formData.basicInfo.name,
    '联系电话': formData.basicInfo.phone,
    '客户号': formData.basicInfo.customerId,
    '紧急联系人': formData.basicInfo.emergencyContact.name,
    '紧急联系电话': formData.basicInfo.emergencyContact.phone,
    '主要疾病': formData.healthBackground.currentDiseases
      .map((d) => d.diagnosis)
      .join('，'),
    '过敏史': formData.healthBackground.allergyHistory.details ?? '无',
    '血管评估结果': formData.healthBackground.vascularAssessment.result,
    '压力自评': formData.lifestyle.stress.stressScore,
    '提交时间': submission.submittedAt.getTime(),
    '版本号': submission.versionNumber,
    '完整数据': JSON.stringify(formData),
  };
};

export const feishuService = {
  /**
   * 同步表单1到飞书
   */
  async syncForm1(submission: {
    id: number;
    userId: number;
    orderNo: string;
    name: string;
    phone: string;
    consultationType: string;
    preferredDate: string;
    preferredTime: string;
    brief: string;
    submittedAt: Date;
    versionNumber: number;
  }) {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping form1 sync');
      return;
    }

    try {
      const fields = mapForm1ToFeishu(submission);
      const recordId = await createRecord(
        feishuConfig.form1.appToken,
        feishuConfig.form1.tableId,
        fields,
      );

      await prisma.form1Submission.update({
        where: { id: submission.id },
        data: {
          feishuSyncStatus: 'success',
          feishuRecordId: recordId,
        },
      });

      logger.info('FEISHU', `Sync success: table=form1, recordId=${submission.id}, feishuRecordId=${recordId}`);
    } catch (err) {
      await prisma.form1Submission.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Sync failed: table=form1, recordId=${submission.id}`, err);
      throw err;
    }
  },

  /**
   * 同步表单2到飞书
   */
  async syncForm2(submission: {
    id: number;
    userId: number;
    formData: string;
    submittedAt: Date;
    versionNumber: number;
  }) {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping form2 sync');
      return;
    }

    try {
      const fields = mapForm2ToFeishu(submission);
      const recordId = await createRecord(
        feishuConfig.form2.appToken,
        feishuConfig.form2.tableId,
        fields,
      );

      await prisma.form2Submission.update({
        where: { id: submission.id },
        data: {
          feishuSyncStatus: 'success',
          feishuRecordId: recordId,
        },
      });

      logger.info('FEISHU', `Sync success: table=form2, recordId=${submission.id}, feishuRecordId=${recordId}`);
    } catch (err) {
      await prisma.form2Submission.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Sync failed: table=form2, recordId=${submission.id}`, err);
      throw err;
    }
  },

  /**
   * 重试同步失败的记录
   */
  async retrySyncForm1(recordId: number) {
    const submission = await prisma.form1Submission.findUnique({
      where: { id: recordId },
    });

    if (!submission) {
      throw { code: 404, message: '记录不存在' };
    }

    if (submission.feishuSyncStatus !== 'failed') {
      throw { code: 400, message: '该记录同步状态不是失败，无需重试' };
    }

    // 重置状态为 pending
    await prisma.form1Submission.update({
      where: { id: recordId },
      data: { feishuSyncStatus: 'pending' },
    });

    await this.syncForm1(submission);

    // 返回最新状态
    const updated = await prisma.form1Submission.findUnique({
      where: { id: recordId },
      select: { feishuSyncStatus: true, feishuRecordId: true },
    });

    return {
      syncStatus: updated?.feishuSyncStatus,
      feishuRecordId: updated?.feishuRecordId,
    };
  },

  /**
   * 重试同步失败的记录（表单2）
   */
  async retrySyncForm2(recordId: number) {
    const submission = await prisma.form2Submission.findUnique({
      where: { id: recordId },
    });

    if (!submission) {
      throw { code: 404, message: '记录不存在' };
    }

    if (submission.feishuSyncStatus !== 'failed') {
      throw { code: 400, message: '该记录同步状态不是失败，无需重试' };
    }

    // 重置状态为 pending
    await prisma.form2Submission.update({
      where: { id: recordId },
      data: { feishuSyncStatus: 'pending' },
    });

    await this.syncForm2(submission);

    const updated = await prisma.form2Submission.findUnique({
      where: { id: recordId },
      select: { feishuSyncStatus: true, feishuRecordId: true },
    });

    return {
      syncStatus: updated?.feishuSyncStatus,
      feishuRecordId: updated?.feishuRecordId,
    };
  },
};
