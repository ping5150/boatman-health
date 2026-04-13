import api from '@/lib/axios';

// ==================== 类型定义 ====================

/** 营养问卷表单数据 */
export interface NutritionSurveyData {
  name: string;
  phone: string;
  // 01 健康信息
  consultationReason?: string;
  nutritionistSupportGoals?: string;
  height?: number;
  weight?: number;
  weightChange?: string;
  chronicDiseases?: string;
  medicationsSupplements?: string;
  // 02 饮食习惯（1/4）
  dailyMeals?: string;
  breakfastHabit?: string;
  commonSnacks?: string[];
  commonSnacksOther?: string;
  foodSources?: string[];
  foodSourcesOther?: string;
  foodAllergies?: string;
  // 03 饮食习惯（2/4）
  dislikedFoods?: string;
  dietPlanType?: string;
  typicalDietWorkday?: string;
  typicalDietWeekend?: string;
  typicalDietDescription?: string;
  // 03 饮食习惯（3/4）- 饮品频率
  drinkWater?: string;
  drinkCoffee?: string;
  drinkTea?: string;
  drinkMilk?: string;
  drinkPlantMilk?: string;
  drinkMilkTea?: string;
  drinkSugarFree?: string;
  drinkSugary?: string;
  drinkEnergy?: string;
  drinkOther?: string;
  // 03 饮食习惯（4/4）
  highSaltSweat?: string;
  dietSatisfaction?: string;
  // 04 运动习惯（1/2）
  exerciseLevel?: string;
  exerciseTypes?: string[];
  exerciseDuration?: string;
  exerciseFrequency?: string;
  exerciseTime?: string;
  exerciseMotivation?: string;
  // 04 运动习惯（2/2）
  exerciseChallenges?: string;
  exerciseGoals?: string;
  hasExercisePartner?: string;
  exercisePartnerDetail?: string;
  // 05 生活方式（1/2）
  stressLevel?: string;
  isSmoker?: string;
  smokingDetail?: string;
  isDrinker?: string;
  drinkingDetail?: string;
  weekdayWakeTime?: string;
  weekdaySleepTime?: string;
  morningState?: string;
  screenTimeTv?: string;
  screenTimeReading?: string;
  screenTimeElectronics?: string;
  // 05 生活方式（2/2）
  socialActivities?: string[];
  socialActivitiesOther?: string;
  otherFeedback?: string;
  // 06 饮食频率（1/3）- 谷薯与水果
  freqRice?: string;
  freqNoodlesBread?: string;
  freqWholeGrains?: string;
  freqFreshFruit?: string;
  freqFruitJuice?: string;
  freqDriedFruit?: string;
  // 06 饮食频率（2/3）- 蔬菜与蛋白质
  freqLeafyVegetables?: string;
  freqStarchyVegetables?: string;
  freqOtherVegetables?: string;
  freqEggs?: string;
  freqPoultry?: string;
  freqFishSeafood?: string;
  freqBeansSoy?: string;
  freqRedMeat?: string;
  // 06 饮食频率（3/3）- 乳制品与零食
  freqMilkDairy?: string;
  freqYogurt?: string;
  freqCheese?: string;
  freqNonDairyAlternatives?: string;
  freqNutsSeeds?: string;
  freqCookiesCake?: string;
  freqChocolateCandy?: string;
  freqSaltySnacks?: string;
  // 07 上传的饮食记录文件
  uploadedDietFiles?: Array<{
    name: string;
    size: number;
    url: string;
    type: 'pdf' | 'image' | 'doc' | 'other';
  }>;
}

