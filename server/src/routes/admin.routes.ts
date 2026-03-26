import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth';
import { adminGuard } from '../middleware/adminGuard';

const router = Router();

// 所有管理后台路由都需要 JWT 认证 + 管理员权限
router.use(authMiddleware, adminGuard);

// GET /admin/dashboard — 仪表盘统计
router.get('/dashboard', adminController.dashboard);

// GET /admin/form1/list — 表单1列表
router.get('/form1/list', adminController.form1List);

// GET /admin/form2/list — 表单2列表
router.get('/form2/list', adminController.form2List);

// GET /admin/form1/:id — 表单1详情
router.get('/form1/:id', adminController.form1Detail);

// GET /admin/form2/:id — 表单2详情
router.get('/form2/:id', adminController.form2Detail);

// GET /admin/sync/failed — 同步失败列表
router.get('/sync/failed', adminController.syncFailedList);

// POST /admin/sync/retry — 重试飞书同步
router.post('/sync/retry', adminController.syncRetry);

export default router;
