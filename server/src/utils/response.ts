import { Response } from 'express';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export const sendSuccess = <T>(res: Response, data?: T, message = '操作成功', statusCode = 200): void => {
  const response: ApiResponse<T> = {
    code: 0,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, code: number, message: string, statusCode = 400): void => {
  const response: ApiResponse = {
    code,
    message,
  };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data?: T, message = '创建成功'): void => {
  sendSuccess(res, data, message, 201);
};
