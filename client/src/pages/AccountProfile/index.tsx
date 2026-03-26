import { useState } from 'react';
import Icon from '@/components/Icon';
import { getUser } from '@/lib/auth';

const AccountProfile = () => {
  const user = getUser();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('配偶');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: 对接用户信息更新 API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pb-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-b-3xl bg-primary-container mb-8 px-8 py-12 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <p className="font-label text-secondary-fixed-dim text-xs tracking-widest uppercase mb-2">会员档案</p>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight">基本信息</h2>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Identity Group */}
        <div className="bg-surface-container-low rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="person" size={22} className="text-secondary" />
            <h3 className="font-headline font-bold text-lg text-primary">身份详情</h3>
          </div>
          <div className="space-y-2">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">姓名</label>
            <div className="relative group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入您的姓名"
                className="w-full bg-surface-container-highest rounded-xl px-4 py-4 text-on-surface font-medium focus:ring-2 focus:ring-secondary/60 outline-none border-none"
              />
              <Icon name="edit" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary transition-colors" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">联系电话</label>
            <div className="relative group">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入联系电话"
                className="w-full bg-surface-container-highest rounded-xl px-4 py-4 text-on-surface font-medium focus:ring-2 focus:ring-secondary/60 outline-none border-none"
              />
              <Icon name="call" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary transition-colors" />
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-surface-container-low rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="emergency" size={22} className="text-error" />
            <h3 className="font-headline font-bold text-lg text-primary">紧急联系人</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">姓名</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="紧急联系人姓名"
                className="w-full bg-surface-container-highest rounded-xl px-4 py-4 text-on-surface font-medium focus:ring-2 focus:ring-secondary/60 outline-none border-none"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">关系</label>
              <select
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                className="w-full bg-surface-container-highest rounded-xl px-4 py-4 text-on-surface font-medium focus:ring-2 focus:ring-secondary/60 outline-none border-none appearance-none"
              >
                {['配偶', '父母', '子女', '同事'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">联系电话</label>
            <div className="relative group">
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="请输入紧急联系电话"
                className="w-full bg-surface-container-highest rounded-xl px-4 py-4 text-on-surface font-medium focus:ring-2 focus:ring-secondary/60 outline-none border-none"
              />
              <Icon name="contact_emergency" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary transition-colors" />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-xl shadow-elevated active:scale-[0.98] transition-all hover:bg-primary-container"
          >
            {saved ? '✓ 已保存' : '保存修改'}
          </button>
          <p className="text-center text-on-surface-variant text-sm mt-4 font-light">您的信息已加密并安全存储。</p>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
