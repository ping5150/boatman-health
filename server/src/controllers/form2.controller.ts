import { Request, Response, NextFunction } from 'express';
import { formService } from '../services/form.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export const form2Controller = {
  /**
   * 提交健康评估表单
   */
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const formData = req.body;

      const result = await formService.submitForm2(userId, formData);

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
   * 获取用户档案列表
   */
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await formService.getForm2List(userId);
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
   * 获取档案详情
   */
  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = parseInt(req.params.id as string, 10);
      const result = await formService.getForm2Detail(userId, id);
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
   * 更新档案
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = parseInt(req.params.id as string, 10);
      const formData = req.body;

      const result = await formService.updateForm2(userId, id, formData);

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
};
