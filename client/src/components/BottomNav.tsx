import { useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  matchPaths: string[];
}

const navItems: NavItem[] = [
  {
    label: '首页',
    icon: 'home_health',
    path: '/',
    matchPaths: ['/'],
  },
  {
    label: '服务',
    icon: 'medical_services',
    path: '/services',
    matchPaths: ['/services', '/paradigm', '/service-journey', '/about', '/cases', '/consultation', '/health-form', '/booking-success'],
  },
  {
    label: '账户',
    icon: 'account_circle',
    path: '/account',
    matchPaths: ['/account', '/account/profile', '/account/health-archive', '/account/logout', '/account/contact', '/archive-success'],
  },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item: NavItem): boolean => {
    return item.matchPaths.some((p) => {
      if (p === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(p);
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 glass z-50 rounded-t-3xl shadow-ambient">
      {navItems.map((item) => {
        const active = isActive(item);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center px-5 py-2 rounded-xl transition-all duration-300 ease-out active:scale-90 ${
              active
                ? 'bg-secondary text-on-secondary'
                : 'text-outline hover:text-secondary'
            }`}
          >
            <Icon name={item.icon} filled={active} size={24} />
            <span className="font-headline text-[10px] font-semibold tracking-wide mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
