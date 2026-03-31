import { Request, Response, NextFunction } from 'express';
import { formService } from '../services/form.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export const form1Controller = {
  /**
   * 提交咨询表单
   */
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { name, phone, consultationType, preferredDate, preferredTime, brief } = req.body;

      const result = await formService.submitForm1(userId, {
        name,
        phone,
        consultationType,
        preferredDate,
        preferredTime,
        brief,
      });

      sendCreated(res, result, '表单提交成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },

  /**
   * 获取用户预约列表
   */
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await formService.getForm1List(userId);
      sendSuccess(res, result, '获取成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },

  /**
   * 获取单个预约详情
   */
  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = parseInt(req.params.id as string, 10);
      const result = await formService.getForm1Detail(userId, id);
      sendSuccess(res, result, '获取成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },

  /**
   * 更新预约（原地修改）
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = parseInt(req.params.id as string, 10);
      const { name, phone, consultationType, preferredDate, preferredTime, brief } = req.body;

      const result = await formService.updateForm1(userId, id, {
        name,
        phone,
        consultationType,
        preferredDate,
        preferredTime,
        brief,
      });

      sendSuccess(res, result, '更新成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },

  /**
   * 取消预约
   */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = parseInt(req.params.id as string, 10);

      const result = await formService.cancelForm1(userId, id);
      sendSuccess(res, result, '预约已取消');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message);
      } else {
        next(err);
      }
    }
  },
};
