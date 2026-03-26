import { Outlet, useLocation } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

// 需要隐藏底部导航的路由
const hideBottomNavPaths = ['/login', '/booking-success', '/archive-success'];

const SubPageLayout = () => {
  const location = useLocation();
  const hideNav = hideBottomNavPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-surface">
      <TopBar showBack />
      <main className={`pt-16 ${hideNav ? 'pb-8' : 'pb-safe'}`}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default SubPageLayout;
