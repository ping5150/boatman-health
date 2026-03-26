import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export const authController = {
  /**
   * 用户注册
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password } = req.body;
      const result = await authService.register(phone, password);
      sendCreated(res, result, '注册成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message, error.code === 409 ? 409 : 400);
      } else {
        next(err);
      }
    }
  },

  /**
   * 发送验证码
   */
  async sendCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      await authService.sendCode(phone);
      sendSuccess(res, null, '验证码已发送');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message, 400);
      } else {
        next(err);
      }
    }
  },

  /**
   * 验证码登录
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, code } = req.body;
      const result = await authService.login(phone, code);
      sendSuccess(res, result, '登录成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message, 401);
      } else {
        next(err);
      }
    }
  },
};
