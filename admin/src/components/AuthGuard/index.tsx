import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = user.role.split(',').map((r: string) => r.trim());
  if (!roles.includes('admin') && !roles.includes('salesman')) {
    // 无权限：清除本地 token，跳转登录页
    logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
