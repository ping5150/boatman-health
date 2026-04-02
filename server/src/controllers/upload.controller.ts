import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { sendSuccess, sendError } from '../utils/response';

export const uploadController = {
  /**
   * 上传文件（支持单个或多个）
   */
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        sendError(res, 400, '请选择要上传的文件');
        return;
      }

      const results = await uploadService.uploadFiles(files, userId);

      sendSuccess(res, results, '文件上传成功');
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
