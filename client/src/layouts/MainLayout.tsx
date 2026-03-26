import { Outlet } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <main className="pt-16 pb-safe">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
