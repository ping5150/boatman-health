import { Router } from 'express';
import { z } from 'zod';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth';
import { adminGuard } from '../middleware/adminGuard';
import { validate } from '../middleware/validator';

const router = Router();

// 更新用户参数校验
const updateUserSchema = z.object({
  username: z.string().min(2, '用户名长度不能少于2位').max(20, '用户名长度不能超过20位').optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  emergencyPhone: z.string().optional(),
  role: z.string().optional(), // 支持多角色，逗号分隔，如 "user,salesman"
});

// ==================== 管理员登录/注册（无需认证） ====================

const adminLoginSchema = z.object({
  phone: z.string().regex(/^\d{11}$/, '手机号格式错误'),
  password: z.string().min(6, '密码长度不能少于6位'),
});

const adminRegisterSchema = z.object({
  phone: z.string().regex(/^\d{11}$/, '手机号格式错误'),
  username: z.string().min(2, '用户名长度不能少于2位').max(20, '用户名长度不能超过20位'),
  password: z.string().min(6, '密码长度不能少于6位'),
});

// POST /admin/auth/login — 管理员登录
router.post('/auth/login', validate(adminLoginSchema), adminController.login);

// POST /admin/auth/register — 管理员注册
router.post('/auth/register', validate(adminRegisterSchema), adminController.register);

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

// ==================== 睡眠问卷管理 ====================

// GET /admin/sleep-surveys/list — 睡眠问卷列表
router.get('/sleep-surveys/list', authMiddleware, adminGuard, adminController.sleepSurveyList);

// GET /admin/sleep-surveys/:id — 睡眠问卷详情
router.get('/sleep-surveys/:id', authMiddleware, adminGuard, adminController.sleepSurveyDetail);

// ==================== 营养问卷管理 ====================

// GET /admin/nutrition-surveys/list — 营养问卷列表
router.get('/nutrition-surveys/list', authMiddleware, adminGuard, adminController.nutritionSurveyList);

// GET /admin/nutrition-surveys/:id — 营养问卷详情
router.get('/nutrition-surveys/:id', authMiddleware, adminGuard, adminController.nutritionSurveyDetail);

// ==================== 用户管理 ====================

// GET /admin/users — 用户列表
router.get('/users', authMiddleware, adminGuard, adminController.userList);

// GET /admin/users/:id — 用户详情
router.get('/users/:id', authMiddleware, adminGuard, adminController.userDetail);

// PUT /admin/users/:id — 更新用户（包括角色）
router.put('/users/:id', authMiddleware, adminGuard, validate(updateUserSchema), adminController.updateUser);

// ==================== 同步管理 ====================

// GET /admin/sync/stats — 同步统计
router.get('/sync/stats', authMiddleware, adminGuard, adminController.syncStats);

// GET /admin/sync/failed — 同步失败列表
router.get('/sync/failed', authMiddleware, adminGuard, adminController.syncFailedList);

// POST /admin/sync/user — 一键同步用户
router.post('/sync/user', authMiddleware, adminGuard, adminController.syncAllUsers);

// POST /admin/sync/booking — 一键同步预约
router.post('/sync/booking', authMiddleware, adminGuard, adminController.syncAllBookings);

// POST /admin/sync/archive — 一键同步档案
router.post('/sync/archive', authMiddleware, adminGuard, adminController.syncAllArchives);

// POST /admin/sync/retry — 重试飞书同步
router.post('/sync/retry', authMiddleware, adminGuard, adminController.syncRetry);

export default router;
