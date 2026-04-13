import prisma from '../config/database';
import {
  SleepSurveyData,
  SleepSurveyListItem,
  SleepSurveyDetail,
  NutritionSurveyData,
  NutritionSurveyListItem,
  NutritionSurveyDetail,
} from '../models/survey.types';
import { logger } from '../utils/logger';
import { feishuService } from './feishu.service';

// 生成订单编号：SS/NS + 日期 + 4位序号 + 4位随机数（防止并发冲突）
async function generateOrderNo(prefix: 'SS' | 'NS'): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = prefix === 'SS'
    ? await prisma.sleepSurvey.count({ where: { submittedAt: { gte: today } } })
    : await prisma.nutritionSurvey.count({ where: { submittedAt: { gte: today } } });

  const seq = String(count + 1).padStart(4, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${prefix}${dateStr}${seq}${random}`;
}

// 获取下一个版本号
async function getNextVersion(userId: string, surveyType: 'sleep' | 'nutrition'): Promise<number> {
  if (surveyType === 'sleep') {
    const last = await prisma.sleepSurvey.findFirst({
      where: { userId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });
    return (last?.versionNumber ?? 0) + 1;
  } else {
    const last = await prisma.nutritionSurvey.findFirst({
      where: { userId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });
    return (last?.versionNumber ?? 0) + 1;
  }
}

export const surveyService = {
  // ==================== 睡眠问卷 ====================

  /**
   * 提交睡眠问卷
   */
  async submitSleepSurvey(userId: string, formData: SleepSurveyData) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const versionNumber = await getNextVersion(userId, 'sleep');
    const orderNo = await generateOrderNo('SS');
    
    // 优先使用表单数据，如果为空则使用用户信息
    const name = formData.name || user?.username || '';
    const phone = formData.phone || user?.phone || '';
    const submittedBy = user?.username || name;

    const submission = await prisma.sleepSurvey.create({
      data: {
        userId,
        orderNo,
        name,
        phone,
        submittedBy,
        bedtime: formData.bedtime,
        sleepLatency: formData.sleepLatency,
        wakeTime: formData.wakeTime,
        sleepDurationHours: formData.sleepDurationHours,
        sleepDurationMinutes: formData.sleepDurationMinutes,
        cantFallAsleep30min: formData.cantFallAsleep30min,
        wakeUpEarly: formData.wakeUpEarly,
        getUpToilet: formData.getUpToilet,
        breathingDiscomfort: formData.breathingDiscomfort,
        coughSnore: formData.coughSnore,
        feelCold: formData.feelCold,
        feelHot: formData.feelHot,
        nightmares: formData.nightmares,
        pain: formData.pain,
        otherSleepIssues: formData.otherSleepIssues,
        sleepQualityRating: formData.sleepQualityRating,
        sleepMedication: formData.sleepMedication,
        stayAwakeDifficulty: formData.stayAwakeDifficulty,
        taskCompletionDifficulty: formData.taskCompletionDifficulty,
        sleepPartner: formData.sleepPartner,
        snoring: formData.snoring,
        breathingPause: formData.breathingPause,
        legTwitch: formData.legTwitch,
        disorientation: formData.disorientation,
        otherRestlessSleep: formData.otherRestlessSleep,
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('SURVEY', `SleepSurvey submitted: userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, id=${submission.id}`);

    // 异步触发飞书同步（不阻塞响应）
    feishuService.syncSleepSurvey(submission).catch((err) => {
      logger.error('FEISHU', `Async sync sleep survey failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
    };
  },

  /**
   * 保存睡眠问卷草稿
   */
  async saveSleepDraft(userId: string, formData: Partial<SleepSurveyData>) {
    const existing = await prisma.sleepSurvey.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    if (existing) {
      const updated = await prisma.sleepSurvey.update({
        where: { id: existing.id },
        data: {
          name: formData.name ?? existing.name,
          phone: formData.phone ?? existing.phone,
          bedtime: formData.bedtime ?? existing.bedtime,
          sleepLatency: formData.sleepLatency ?? existing.sleepLatency,
          wakeTime: formData.wakeTime ?? existing.wakeTime,
          sleepDurationHours: formData.sleepDurationHours ?? existing.sleepDurationHours,
          sleepDurationMinutes: formData.sleepDurationMinutes ?? existing.sleepDurationMinutes,
          cantFallAsleep30min: formData.cantFallAsleep30min ?? existing.cantFallAsleep30min,
          wakeUpEarly: formData.wakeUpEarly ?? existing.wakeUpEarly,
          getUpToilet: formData.getUpToilet ?? existing.getUpToilet,
          breathingDiscomfort: formData.breathingDiscomfort ?? existing.breathingDiscomfort,
          coughSnore: formData.coughSnore ?? existing.coughSnore,
          feelCold: formData.feelCold ?? existing.feelCold,
          feelHot: formData.feelHot ?? existing.feelHot,
          nightmares: formData.nightmares ?? existing.nightmares,
          pain: formData.pain ?? existing.pain,
          otherSleepIssues: formData.otherSleepIssues ?? existing.otherSleepIssues,
          sleepQualityRating: formData.sleepQualityRating ?? existing.sleepQualityRating,
          sleepMedication: formData.sleepMedication ?? existing.sleepMedication,
          stayAwakeDifficulty: formData.stayAwakeDifficulty ?? existing.stayAwakeDifficulty,
          taskCompletionDifficulty: formData.taskCompletionDifficulty ?? existing.taskCompletionDifficulty,
          sleepPartner: formData.sleepPartner ?? existing.sleepPartner,
          snoring: formData.snoring ?? existing.snoring,
          breathingPause: formData.breathingPause ?? existing.breathingPause,
          legTwitch: formData.legTwitch ?? existing.legTwitch,
          disorientation: formData.disorientation ?? existing.disorientation,
          otherRestlessSleep: formData.otherRestlessSleep ?? existing.otherRestlessSleep,
        },
      });

      logger.info('SURVEY', `SleepSurvey draft updated: userId=${userId}, id=${updated.id}, orderNo=${updated.orderNo}`);

      feishuService.updateSleepSurvey(updated).catch((err) => {
        logger.error('FEISHU', `Async sync sleep survey draft failed: id=${updated.id}`, err);
      });

      return {
        id: updated.id,
        orderNo: updated.orderNo,
        submittedAt: updated.submittedAt.toISOString(),
        versionNumber: updated.versionNumber,
      };
    }

    // 无已有问卷：创建新记录
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const versionNumber = await getNextVersion(userId, 'sleep');
    const orderNo = await generateOrderNo('SS');
    const submittedBy = user?.username || formData.name || 'unknown';
    // 优先使用表单数据，如果为空则使用用户信息
    const name = formData.name || user?.username || '';
    const phone = formData.phone || user?.phone || '';

    const submission = await prisma.sleepSurvey.create({
      data: {
        userId,
        orderNo,
        name,
        phone,
        submittedBy,
        bedtime: formData.bedtime,
        sleepLatency: formData.sleepLatency,
        wakeTime: formData.wakeTime,
        sleepDurationHours: formData.sleepDurationHours,
        sleepDurationMinutes: formData.sleepDurationMinutes,
        cantFallAsleep30min: formData.cantFallAsleep30min,
        wakeUpEarly: formData.wakeUpEarly,
        getUpToilet: formData.getUpToilet,
        breathingDiscomfort: formData.breathingDiscomfort,
        coughSnore: formData.coughSnore,
        feelCold: formData.feelCold,
        feelHot: formData.feelHot,
        nightmares: formData.nightmares,
        pain: formData.pain,
        otherSleepIssues: formData.otherSleepIssues,
        sleepQualityRating: formData.sleepQualityRating,
        sleepMedication: formData.sleepMedication,
        stayAwakeDifficulty: formData.stayAwakeDifficulty,
        taskCompletionDifficulty: formData.taskCompletionDifficulty,
        sleepPartner: formData.sleepPartner,
        snoring: formData.snoring,
        breathingPause: formData.breathingPause,
        legTwitch: formData.legTwitch,
        disorientation: formData.disorientation,
        otherRestlessSleep: formData.otherRestlessSleep,
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('SURVEY', `SleepSurvey draft created: userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, id=${submission.id}`);

    feishuService.syncSleepSurvey(submission).catch((err) => {
      logger.error('FEISHU', `Async sync sleep survey draft failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
    };
  },

  /**
   * 获取睡眠问卷列表
   */
  async getSleepSurveyList(userId: string): Promise<SleepSurveyListItem[]> {
    const list = await prisma.sleepSurvey.findMany({
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
      feishuSyncStatus: item.feishuSyncStatus as SleepSurveyListItem['feishuSyncStatus'],
    }));
  },

  /**
   * 获取睡眠问卷详情
   */
  async getSleepSurveyDetail(userId: string, id: number): Promise<SleepSurveyDetail> {
    const submission = await prisma.sleepSurvey.findFirst({
      where: { id, userId },
    });

    if (!submission) {
      throw { code: 404, message: '问卷记录不存在' };
    }

    const formData: SleepSurveyData = {
      name: submission.name,
      phone: submission.phone,
      bedtime: submission.bedtime ?? undefined,
      sleepLatency: submission.sleepLatency ?? undefined,
      wakeTime: submission.wakeTime ?? undefined,
      sleepDurationHours: submission.sleepDurationHours ?? undefined,
      sleepDurationMinutes: submission.sleepDurationMinutes ?? undefined,
      cantFallAsleep30min: submission.cantFallAsleep30min ?? undefined,
      wakeUpEarly: submission.wakeUpEarly ?? undefined,
      getUpToilet: submission.getUpToilet ?? undefined,
      breathingDiscomfort: submission.breathingDiscomfort ?? undefined,
      coughSnore: submission.coughSnore ?? undefined,
      feelCold: submission.feelCold ?? undefined,
      feelHot: submission.feelHot ?? undefined,
      nightmares: submission.nightmares ?? undefined,
      pain: submission.pain ?? undefined,
      otherSleepIssues: submission.otherSleepIssues ?? undefined,
      sleepQualityRating: submission.sleepQualityRating ?? undefined,
      sleepMedication: submission.sleepMedication ?? undefined,
      stayAwakeDifficulty: submission.stayAwakeDifficulty ?? undefined,
      taskCompletionDifficulty: submission.taskCompletionDifficulty ?? undefined,
      sleepPartner: submission.sleepPartner ?? undefined,
      snoring: submission.snoring ?? undefined,
      breathingPause: submission.breathingPause ?? undefined,
      legTwitch: submission.legTwitch ?? undefined,
      disorientation: submission.disorientation ?? undefined,
      otherRestlessSleep: submission.otherRestlessSleep ?? undefined,
    };

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
      feishuSyncStatus: submission.feishuSyncStatus as SleepSurveyDetail['feishuSyncStatus'],
      feishuRecordId: submission.feishuRecordId,
      formData,
    };
  },

  /**
   * 获取用户最新睡眠问卷
   */
  async getSleepSurveyLatest(userId: string): Promise<SleepSurveyDetail | null> {
    const submission = await prisma.sleepSurvey.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    if (!submission) {
      return null;
    }

    const formData: SleepSurveyData = {
      name: submission.name,
      phone: submission.phone,
      bedtime: submission.bedtime ?? undefined,
      sleepLatency: submission.sleepLatency ?? undefined,
      wakeTime: submission.wakeTime ?? undefined,
      sleepDurationHours: submission.sleepDurationHours ?? undefined,
      sleepDurationMinutes: submission.sleepDurationMinutes ?? undefined,
      cantFallAsleep30min: submission.cantFallAsleep30min ?? undefined,
      wakeUpEarly: submission.wakeUpEarly ?? undefined,
      getUpToilet: submission.getUpToilet ?? undefined,
      breathingDiscomfort: submission.breathingDiscomfort ?? undefined,
      coughSnore: submission.coughSnore ?? undefined,
      feelCold: submission.feelCold ?? undefined,
      feelHot: submission.feelHot ?? undefined,
      nightmares: submission.nightmares ?? undefined,
      pain: submission.pain ?? undefined,
      otherSleepIssues: submission.otherSleepIssues ?? undefined,
      sleepQualityRating: submission.sleepQualityRating ?? undefined,
      sleepMedication: submission.sleepMedication ?? undefined,
      stayAwakeDifficulty: submission.stayAwakeDifficulty ?? undefined,
      taskCompletionDifficulty: submission.taskCompletionDifficulty ?? undefined,
      sleepPartner: submission.sleepPartner ?? undefined,
      snoring: submission.snoring ?? undefined,
      breathingPause: submission.breathingPause ?? undefined,
      legTwitch: submission.legTwitch ?? undefined,
      disorientation: submission.disorientation ?? undefined,
      otherRestlessSleep: submission.otherRestlessSleep ?? undefined,
    };

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
      feishuSyncStatus: submission.feishuSyncStatus as SleepSurveyDetail['feishuSyncStatus'],
      feishuRecordId: submission.feishuRecordId,
      formData,
    };
  },

  /**
   * 更新睡眠问卷
   */
  async updateSleepSurvey(userId: string, id: number, formData: Partial<SleepSurveyData>) {
    const original = await prisma.sleepSurvey.findFirst({
      where: { id, userId },
    });

    if (!original) {
      throw { code: 404, message: '问卷记录不存在' };
    }

    const updated = await prisma.sleepSurvey.update({
      where: { id },
      data: {
        name: formData.name ?? original.name,
        phone: formData.phone ?? original.phone,
        bedtime: formData.bedtime ?? original.bedtime,
        sleepLatency: formData.sleepLatency ?? original.sleepLatency,
        wakeTime: formData.wakeTime ?? original.wakeTime,
        sleepDurationHours: formData.sleepDurationHours ?? original.sleepDurationHours,
        sleepDurationMinutes: formData.sleepDurationMinutes ?? original.sleepDurationMinutes,
        cantFallAsleep30min: formData.cantFallAsleep30min ?? original.cantFallAsleep30min,
        wakeUpEarly: formData.wakeUpEarly ?? original.wakeUpEarly,
        getUpToilet: formData.getUpToilet ?? original.getUpToilet,
        breathingDiscomfort: formData.breathingDiscomfort ?? original.breathingDiscomfort,
        coughSnore: formData.coughSnore ?? original.coughSnore,
        feelCold: formData.feelCold ?? original.feelCold,
        feelHot: formData.feelHot ?? original.feelHot,
        nightmares: formData.nightmares ?? original.nightmares,
        pain: formData.pain ?? original.pain,
        otherSleepIssues: formData.otherSleepIssues ?? original.otherSleepIssues,
        sleepQualityRating: formData.sleepQualityRating ?? original.sleepQualityRating,
        sleepMedication: formData.sleepMedication ?? original.sleepMedication,
        stayAwakeDifficulty: formData.stayAwakeDifficulty ?? original.stayAwakeDifficulty,
        taskCompletionDifficulty: formData.taskCompletionDifficulty ?? original.taskCompletionDifficulty,
        sleepPartner: formData.sleepPartner ?? original.sleepPartner,
        snoring: formData.snoring ?? original.snoring,
        breathingPause: formData.breathingPause ?? original.breathingPause,
        legTwitch: formData.legTwitch ?? original.legTwitch,
        disorientation: formData.disorientation ?? original.disorientation,
        otherRestlessSleep: formData.otherRestlessSleep ?? original.otherRestlessSleep,
      },
    });

    logger.info('SURVEY', `SleepSurvey updated: userId=${userId}, id=${id}, orderNo=${updated.orderNo}`);

    feishuService.updateSleepSurvey(updated).catch((err) => {
      logger.error('FEISHU', `Async update sleep survey failed: id=${updated.id}`, err);
    });

    return {
      id: updated.id,
      orderNo: updated.orderNo,
      submittedAt: updated.submittedAt.toISOString(),
      versionNumber: updated.versionNumber,
    };
  },

  // ==================== 营养问卷 ====================

  /**
   * 提交营养问卷
   */
  async submitNutritionSurvey(userId: string, formData: NutritionSurveyData) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const versionNumber = await getNextVersion(userId, 'nutrition');
    const orderNo = await generateOrderNo('NS');
    
    // 优先使用表单数据，如果为空则使用用户信息
    const name = formData.name || user?.username || '';
    const phone = formData.phone || user?.phone || '';
    const submittedBy = user?.username || name;

    const submission = await prisma.nutritionSurvey.create({
      data: {
        userId,
        orderNo,
        name,
        phone,
        submittedBy,
        consultationReason: formData.consultationReason,
        nutritionistSupportGoals: formData.nutritionistSupportGoals,
        height: formData.height,
        weight: formData.weight,
        weightChange: formData.weightChange,
        chronicDiseases: formData.chronicDiseases,
        medicationsSupplements: formData.medicationsSupplements,
        dailyMeals: formData.dailyMeals,
        breakfastHabit: formData.breakfastHabit,
        commonSnacks: formData.commonSnacks,
        commonSnacksOther: formData.commonSnacksOther,
        foodSources: formData.foodSources,
        foodSourcesOther: formData.foodSourcesOther,
        foodAllergies: formData.foodAllergies,
        dislikedFoods: formData.dislikedFoods,
        dietPlanType: formData.dietPlanType,
        typicalDietWorkday: formData.typicalDietWorkday,
        typicalDietWeekend: formData.typicalDietWeekend,
        typicalDietDescription: formData.typicalDietDescription,
        drinkWater: formData.drinkWater,
        drinkCoffee: formData.drinkCoffee,
        drinkTea: formData.drinkTea,
        drinkMilk: formData.drinkMilk,
        drinkPlantMilk: formData.drinkPlantMilk,
        drinkMilkTea: formData.drinkMilkTea,
        drinkSugarFree: formData.drinkSugarFree,
        drinkSugary: formData.drinkSugary,
        drinkEnergy: formData.drinkEnergy,
        drinkOther: formData.drinkOther,
        highSaltSweat: formData.highSaltSweat,
        dietSatisfaction: formData.dietSatisfaction,
        exerciseLevel: formData.exerciseLevel,
        exerciseTypes: formData.exerciseTypes,
        exerciseDuration: formData.exerciseDuration,
        exerciseFrequency: formData.exerciseFrequency,
        exerciseTime: formData.exerciseTime,
        exerciseMotivation: formData.exerciseMotivation,
        exerciseChallenges: formData.exerciseChallenges,
        exerciseGoals: formData.exerciseGoals,
        hasExercisePartner: formData.hasExercisePartner,
        exercisePartnerDetail: formData.exercisePartnerDetail,
        stressLevel: formData.stressLevel,
        isSmoker: formData.isSmoker,
        smokingDetail: formData.smokingDetail,
        isDrinker: formData.isDrinker,
        drinkingDetail: formData.drinkingDetail,
        weekdayWakeTime: formData.weekdayWakeTime,
        weekdaySleepTime: formData.weekdaySleepTime,
        morningState: formData.morningState,
        screenTimeTv: formData.screenTimeTv,
        screenTimeReading: formData.screenTimeReading,
        screenTimeElectronics: formData.screenTimeElectronics,
        socialActivities: formData.socialActivities,
        socialActivitiesOther: formData.socialActivitiesOther,
        otherFeedback: formData.otherFeedback,
        freqRice: formData.freqRice,
        freqNoodlesBread: formData.freqNoodlesBread,
        freqWholeGrains: formData.freqWholeGrains,
        freqFreshFruit: formData.freqFreshFruit,
        freqFruitJuice: formData.freqFruitJuice,
        freqDriedFruit: formData.freqDriedFruit,
        freqLeafyVegetables: formData.freqLeafyVegetables,
        freqStarchyVegetables: formData.freqStarchyVegetables,
        freqOtherVegetables: formData.freqOtherVegetables,
        freqEggs: formData.freqEggs,
        freqPoultry: formData.freqPoultry,
        freqFishSeafood: formData.freqFishSeafood,
        freqBeansSoy: formData.freqBeansSoy,
        freqRedMeat: formData.freqRedMeat,
        freqMilkDairy: formData.freqMilkDairy,
        freqYogurt: formData.freqYogurt,
        freqCheese: formData.freqCheese,
        freqNonDairyAlternatives: formData.freqNonDairyAlternatives,
        freqNutsSeeds: formData.freqNutsSeeds,
        freqCookiesCake: formData.freqCookiesCake,
        freqChocolateCandy: formData.freqChocolateCandy,
        freqSaltySnacks: formData.freqSaltySnacks,
        uploadedDietFiles: formData.uploadedDietFiles,
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('SURVEY', `NutritionSurvey submitted: userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, id=${submission.id}`);

    feishuService.syncNutritionSurvey(submission).catch((err) => {
      logger.error('FEISHU', `Async sync nutrition survey failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
    };
  },

  /**
   * 保存营养问卷草稿
   */
  async saveNutritionDraft(userId: string, formData: Partial<NutritionSurveyData>) {
    const existing = await prisma.nutritionSurvey.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    if (existing) {
      const updateData: Record<string, unknown> = {};
      for (const key of Object.keys(formData)) {
        if (formData[key as keyof NutritionSurveyData] !== undefined) {
          updateData[key] = formData[key as keyof NutritionSurveyData];
        }
      }

      const updated = await prisma.nutritionSurvey.update({
        where: { id: existing.id },
        data: updateData,
      });

      logger.info('SURVEY', `NutritionSurvey draft updated: userId=${userId}, id=${updated.id}, orderNo=${updated.orderNo}`);

      feishuService.updateNutritionSurvey(updated).catch((err) => {
        logger.error('FEISHU', `Async sync nutrition survey draft failed: id=${updated.id}`, err);
      });

      return {
        id: updated.id,
        orderNo: updated.orderNo,
        submittedAt: updated.submittedAt.toISOString(),
        versionNumber: updated.versionNumber,
      };
    }

    // 无已有问卷：创建新记录
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const versionNumber = await getNextVersion(userId, 'nutrition');
    const orderNo = await generateOrderNo('NS');
    
    // 优先使用表单数据，如果为空则使用用户信息
    const name = formData.name || user?.username || '';
    const phone = formData.phone || user?.phone || '';
    const submittedBy = user?.username || name;

    const submission = await prisma.nutritionSurvey.create({
      data: {
        userId,
        orderNo,
        name,
        phone,
        submittedBy,
        consultationReason: formData.consultationReason,
        nutritionistSupportGoals: formData.nutritionistSupportGoals,
        height: formData.height,
        weight: formData.weight,
        weightChange: formData.weightChange,
        chronicDiseases: formData.chronicDiseases,
        medicationsSupplements: formData.medicationsSupplements,
        dailyMeals: formData.dailyMeals,
        breakfastHabit: formData.breakfastHabit,
        commonSnacks: formData.commonSnacks,
        commonSnacksOther: formData.commonSnacksOther,
        foodSources: formData.foodSources,
        foodSourcesOther: formData.foodSourcesOther,
        foodAllergies: formData.foodAllergies,
        dislikedFoods: formData.dislikedFoods,
        dietPlanType: formData.dietPlanType,
        typicalDietWorkday: formData.typicalDietWorkday,
        typicalDietWeekend: formData.typicalDietWeekend,
        typicalDietDescription: formData.typicalDietDescription,
        drinkWater: formData.drinkWater,
        drinkCoffee: formData.drinkCoffee,
        drinkTea: formData.drinkTea,
        drinkMilk: formData.drinkMilk,
        drinkPlantMilk: formData.drinkPlantMilk,
        drinkMilkTea: formData.drinkMilkTea,
        drinkSugarFree: formData.drinkSugarFree,
        drinkSugary: formData.drinkSugary,
        drinkEnergy: formData.drinkEnergy,
        drinkOther: formData.drinkOther,
        highSaltSweat: formData.highSaltSweat,
        dietSatisfaction: formData.dietSatisfaction,
        exerciseLevel: formData.exerciseLevel,
        exerciseTypes: formData.exerciseTypes,
        exerciseDuration: formData.exerciseDuration,
        exerciseFrequency: formData.exerciseFrequency,
        exerciseTime: formData.exerciseTime,
        exerciseMotivation: formData.exerciseMotivation,
        exerciseChallenges: formData.exerciseChallenges,
        exerciseGoals: formData.exerciseGoals,
        hasExercisePartner: formData.hasExercisePartner,
        exercisePartnerDetail: formData.exercisePartnerDetail,
        stressLevel: formData.stressLevel,
        isSmoker: formData.isSmoker,
        smokingDetail: formData.smokingDetail,
        isDrinker: formData.isDrinker,
        drinkingDetail: formData.drinkingDetail,
        weekdayWakeTime: formData.weekdayWakeTime,
        weekdaySleepTime: formData.weekdaySleepTime,
        morningState: formData.morningState,
        screenTimeTv: formData.screenTimeTv,
        screenTimeReading: formData.screenTimeReading,
        screenTimeElectronics: formData.screenTimeElectronics,
        socialActivities: formData.socialActivities,
        socialActivitiesOther: formData.socialActivitiesOther,
        otherFeedback: formData.otherFeedback,
        freqRice: formData.freqRice,
        freqNoodlesBread: formData.freqNoodlesBread,
        freqWholeGrains: formData.freqWholeGrains,
        freqFreshFruit: formData.freqFreshFruit,
        freqFruitJuice: formData.freqFruitJuice,
        freqDriedFruit: formData.freqDriedFruit,
        freqLeafyVegetables: formData.freqLeafyVegetables,
        freqStarchyVegetables: formData.freqStarchyVegetables,
        freqOtherVegetables: formData.freqOtherVegetables,
        freqEggs: formData.freqEggs,
        freqPoultry: formData.freqPoultry,
        freqFishSeafood: formData.freqFishSeafood,
        freqBeansSoy: formData.freqBeansSoy,
        freqRedMeat: formData.freqRedMeat,
        freqMilkDairy: formData.freqMilkDairy,
        freqYogurt: formData.freqYogurt,
        freqCheese: formData.freqCheese,
        freqNonDairyAlternatives: formData.freqNonDairyAlternatives,
        freqNutsSeeds: formData.freqNutsSeeds,
        freqCookiesCake: formData.freqCookiesCake,
        freqChocolateCandy: formData.freqChocolateCandy,
        freqSaltySnacks: formData.freqSaltySnacks,
        uploadedDietFiles: formData.uploadedDietFiles,
        versionNumber,
        feishuSyncStatus: 'pending',
      },
    });

    logger.info('SURVEY', `NutritionSurvey draft created: userId=${userId}, orderNo=${orderNo}, version=${versionNumber}, id=${submission.id}`);

    feishuService.syncNutritionSurvey(submission).catch((err) => {
      logger.error('FEISHU', `Async sync nutrition survey draft failed: id=${submission.id}`, err);
    });

    return {
      id: submission.id,
      orderNo: submission.orderNo,
      submittedAt: submission.submittedAt.toISOString(),
      versionNumber: submission.versionNumber,
    };
  },

  /**
   * 获取营养问卷列表
   */
  async getNutritionSurveyList(userId: string): Promise<NutritionSurveyListItem[]> {
    const list = await prisma.nutritionSurvey.findMany({
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
      feishuSyncStatus: item.feishuSyncStatus as NutritionSurveyListItem['feishuSyncStatus'],
    }));
  },

  /**
   * 获取营养问卷详情
   */
  async getNutritionSurveyDetail(userId: string, id: number): Promise<NutritionSurveyDetail> {
    const submission = await prisma.nutritionSurvey.findFirst({
      where: { id, userId },
    });

    if (!submission) {
      throw { code: 404, message: '问卷记录不存在' };
    }

    const formData: NutritionSurveyData = {
      name: submission.name,
      phone: submission.phone,
      consultationReason: submission.consultationReason ?? undefined,
      nutritionistSupportGoals: submission.nutritionistSupportGoals ?? undefined,
      height: submission.height ?? undefined,
      weight: submission.weight ?? undefined,
      weightChange: submission.weightChange ?? undefined,
      chronicDiseases: submission.chronicDiseases ?? undefined,
      medicationsSupplements: submission.medicationsSupplements ?? undefined,
      dailyMeals: submission.dailyMeals ?? undefined,
      breakfastHabit: submission.breakfastHabit ?? undefined,
      commonSnacks: submission.commonSnacks ?? undefined,
      commonSnacksOther: submission.commonSnacksOther ?? undefined,
      foodSources: submission.foodSources ?? undefined,
      foodSourcesOther: submission.foodSourcesOther ?? undefined,
      foodAllergies: submission.foodAllergies ?? undefined,
      dislikedFoods: submission.dislikedFoods ?? undefined,
      dietPlanType: submission.dietPlanType ?? undefined,
      typicalDietWorkday: submission.typicalDietWorkday ?? undefined,
      typicalDietWeekend: submission.typicalDietWeekend ?? undefined,
      typicalDietDescription: submission.typicalDietDescription ?? undefined,
      drinkWater: submission.drinkWater ?? undefined,
      drinkCoffee: submission.drinkCoffee ?? undefined,
      drinkTea: submission.drinkTea ?? undefined,
      drinkMilk: submission.drinkMilk ?? undefined,
      drinkPlantMilk: submission.drinkPlantMilk ?? undefined,
      drinkMilkTea: submission.drinkMilkTea ?? undefined,
      drinkSugarFree: submission.drinkSugarFree ?? undefined,
      drinkSugary: submission.drinkSugary ?? undefined,
      drinkEnergy: submission.drinkEnergy ?? undefined,
      drinkOther: submission.drinkOther ?? undefined,
      highSaltSweat: submission.highSaltSweat ?? undefined,
      dietSatisfaction: submission.dietSatisfaction ?? undefined,
      exerciseLevel: submission.exerciseLevel ?? undefined,
      exerciseTypes: submission.exerciseTypes ?? undefined,
      exerciseDuration: submission.exerciseDuration ?? undefined,
      exerciseFrequency: submission.exerciseFrequency ?? undefined,
      exerciseTime: submission.exerciseTime ?? undefined,
      exerciseMotivation: submission.exerciseMotivation ?? undefined,
      exerciseChallenges: submission.exerciseChallenges ?? undefined,
      exerciseGoals: submission.exerciseGoals ?? undefined,
      hasExercisePartner: submission.hasExercisePartner ?? undefined,
      exercisePartnerDetail: submission.exercisePartnerDetail ?? undefined,
      stressLevel: submission.stressLevel ?? undefined,
      isSmoker: submission.isSmoker ?? undefined,
      smokingDetail: submission.smokingDetail ?? undefined,
      isDrinker: submission.isDrinker ?? undefined,
      drinkingDetail: submission.drinkingDetail ?? undefined,
      weekdayWakeTime: submission.weekdayWakeTime ?? undefined,
      weekdaySleepTime: submission.weekdaySleepTime ?? undefined,
      morningState: submission.morningState ?? undefined,
      screenTimeTv: submission.screenTimeTv ?? undefined,
      screenTimeReading: submission.screenTimeReading ?? undefined,
      screenTimeElectronics: submission.screenTimeElectronics ?? undefined,
      socialActivities: submission.socialActivities ?? undefined,
      socialActivitiesOther: submission.socialActivitiesOther ?? undefined,
      otherFeedback: submission.otherFeedback ?? undefined,
      freqRice: submission.freqRice ?? undefined,
      freqNoodlesBread: submission.freqNoodlesBread ?? undefined,
      freqWholeGrains: submission.freqWholeGrains ?? undefined,
      freqFreshFruit: submission.freqFreshFruit ?? undefined,
      freqFruitJuice: submission.freqFruitJuice ?? undefined,
      freqDriedFruit: submission.freqDriedFruit ?? undefined,
      freqLeafyVegetables: submission.freqLeafyVegetables ?? undefined,
      freqStarchyVegetables: submission.freqStarchyVegetables ?? undefined,
      freqOtherVegetables: submission.freqOtherVegetables ?? undefined,
      freqEggs: submission.freqEggs ?? undefined,
      freqPoultry: submission.freqPoultry ?? undefined,
      freqFishSeafood: submission.freqFishSeafood ?? undefined,
      freqBeansSoy: submission.freqBeansSoy ?? undefined,
      freqRedMeat: submission.freqRedMeat ?? undefined,
      freqMilkDairy: submission.freqMilkDairy ?? undefined,
      freqYogurt: submission.freqYogurt ?? undefined,
      freqCheese: submission.freqCheese ?? undefined,
      freqNonDairyAlternatives: submission.freqNonDairyAlternatives ?? undefined,
      freqNutsSeeds: submission.freqNutsSeeds ?? undefined,
      freqCookiesCake: submission.freqCookiesCake ?? undefined,
      freqChocolateCandy: submission.freqChocolateCandy ?? undefined,
      freqSaltySnacks: submission.freqSaltySnacks ?? undefined,
      uploadedDietFiles: submission.uploadedDietFiles ?? undefined,
    };

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
      feishuSyncStatus: submission.feishuSyncStatus as NutritionSurveyDetail['feishuSyncStatus'],
      feishuRecordId: submission.feishuRecordId,
      formData,
    };
  },

  /**
   * 获取用户最新营养问卷
   */
  async getNutritionSurveyLatest(userId: string): Promise<NutritionSurveyDetail | null> {
    const submission = await prisma.nutritionSurvey.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    if (!submission) {
      return null;
    }

    return this.getNutritionSurveyDetail(userId, submission.id);
  },

  /**
   * 更新营养问卷
   */
  async updateNutritionSurvey(userId: string, id: number, formData: Partial<NutritionSurveyData>) {
    const original = await prisma.nutritionSurvey.findFirst({
      where: { id, userId },
    });

    if (!original) {
      throw { code: 404, message: '问卷记录不存在' };
    }

    const updateData: Record<string, unknown> = {};
    for (const key of Object.keys(formData)) {
      if (formData[key as keyof NutritionSurveyData] !== undefined) {
        updateData[key] = formData[key as keyof NutritionSurveyData];
      }
    }

    const updated = await prisma.nutritionSurvey.update({
      where: { id },
      data: updateData,
    });

    logger.info('SURVEY', `NutritionSurvey updated: userId=${userId}, id=${id}, orderNo=${updated.orderNo}`);

    feishuService.updateNutritionSurvey(updated).catch((err) => {
      logger.error('FEISHU', `Async update nutrition survey failed: id=${updated.id}`, err);
    });

    return {
      id: updated.id,
      orderNo: updated.orderNo,
      submittedAt: updated.submittedAt.toISOString(),
      versionNumber: updated.versionNumber,
    };
  },
};
