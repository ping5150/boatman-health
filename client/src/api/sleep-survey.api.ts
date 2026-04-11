import api from '@/lib/axios';

// ==================== 类型定义 ====================

/** 睡眠问卷表单数据 */
export interface SleepSurveyData {
  name: string;
  phone: string;
  bedtime?: string;
  sleepLatency?: string;
  wakeTime?: string;
  sleepDurationHours?: number;
  sleepDurationMinutes?: number;
  cantFallAsleep30min?: string;
  wakeUpEarly?: string;
  getUpToilet?: string;
  breathingDiscomfort?: string;
  coughSnore?: string;
  feelCold?: string;
  feelHot?: string;
  nightmares?: string;
  pain?: string;
  otherSleepIssues?: string;
  sleepQualityRating?: string;
  sleepMedication?: string;
  stayAwakeDifficulty?: string;
  taskCompletionDifficulty?: string;
  sleepPartner?: string;
  snoring?: string;
  breathingPause?: string;
  legTwitch?: string;
  disorientation?: string;
  otherRestlessSleep?: string;
}

/** 睡眠问卷列表项 */
export interface SleepSurveyListItem {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuSyncStatus: 'success' | 'pending' | 'failed';
}

/** 睡眠问卷详情 */
export interface SleepSurveyDetail extends SleepSurveyListItem {
  userId: string;
  feishuRecordId: string | null;
  formData: SleepSurveyData;
}

/** 提交响应 */
interface SurveySubmitResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    orderNo: string;
    submittedAt: string;
    versionNumber: number;
  };
}

// ==================== API 方法 ====================

/**
 * 提交睡眠问卷
 */
export const submitSleepSurvey = async (data: SleepSurveyData): Promise<SurveySubmitResponse> => {
  const res = await api.post('/sleep-survey', data);
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '问卷提交成功',
    data: {
      id: result.id,
      orderNo: result.orderNo,
      submittedAt: result.submittedAt,
      versionNumber: result.versionNumber,
    },
  };
};

/**
 * 获取用户问卷列表
 */
export const getSleepSurveyList = async (): Promise<SleepSurveyListItem[]> => {
  const res = await api.get('/sleep-survey');
  return res.data.data || [];
};

/**
 * 获取问卷详情
 */
export const getSleepSurveyDetail = async (id: number): Promise<SleepSurveyDetail> => {
  const res = await api.get(`/sleep-survey/${id}`);
  return res.data.data;
};

/**
 * 获取用户最新问卷
 */
export const getLatestSleepSurvey = async (): Promise<SleepSurveyDetail | null> => {
  const res = await api.get('/sleep-survey/latest');
  return res.data.data;
};

/**
 * 更新问卷
 */
export const updateSleepSurvey = async (
  id: number,
  data: Partial<SleepSurveyData>
): Promise<SurveySubmitResponse> => {
  const res = await api.put(`/sleep-survey/${id}`, data);
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '问卷更新成功',
    data: {
      id: result.id,
      orderNo: result.orderNo,
      submittedAt: result.submittedAt,
      versionNumber: result.versionNumber,
    },
  };
};

/**
 * 保存草稿
 */
export const saveSleepDraft = async (
  data: Partial<SleepSurveyData>,
  existingId?: number
): Promise<SurveySubmitResponse> => {
  if (existingId) {
    return updateSleepSurvey(existingId, data);
  }
  const res = await api.post('/sleep-survey/draft', data);
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '草稿保存成功',
    data: {
      id: result.id,
      orderNo: result.orderNo,
      submittedAt: result.submittedAt,
      versionNumber: result.versionNumber,
    },
  };
};
