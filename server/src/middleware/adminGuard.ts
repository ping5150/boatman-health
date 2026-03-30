import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

/**
 * 管理后台权限守卫
 * 只有拥有 admin 或 salesman 角色的用户才能访问
 * 纯 user 角色无法登录管理后台
 */
export const adminGuard = (req: Request, res: Response, next: NextFunction): void => {
  const userRole = req.user?.role || '';
  
  // 角色是逗号分隔的字符串，检查是否包含 admin 或 salesman
  const roles = userRole.split(',').map(r => r.trim());
  const hasPermission = roles.includes('admin') || roles.includes('salesman');
  
  if (!hasPermission) {
    sendError(res, 403, '无权限访问，仅管理员或业务员可登录管理后台', 403);
    return;
  }
  next();
};
