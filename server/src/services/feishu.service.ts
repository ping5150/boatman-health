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
};
