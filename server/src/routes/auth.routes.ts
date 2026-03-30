import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 检查用户是否存在参数校验
const checkUserSchema = z.object({
  phone: z
    .string()
    .regex(/^\d{11}$/, '手机号格式错误，需为11位数字'),
});

// 密码登录参数校验
const passwordLoginSchema = z.object({
  phone: z
    .string()
    .regex(/^\d{11}$/, '手机号格式错误'),
  password: z
    .string()
    .min(6, '密码长度不能少于6位'),
});

// 注册参数校验
const registerSchema = z.object({
  phone: z
    .string()
    .regex(/^\d{11}$/, '手机号格式错误，需为11位数字'),
  username: z
    .string()
    .min(2, '用户名长度不能少于2位')
    .max(20, '用户名长度不能超过20位'),
  password: z
    .string()
    .min(6, '密码长度不能少于6位'),
});

// 发送验证码参数校验
const sendCodeSchema = z.object({
  phone: z
    .string()
    .regex(/^\d{11}$/, '手机号格式错误'),
});

// 验证码登录参数校验
const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^\d{11}$/, '手机号格式错误'),
  code: z
    .string()
    .length(6, '验证码为6位数字'),
});

// 更新用户信息参数校验
const updateProfileSchema = z.object({
  username: z.string().min(2, '用户名长度不能少于2位').max(20, '用户名长度不能超过20位').optional(),
  phone: z.string().regex(/^\d{11}$/, '手机号格式错误，需为11位数字').optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

// POST /api/auth/check-user — 检查用户是否存在
router.post('/check-user', validate(checkUserSchema), authController.checkUser);

// POST /api/auth/password-login — 密码登录
router.post('/password-login', validate(passwordLoginSchema), authController.passwordLogin);

// POST /api/auth/register — 用户注册
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/send-code — 发送验证码
router.post('/send-code', validate(sendCodeSchema), authController.sendCode);

// POST /api/auth/login — 验证码登录
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/me — 获取当前用户信息（需要认证）
router.get('/me', authMiddleware, authController.getProfile);

// PUT /api/auth/me — 更新当前用户信息（需要认证）
router.put('/me', authMiddleware, validate(updateProfileSchema), authController.updateProfile);

export default router;
