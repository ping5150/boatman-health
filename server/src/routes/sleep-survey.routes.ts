import { Router } from 'express';
import { z } from 'zod';
import { sleepSurveyController } from '../controllers/sleep-survey.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// 睡眠问卷表单校验
const sleepSurveySchema = z.object({
  // 基本信息
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().min(1, '联系电话不能为空'),
  // 基础睡眠模式
  bedtime: z.string().optional(),
  sleepLatency: z.string().optional(),
  wakeTime: z.string().optional(),
  sleepDurationHours: z.number().int().min(0).max(24).optional(),
  sleepDurationMinutes: z.number().int().min(0).max(59).optional(),
  // 入睡与夜间干扰 (A-J)
  cantFallAsleep30min: z.string().optional(),
  wakeUpEarly: z.string().optional(),
  getUpToilet: z.string().optional(),
  breathingDiscomfort: z.string().optional(),
  coughSnore: z.string().optional(),
  feelCold: z.string().optional(),
  feelHot: z.string().optional(),
  nightmares: z.string().optional(),
  pain: z.string().optional(),
  otherSleepIssues: z.string().optional(),
  // 梦境与整体评估
  sleepQualityRating: z.string().optional(),
  // 药物与日间影响
  sleepMedication: z.string().optional(),
  stayAwakeDifficulty: z.string().optional(),
  taskCompletionDifficulty: z.string().optional(),
  // 睡眠质量观察
  sleepPartner: z.string().optional(),
  snoring: z.string().optional(),
  breathingPause: z.string().optional(),
  legTwitch: z.string().optional(),
  disorientation: z.string().optional(),
  otherRestlessSleep: z.string().optional(),
});

// 更新表单参数校验（所有字段可选）
const sleepSurveyUpdateSchema = sleepSurveySchema.partial();

// 草稿保存校验（所有字段可选，name和phone允许为空字符串）
const sleepSurveyDraftSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  bedtime: z.string().optional(),
  sleepLatency: z.string().optional(),
  wakeTime: z.string().optional(),
  sleepDurationHours: z.number().int().min(0).max(24).optional(),
  sleepDurationMinutes: z.number().int().min(0).max(59).optional(),
  cantFallAsleep30min: z.string().optional(),
  wakeUpEarly: z.string().optional(),
  getUpToilet: z.string().optional(),
  breathingDiscomfort: z.string().optional(),
  coughSnore: z.string().optional(),
  feelCold: z.string().optional(),
  feelHot: z.string().optional(),
  nightmares: z.string().optional(),
  pain: z.string().optional(),
  otherSleepIssues: z.string().optional(),
  sleepQualityRating: z.string().optional(),
  sleepMedication: z.string().optional(),
  stayAwakeDifficulty: z.string().optional(),
  taskCompletionDifficulty: z.string().optional(),
  sleepPartner: z.string().optional(),
  snoring: z.string().optional(),
  breathingPause: z.string().optional(),
  legTwitch: z.string().optional(),
  disorientation: z.string().optional(),
  otherRestlessSleep: z.string().optional(),
});

// POST /api/sleep-survey — 提交睡眠问卷（允许name和phone为空，后端自动填充）
router.post('/', authMiddleware, validate(sleepSurveyDraftSchema), sleepSurveyController.submit);

// POST /api/sleep-survey/draft — 保存草稿
router.post('/draft', authMiddleware, validate(sleepSurveyDraftSchema), sleepSurveyController.saveDraft);

// GET /api/sleep-survey — 获取用户问卷列表
router.get('/', authMiddleware, sleepSurveyController.getList);

// GET /api/sleep-survey/latest — 获取用户最新问卷
router.get('/latest', authMiddleware, sleepSurveyController.getLatest);

// GET /api/sleep-survey/:id — 获取问卷详情
router.get('/:id', authMiddleware, sleepSurveyController.getDetail);

// PUT /api/sleep-survey/:id — 更新问卷
router.put('/:id', authMiddleware, validate(sleepSurveyUpdateSchema), sleepSurveyController.update);

export default router;
