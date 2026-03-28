import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { feishuService } from '../services/feishu.service';
import { sendSuccess, sendError } from '../utils/response';
import { SyncRetryRequest } from '../models/common.types';

export const adminController = {
  /**
   * 管理员登录
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password } = req.body;
      const result = await adminService.login(phone, password);
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

  /**
   * 获取当前管理员信息
   */
  async getCurrentAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await adminService.getCurrentAdmin(userId);
      sendSuccess(res, result);
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
   * 仪表盘统计
   */
  async dashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 表单1列表（预约列表）
   */
  async form1List(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await adminService.getForm1List(page, limit, search, status);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 表单2列表（档案列表）
   */
  async form2List(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const limit = parseInt(String(req.query.limit || '20'), 10);
      const search = req.query.search ? String(req.query.search) : undefined;
      const status = req.query.status as string | undefined;

      const result = await adminService.getForm2List(page, limit, search, status);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 表单1详情（预约详情）
   */
  async form1Detail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        sendError(res, 400, 'ID 参数无效');
        return;
      }

      const result = await adminService.getForm1Detail(id);
      sendSuccess(res, result);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message, error.code);
      } else {
        next(err);
      }
    }
  },

  /**
   * 更新预约
   */
  async updateForm1(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        sendError(res, 400, 'ID 参数无效');
        return;
      }

      const result = await adminService.updateForm1(id, req.body);
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
   * 表单2详情（档案详情）
   */
  async form2Detail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        sendError(res, 400, 'ID 参数无效');
        return;
      }

      const result = await adminService.getForm2Detail(id);
      sendSuccess(res, result);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message, error.code);
      } else {
        next(err);
      }
    }
  },

  /**
   * 更新档案
   */
  async updateForm2(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        sendError(res, 400, 'ID 参数无效');
        return;
      }

      const result = await adminService.updateForm2(id, req.body);
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
   * 同步失败列表
   */
  async syncFailedList(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getSyncFailedList();
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 重试飞书同步
   */
  async syncRetry(req: Request, res: Response, next: NextFunction) {
    try {
      const { table, recordId } = req.body as SyncRetryRequest;

      if (!table || !recordId) {
        sendError(res, 400, '缺少 table 或 recordId 参数');
        return;
      }

      if (table !== 'booking' && table !== 'archive') {
        sendError(res, 400, 'table 参数只能是 booking 或 archive');
        return;
      }

      const result = await feishuService.retrySync(table === 'booking' ? 'form1' : 'form2', recordId);
      sendSuccess(res, result, '同步重试成功');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code: number; message: string };
        sendError(res, error.code, error.message, error.code >= 400 ? error.code : 400);
      } else {
        next(err);
      }
    }
  },

  /**
   * 用户列表
   */
  async userList(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string | undefined;
      const role = req.query.role as string | undefined;

      const result = await adminService.getUserList(page, limit, search, role);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * 用户详情
   */
  async userDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        sendError(res, 400, 'ID 参数无效');
        return;
      }

      const result = await adminService.getUserDetail(id);
      sendSuccess(res, result);
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
   * 更新用户
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        sendError(res, 400, 'ID 参数无效');
        return;
      }

      const result = await adminService.updateUser(id, req.body);
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
