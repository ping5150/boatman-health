import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import { logout } from '@/lib/auth';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary-container/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-48 -left-24 w-64 h-64 rounded-full bg-primary-container/10 blur-[80px] pointer-events-none" />

      {/* Logout Card */}
      <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-[2rem] p-10 shadow-elevated ghost-border">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center">
            <Icon name="logout" size={36} className="text-primary" />
          </div>

          <div className="space-y-4">
            <h2 className="font-headline font-extrabold text-2xl text-primary tracking-tight">确定要退出登录吗？</h2>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed px-2">退出后，您将无法及时接收健康动态和管家提醒。</p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-4 pt-4">
            <button
              onClick={handleLogout}
              className="w-full bg-primary text-on-primary font-body font-semibold py-4 rounded-xl shadow-elevated active:scale-[0.98] transition-all"
            >
              确定退出
            </button>
            <button
              onClick={handleCancel}
              className="w-full bg-transparent text-secondary font-body font-semibold py-4 rounded-xl border border-secondary/20 hover:bg-secondary/5 active:scale-[0.98] transition-all"
            >
              返回
            </button>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute -bottom-1 -right-1 opacity-10 pointer-events-none">
          <svg fill="none" height="80" viewBox="0 0 120 80" width="120" xmlns="http://www.w3.org/2000/svg">
            <path className="text-primary" d="M0 80C30 80 40 40 70 40C100 40 110 0 140 0" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Logout;
