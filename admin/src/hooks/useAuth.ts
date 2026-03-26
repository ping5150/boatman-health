import { useState, useEffect, useCallback } from 'react';
import { tokenUtil } from '../utils/token';

interface AuthUser {
  userId: number;
  phone: string;
  role: string;
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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };
};
