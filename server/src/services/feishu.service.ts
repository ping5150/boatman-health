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
 * 检查飞书 API 响应，若 code !== 0 则抛出详细错误
 */
const checkFeishuResponse = (response: { data: { code: number; msg: string; data?: unknown } }, context: string) => {
  const { code, msg } = response.data;
  if (code !== 0) {
    const detail = JSON.stringify(response.data);
    throw new Error(`[Feishu API Error] ${context}: code=${code}, msg=${msg}, detail=${detail}`);
  }
};

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

  checkFeishuResponse(response, `createRecord(table=${tableId})`);
  return response.data.data.record.record_id;
};

/**
 * 更新飞书多维表格记录
 */
const updateRecord = async (
  appToken: string,
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>,
): Promise<void> => {
  const token = await tokenManager.getToken();
  const response = await axios.put(
    `${feishuConfig.baseUrl}/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
    { fields },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  checkFeishuResponse(response, `updateRecord(table=${tableId}, record=${recordId})`);
};

/**
 * 日期格式化：将 Date 对象转为 "YYYY-MM-DD HH:mm:ss" 字符串
 * 飞书多维表格中日期相关字段为多行文本类型，需传字符串
 */
const formatDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${M}-${d} ${h}:${m}:${s}`;
};

/**
 * 日期格式化：将 Date 对象转为 Unix 时间戳（毫秒）
 * 用于飞书多维表格中「日期」类型的字段（预约表的预约时间）
 */
const formatDateTs = (date: Date): number => {
  return date.getTime();
};

/**
 * 用户字段映射：数据库记录 → 飞书表格字段
 */
const mapUserToFeishu = (user: {
  id: string;
  username: string;
  phone: string;
  role: string;
  gender: string | null;
  birthDate: string | null;
  emergencyName: string | null;
  emergencyRelation: string | null;
  emergencyPhone: string | null;
  createdAt: Date;
}): Record<string, unknown> => {
  // 基础字段：注册时必定有值的字段
  const fields: Record<string, unknown> = {
    '用户ID': user.id,
    '用户名': user.username,
    '手机号': user.phone,
    '注册时间': formatDateStr(user.createdAt),
  };

  // 角色映射：英文 → 中文
  const roleMap: Record<string, string> = {
    user: '普通用户',
    admin: '管理员',
    salesman: '业务员',
  };
  fields['角色'] = user.role
    .split(',')
    .map(r => roleMap[r.trim()] || r.trim())
    .join(',');

  // 以下字段仅在有值时才同步，避免传空字符串给飞书
  if (user.gender) {
    fields['性别'] = user.gender;
  }
  if (user.birthDate) {
    const bd = new Date(user.birthDate);
    if (!isNaN(bd.getTime())) {
      fields['出生日期'] = formatDateStr(bd);
    }
  }
  if (user.emergencyName) {
    fields['紧急联系人'] = user.emergencyName;
  }
  if (user.emergencyRelation) {
    fields['紧急联系人关系'] = user.emergencyRelation;
  }
  if (user.emergencyPhone) {
    fields['紧急联系人电话'] = user.emergencyPhone;
  }

  return fields;
};

/**
 * 表单1字段映射：数据库记录 → 飞书表格字段
 */
const mapForm1ToFeishu = (submission: {
  userId: string;
  orderNo: string;
  name: string;
  phone: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  brief: string;
  submittedAt: Date;
  versionNumber: number;
}): Record<string, unknown> => {
  const fields: Record<string, unknown> = {
    '用户ID': submission.userId,
    '提交时间': formatDateStr(submission.submittedAt),
    '版本号': submission.versionNumber,
  };

  if (submission.orderNo) {
    fields['订单编号'] = submission.orderNo;
  }
  if (submission.name) {
    fields['姓名'] = submission.name;
  }
  if (submission.phone) {
    fields['联系电话'] = submission.phone;
  }
  if (submission.consultationType) {
    fields['咨询类型'] = submission.consultationType;
  }
  if (submission.preferredDate) {
    fields['预约日期'] = submission.preferredDate;
  }
  if (submission.brief) {
    fields['简要说明'] = submission.brief;
  }

  // 预约时间：拼接日期+时间，格式化为字符串（飞书多行文本类型）
  if (submission.preferredDate && submission.preferredTime) {
    const timeStr = submission.preferredTime.split('-')[0];
    const dateTime = new Date(`${submission.preferredDate} ${timeStr}`);
    if (!isNaN(dateTime.getTime())) {
      fields['预约时间'] = formatDateStr(dateTime);
    }
  }

  return fields;
};

/**
 * 表单2字段映射：数据库记录 → 飞书表格字段
 */
const mapForm2ToFeishu = (submission: {
  userId: string;
  orderNo: string;
  name: string;
  phone: string;
  formData: string;
  submittedAt: Date;
  updatedAt: Date;
}): Record<string, unknown> => {
  const formData: HealthFormData = JSON.parse(submission.formData);
  const fields: Record<string, unknown> = {
    '用户ID': submission.userId,
    '档案编号': submission.orderNo,
    '提交时间': formatDateStr(submission.submittedAt),
    '最近更新时间': formatDateStr(submission.updatedAt),  // ① 替换版本号
  };

  const name = formData.name || submission.name;
  if (name) fields['姓名'] = name;

  const phone = formData.phone || submission.phone;
  if (phone) fields['联系电话'] = phone;

  if (formData.emergencyName) fields['紧急联系人'] = formData.emergencyName;
  if (formData.emergencyPhone) fields['紧急联系人电话'] = formData.emergencyPhone;

  // ② 当前疾病（原主要疾病）+ ⑥ 确诊时间
  if (formData.diseases && formData.diseases.length > 0) {
    fields['当前疾病'] = formData.diseases.map((d) => d.name).filter(Boolean).join('，');
    const diagnosedDates = formData.diseases.map((d) => d.date).filter(Boolean).join('，');
    if (diagnosedDates) fields['确诊时间'] = diagnosedDates;
  }

  const medications = formData.medications?.map((m) => m.name).filter(Boolean).join('，');
  if (medications) fields['目前用药'] = medications;

  if (formData.allergy?.detail) fields['过敏史'] = formData.allergy.detail;
  if (formData.surgery?.detail) fields['手术史'] = formData.surgery.detail;
  if (formData.vascular?.qualified) {
    fields['血管评估'] = formData.vascular.qualified === 'yes' ? '合格' : '不合格';
  }

  const familyHistory = formData.familyHistory?.join('，');
  if (familyHistory) fields['家族史'] = familyHistory;

  // ③ 饮食偏好（原饮食模式）
  const dietModes = formData.dietModes?.join('，');
  if (dietModes) fields['饮食偏好'] = dietModes;

  // ④ 常饮饮品（原饮品习惯，之前未写入）
  const drinks = formData.drinks?.join('，');
  if (drinks) fields['常饮饮品'] = drinks;

  if (formData.dietRestriction) {
    fields['饮食限制'] = Array.isArray(formData.dietRestriction)
      ? formData.dietRestriction.join('，')
      : formData.dietRestriction;
  }

  const exerciseTypes = formData.exerciseTypes?.join('，');
  if (exerciseTypes) fields['运动类型'] = exerciseTypes;

  // ⑤ 运动频率、运动时长（之前未写入）
  if (formData.exerciseFrequency) fields['运动频率'] = formData.exerciseFrequency;
  if (formData.exerciseDuration) fields['运动时长'] = formData.exerciseDuration;

  if (formData.sleepDuration) fields['睡眠时长'] = formData.sleepDuration;
  if (formData.sleepQuality) fields['睡眠质量'] = formData.sleepQuality;
  if (formData.stressLevel != null) fields['压力自评'] = String(formData.stressLevel);
  if (formData.anxietyFrequency) fields['焦虑频率'] = formData.anxietyFrequency;

  const brainFog = formData.brainFog?.join('，');
  if (brainFog) fields['脑雾症状'] = brainFog;

  if (formData.healthConcerns) fields['健康关注点'] = formData.healthConcerns;

  // 附件（最多支持 5 个，对应飞书列：附件1~附件5）
  if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
    formData.uploadedFiles.slice(0, 5).forEach((f: { name: string; url: string }, i: number) => {
      fields[`附件${i + 1}`] = { link: f.url, text: f.name };
    });
  }

  return fields;
};

