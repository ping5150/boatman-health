import { Router } from 'express';
import { z } from 'zod';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth';
import { adminGuard } from '../middleware/adminGuard';
import { validate } from '../middleware/validator';

const router = Router();

// ==================== 管理员登录（无需认证） ====================

const adminLoginSchema = z.object({
  phone: z.string().regex(/^\d{11}$/, '手机号格式错误'),
  password: z.string().min(6, '密码长度不能少于6位'),
});

// POST /admin/auth/login — 管理员登录
router.post('/auth/login', validate(adminLoginSchema), adminController.login);

// ==================== 需要认证的管理后台路由 ====================

// GET /admin/auth/me — 获取当前管理员信息
router.get('/auth/me', authMiddleware, adminGuard, adminController.getCurrentAdmin);

// GET /admin/dashboard — 仪表盘统计
router.get('/dashboard', authMiddleware, adminGuard, adminController.dashboard);

// ==================== 预约管理 ====================

// GET /admin/form1/list — 预约列表
router.get('/form1/list', authMiddleware, adminGuard, adminController.form1List);

// GET /admin/form1/:id — 预约详情
router.get('/form1/:id', authMiddleware, adminGuard, adminController.form1Detail);

// PUT /admin/form1/:id — 更新预约
router.put('/form1/:id', authMiddleware, adminGuard, adminController.updateForm1);

// ==================== 档案管理 ====================

// GET /admin/form2/list — 档案列表
router.get('/form2/list', authMiddleware, adminGuard, adminController.form2List);

// GET /admin/form2/:id — 档案详情
router.get('/form2/:id', authMiddleware, adminGuard, adminController.form2Detail);

// PUT /admin/form2/:id — 更新档案
router.put('/form2/:id', authMiddleware, adminGuard, adminController.updateForm2);

// ==================== 用户管理 ====================

// GET /admin/users — 用户列表
router.get('/users', authMiddleware, adminGuard, adminController.userList);

// GET /admin/users/:id — 用户详情
router.get('/users/:id', authMiddleware, adminGuard, adminController.userDetail);

// PUT /admin/users/:id — 更新用户
router.put('/users/:id', authMiddleware, adminGuard, adminController.updateUser);

// ==================== 同步管理 ====================

// GET /admin/sync/failed — 同步失败列表
router.get('/sync/failed', authMiddleware, adminGuard, adminController.syncFailedList);

// POST /admin/sync/retry — 重试飞书同步
router.post('/sync/retry', authMiddleware, adminGuard, adminController.syncRetry);

export default router;
