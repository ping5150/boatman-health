import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validator';

const router = Router();

// 注册参数校验
const registerSchema = z.object({
  phone: z
    .string()
    .regex(/^\d{11}$/, '手机号格式错误，需为11位数字'),
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

// 登录参数校验
const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^\d{11}$/, '手机号格式错误'),
  code: z
    .string()
    .length(6, '验证码为6位数字'),
});

// POST /api/auth/register — 用户注册
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/send-code — 发送验证码
router.post('/send-code', validate(sendCodeSchema), authController.sendCode);

// POST /api/auth/login — 验证码登录
router.post('/login', validate(loginSchema), authController.login);

export default router;
