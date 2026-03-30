import axios from 'axios';
import prisma from '../config/database';
import { feishuConfig } from '../config/feishu';
import { HealthFormData } from '../models/common.types';
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

/**
 * 同步结果类型
 */
interface SyncResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
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
 * 用户字段映射：数据库记录 → 飞书表格字段
 */
const mapUserToFeishu = (user: {
  id: number;
  username: string;
  phone: string;
  role: string;
  gender: string | null;
  birthDate: string | null;
  emergencyName: string | null;
  emergencyRelation: string | null;
  emergencyPhone: string | null;
  createdAt: Date;
}): Record<string, unknown> => ({
  '用户ID': String(user.id),
  '用户名': user.username,
  '手机号': user.phone,
  '角色': user.role,
  '性别': user.gender || '',
  '出生日期': user.birthDate || '',
  '紧急联系人': user.emergencyName || '',
  '紧急联系人关系': user.emergencyRelation || '',
  '紧急联系人电话': user.emergencyPhone || '',
  '注册时间': user.createdAt.getTime(),
});

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
  name: string;
  phone: string;
  formData: string;
  submittedAt: Date;
  versionNumber: number;
}): Record<string, unknown> => {
  const formData: HealthFormData = JSON.parse(submission.formData);
  return {
    '用户ID': String(submission.userId),
    '姓名': formData.name || submission.name,
    '联系电话': formData.phone || submission.phone,
    '紧急联系人': formData.emergencyName || '',
    '紧急联系人电话': formData.emergencyPhone || '',
    '主要疾病': formData.diseases?.map((d) => d.name).join('，') || '',
    '目前用药': formData.medications?.map((m) => m.name).join('，') || '',
    '过敏史': formData.allergy?.detail || '无',
    '手术史': formData.surgery?.detail || '无',
    '血管评估': formData.vascular?.qualified === 'yes' ? '合格' : '不合格',
    '家族史': formData.familyHistory?.join('，') || '',
    '饮食模式': formData.dietModes?.join('，') || '',
    '运动类型': formData.exerciseTypes?.join('，') || '',
    '睡眠时长': formData.sleepDuration || '',
    '睡眠质量': formData.sleepQuality || '',
    '压力自评': formData.stressLevel || 5,
    '焦虑频率': formData.anxietyFrequency || '',
    '脑雾症状': formData.brainFog?.join('，') || '',
    '健康关注点': formData.healthConcerns || '',
    '提交时间': submission.submittedAt.getTime(),
    '版本号': submission.versionNumber,
    '完整数据': JSON.stringify(formData),
  };
};

export const feishuService = {
  /**
   * 同步用户到飞书
   */
  async syncUser(user: {
    id: number;
    username: string;
    phone: string;
    role: string;
    gender: string | null;
    birthDate: string | null;
    emergencyName: string | null;
    emergencyRelation: string | null;
    emergencyPhone: string | null;
    createdAt: Date;
  }) {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping user sync');
      return;
    }

    try {
      const fields = mapUserToFeishu(user);
      const recordId = await createRecord(
        feishuConfig.user.appToken,
        feishuConfig.user.tableId,
        fields,
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          feishuSyncStatus: 'success',
          feishuRecordId: recordId,
        },
      });

      logger.info('FEISHU', `Sync success: table=user, recordId=${user.id}, feishuRecordId=${recordId}`);
    } catch (err) {
      await prisma.user.update({
        where: { id: user.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Sync failed: table=user, recordId=${user.id}`, err);
      throw err;
    }
  },

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
    name: string;
    phone: string;
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
   * 统一重试同步方法
   */
  async retrySync(table: 'user' | 'form1' | 'form2', recordId: number) {
    if (table === 'user') {
      return this.retrySyncUser(recordId);
    } else if (table === 'form1') {
      return this.retrySyncForm1(recordId);
    } else {
      return this.retrySyncForm2(recordId);
    }
  },

  /**
   * 重试同步用户
   */
  async retrySyncUser(recordId: number) {
    const user = await prisma.user.findUnique({
      where: { id: recordId },
    });

    if (!user) {
      throw { code: 404, message: '用户不存在' };
    }

    // 只允许重试普通用户
    if (user.role !== 'user') {
      throw { code: 400, message: '只能同步普通用户，管理员和业务员不需要同步到飞书' };
    }

    if (user.feishuSyncStatus !== 'failed') {
      throw { code: 400, message: '该用户同步状态不是失败，无需重试' };
    }

    // 重置状态为 pending
    await prisma.user.update({
      where: { id: recordId },
      data: { feishuSyncStatus: 'pending' },
    });

    await this.syncUser(user);

    const updated = await prisma.user.findUnique({
      where: { id: recordId },
      select: { feishuSyncStatus: true, feishuRecordId: true },
    });

    return {
      syncStatus: updated?.feishuSyncStatus,
      feishuRecordId: updated?.feishuRecordId,
    };
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

  /**
   * 一键同步用户
   */
  async syncAllUsers(): Promise<SyncResult> {
    const result: SyncResult = { total: 0, success: 0, failed: 0, errors: [] };

    // 只同步普通用户（role=user）
    const users = await prisma.user.findMany({
      where: {
        role: 'user',
        feishuSyncStatus: { in: ['pending', 'failed'] },
      },
    });

    result.total = users.length;

    for (const user of users) {
      try {
        await this.syncUser(user);
        result.success++;
      } catch (err) {
        result.failed++;
        const errMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`用户ID ${user.id}: ${errMsg}`);
      }
    }

    logger.info('FEISHU', `Batch sync users: total=${result.total}, success=${result.success}, failed=${result.failed}`);
    return result;
  },

  /**
   * 一键同步预约（表单1）
   */
  async syncAllForm1(): Promise<SyncResult> {
    const result: SyncResult = { total: 0, success: 0, failed: 0, errors: [] };

    const submissions = await prisma.form1Submission.findMany({
      where: {
        feishuSyncStatus: { in: ['pending', 'failed'] },
      },
    });

    result.total = submissions.length;

    for (const submission of submissions) {
      try {
        await this.syncForm1(submission);
        result.success++;
      } catch (err) {
        result.failed++;
        const errMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`预约ID ${submission.id}: ${errMsg}`);
      }
    }

    logger.info('FEISHU', `Batch sync form1: total=${result.total}, success=${result.success}, failed=${result.failed}`);
    return result;
  },

  /**
   * 一键同步档案（表单2）
   */
  async syncAllForm2(): Promise<SyncResult> {
    const result: SyncResult = { total: 0, success: 0, failed: 0, errors: [] };

    const submissions = await prisma.form2Submission.findMany({
      where: {
        feishuSyncStatus: { in: ['pending', 'failed'] },
      },
    });

    result.total = submissions.length;

    for (const submission of submissions) {
      try {
        await this.syncForm2(submission);
        result.success++;
      } catch (err) {
        result.failed++;
        const errMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`档案ID ${submission.id}: ${errMsg}`);
      }
    }

    logger.info('FEISHU', `Batch sync form2: total=${result.total}, success=${result.success}, failed=${result.failed}`);
    return result;
  },
};
