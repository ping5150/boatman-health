import { Router } from 'express';
import { z } from 'zod';
import { form2Controller } from '../controllers/form2.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// 表单2参数校验（嵌套 JSON 结构）
const form2Schema = z.object({
  basicInfo: z.object({
    name: z.string().min(1, '姓名不能为空'),
    customerId: z.string().min(1, '客户号不能为空'),
    phone: z.string().min(1, '联系电话不能为空'),
    emergencyContact: z.object({
      name: z.string().min(1, '紧急联系人姓名不能为空'),
      phone: z.string().min(1, '紧急联系人电话不能为空'),
    }),
  }),
  healthBackground: z.object({
    currentDiseases: z.array(z.object({
      diagnosis: z.string(),
      diagnosedAt: z.string(),
    })),
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
    })),
    surgeryHistory: z.object({
      hasSurgery: z.boolean(),
      details: z.string().optional(),
    }),
    allergyHistory: z.object({
      hasAllergy: z.boolean(),
      details: z.string().optional(),
    }),
    vascularAssessment: z.object({
      result: z.enum(['合格', '不合格']),
      reason: z.string().optional(),
    }),
    familyHistory: z.object({
      selected: z.array(z.string()),
      tumorType: z.string().optional(),
      other: z.string().optional(),
    }),
    medicalQuestions: z.string(),
  }),
  lifestyle: z.object({
    diet: z.object({
      dietPatterns: z.array(z.string()),
      beverages: z.array(z.string()),
      beverageOther: z.string().optional(),
      postMealFeelings: z.array(z.string()),
      postMealOther: z.string().optional(),
      foodRestrictions: z.string(),
    }),
    exercise: z.object({
      types: z.array(z.string()),
      frequencyPerWeek: z.number(),
      durationMinutes: z.number(),
    }),
    sleep: z.object({
      avgHours: z.string(),
      fallAsleep: z.string(),
      morningFeeling: z.string(),
    }),
    stress: z.object({
      stressScore: z.number().min(1).max(10),
    }),
    anxiety: z.object({
      frequency: z.string(),
    }),
    brainFog: z.object({
      symptoms: z.array(z.string()),
      other: z.string().optional(),
    }),
  }),
});

// POST /api/form2 — 提交健康评估表单
router.post('/', authMiddleware, validate(form2Schema), form2Controller.submit);

export default router;
