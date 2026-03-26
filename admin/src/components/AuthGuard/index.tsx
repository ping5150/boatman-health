import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin, Result } from 'antd';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

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

  if (user.role !== 'admin') {
    return (
      <Result
        status="403"
        title="403"
        subTitle="无权限访问管理后台"
      />
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