export const feishuService = {
  /**
   * 同步用户到飞书
   */
  async syncUser(user: {
    id: string;
    username: string;
    phone: string;
    role: string;
    gender: string | null;
    birthDate: string | null;
    emergencyName: string | null;
    emergencyRelation: string | null;
    emergencyPhone: string | null;
    createdAt: Date;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping user sync');
      return;
    }

    // 新建前先查数据库最新状态，避免并发导致重复创建
    const latest = await prisma.user.findUnique({
      where: { id: user.id },
      select: { feishuRecordId: true },
    });
    if (latest?.feishuRecordId) {
      logger.info('FEISHU', `Skip sync user: id=${user.id} already has feishuRecordId=${latest.feishuRecordId}, use update instead`);
      return this.updateUser({ ...user, feishuRecordId: latest.feishuRecordId });
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
   * 更新用户到飞书（已有 feishuRecordId 时更新，否则新建）
   */
  async updateUser(user: {
    id: string;
    username: string;
    phone: string;
    role: string;
    gender: string | null;
    birthDate: string | null;
    emergencyName: string | null;
    emergencyRelation: string | null;
    emergencyPhone: string | null;
    createdAt: Date;
    feishuRecordId: string | null;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping user update');
      return;
    }

    // 如果没有飞书记录 ID，退化为新建
    if (!user.feishuRecordId) {
      return this.syncUser(user);
    }

    try {
      const fields = mapUserToFeishu(user);
      await updateRecord(
        feishuConfig.user.appToken,
        feishuConfig.user.tableId,
        user.feishuRecordId,
        fields,
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { feishuSyncStatus: 'success' },
      });

      logger.info('FEISHU', `Update success: table=user, recordId=${user.id}, feishuRecordId=${user.feishuRecordId}`);
    } catch (err) {
      await prisma.user.update({
        where: { id: user.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Update failed: table=user, recordId=${user.id}`, err);
      throw err;
    }
  },

  /**
   * 更新表单2到飞书（已有 feishuRecordId 时更新，否则新建）
   */
  async updateForm2(submission: {
    id: number;
    userId: string;
    orderNo: string;
    name: string;
    phone: string;
    formData: string;
    submittedAt: Date;
    updatedAt: Date;
    feishuRecordId: string | null;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping form2 update');
      return;
    }

    // 如果没有飞书记录 ID，退化为新建
    if (!submission.feishuRecordId) {
      return this.syncForm2(submission);
    }

    try {
      const fields = mapForm2ToFeishu(submission);
      await updateRecord(
        feishuConfig.form2.appToken,
        feishuConfig.form2.tableId,
        submission.feishuRecordId,
        fields,
      );

      await prisma.form2Submission.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'success' },
      });

      logger.info('FEISHU', `Update success: table=form2, recordId=${submission.id}, feishuRecordId=${submission.feishuRecordId}`);
    } catch (err) {
      // 飞书记录已被删除，降级为新建
      if (err instanceof Error && err.message.includes('code=1254043')) {
        logger.warn('FEISHU', `Record not found in feishu, fallback to create: table=form2, id=${submission.id}, oldRecordId=${submission.feishuRecordId}`);
        await prisma.form2Submission.update({
          where: { id: submission.id },
          data: { feishuRecordId: null },
        });
        const { feishuRecordId: _removed2, ...rest2 } = submission;
        return this.syncForm2(rest2);
      }

      await prisma.form2Submission.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Update failed: table=form2, recordId=${submission.id}`, err);
      throw err;
    }
  },

  /**
   * 同步表单1到飞书
   */
  async syncForm1(submission: {
    id: number;
    userId: string;
    orderNo: string;
    name: string;
    phone: string;
    consultationType: string;
    preferredDate: string;
    preferredTime: string;
    brief: string;
    submittedAt: Date;
    versionNumber: number;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping form1 sync');
      return;
    }

    // 新建前先查数据库最新状态，避免并发导致重复创建
    const latest = await prisma.form1Submission.findUnique({
      where: { id: submission.id },
      select: { feishuRecordId: true },
    });
    if (latest?.feishuRecordId) {
      logger.info('FEISHU', `Skip sync form1: id=${submission.id} already has feishuRecordId=${latest.feishuRecordId}, use update instead`);
      return this.updateForm1({ ...submission, feishuRecordId: latest.feishuRecordId });
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
   * 更新表单1到飞书（已有 feishuRecordId 时更新，否则新建）
   */
  async updateForm1(submission: {
    id: number;
    userId: string;
    orderNo: string;
    name: string;
    phone: string;
    consultationType: string;
    preferredDate: string;
    preferredTime: string;
    brief: string;
    submittedAt: Date;
    versionNumber: number;
    feishuRecordId: string | null;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping form1 update');
      return;
    }

    // 没有飞书记录ID，走新建流程
    if (!submission.feishuRecordId) {
      return this.syncForm1(submission);
    }

    try {
      const fields = mapForm1ToFeishu(submission);
      await updateRecord(
        feishuConfig.form1.appToken,
        feishuConfig.form1.tableId,
        submission.feishuRecordId,
        fields,
      );

      // 更新同步状态为成功
      await prisma.form1Submission.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'success' },
      });

      logger.info('FEISHU', `Update success: table=form1, recordId=${submission.id}, feishuRecordId=${submission.feishuRecordId}`);
    } catch (err) {
      // 飞书记录已被删除，降级为新建
      if (err instanceof Error && err.message.includes('code=1254043')) {
        logger.warn('FEISHU', `Record not found in feishu, fallback to create: table=form1, id=${submission.id}, oldRecordId=${submission.feishuRecordId}`);
        await prisma.form1Submission.update({
          where: { id: submission.id },
          data: { feishuRecordId: null },
        });
        const { feishuRecordId: _removed1, ...rest1 } = submission;
        return this.syncForm1(rest1);
      }

      await prisma.form1Submission.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Update failed: table=form1, recordId=${submission.id}`, err);
      throw err;
    }
  },

  /**
   * 同步表单2到飞书
   */
  async syncForm2(submission: {
    id: number;
    userId: string;
    orderNo: string;
    name: string;
    phone: string;
    formData: string;
    submittedAt: Date;
    updatedAt: Date;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping form2 sync');
      return;
    }

    // 新建前先查数据库最新状态，避免并发导致重复创建
    const latest = await prisma.form2Submission.findUnique({
      where: { id: submission.id },
      select: { feishuRecordId: true },
    });
    if (latest?.feishuRecordId) {
      logger.info('FEISHU', `Skip sync form2: id=${submission.id} already has feishuRecordId=${latest.feishuRecordId}, use update instead`);
      return this.updateForm2({ ...submission, feishuRecordId: latest.feishuRecordId });
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
  async retrySync(table: 'user' | 'form1' | 'form2', recordId: string | number) {
    if (table === 'user') {
      return this.retrySyncUser(recordId as string);
    } else if (table === 'form1') {
      return this.retrySyncForm1(recordId as number);
    } else {
      return this.retrySyncForm2(recordId as number);
    }
  },

  /**
   * 重试同步用户
   */
  async retrySyncUser(recordId: string) {
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

  // ==================== 睡眠问卷 ====================

  /**
   * 同步睡眠问卷到飞书
   */
  async syncSleepSurvey(submission: {
    id: number;
    userId: string;
    orderNo: string;
    name: string;
    phone: string;
    submittedAt: Date;
    feishuRecordId?: string | null;
    bedtime?: string | null;
    sleepLatency?: string | null;
    wakeTime?: string | null;
    sleepDurationHours?: number | null;
    sleepDurationMinutes?: number | null;
    cantFallAsleep30min?: string | null;
    wakeUpEarly?: string | null;
    getUpToilet?: string | null;
    breathingDiscomfort?: string | null;
    coughSnore?: string | null;
    feelCold?: string | null;
    feelHot?: string | null;
    nightmares?: string | null;
    pain?: string | null;
    otherSleepIssues?: string | null;
    sleepQualityRating?: string | null;
    sleepMedication?: string | null;
    stayAwakeDifficulty?: string | null;
    taskCompletionDifficulty?: string | null;
    sleepPartner?: string | null;
    snoring?: string | null;
    breathingPause?: string | null;
    legTwitch?: string | null;
    disorientation?: string | null;
    otherRestlessSleep?: string | null;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping sleep survey sync');
      return;
    }

    // 新建前先查数据库最新状态
    const latest = await prisma.sleepSurvey.findUnique({
      where: { id: submission.id },
      select: { feishuRecordId: true },
    });
    if (latest?.feishuRecordId) {
      logger.info('FEISHU', `Skip sync sleep survey: id=${submission.id} already has feishuRecordId, use update instead`);
      return this.updateSleepSurvey({ ...submission, feishuRecordId: latest.feishuRecordId } as any);
    }

    try {
      const fields: Record<string, unknown> = {
        '用户ID': submission.userId,
        '提交时间': formatDateStr(submission.submittedAt),
      };

      if (submission.orderNo) fields['问卷编号'] = submission.orderNo;
      if (submission.name) fields['姓名'] = submission.name;
      if (submission.phone) fields['联系电话'] = submission.phone;
      if (submission.bedtime) fields['上床睡觉时间'] = submission.bedtime;
      if (submission.sleepLatency) fields['入睡所需时长'] = submission.sleepLatency;
      if (submission.wakeTime) fields['起床时间'] = submission.wakeTime;
      if (submission.sleepDurationHours != null) fields['睡眠时长（小时）'] = String(submission.sleepDurationHours);
      if (submission.sleepDurationMinutes != null) fields['睡眠时长（分钟）'] = String(submission.sleepDurationMinutes);
      if (submission.cantFallAsleep30min) fields['不能在30min内入睡'] = submission.cantFallAsleep30min;
      if (submission.wakeUpEarly) fields['早醒'] = submission.wakeUpEarly;
      if (submission.getUpToilet) fields['起床上洗手间'] = submission.getUpToilet;
      if (submission.breathingDiscomfort) fields['不舒服的呼吸'] = submission.breathingDiscomfort;
      if (submission.coughSnore) fields['大声咳嗽或打鼾'] = submission.coughSnore;
      if (submission.feelCold) fields['感到寒冷'] = submission.feelCold;
      if (submission.feelHot) fields['感到太热'] = submission.feelHot;
      if (submission.nightmares) fields['做噩梦'] = submission.nightmares;
      if (submission.pain) fields['出现疼痛'] = submission.pain;
      if (submission.otherSleepIssues) fields['其他影响睡眠的事情'] = submission.otherSleepIssues;
      if (submission.sleepQualityRating) fields['睡眠质量评分'] = submission.sleepQualityRating;
      if (submission.sleepMedication) fields['使用催眠药物'] = submission.sleepMedication;
      if (submission.stayAwakeDifficulty) fields['难以保持清醒'] = submission.stayAwakeDifficulty;
      if (submission.taskCompletionDifficulty) fields['完成事情困难'] = submission.taskCompletionDifficulty;
      if (submission.sleepPartner) fields['是否与人同睡'] = submission.sleepPartner;
      if (submission.snoring) fields['打鼾声'] = submission.snoring;
      if (submission.breathingPause) fields['呼吸停顿'] = submission.breathingPause;
      if (submission.legTwitch) fields['腿部抽动'] = submission.legTwitch;
      if (submission.disorientation) fields['不能辨认方向'] = submission.disorientation;
      if (submission.otherRestlessSleep) fields['其他睡不安宁'] = submission.otherRestlessSleep;

      const recordId = await createRecord(
        feishuConfig.sleepSurvey.appToken,
        feishuConfig.sleepSurvey.tableId,
        fields,
      );

      await prisma.sleepSurvey.update({
        where: { id: submission.id },
        data: {
          feishuSyncStatus: 'success',
          feishuRecordId: recordId,
        },
      });

      logger.info('FEISHU', `Sync success: table=sleep_survey, recordId=${submission.id}, feishuRecordId=${recordId}`);
    } catch (err) {
      await prisma.sleepSurvey.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Sync failed: table=sleep_survey, recordId=${submission.id}`, err);
      throw err;
    }
  },

  /**
   * 更新睡眠问卷到飞书
   */
  async updateSleepSurvey(submission: {
    id: number;
    feishuRecordId: string | null;
    userId: string;
    orderNo: string;
    name: string;
    phone: string;
    submittedAt: Date;
    bedtime?: string | null;
    sleepLatency?: string | null;
    wakeTime?: string | null;
    sleepDurationHours?: number | null;
    sleepDurationMinutes?: number | null;
    cantFallAsleep30min?: string | null;
    wakeUpEarly?: string | null;
    getUpToilet?: string | null;
    breathingDiscomfort?: string | null;
    coughSnore?: string | null;
    feelCold?: string | null;
    feelHot?: string | null;
    nightmares?: string | null;
    pain?: string | null;
    otherSleepIssues?: string | null;
    sleepQualityRating?: string | null;
    sleepMedication?: string | null;
    stayAwakeDifficulty?: string | null;
    taskCompletionDifficulty?: string | null;
    sleepPartner?: string | null;
    snoring?: string | null;
    breathingPause?: string | null;
    legTwitch?: string | null;
    disorientation?: string | null;
    otherRestlessSleep?: string | null;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping sleep survey update');
      return;
    }

    if (!submission.feishuRecordId) {
      const { feishuRecordId, ...rest } = submission;
      return this.syncSleepSurvey(rest);
    }

    try {
      const fields: Record<string, unknown> = {
        '用户ID': submission.userId,
        '提交时间': formatDateStr(submission.submittedAt),
      };

      if (submission.orderNo) fields['问卷编号'] = submission.orderNo;
      if (submission.name) fields['姓名'] = submission.name;
      if (submission.phone) fields['联系电话'] = submission.phone;
      if (submission.bedtime) fields['上床睡觉时间'] = submission.bedtime;
      if (submission.sleepLatency) fields['入睡所需时长'] = submission.sleepLatency;
      if (submission.wakeTime) fields['起床时间'] = submission.wakeTime;
      if (submission.sleepDurationHours != null) fields['睡眠时长（小时）'] = String(submission.sleepDurationHours);
      if (submission.sleepDurationMinutes != null) fields['睡眠时长（分钟）'] = String(submission.sleepDurationMinutes);
      if (submission.cantFallAsleep30min) fields['不能在30min内入睡'] = submission.cantFallAsleep30min;
      if (submission.wakeUpEarly) fields['早醒'] = submission.wakeUpEarly;
      if (submission.getUpToilet) fields['起床上洗手间'] = submission.getUpToilet;
      if (submission.breathingDiscomfort) fields['不舒服的呼吸'] = submission.breathingDiscomfort;
      if (submission.coughSnore) fields['大声咳嗽或打鼾'] = submission.coughSnore;
      if (submission.feelCold) fields['感到寒冷'] = submission.feelCold;
      if (submission.feelHot) fields['感到太热'] = submission.feelHot;
      if (submission.nightmares) fields['做噩梦'] = submission.nightmares;
      if (submission.pain) fields['出现疼痛'] = submission.pain;
      if (submission.otherSleepIssues) fields['其他影响睡眠的事情'] = submission.otherSleepIssues;
      if (submission.sleepQualityRating) fields['睡眠质量评分'] = submission.sleepQualityRating;
      if (submission.sleepMedication) fields['使用催眠药物'] = submission.sleepMedication;
      if (submission.stayAwakeDifficulty) fields['难以保持清醒'] = submission.stayAwakeDifficulty;
      if (submission.taskCompletionDifficulty) fields['完成事情困难'] = submission.taskCompletionDifficulty;
      if (submission.sleepPartner) fields['是否与人同睡'] = submission.sleepPartner;
      if (submission.snoring) fields['打鼾声'] = submission.snoring;
      if (submission.breathingPause) fields['呼吸停顿'] = submission.breathingPause;
      if (submission.legTwitch) fields['腿部抽动'] = submission.legTwitch;
      if (submission.disorientation) fields['不能辨认方向'] = submission.disorientation;
      if (submission.otherRestlessSleep) fields['其他睡不安宁'] = submission.otherRestlessSleep;

      await updateRecord(
        feishuConfig.sleepSurvey.appToken,
        feishuConfig.sleepSurvey.tableId,
        submission.feishuRecordId,
        fields,
      );

      await prisma.sleepSurvey.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'success' },
      });

      logger.info('FEISHU', `Update success: table=sleep_survey, recordId=${submission.id}, feishuRecordId=${submission.feishuRecordId}`);
    } catch (err) {
      if (err instanceof Error && err.message.includes('code=1254043')) {
        logger.warn('FEISHU', `Record not found in feishu, fallback to create: table=sleep_survey, id=${submission.id}`);
        await prisma.sleepSurvey.update({
          where: { id: submission.id },
          data: { feishuRecordId: null },
        });
        const { feishuRecordId, ...rest } = submission;
        return this.syncSleepSurvey(rest);
      }

      await prisma.sleepSurvey.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Update failed: table=sleep_survey, recordId=${submission.id}`, err);
      throw err;
    }
  },

  // ==================== 营养问卷 ====================

  /**
   * 同步营养问卷到飞书
   */
  async syncNutritionSurvey(submission: {
    id: number;
    userId: string;
    orderNo: string;
    name: string;
    phone: string;
    submittedAt: Date;
    feishuRecordId?: string | null;
    [key: string]: unknown;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping nutrition survey sync');
      return;
    }

    const latest = await prisma.nutritionSurvey.findUnique({
      where: { id: submission.id },
      select: { feishuRecordId: true },
    });
    if (latest?.feishuRecordId) {
      logger.info('FEISHU', `Skip sync nutrition survey: id=${submission.id} already has feishuRecordId, use update instead`);
      return this.updateNutritionSurvey({ ...submission, feishuRecordId: latest.feishuRecordId } as any);
    }

    try {
      const fields = this.mapNutritionSurveyToFeishu(submission);
      const recordId = await createRecord(
        feishuConfig.nutritionSurvey.appToken,
        feishuConfig.nutritionSurvey.tableId,
        fields,
      );

      await prisma.nutritionSurvey.update({
        where: { id: submission.id },
        data: {
          feishuSyncStatus: 'success',
          feishuRecordId: recordId,
        },
      });

      logger.info('FEISHU', `Sync success: table=nutrition_survey, recordId=${submission.id}, feishuRecordId=${recordId}`);
    } catch (err) {
      await prisma.nutritionSurvey.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Sync failed: table=nutrition_survey, recordId=${submission.id}`, err);
      throw err;
    }
  },

  /**
   * 更新营养问卷到飞书
   */
  async updateNutritionSurvey(submission: {
    id: number;
    feishuRecordId: string | null;
    [key: string]: unknown;
  }): Promise<void> {
    if (!feishuConfig.isEnabled) {
      logger.warn('FEISHU', 'Feishu sync disabled (missing config), skipping nutrition survey update');
      return;
    }

    if (!submission.feishuRecordId) {
      const { feishuRecordId: _feishuRecordId, ...rest } = submission;
      return this.syncNutritionSurvey(rest as any);
    }

    try {
      const fields = this.mapNutritionSurveyToFeishu(submission);
      await updateRecord(
        feishuConfig.nutritionSurvey.appToken,
        feishuConfig.nutritionSurvey.tableId,
        submission.feishuRecordId,
        fields,
      );

      await prisma.nutritionSurvey.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'success' },
      });

      logger.info('FEISHU', `Update success: table=nutrition_survey, recordId=${submission.id}, feishuRecordId=${submission.feishuRecordId}`);
    } catch (err) {
      if (err instanceof Error && err.message.includes('code=1254043')) {
        logger.warn('FEISHU', `Record not found in feishu, fallback to create: table=nutrition_survey, id=${submission.id}`);
        await prisma.nutritionSurvey.update({
          where: { id: submission.id },
          data: { feishuRecordId: null },
        });
        const { feishuRecordId: _feishuRecordId, ...rest } = submission;
        return this.syncNutritionSurvey(rest as any);
      }

      await prisma.nutritionSurvey.update({
        where: { id: submission.id },
        data: { feishuSyncStatus: 'failed' },
      });

      logger.error('FEISHU', `Update failed: table=nutrition_survey, recordId=${submission.id}`, err);
      throw err;
    }
  },

  /**
   * 营养问卷字段映射（合并优化版）
   */
  mapNutritionSurveyToFeishu(submission: Record<string, unknown>): Record<string, unknown> {
    const fields: Record<string, unknown> = {
      '用户ID': submission.userId,
      '提交时间': submission.submittedAt ? formatDateStr(submission.submittedAt as Date) : undefined,
    };

    // 基础信息
    if (submission.orderNo) fields['问卷编号'] = submission.orderNo;
    if (submission.name) fields['姓名'] = submission.name;
    if (submission.phone) fields['联系电话'] = submission.phone;

    // 01 健康信息
    if (submission.consultationReason) fields['咨询原因'] = submission.consultationReason;
    if (submission.nutritionistSupportGoals) fields['营养师支持目标'] = submission.nutritionistSupportGoals;
    if (submission.height != null && submission.weight != null) {
      fields['身高体重'] = `${submission.height}cm / ${submission.weight}kg`;
    } else if (submission.height != null) {
      fields['身高体重'] = `${submission.height}cm`;
    } else if (submission.weight != null) {
      fields['身高体重'] = `${submission.weight}kg`;
    }
    if (submission.weightChange) {
      // 判断是否为"其他"值
      fields['体重变化'] = ['是', '否'].includes(submission.weightChange as string)
        ? submission.weightChange
        : `其他：${submission.weightChange}`;
    }
    if (submission.chronicDiseases) fields['慢性疾病'] = submission.chronicDiseases;
    if (submission.medicationsSupplements) fields['用药情况'] = submission.medicationsSupplements;

    // 02 饮食习惯（合并）
    const dietHabits: string[] = [];
    if (submission.dailyMeals) {
      // 判断是否为"其他"值
      const dailyMealsStr = ['1餐', '2餐', '3餐'].includes(submission.dailyMeals as string)
        ? submission.dailyMeals
        : `其他：${submission.dailyMeals}`;
      dietHabits.push(`每日${dailyMealsStr}餐`);
    }
    if (submission.breakfastHabit) dietHabits.push(`早餐: ${submission.breakfastHabit}`);
    if (dietHabits.length > 0) fields['饮食习惯'] = dietHabits.join('；');

    // 常吃零食（含"其他"）
    if (submission.commonSnacks || submission.commonSnacksOther) {
      const snacks = this.formatArrayWithOther(submission.commonSnacks, submission.commonSnacksOther);
      fields['常吃零食'] = snacks;
    }
    // 食物来源（含"其他"）
    if (submission.foodSources || submission.foodSourcesOther) {
      const sources = this.formatArrayWithOther(submission.foodSources, submission.foodSourcesOther);
      fields['食物来源'] = sources;
    }
    if (submission.foodAllergies) fields['食物过敏'] = submission.foodAllergies;
    if (submission.dislikedFoods) fields['不喜欢的食物'] = submission.dislikedFoods;
    if (submission.dietPlanType) fields['特殊饮食'] = submission.dietPlanType;

    // 典型饮食描述（合并工作日+周末）
    const typicalDiet: string[] = [];
    if (submission.typicalDietWorkday) typicalDiet.push(`工作日: ${submission.typicalDietWorkday}`);
    if (submission.typicalDietWeekend) typicalDiet.push(`周末: ${submission.typicalDietWeekend}`);
    if (submission.typicalDietDescription) typicalDiet.push(submission.typicalDietDescription as string);
    if (typicalDiet.length > 0) fields['典型饮食'] = typicalDiet.join('；');

    // 饮品频率（合并）
    const drinks: string[] = [];
    if (submission.drinkWater) drinks.push(`水: ${submission.drinkWater}`);
    if (submission.drinkCoffee) drinks.push(`咖啡: ${submission.drinkCoffee}`);
    if (submission.drinkTea) drinks.push(`茶: ${submission.drinkTea}`);
    if (submission.drinkMilk) drinks.push(`牛奶: ${submission.drinkMilk}`);
    if (submission.drinkPlantMilk) drinks.push(`植物奶: ${submission.drinkPlantMilk}`);
    if (submission.drinkMilkTea) drinks.push(`奶茶: ${submission.drinkMilkTea}`);
    if (submission.drinkSugarFree) drinks.push(`无糖饮料: ${submission.drinkSugarFree}`);
    if (submission.drinkSugary) drinks.push(`含糖饮料: ${submission.drinkSugary}`);
    if (submission.drinkEnergy) drinks.push(`能量饮料: ${submission.drinkEnergy}`);
    if (submission.drinkOther) drinks.push(`其他：${submission.drinkOther}`);
    if (drinks.length > 0) fields['饮品摄入'] = drinks.join('；');

    if (submission.highSaltSweat) fields['出汗含盐高'] = submission.highSaltSweat;
    if (submission.dietSatisfaction) fields['饮食满意度'] = submission.dietSatisfaction;

    // 运动习惯（合并）
    const exercise: string[] = [];
    if (submission.exerciseLevel) exercise.push(`水平: ${submission.exerciseLevel}`);
    if (submission.exerciseTypes) exercise.push(`类型: ${this.formatArray(submission.exerciseTypes)}`);
    if (submission.exerciseDuration) exercise.push(`时长: ${submission.exerciseDuration}`);
    if (submission.exerciseFrequency) exercise.push(`频率: ${submission.exerciseFrequency}`);
    if (submission.exerciseTime) exercise.push(`时间: ${submission.exerciseTime}`);
    if (exercise.length > 0) fields['运动习惯'] = exercise.join('；');

    if (submission.exerciseMotivation) fields['运动激励因素'] = submission.exerciseMotivation;
    if (submission.exerciseChallenges) fields['运动挑战'] = submission.exerciseChallenges;
    if (submission.exerciseGoals) fields['运动目标'] = submission.exerciseGoals;

    if (submission.hasExercisePartner) {
      const partner = submission.hasExercisePartner === 'yes' ? '是' : '否';
      if (submission.exercisePartnerDetail) {
        fields['运动伙伴'] = `${partner}（${submission.exercisePartnerDetail}）`;
      } else {
        fields['运动伙伴'] = partner;
      }
    }

    // 生活方式（合并）
    const lifestyle: string[] = [];
    if (submission.stressLevel) lifestyle.push(`压力: ${submission.stressLevel}`);
    if (submission.isSmoker) lifestyle.push(`吸烟: ${submission.isSmoker}`);
    if (submission.isDrinker) lifestyle.push(`饮酒: ${submission.isDrinker}`);
    if (lifestyle.length > 0) fields['生活方式'] = lifestyle.join('；');

    if (submission.smokingDetail) fields['吸烟详情'] = submission.smokingDetail;
    if (submission.drinkingDetail) fields['饮酒详情'] = submission.drinkingDetail;

    // 作息时间（合并）
    const sleepSchedule: string[] = [];
    if (submission.weekdayWakeTime) sleepSchedule.push(`起床: ${submission.weekdayWakeTime}`);
    if (submission.weekdaySleepTime) sleepSchedule.push(`睡觉: ${submission.weekdaySleepTime}`);
    if (sleepSchedule.length > 0) fields['作息时间'] = sleepSchedule.join('；');

    if (submission.morningState) fields['起床状态'] = submission.morningState;

    // 屏幕时间（合并）
    const screenTime: string[] = [];
    if (submission.screenTimeTv) screenTime.push(`电视: ${submission.screenTimeTv}`);
    if (submission.screenTimeReading) screenTime.push(`阅读: ${submission.screenTimeReading}`);
    if (submission.screenTimeElectronics) screenTime.push(`电子设备: ${submission.screenTimeElectronics}`);
    if (screenTime.length > 0) fields['屏幕时间'] = screenTime.join('；');

    if (submission.socialActivities || submission.socialActivitiesOther) {
      const activities = this.formatArrayWithOther(submission.socialActivities, submission.socialActivitiesOther);
      fields['社交活动'] = activities;
    }
    if (submission.otherFeedback) fields['其他反馈'] = submission.otherFeedback;

    // 饮食频率（合并为3个字段）
    // 谷薯与水果
    const grainFruit: string[] = [];
    if (submission.freqRice) grainFruit.push(`米饭: ${submission.freqRice}`);
    if (submission.freqNoodlesBread) grainFruit.push(`面食: ${submission.freqNoodlesBread}`);
    if (submission.freqWholeGrains) grainFruit.push(`全谷物: ${submission.freqWholeGrains}`);
    if (submission.freqFreshFruit) grainFruit.push(`水果: ${submission.freqFreshFruit}`);
    if (submission.freqFruitJuice) grainFruit.push(`果汁: ${submission.freqFruitJuice}`);
    if (submission.freqDriedFruit) grainFruit.push(`果干: ${submission.freqDriedFruit}`);
    if (grainFruit.length > 0) fields['谷薯水果'] = grainFruit.join('；');

    // 蔬菜与蛋白质
    const vegProtein: string[] = [];
    if (submission.freqLeafyVegetables) vegProtein.push(`绿叶菜: ${submission.freqLeafyVegetables}`);
    if (submission.freqStarchyVegetables) vegProtein.push(`淀粉菜: ${submission.freqStarchyVegetables}`);
    if (submission.freqOtherVegetables) vegProtein.push(`其他菜: ${submission.freqOtherVegetables}`);
    if (submission.freqEggs) vegProtein.push(`鸡蛋: ${submission.freqEggs}`);
    if (submission.freqPoultry) vegProtein.push(`家禽: ${submission.freqPoultry}`);
    if (submission.freqFishSeafood) vegProtein.push(`鱼虾: ${submission.freqFishSeafood}`);
    if (submission.freqBeansSoy) vegProtein.push(`豆类: ${submission.freqBeansSoy}`);
    if (submission.freqRedMeat) vegProtein.push(`红肉: ${submission.freqRedMeat}`);
    if (vegProtein.length > 0) fields['蔬菜蛋白'] = vegProtein.join('；');

    // 乳制品与零食
    const dairySnacks: string[] = [];
    if (submission.freqMilkDairy) dairySnacks.push(`牛奶: ${submission.freqMilkDairy}`);
    if (submission.freqYogurt) dairySnacks.push(`酸奶: ${submission.freqYogurt}`);
    if (submission.freqCheese) dairySnacks.push(`奶酪: ${submission.freqCheese}`);
    if (submission.freqNonDairyAlternatives) dairySnacks.push(`非乳制品: ${submission.freqNonDairyAlternatives}`);
    if (submission.freqNutsSeeds) dairySnacks.push(`坚果: ${submission.freqNutsSeeds}`);
    if (submission.freqCookiesCake) dairySnacks.push(`糕点: ${submission.freqCookiesCake}`);
    if (submission.freqChocolateCandy) dairySnacks.push(`糖果: ${submission.freqChocolateCandy}`);
    if (submission.freqSaltySnacks) dairySnacks.push(`咸零食: ${submission.freqSaltySnacks}`);
    if (dairySnacks.length > 0) fields['乳制品零食'] = dairySnacks.join('；');

    // 附件（饮食习惯中上传的文件，最多支持 10 个）
    if (submission.uploadedDietFiles) {
      // 解析 JSON 字符串（数据库存储为字符串）
      let files: Array<{ name: string; url: string }> = [];
      if (typeof submission.uploadedDietFiles === 'string') {
        try {
          files = JSON.parse(submission.uploadedDietFiles);
        } catch {
          files = [];
        }
      } else if (Array.isArray(submission.uploadedDietFiles)) {
        files = submission.uploadedDietFiles;
      }
      // 同步到飞书
      files.slice(0, 10).forEach((f, i) => {
        if (f.url && f.name) {
          fields[`附件${i + 1}`] = { link: f.url, text: f.name };
        }
      });
    }

    return fields;
  },

  /**
   * 格式化数组为字符串
   * 支持多种输入格式：数组、JSON字符串、逗号分隔字符串
   */
  formatArray(value: unknown): string {
    if (Array.isArray(value)) {
      return value.join('、');
    }
    if (typeof value === 'string' && value.trim()) {
      // 尝试解析 JSON 字符串
      if (value.startsWith('[')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.join('、');
          }
        } catch {
          // JSON 解析失败，返回原字符串
        }
      }
      // 按逗号分隔处理
      const items = value.split(',').map(s => s.trim()).filter(Boolean);
      return items.join('、');
    }
    return String(value);
  },

  /**
   * 格式化数组字段，并添加"其他"内容
   * 过滤掉数组中的"其他"选项，用 otherValue 替代显示
   * 支持多种输入格式：数组、JSON字符串、逗号分隔字符串
   */
  formatArrayWithOther(mainValue: unknown, otherValue: unknown): string {
    const items: string[] = [];
    
    // 解析 mainValue（可能是数组、JSON字符串或逗号分隔字符串）
    let parsedArray: string[] = [];
    if (Array.isArray(mainValue) && mainValue.length > 0) {
      parsedArray = mainValue;
    } else if (typeof mainValue === 'string' && mainValue.trim()) {
      // 尝试解析 JSON 字符串
      if (mainValue.startsWith('[')) {
        try {
          const parsed = JSON.parse(mainValue);
          if (Array.isArray(parsed)) {
            parsedArray = parsed;
          }
        } catch {
          // JSON 解析失败，尝试按逗号分隔
          parsedArray = mainValue.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else {
        // 按逗号分隔
        parsedArray = mainValue.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    
    // 过滤掉"其他"选项，避免重复显示
    const filtered = parsedArray.filter(item => item !== '其他');
    items.push(...filtered);
    
    // 添加"其他"内容（如果有实际输入）
    if (otherValue && String(otherValue).trim()) {
      items.push(`其他：${String(otherValue).trim()}`);
    }
    return items.join('、');
  },
};
