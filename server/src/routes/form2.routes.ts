import { Router } from 'express';
import { z } from 'zod';
import { form2Controller } from '../controllers/form2.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// 健康档案表单校验（扁平结构，匹配前端 HealthFormData）
const healthFormSchema = z.object({
  // 基本信息
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().min(1, '联系电话不能为空'),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  // 健康背景
  diseases: z.array(z.object({
    name: z.string(),
    date: z.string(),
  })).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
  })).optional(),
  surgery: z.object({
    has: z.string(),
    detail: z.string().optional(),
  }).optional(),
  allergy: z.object({
    has: z.string(),
    detail: z.string().optional(),
  }).optional(),
  vascular: z.object({
    qualified: z.string(),
    reason: z.string().optional(),
  }).optional(),
  familyHistory: z.array(z.string()).optional(),
  familyHistoryOther: z.string().optional(),
  familyHistoryNote: z.string().optional(),
  // 饮食模式
  dietModes: z.array(z.string()).optional(),
  drinks: z.array(z.string()).optional(),
  drinksOther: z.string().optional(),
  mealFeeling: z.array(z.string()).optional(),
  mealFeelingOther: z.string().optional(),
  dietRestriction: z.string().optional(),
  // 运动
  exerciseTypes: z.array(z.string()).optional(),
  exerciseFrequency: z.string().optional(),
  exerciseDuration: z.string().optional(),
  // 睡眠
  sleepDuration: z.string().optional(),
  sleepQuality: z.string().optional(),
  wakeUpFeeling: z.array(z.string()).optional(),
  // 压力情绪
  stressLevel: z.number().min(1).max(10).optional(),
  anxietyFrequency: z.string().optional(),
  brainFog: z.array(z.string()).optional(),
  brainFogOther: z.string().optional(),
  // 其他
  healthConcerns: z.string().optional(),
  uploadedFiles: z.array(z.object({
    name: z.string(),
    size: z.number(),
    url: z.string(),
    type: z.enum(['pdf', 'image', 'doc', 'other']),
  })).optional(),
});

// 更新表单参数校验（所有字段可选）
const healthFormUpdateSchema = healthFormSchema.partial();

// POST /api/form2 — 提交健康评估表单
router.post('/', authMiddleware, validate(healthFormSchema), form2Controller.submit);

// POST /api/form2/draft — 保存草稿
router.post('/draft', authMiddleware, validate(healthFormUpdateSchema), form2Controller.saveDraft);

// GET /api/form2 — 获取用户档案列表
router.get('/', authMiddleware, form2Controller.getList);

// GET /api/form2/latest — 获取用户最新档案
router.get('/latest', authMiddleware, form2Controller.getLatest);

// GET /api/form2/:id — 获取档案详情
router.get('/:id', authMiddleware, form2Controller.getDetail);

// PUT /api/form2/:id — 更新档案
router.put('/:id', authMiddleware, validate(healthFormUpdateSchema), form2Controller.update);

export default router;
