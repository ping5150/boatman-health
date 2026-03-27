import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const AccountProfile = () => {
  const [formData, setFormData] = useState({
    name: '王德华',
    phone: '+86 138 8888 8888',
    emergencyName: '李美玲',
    emergencyRelation: '配偶',
    emergencyPhone: '+86 139 9999 9999',
  });

  const navigate = useNavigate();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('保存基本信息:', formData);
    navigate('/archive-success');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const relationOptions = ['配偶', '父母', '子女', '兄弟/姐妹', '朋友', '其他'];

  return (
    <>
      <TopBar showBack showAccount={false} />

      <main className="pt-24 pb-32 sm:pb-40 px-4 sm:px-6 max-w-lg mx-auto">
        <section className="mb-8">
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 text-white mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2 opacity-80">会员档案</p>
            <h2 className="font-headline text-2xl font-bold">基本信息</h2>
          </div>
        </section>

        <form className="space-y-6" onSubmit={handleFormSubmit}>
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
              <h3 className="font-headline font-bold text-primary text-lg">身份详情</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">姓名</label>
                <div className="relative">
                  <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface font-body" />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">edit</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">联系电话</label>
                <div className="relative">
                  <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface font-body" />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">phone</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-red-500 font-bold text-xl">*</span>
              <h3 className="font-headline font-bold text-primary text-lg">紧急联系人</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">姓名</label>
                <div className="relative">
                  <input type="text" value={formData.emergencyName} onChange={(e) => handleChange('emergencyName', e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface font-body" />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">edit</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">关系</label>
                <div className="relative">
                  <select value={formData.emergencyRelation} onChange={(e) => handleChange('emergencyRelation', e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface font-body appearance-none">
                    {relationOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">expand_more</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">联系电话</label>
                <div className="relative">
                  <input type="tel" value={formData.emergencyPhone} onChange={(e) => handleChange('emergencyPhone', e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface font-body" />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">contacts</span>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-4 space-y-4">
            <button type="submit" className="w-full bg-primary text-on-primary rounded-full font-bold text-lg px-8 py-4 hover:bg-primary-container transition-all active:scale-95 shadow-lg flex items-center justify-center touch-manipulation min-h-[56px]">保存修改</button>
            <p className="text-center text-xs text-on-surface-variant">您的信息已加密并安全存储。</p>
          </div>
        </form>
      </main>

      <BottomNav />
    </>
  );
};

export default AccountProfile;
