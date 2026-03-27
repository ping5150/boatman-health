import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, setToken, removeToken, getUser as getStoredUser, setUser as storeUser, removeUser } from '@/lib/auth';

interface User {
  id: string;
  username: string;
  phone: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  login: (user: User, token?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 从 localStorage 加载用户信息
  useEffect(() => {
    const savedUser = getStoredUser();
    const token = getToken();
    if (savedUser && token) {
      // 兼容旧数据格式（lib/auth.ts 用 name，UserContext 用 username）
      const userData: User = {
        id: savedUser.id,
        username: (savedUser as any).username || savedUser.name || '用户',
        phone: savedUser.phone,
        avatar: (savedUser as any).avatar,
      };
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    // 兼容两种存储格式
    storeUser({
      id: userData.id,
      phone: userData.phone,
      name: userData.username,
      role: 'user',
    });
    if (token) {
      setToken(token);
    } else if (!getToken()) {
      // 如果没有 token，生成一个模拟的
      setToken(`mock_token_${Date.now()}`);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    removeToken();
    removeUser();
    sessionStorage.clear();
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
