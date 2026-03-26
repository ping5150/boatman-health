import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error('GLOBAL', `Unhandled error: ${err.message}`, err);

  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
  });
};
