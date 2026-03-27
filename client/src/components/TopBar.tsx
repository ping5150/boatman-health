import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showAccount?: boolean;
  onBack?: () => void;
}

const TopBar = ({
  title = '船夫健康',
  showBack = false,
  showAccount = true,
  onBack,
}: TopBarProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-4 sm:px-6 py-3 shadow-sm">
      {!showBack && (
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/logo.png" alt="船夫健康Logo" className="h-[26px] sm:h-8 w-auto" />
          <span className="text-lg sm:text-xl font-black text-primary tracking-tighter font-headline">{title}</span>
        </div>
      )}

      {showBack && (
        <button
          onClick={onBack || (() => navigate(-1))}
          className="flex items-center gap-2 min-h-[44px] min-w-[44px] active:scale-95 transition-transform touch-manipulation"
        >
          <span className="material-symbols-outlined text-primary cursor-pointer">arrow_back</span>
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
