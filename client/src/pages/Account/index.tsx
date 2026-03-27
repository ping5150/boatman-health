import { Link, useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';

const Account = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <TopBar showAccount={false} />

      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto space-y-8">
        {/* User Profile Hero Section */}
        <section className="relative group">
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container text-white overflow-hidden shadow-[0_20px_40px_rgba(0,30,64,0.15)]">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30">
                  <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>person</span>
                </div>
                <div>
                  <h2 className="font-headline font-extrabold text-3xl tracking-tight">{user?.username || '用户'}</h2>
                  <p className="text-white/80 text-sm mt-1">{user?.phone || '未绑定手机号'}</p>
                </div>
              </div>
              <Link to="/account/settings" className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all active:scale-95">
                <span className="material-symbols-outlined text-white text-2xl">settings</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Personal Information Section */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-lg text-primary px-2">档案中心</h3>
          <div className="grid grid-cols-1 gap-4">
            <Link to="/account/profile" className="p-6 rounded-[1.5rem] bg-surface-container-low flex justify-between items-center group transition-all duration-300 hover:bg-surface-container">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">badge</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-primary">基本信息</p>
                  <p className="text-xs text-on-surface-variant">个人身份及联系方式</p>
                </div>
              </div>
              <button className="px-4 py-2 text-xs font-bold text-secondary bg-secondary/5 rounded-full hover:bg-secondary/10 transition-colors">查看/修改</button>
            </Link>

            <Link to="/account/health-archive" className="p-6 rounded-[1.5rem] bg-surface-container-low flex justify-between items-center group transition-all duration-300 hover:bg-surface-container">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-primary">深度健康档案</p>
                  <p className="text-xs text-on-surface-variant">病历、体检报告及用药史</p>
                </div>
              </div>
              <button className="px-4 py-2 text-xs font-bold text-secondary bg-secondary/5 rounded-full hover:bg-secondary/10 transition-colors">查看/修改</button>
            </Link>
          </div>
        </section>

        {/* My Appointments Section */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-lg text-primary px-2">我的预约</h3>
          <div className="space-y-3">
            <div className="p-5 rounded-[1.5rem] bg-surface-container-lowest shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-xl">stethoscope</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primary">全科医生深度问诊</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">预约时间：2024年10月24日 14:00</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full uppercase">管家处理中</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-secondary"></div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-[1.5rem] bg-surface-container-lowest shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-xl">medical_information</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primary">海外专家远程会诊</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">预约时间：待定</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded-full uppercase">已提交</span>
              </div>
            </div>
          </div>
        </section>

        {/* System Settings Section */}
        <section className="pt-4">
          <div className="bg-surface-container-low rounded-[2rem] overflow-hidden">
            <div className="p-2 space-y-1">
              <Link to="/account/contact" className="flex justify-between items-center p-4 hover:bg-surface-container transition-colors rounded-2xl cursor-pointer">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant">support_agent</span>
                  <span className="font-medium text-sm">联系管家</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
              </Link>
              <Link to="/account/logout" className="flex justify-between items-center p-4 hover:bg-error/5 transition-colors rounded-2xl cursor-pointer">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-error">logout</span>
                  <span className="font-medium text-sm text-error">退出登录</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
};

export default Account;
