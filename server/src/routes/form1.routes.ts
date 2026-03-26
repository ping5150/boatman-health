import { Router } from 'express';
import { z } from 'zod';
import { form1Controller } from '../controllers/form1.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// 表单1参数校验
const form1Schema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名最长50个字符'),
  phone: z.string().regex(/^\d{11}$/, '联系电话格式错误'),
  consultationType: z.enum(['病历咨询', '体检咨询'], {
    errorMap: () => ({ message: '咨询类型只能是 病历咨询 或 体检咨询' }),
  }),
  preferredTime: z.string().min(1, '首选联系时间不能为空'),
  brief: z.string().min(1, '简要说明不能为空'),
});

// POST /api/form1 — 提交咨询表单
router.post('/', authMiddleware, validate(form1Schema), form1Controller.submit);

export default router;
