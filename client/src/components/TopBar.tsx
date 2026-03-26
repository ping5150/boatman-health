import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  onBack?: () => void;
}

const TopBar = ({ title, showBack = false, transparent = false, onBack }: TopBarProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 transition-all ${
        transparent
          ? 'bg-transparent'
          : 'glass shadow-sm shadow-primary/5'
      }`}
    >
      <div className="flex items-center gap-2">
        {showBack ? (
          <button onClick={handleBack} className="active:scale-90 transition-transform">
            <Icon name="arrow_back" size={24} className="text-primary cursor-pointer" />
          </button>
        ) : (
          <Icon name="menu" size={24} className="text-primary cursor-pointer" />
        )}
        {title ? (
          <span className="text-lg font-bold text-primary font-headline tracking-tight">{title}</span>
        ) : (
          <span className="text-xl font-black text-primary tracking-tighter font-headline">船夫健康</span>
        )}
      </div>
      <div className="flex items-center">
        <button onClick={() => navigate('/account')} className="active:scale-90 transition-transform">
          <Icon name="account_circle" size={24} className="text-primary cursor-pointer" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
