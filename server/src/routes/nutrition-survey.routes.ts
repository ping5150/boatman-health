import { Router } from 'express';
import { z } from 'zod';
import { nutritionSurveyController } from '../controllers/nutrition-survey.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// 营养问卷表单校验
const nutritionSurveySchema = z.object({
  // 基本信息
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().min(1, '联系电话不能为空'),
  // 01 健康信息
  consultationReason: z.string().optional(),
  nutritionistSupportGoals: z.string().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  weightChange: z.string().optional(),
  chronicDiseases: z.string().optional(),
  medicationsSupplements: z.string().optional(),
  // 02 饮食习惯（1/4）
  dailyMeals: z.string().optional(),
  breakfastHabit: z.string().optional(),
  commonSnacks: z.string().optional(),
  foodSources: z.string().optional(),
  foodAllergies: z.string().optional(),
  // 03 饮食习惯（2/4）
  dislikedFoods: z.string().optional(),
  dietPlanType: z.string().optional(),
  typicalDietWorkday: z.string().optional(),
  typicalDietWeekend: z.string().optional(),
  typicalDietDescription: z.string().optional(),
  // 03 饮食习惯（3/4）- 饮品频率
  drinkWater: z.string().optional(),
  drinkCoffee: z.string().optional(),
  drinkTea: z.string().optional(),
  drinkMilk: z.string().optional(),
  drinkPlantMilk: z.string().optional(),
  drinkMilkTea: z.string().optional(),
  drinkSugarFree: z.string().optional(),
  drinkSugary: z.string().optional(),
  drinkEnergy: z.string().optional(),
  drinkOther: z.string().optional(),
  // 03 饮食习惯（4/4）
  highSaltSweat: z.string().optional(),
  dietSatisfaction: z.string().optional(),
  // 04 运动习惯（1/2）
  exerciseLevel: z.string().optional(),
  exerciseTypes: z.string().optional(),
  exerciseDuration: z.string().optional(),
  exerciseFrequency: z.string().optional(),
  exerciseTime: z.string().optional(),
  exerciseMotivation: z.string().optional(),
  // 04 运动习惯（2/2）
  exerciseChallenges: z.string().optional(),
  exerciseGoals: z.string().optional(),
  hasExercisePartner: z.string().optional(),
  exercisePartnerDetail: z.string().optional(),
  // 05 生活方式（1/2）
  stressLevel: z.string().optional(),
  isSmoker: z.string().optional(),
  smokingDetail: z.string().optional(),
  isDrinker: z.string().optional(),
  drinkingDetail: z.string().optional(),
  weekdayWakeTime: z.string().optional(),
  weekdaySleepTime: z.string().optional(),
  morningState: z.string().optional(),
  screenTimeTv: z.string().optional(),
  screenTimeReading: z.string().optional(),
  screenTimeElectronics: z.string().optional(),
  // 05 生活方式（2/2）
  socialActivities: z.string().optional(),
  socialActivitiesOther: z.string().optional(),
  otherFeedback: z.string().optional(),
  // 06 饮食频率（1/3）- 谷薯与水果
  freqRice: z.string().optional(),
  freqNoodlesBread: z.string().optional(),
  freqWholeGrains: z.string().optional(),
  freqFreshFruit: z.string().optional(),
  freqFruitJuice: z.string().optional(),
  freqDriedFruit: z.string().optional(),
  // 06 饮食频率（2/3）- 蔬菜与蛋白质
  freqLeafyVegetables: z.string().optional(),
  freqStarchyVegetables: z.string().optional(),
  freqOtherVegetables: z.string().optional(),
  freqEggs: z.string().optional(),
  freqPoultry: z.string().optional(),
  freqFishSeafood: z.string().optional(),
  freqBeansSoy: z.string().optional(),
  freqRedMeat: z.string().optional(),
  // 06 饮食频率（3/3）- 乳制品与零食
  freqMilkDairy: z.string().optional(),
  freqYogurt: z.string().optional(),
  freqCheese: z.string().optional(),
  freqNonDairyAlternatives: z.string().optional(),
  freqNutsSeeds: z.string().optional(),
  freqCookiesCake: z.string().optional(),
  freqChocolateCandy: z.string().optional(),
  freqSaltySnacks: z.string().optional(),
});

// 更新表单参数校验（所有字段可选）
const nutritionSurveyUpdateSchema = nutritionSurveySchema.partial();

// POST /api/nutrition-survey — 提交营养问卷
router.post('/', authMiddleware, validate(nutritionSurveySchema), nutritionSurveyController.submit);

// POST /api/nutrition-survey/draft — 保存草稿
router.post('/draft', authMiddleware, validate(nutritionSurveyUpdateSchema), nutritionSurveyController.saveDraft);

// GET /api/nutrition-survey — 获取用户问卷列表
router.get('/', authMiddleware, nutritionSurveyController.getList);

// GET /api/nutrition-survey/latest — 获取用户最新问卷
router.get('/latest', authMiddleware, nutritionSurveyController.getLatest);

// GET /api/nutrition-survey/:id — 获取问卷详情
router.get('/:id', authMiddleware, nutritionSurveyController.getDetail);

// PUT /api/nutrition-survey/:id — 更新问卷
router.put('/:id', authMiddleware, validate(nutritionSurveyUpdateSchema), nutritionSurveyController.update);

export default router;
