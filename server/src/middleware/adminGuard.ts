import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const adminGuard = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    sendError(res, 403, '无权限访问', 403);
    return;
  }
  next();
};
