import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { getProfile, updateProfile } from '@/api/auth.api';
import { getUser, setUser } from '@/lib/auth';

interface FormData {
  username: string;
  phone: string;
  gender: string;
  birthDate: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

const AccountProfile = () => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    username: '',
    phone: '',
    gender: '',
    birthDate: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 加载用户信息
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile();
        if (res.success && res.data) {
          const profile = res.data;
          setFormData({
            username: profile.username || '',
            phone: profile.phone || '',
            gender: profile.gender || '',
            birthDate: profile.birthDate || '',
            emergencyName: profile.emergencyName || '',
            emergencyRelation: profile.emergencyRelation || '',
            emergencyPhone: profile.emergencyPhone || '',
          });
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateProfile({
        username: formData.username,
        gender: formData.gender,
        birthDate: formData.birthDate,
        emergencyName: formData.emergencyName,
        emergencyRelation: formData.emergencyRelation,
        emergencyPhone: formData.emergencyPhone,
      });

      if (res.success) {
        // 更新本地存储的用户信息
        const currentUser = getUser();
        if (currentUser) {
          setUser({
            ...currentUser,
            username: formData.username,
          });
        }
        navigate('/archive-success');
      }
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const relationOptions = ['配偶', '父母', '子女', '兄弟/姐妹', '朋友', '其他'];

  if (loading) {
    return (
      <>
        <TopBar showBack showAccount={false} />
        <main className="pt-8 pb-16 sm:pb-40 px-4 sm:px-6 max-w-lg mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <TopBar showBack showAccount={false} />

      <main className="pt-8 pb-16 sm:pb-40 px-4 sm:px-6 max-w-lg mx-auto">
        <section className="mb-8">
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 text-white mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2 opacity-80">会员档案</p>
            <h2 className="font-headline text-2xl font-bold text-white">基本信息</h2>
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
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={(e) => handleChange('username', e.target.value)} 
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface font-body" 
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">edit</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">联系电话</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    disabled
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface/50 font-body cursor-not-allowed" 
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">phone</span>
                </div>
                <p className="text-xs text-on-surface-variant">手机号不可修改</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">性别</label>
                <div className="flex gap-3">
                  {['男', '女'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleChange('gender', g)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        formData.gender === g
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">出生日期</label>
                <div 
                  className="relative cursor-pointer bg-surface-container-low rounded-xl p-4 pr-10"
                  onClick={() => dateInputRef.current?.showPicker()}
                >
                  <input 
                    ref={dateInputRef}
                    type="date" 
                    value={formData.birthDate} 
                    onChange={(e) => handleChange('birthDate', e.target.value)} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <span className="text-on-surface font-body">{formData.birthDate || '选择日期'}</span>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">calendar_month</span>
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
                  <input 
                    type="text" 
                    value={formData.emergencyName} 
                    onChange={(e) => handleChange('emergencyName', e.target.value)} 
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface font-body" 
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">edit</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">关系</label>
                <div className="relative">
                  <select 
                    value={formData.emergencyRelation} 
                    onChange={(e) => handleChange('emergencyRelation', e.target.value)} 
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface font-body appearance-none"
                  >
                    <option value="">请选择</option>
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
                  <input 
                    type="tel" 
                    value={formData.emergencyPhone} 
                    onChange={(e) => handleChange('emergencyPhone', e.target.value)} 
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 pr-10 text-on-surface font-body" 
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">contacts</span>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-4 space-y-4">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-primary text-on-primary rounded-full font-bold text-lg px-8 py-4 hover:bg-primary-container transition-all active:scale-95 shadow-lg flex items-center justify-center touch-manipulation min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存修改'}
            </button>
            <p className="text-center text-xs text-on-surface-variant">您的信息已加密并安全存储。</p>
          </div>
        </form>
      </main>

      <BottomNav />
    </>
  );
};

export default AccountProfile;
