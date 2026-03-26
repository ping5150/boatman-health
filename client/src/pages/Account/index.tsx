import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import { getUser } from '@/lib/auth';

const Account = () => {
  const navigate = useNavigate();
  const user = getUser();

  return (
    <div className="px-6 py-8 space-y-8">
      {/* User Profile Hero */}
      <section>
        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container text-white overflow-hidden shadow-elevated relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
          <div className="flex items-center space-x-6 relative z-10">
            <div className="w-20 h-20 rounded-full bg-surface/10 backdrop-blur-md flex items-center justify-center ghost-border">
              <Icon name="account_circle" filled size={40} className="text-secondary-fixed-dim" />
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">{user?.name || '未登录'}</h2>
              {user?.phone && <p className="text-on-primary-container text-sm mt-1 opacity-80">{user.phone}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Archive Center */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-lg text-primary px-2">档案中心</h3>
        <div className="space-y-4">
          {/* Basic Info */}
          <div
            onClick={() => navigate('/account/profile')}
            className="p-6 rounded-3xl bg-surface-container-low flex justify-between items-center cursor-pointer transition-all hover:bg-surface-container active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                <Icon name="badge" size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-headline font-bold text-primary">基本信息</p>
                <p className="text-xs text-on-surface-variant">个人身份及联系方式</p>
              </div>
            </div>
            <button className="px-4 py-2 text-xs font-bold text-secondary bg-secondary/5 rounded-full">查看/修改</button>
          </div>

          {/* Deep Health Profile */}
          <div
            onClick={() => navigate('/account/health-archive')}
            className="p-6 rounded-3xl bg-surface-container-low flex justify-between items-center cursor-pointer transition-all hover:bg-surface-container active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                <Icon name="analytics" size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-headline font-bold text-primary">深度健康档案</p>
                <p className="text-xs text-on-surface-variant">病历、体检报告及用药史</p>
              </div>
            </div>
            <button className="px-4 py-2 text-xs font-bold text-secondary bg-secondary/5 rounded-full">查看/修改</button>
          </div>
        </div>
      </section>

      {/* My Appointments */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-lg text-primary px-2">我的预约</h3>
        <div className="space-y-3">
          <div className="p-5 rounded-3xl bg-surface-container-lowest shadow-sm ghost-border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Icon name="stethoscope" size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-primary">全科医生深度问诊</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">预约时间：待管家确认</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full uppercase">管家处理中</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-secondary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Settings */}
      <section className="pt-4">
        <div className="bg-surface-container-low rounded-[2rem] overflow-hidden">
          <div className="p-2 space-y-1">
            <div
              onClick={() => navigate('/account/contact')}
              className="flex justify-between items-center p-4 hover:bg-surface-container transition-colors rounded-2xl cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Icon name="support_agent" size={22} className="text-on-surface-variant" />
                <span className="font-medium text-sm">联系管家</span>
              </div>
              <Icon name="chevron_right" size={18} className="text-on-surface-variant" />
            </div>
            <div
              onClick={() => navigate('/account/logout')}
              className="flex justify-between items-center p-4 hover:bg-error/5 transition-colors rounded-2xl cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Icon name="logout" size={22} className="text-error" />
                <span className="font-medium text-sm text-error">退出登录</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Account;
