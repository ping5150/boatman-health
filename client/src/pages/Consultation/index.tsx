import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/Toast';
import { submitForm1 } from '@/api/form1.api';

interface BookingResult {
  id: number;
  orderNo: string;
  submittedAt: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
}

const Consultation = () => {
  const { user } = useUser();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    consultationType: '',
    preferredDate: '',
    preferredTime: '',
    brief: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.username,
        phone: user.phone,
      }));
    }
  }, [user]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!formData.name.trim()) {
      showToast('请输入姓名');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('请输入联系电话');
      return;
    }
    if (!formData.consultationType) {
      showToast('请选择咨询需求');
      return;
    }
    if (!formData.preferredDate) {
      showToast('请选择首选联系日期');
      return;
    }
    if (!formData.preferredTime) {
      showToast('请选择首选联系时间');
      return;
    }
    if (!formData.brief.trim()) {
      showToast('请填写简要病史');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitForm1({
        name: formData.name,
        phone: formData.phone,
        consultationType: formData.consultationType as any,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        brief: formData.brief,
      });

      // 跳转到成功页面，携带数据
      navigate('/booking-success', {
        state: {
          orderNo: result.data.orderNo,
          submittedAt: result.data.submittedAt,
          consultationType: result.data.consultationType,
          preferredDate: result.data.preferredDate,
          preferredTime: result.data.preferredTime,
        } as BookingResult,
      });
    } catch (error) {
      console.error('提交失败:', error);
      showToast('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const consultationTypes = [
    { value: '重疾咨询', label: '重疾咨询' },
    { value: '慢病管理', label: '慢病管理' },
    { value: '健康资产规划', label: '健康资产规划' },
  ];

  return (
    <>
      <TopBar showBack showAccount />

      <main className="flex-grow pt-16 sm:pt-20 px-4 sm:px-6 pb-48">
        <div className="max-w-4xl mx-auto">
          <section className="mb-8 sm:mb-12">
            {/* <span className="text-secondary font-headline font-bold tracking-widest uppercase text-xs mb-4 block">个人管家服务</span> */}
            <h2 className="font-headline text-3xl sm:text-4xl md:text-6xl font-extrabold text-primary leading-tight tracking-tighter mb-6">开启您的<br />专属医疗咨询</h2>
            <p className="text-on-surface-variant font-body text-base sm:text-lg max-w-xl leading-relaxed">为您的高净值生活提供独立、客观且极具前瞻性的健康资产管理建议。我们不仅是咨询者,更是您的私人健康舵手。</p>
          </section>

          <form className="space-y-12" onSubmit={handleFormSubmit}>
            <section className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-headline font-bold text-primary uppercase tracking-wider px-1">姓名</label>
                <input type="text" className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 focus:ring-2 focus:ring-secondary/60 text-on-surface text-base font-body input-shadow" placeholder="请输入尊称" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-headline font-bold text-primary uppercase tracking-wider px-1">联系电话</label>
                <input type="tel" className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 focus:ring-2 focus:ring-secondary/60 text-on-surface text-base font-body input-shadow" placeholder="主要联系号码" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-headline font-bold text-primary uppercase tracking-wider px-1">咨询需求</label>
                <div className="grid grid-cols-3 gap-3">
                  {consultationTypes.map((type) => (
                    <button key={type.value} type="button" onClick={() => handleChange('consultationType', type.value)} className={`p-5 rounded-2xl text-base font-bold font-body transition-all ${formData.consultationType === type.value ? 'bg-secondary text-on-secondary shadow-lg scale-105' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/20'}`}>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-headline font-bold text-primary uppercase tracking-wider px-1">首选联系日期</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 focus:ring-2 focus:ring-secondary/60 text-on-surface text-base font-body input-shadow" value={formData.preferredDate} onChange={(e) => handleChange('preferredDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-headline font-bold text-primary uppercase tracking-wider px-1">首选联系时间</label>
                <input type="time" className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 focus:ring-2 focus:ring-secondary/60 text-on-surface text-base font-body input-shadow" value={formData.preferredTime} onChange={(e) => handleChange('preferredTime', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-headline font-bold text-primary uppercase tracking-wider px-1">简要病史</label>
                <textarea rows={5} className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 focus:ring-2 focus:ring-secondary/60 text-on-surface text-base font-body input-shadow resize-none" placeholder="请简要描述您的健康状况或当前需求,以便我们匹配专家..." value={formData.brief} onChange={(e) => handleChange('brief', e.target.value)} />
              </div>
            </section>
            {/* 悬浮固定于视口底部（位于底部导航之上），横向沿用 px-4 sm:px-6 留白并与表单同宽居中 */}
            <div className="fixed left-0 right-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] z-40 bg-surface px-4 sm:px-6 pt-3 pb-3 shadow-[0_-8px_24px_rgba(0,30,64,0.06)]">
              <div className="max-w-4xl mx-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-on-primary rounded-full font-bold text-lg px-8 py-4 hover:bg-primary-container transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 touch-manipulation min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '提交中...' : '提交咨询申请'}
                  {!isSubmitting && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </div>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 mt-10">
            <div className="bg-surface-container-lowest p-6 rounded-3xl editorial-shadow border border-outline-variant/10 flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: 'FILL 1' }}>security</span>
              <div>
                <h3 className="font-headline font-bold text-primary text-lg mb-1">隐私承诺</h3>
                <p className="text-on-surface-variant text-sm font-body leading-relaxed">您的所有病史与个人身份信息均受严格的私人管家级加密保护,绝不流向任何医疗机构或商业实体。</p>
              </div>
            </div>
            <div className="bg-primary-container p-6 rounded-3xl text-on-primary editorial-shadow relative overflow-hidden flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary-container text-3xl">anchor</span>
              <div className="relative z-10">
                <h3 className="font-headline font-bold text-lg mb-1 text-white">独立视角</h3>
                <p className="text-on-primary-container text-sm font-body leading-relaxed">坚持第三方立场,为您剔除医疗链条中的利益干扰,还原医学最真实的诊断逻辑。</p>
              </div>
            </div>
          </div>

          {/* <section className="mt-16 sm:mt-24">
            <div className="bg-surface-container-low rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">anchor</span>
              </div>
              <p className="font-headline font-bold text-primary text-lg mb-2">第三方独立视角</p>
              <p className="text-on-surface-variant text-sm">在复杂的医疗体系中，患者往往面临信息不对称。我们作为您的"第三方"专家，通过精准的数据匹配与全球医疗资源筛选，确保您获得的每一个治疗方案都是基于纯粹的医学价值，而非商业驱动。</p>
            </div>
            <div className="text-center space-y-4">
              <h3 className="font-headline text-xl sm:text-2xl font-bold text-primary">为什么选择船夫健康？</h3>
              <p className="text-on-surface-variant text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">在复杂的医疗体系中，患者往往面临信息不对称。我们作为您的"第三方"专家，通过精准的数据匹配与全球医疗资源筛选，确保您获得的每一个治疗方案都是基于纯粹的医学价值，而非商业驱动。</p>
            </div>
          </section> */}
        </div>
      </main>

      <BottomNav />
    </>
  );
};

export default Consultation;
