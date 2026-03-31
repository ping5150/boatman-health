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
  consultationType: z.string().min(1, '咨询类型不能为空'),
  preferredDate: z.string().min(1, '预约日期不能为空'),
  preferredTime: z.string().min(1, '预约时间不能为空'),
  brief: z.string().min(1, '简要说明不能为空'),
});

// 更新表单参数校验
const form1UpdateSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名最长50个字符').optional(),
  phone: z.string().regex(/^\d{11}$/, '联系电话格式错误').optional(),
  consultationType: z.string().min(1, '咨询类型不能为空').optional(),
  preferredDate: z.string().min(1, '预约日期不能为空').optional(),
  preferredTime: z.string().min(1, '预约时间不能为空').optional(),
  brief: z.string().min(1, '简要说明不能为空').optional(),
});

// POST /api/form1 — 提交咨询表单
router.post('/', authMiddleware, validate(form1Schema), form1Controller.submit);

// GET /api/form1 — 获取用户预约列表
router.get('/', authMiddleware, form1Controller.getList);

// GET /api/form1/:id — 获取单个预约详情
router.get('/:id', authMiddleware, form1Controller.getDetail);

// PUT /api/form1/:id — 更新预约（原地修改）
router.put('/:id', authMiddleware, validate(form1UpdateSchema), form1Controller.update);

// DELETE /api/form1/:id — 取消预约
router.delete('/:id', authMiddleware, form1Controller.cancel);

export default router;
