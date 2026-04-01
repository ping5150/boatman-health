import { useState, useEffect, useCallback } from 'react';
import { tokenUtil } from '../utils/token';

interface AuthUser {
  userId: string;
  phone: string;
  role: string; // 逗号分隔的多角色
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = tokenUtil.getUser();
    const token = tokenUtil.getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, userInfo: AuthUser) => {
    tokenUtil.setToken(token);
    tokenUtil.setUser(userInfo);
    setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    tokenUtil.clear();
    setUser(null);
  }, []);

  // 检查是否拥有某个角色
  const hasRole = useCallback((role: string): boolean => {
    if (!user?.role) return false;
    const roles = user.role.split(',').map(r => r.trim());
    return roles.includes(role);
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: hasRole('admin'),
    isSalesman: hasRole('salesman'),
    hasRole,
    login,
    logout,
  };
};
