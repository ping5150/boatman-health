import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import { submitForm1 } from '@/api/form1.api';

const consultTypes = ['重疾咨询', '慢病管理', '健康资产规划'];
const contactTimes = [
  '工作日 上午 (09:00 - 12:00)',
  '工作日 下午 (14:00 - 18:00)',
  '工作日 晚间 (19:00 - 21:00)',
  '周末 全天',
];

const Consultation = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consultType, setConsultType] = useState('');
  const [contactTime, setContactTime] = useState(contactTimes[0]);
  const [briefHistory, setBriefHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('请输入姓名');
      return;
    }
    if (!phone || phone.length !== 11) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    if (!consultType) {
      setError('请选择咨询需求');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await submitForm1({
        name: name.trim(),
        phone,
        consultType,
        contactTime,
        briefHistory: briefHistory.trim(),
      });
      navigate('/booking-success', {
        state: { name, phone, consultType, contactTime, briefHistory },
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '提交失败，请重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-8">
      {/* Hero Header */}
      <section className="px-6 pt-8 pb-6">
        <span className="text-secondary font-headline font-bold tracking-widest uppercase text-xs mb-4 block">Personal Steward Service</span>
        <h2 className="font-headline text-3xl font-extrabold text-primary leading-tight tracking-tighter mb-4">开启您的专属医疗咨询</h2>
        <p className="text-on-surface-variant font-body text-base leading-relaxed">为您的高净值生活提供独立、客观且极具前瞻性的健康资产管理建议。</p>
      </section>

      {/* Info Cards */}
      <div className="px-6 grid grid-cols-1 gap-4 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-ambient flex items-start gap-4">
          <Icon name="security" filled size={28} className="text-secondary shrink-0" />
          <div>
            <h3 className="font-headline font-bold text-primary text-lg mb-1">隐私承诺</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">您的所有病史与个人身份信息均受严格的私人管家级加密保护。</p>
          </div>
        </div>
        <div className="bg-primary-container p-6 rounded-3xl shadow-ambient flex items-start gap-4">
          <Icon name="anchor" size={28} className="text-secondary-container shrink-0" />
          <div>
            <h3 className="font-headline font-bold text-lg mb-1 text-on-primary">独立视角</h3>
            <p className="text-on-primary-container text-sm leading-relaxed">坚持第三方立场，为您剔除医疗链条中的利益干扰。</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="px-6 space-y-8" onSubmit={handleSubmit}>
        <div className="bg-surface-container-low p-6 rounded-3xl shadow-ambient space-y-6">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-error-container/30 text-error text-sm">{error}</div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-headline font-bold text-primary uppercase tracking-widest px-1">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入尊称"
                className="w-full bg-surface-container-lowest rounded-xl p-4 text-on-surface font-body shadow-sm focus:ring-2 focus:ring-secondary/60 outline-none border-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-headline font-bold text-primary uppercase tracking-widest px-1">联系电话</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="主要联系号码"
                className="w-full bg-surface-container-lowest rounded-xl p-4 text-on-surface font-body shadow-sm focus:ring-2 focus:ring-secondary/60 outline-none border-none"
              />
            </div>
          </div>

          {/* Consult Type */}
          <div className="space-y-4">
            <label className="text-xs font-headline font-bold text-primary uppercase tracking-widest px-1">咨询需求</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {consultTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setConsultType(type)}
                  className={`p-4 rounded-xl text-sm font-body font-medium transition-all ${
                    consultType === type
                      ? 'bg-secondary text-on-secondary shadow-cta'
                      : 'bg-surface-container-lowest text-on-surface-variant ghost-border hover:bg-secondary/5'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Time */}
          <div className="space-y-2">
            <label className="text-xs font-headline font-bold text-primary uppercase tracking-widest px-1">首选联系时间</label>
            <div className="relative">
              <select
                value={contactTime}
                onChange={(e) => setContactTime(e.target.value)}
                className="w-full bg-surface-container-lowest rounded-xl p-4 appearance-none text-on-surface font-body shadow-sm focus:ring-2 focus:ring-secondary/60 outline-none border-none"
              >
                {contactTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon name="expand_more" size={20} className="text-outline" />
              </div>
            </div>
          </div>

          {/* Brief History */}
          <div className="space-y-2">
            <label className="text-xs font-headline font-bold text-primary uppercase tracking-widest px-1">简要病史</label>
            <textarea
              value={briefHistory}
              onChange={(e) => setBriefHistory(e.target.value)}
              placeholder="请简要描述您的健康状况或当前需求，以便我们匹配专家..."
              rows={4}
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-on-surface font-body shadow-sm focus:ring-2 focus:ring-secondary/60 outline-none border-none resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-2xl text-lg tracking-tight shadow-elevated hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? '提交中...' : '提交咨询申请'}
            {!loading && <Icon name="arrow_forward_ios" size={18} />}
          </button>
          <p className="text-center text-[10px] text-outline mt-4 uppercase tracking-[0.2em]">Official Boatman Stewardship Channel</p>
        </div>
      </form>
    </div>
  );
};

export default Consultation;
