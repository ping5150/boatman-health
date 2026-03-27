import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const { pathname } = useLocation();

  const navItems = [
    { name: '首页', icon: 'home_health', href: '/' },
    { name: '服务', icon: 'medical_services', href: '/services' },
    { name: '我的', icon: 'account_circle', href: '/account' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 sm:px-4 pb-4 sm:pb-4 pt-3 bg-surface/90 backdrop-blur-xl z-50 rounded-t-2xl sm:rounded-t-3xl border-t border-outline-variant/20 shadow-[0_-8px_24px_rgba(0,30,64,0.06)]">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`flex flex-col items-center justify-center px-3 sm:px-5 py-2 min-h-[60px] min-w-[60px] sm:min-h-auto sm:min-w-0 transition-all active:scale-90 duration-300 ease-out ${
            isActive(item.href)
              ? 'bg-secondary text-on-secondary rounded-xl'
              : 'text-on-surface-variant hover:text-secondary'
          }`}
        >
          <span
            className="material-symbols-outlined text-xl sm:text-base"
            style={isActive(item.href) ? { fontVariationSettings: 'FILL 1' } : {}}
          >
            {item.icon}
          </span>
          <span className="font-headline text-[9px] sm:text-[10px] font-semibold tracking-wide mt-1">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
