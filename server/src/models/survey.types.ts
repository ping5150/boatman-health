// ==================== 睡眠问卷类型 ====================

/** 睡眠问卷表单数据 */
export interface SleepSurveyData {
  // 基本信息
  name: string;
  phone: string;
  // 基础睡眠模式
  bedtime?: string;                  // 上床睡觉时间 HH:MM
  sleepLatency?: string;             // 入睡所需时长
  wakeTime?: string;                 // 起床时间 HH:MM
  sleepDurationHours?: number;       // 睡眠时长（小时）
  sleepDurationMinutes?: number;     // 睡眠时长（分钟）
  // 入睡与夜间干扰 (A-J)
  cantFallAsleep30min?: string;      // 不能在30min内入睡
  wakeUpEarly?: string;              // 早醒
  getUpToilet?: string;              // 起床上洗手间
  breathingDiscomfort?: string;      // 不舒服的呼吸
  coughSnore?: string;               // 大声咳嗽或打鼾
  feelCold?: string;                 // 感到寒冷
  feelHot?: string;                  // 感到太热
  nightmares?: string;               // 做噩梦
  pain?: string;                     // 出现疼痛
  otherSleepIssues?: string;         // 其他影响睡眠的事情
  // 梦境与整体评估
  sleepQualityRating?: string;       // 睡眠质量评分
  // 药物与日间影响
  sleepMedication?: string;          // 使用催眠药物
  stayAwakeDifficulty?: string;      // 难以保持清醒
  taskCompletionDifficulty?: string; // 完成事情困难
  // 睡眠质量观察
  sleepPartner?: string;             // 是否与人同睡
  snoring?: string;                  // 打鼾声
  breathingPause?: string;           // 呼吸停顿
  legTwitch?: string;                // 腿部抽动
  disorientation?: string;           // 不能辨认方向
  otherRestlessSleep?: string;       // 其他睡不安宁
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

// ==================== 营养问卷类型 ====================

/** 营养问卷表单数据 */
export interface NutritionSurveyData {
  // 基本信息
  name: string;
  phone: string;
  // 01 健康信息
  consultationReason?: string;       // 咨询主要原因
  nutritionistSupportGoals?: string; // 希望营养师支持领域
  height?: number;                   // 身高
  weight?: number;                   // 体重
  weightChange?: string;             // 体重变化
  chronicDiseases?: string;          // 慢性疾病
  medicationsSupplements?: string;   // 药物或补充剂
  // 02 饮食习惯（1/4）
  dailyMeals?: string;               // 每天主餐数量
  breakfastHabit?: string;           // 固定早餐习惯
  commonSnacks?: string;             // 常吃零食（多选，逗号分隔）
  foodSources?: string;              // 食物来源（多选，逗号分隔）
  foodAllergies?: string;            // 食物过敏
  // 03 饮食习惯（2/4）
  dislikedFoods?: string;            // 不喜欢食物
  dietPlanType?: string;             // 特定饮食计划
  typicalDietWorkday?: string;       // 工作日饮食图片URL
  typicalDietWeekend?: string;       // 周末饮食图片URL
  typicalDietDescription?: string;   // 典型饮食描述
  // 03 饮食习惯（3/4）- 饮品频率
  drinkWater?: string;               // 水
  drinkCoffee?: string;              // 咖啡
  drinkTea?: string;                 // 茶
  drinkMilk?: string;                // 牛奶
  drinkPlantMilk?: string;           // 植物奶
  drinkMilkTea?: string;             // 奶茶
  drinkSugarFree?: string;           // 无糖饮料
  drinkSugary?: string;              // 含糖饮料
  drinkEnergy?: string;              // 能量饮料
  drinkOther?: string;               // 其他饮品
  // 03 饮食习惯（4/4）
  highSaltSweat?: string;            // 出汗含盐量高
  dietSatisfaction?: string;         // 饮食满意度
  // 04 运动习惯（1/2）
  exerciseLevel?: string;            // 运动水平
  exerciseTypes?: string;            // 运动类型（多选，逗号分隔）
  exerciseDuration?: string;         // 每次运动时长
  exerciseFrequency?: string;        // 每周运动频率
  exerciseTime?: string;             // 运动时间段
  exerciseMotivation?: string;       // 运动激励因素
  // 04 运动习惯（2/2）
  exerciseChallenges?: string;       // 运动挑战
  exerciseGoals?: string;            // 运动目标
  hasExercisePartner?: string;       // 是否与他人运动
  exercisePartnerDetail?: string;    // 和谁运动
  // 05 生活方式（1/2）
  stressLevel?: string;              // 压力水平
  isSmoker?: string;                 // 是否吸烟
  smokingDetail?: string;            // 吸烟详情
  isDrinker?: string;                // 是否饮酒
  drinkingDetail?: string;           // 饮酒详情
  weekdayWakeTime?: string;          // 工作日起床时间
  weekdaySleepTime?: string;         // 工作日睡觉时间
  morningState?: string;             // 起床精神状态
  screenTimeTv?: string;             // 看电视时间
  screenTimeReading?: string;        // 阅读时间
  screenTimeElectronics?: string;    // 电子屏幕时间
  // 05 生活方式（2/2）
  socialActivities?: string;         // 社交活动（多选，逗号分隔）
  socialActivitiesOther?: string;    // 其他社交活动
  otherFeedback?: string;            // 其他反馈
  // 06 饮食频率（1/3）- 谷薯与水果
  freqRice?: string;                 // 米饭
  freqNoodlesBread?: string;         // 面条面包
  freqWholeGrains?: string;          // 全谷物
  freqFreshFruit?: string;           // 新鲜水果
  freqFruitJuice?: string;           // 果汁
  freqDriedFruit?: string;           // 果干
  // 06 饮食频率（2/3）- 蔬菜与蛋白质
  freqLeafyVegetables?: string;      // 绿叶蔬菜
  freqStarchyVegetables?: string;    // 淀粉类蔬菜
  freqOtherVegetables?: string;      // 其他蔬菜
  freqEggs?: string;                 // 鸡蛋
  freqPoultry?: string;              // 家禽
  freqFishSeafood?: string;          // 鱼类海鲜
  freqBeansSoy?: string;             // 豆类大豆
  freqRedMeat?: string;              // 红肉
  // 06 饮食频率（3/3）- 乳制品与零食
  freqMilkDairy?: string;            // 牛奶
  freqYogurt?: string;               // 酸奶
  freqCheese?: string;               // 奶酪
  freqNonDairyAlternatives?: string; // 非乳制品替代
  freqNutsSeeds?: string;            // 坚果种子
  freqCookiesCake?: string;          // 饼干蛋糕
  freqChocolateCandy?: string;       // 巧克力糖果
  freqSaltySnacks?: string;          // 咸味小吃
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

// ==================== 通用提交响应 ====================

export interface SurveySubmitResponse {
  id: number;
  orderNo: string;
  submittedAt: string;
  versionNumber: number;
}
