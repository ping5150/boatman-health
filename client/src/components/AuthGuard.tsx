import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';
import { useAuthModal } from '@/contexts/AuthModalContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AUTH_MODAL_FLAG = 'auth_modal_login';

const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const { openModal, setOnSuccess } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated()) {
      // 设置登录成功后的回调：设置标记后刷新页面
      setOnSuccess(() => () => {
        sessionStorage.setItem(AUTH_MODAL_FLAG, 'true');
        window.location.reload();
      });
      openModal();
    }

    // 监听 axios 401 事件
    const handleAuthRequired = () => {
      setOnSuccess(() => () => {
        sessionStorage.setItem(AUTH_MODAL_FLAG, 'true');
        window.location.reload();
      });
      openModal();
    };

    window.addEventListener('auth:required', handleAuthRequired);

    return () => {
      window.removeEventListener('auth:required', handleAuthRequired);
    };
  }, [openModal, setOnSuccess, location.pathname]);

  // 始终渲染 children，弹窗会覆盖在页面上
  return <>{children}</>;
};

export default AuthGuard;
