import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validator';

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

export default router;
