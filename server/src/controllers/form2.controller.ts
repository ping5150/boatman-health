import { Request, Response, NextFunction } from 'express';
import { formService } from '../services/form.service';
import { sendCreated, sendError } from '../utils/response';

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
};