/** 营养问卷列表项 */
export interface NutritionSurveyListItem {
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

/** 营养问卷详情 */
export interface NutritionSurveyDetail extends NutritionSurveyListItem {
  userId: string;
  feishuRecordId: string | null;
  formData: NutritionSurveyData;
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
 * 提交营养问卷
 */
export const submitNutritionSurvey = async (data: NutritionSurveyData): Promise<SurveySubmitResponse> => {
  // 将数组字段转换为逗号分隔的字符串
  const payload = { ...data } as Record<string, unknown>;
  if (Array.isArray(payload.commonSnacks)) payload.commonSnacks = (payload.commonSnacks as string[]).join(',');
  if (Array.isArray(payload.foodSources)) payload.foodSources = (payload.foodSources as string[]).join(',');
  if (Array.isArray(payload.exerciseTypes)) payload.exerciseTypes = (payload.exerciseTypes as string[]).join(',');
  if (Array.isArray(payload.socialActivities)) payload.socialActivities = (payload.socialActivities as string[]).join(',');
  if (Array.isArray(payload.uploadedDietFiles)) payload.uploadedDietFiles = JSON.stringify(payload.uploadedDietFiles);

  const res = await api.post('/nutrition-survey', payload);
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
export const getNutritionSurveyList = async (): Promise<NutritionSurveyListItem[]> => {
  const res = await api.get('/nutrition-survey');
  return res.data.data || [];
};

/**
 * 获取问卷详情
 */
export const getNutritionSurveyDetail = async (id: number): Promise<NutritionSurveyDetail> => {
  const res = await api.get(`/nutrition-survey/${id}`);
  const data = res.data.data;
  // 将逗号分隔的字符串转换为数组
  if (data.formData) {
    if (typeof data.formData.commonSnacks === 'string') {
      data.formData.commonSnacks = data.formData.commonSnacks ? data.formData.commonSnacks.split(',') : [];
    }
    if (typeof data.formData.foodSources === 'string') {
      data.formData.foodSources = data.formData.foodSources ? data.formData.foodSources.split(',') : [];
    }
    if (typeof data.formData.exerciseTypes === 'string') {
      data.formData.exerciseTypes = data.formData.exerciseTypes ? data.formData.exerciseTypes.split(',') : [];
    }
    if (typeof data.formData.socialActivities === 'string') {
      data.formData.socialActivities = data.formData.socialActivities ? data.formData.socialActivities.split(',') : [];
    }
    // 将 JSON 字符串转换为数组
    if (typeof data.formData.uploadedDietFiles === 'string' && data.formData.uploadedDietFiles) {
      try {
        data.formData.uploadedDietFiles = JSON.parse(data.formData.uploadedDietFiles);
      } catch {
        data.formData.uploadedDietFiles = [];
      }
    }
  }
  return data;
};

/**
 * 获取用户最新问卷
 */
export const getLatestNutritionSurvey = async (): Promise<NutritionSurveyDetail | null> => {
  const res = await api.get('/nutrition-survey/latest');
  const data = res.data.data;
  if (data?.formData) {
    if (typeof data.formData.commonSnacks === 'string') {
      data.formData.commonSnacks = data.formData.commonSnacks ? data.formData.commonSnacks.split(',') : [];
    }
    if (typeof data.formData.foodSources === 'string') {
      data.formData.foodSources = data.formData.foodSources ? data.formData.foodSources.split(',') : [];
    }
    if (typeof data.formData.exerciseTypes === 'string') {
      data.formData.exerciseTypes = data.formData.exerciseTypes ? data.formData.exerciseTypes.split(',') : [];
    }
    if (typeof data.formData.socialActivities === 'string') {
      data.formData.socialActivities = data.formData.socialActivities ? data.formData.socialActivities.split(',') : [];
    }
    // 将 JSON 字符串转换为数组
    if (typeof data.formData.uploadedDietFiles === 'string' && data.formData.uploadedDietFiles) {
      try {
        data.formData.uploadedDietFiles = JSON.parse(data.formData.uploadedDietFiles);
      } catch {
        data.formData.uploadedDietFiles = [];
      }
    }
  }
  return data;
};

/**
 * 更新问卷
 */
export const updateNutritionSurvey = async (
  id: number,
  data: Partial<NutritionSurveyData>
): Promise<SurveySubmitResponse> => {
  // 将数组字段转换为逗号分隔的字符串
  const payload = { ...data } as Record<string, unknown>;
  if (Array.isArray(payload.commonSnacks)) payload.commonSnacks = (payload.commonSnacks as string[]).join(',');
  if (Array.isArray(payload.foodSources)) payload.foodSources = (payload.foodSources as string[]).join(',');
  if (Array.isArray(payload.exerciseTypes)) payload.exerciseTypes = (payload.exerciseTypes as string[]).join(',');
  if (Array.isArray(payload.socialActivities)) payload.socialActivities = (payload.socialActivities as string[]).join(',');
  if (Array.isArray(payload.uploadedDietFiles)) payload.uploadedDietFiles = JSON.stringify(payload.uploadedDietFiles);

  const res = await api.put(`/nutrition-survey/${id}`, payload);
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
export const saveNutritionDraft = async (
  data: Partial<NutritionSurveyData>,
  existingId?: number
): Promise<SurveySubmitResponse> => {
  if (existingId) {
    return updateNutritionSurvey(existingId, data);
  }
  // 将数组字段转换为逗号分隔的字符串
  const payload = { ...data } as Record<string, unknown>;
  if (Array.isArray(payload.commonSnacks)) payload.commonSnacks = (payload.commonSnacks as string[]).join(',');
  if (Array.isArray(payload.foodSources)) payload.foodSources = (payload.foodSources as string[]).join(',');
  if (Array.isArray(payload.exerciseTypes)) payload.exerciseTypes = (payload.exerciseTypes as string[]).join(',');
  if (Array.isArray(payload.socialActivities)) payload.socialActivities = (payload.socialActivities as string[]).join(',');
  if (Array.isArray(payload.uploadedDietFiles)) payload.uploadedDietFiles = JSON.stringify(payload.uploadedDietFiles);

  const res = await api.post('/nutrition-survey/draft', payload);
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
