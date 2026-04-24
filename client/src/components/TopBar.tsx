import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showAccount?: boolean;
  transparent?: boolean;
  onBack?: () => void;
}

const AUTH_MODAL_FLAG = 'auth_modal_login';

const TopBar = ({
  title = '船夫健康',
  showBack = false,
  showAccount = true,
  transparent = false,
  onBack,
}: TopBarProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    // 如果是从登录弹窗登录后的页面，返回首页
    if (sessionStorage.getItem(AUTH_MODAL_FLAG) === 'true') {
      sessionStorage.removeItem(AUTH_MODAL_FLAG);
      navigate('/', { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 py-3 ${transparent ? 'bg-transparent' : 'bg-surface/80 backdrop-blur-xl shadow-sm'}`}>
      {!showBack && (
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/logo.png" alt="船夫健康Logo" className="h-[26px] sm:h-8 w-auto" />
          <span className="text-lg sm:text-xl font-black text-primary tracking-tighter font-headline">{title}</span>
        </div>
      )}

      {showBack && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 min-h-[44px] min-w-[44px] active:scale-95 transition-transform touch-manipulation"
        >
          <Icon name="arrow_back" size={24} className="text-primary cursor-pointer" />
          <span className="text-lg sm:text-xl font-black text-primary tracking-tighter font-headline">{title}</span>
        </button>
      )}

      {showAccount && (
        <div className="w-8 h-8" />
      )}
    </header>
  );
};

export default TopBar;
