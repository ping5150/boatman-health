import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';

interface BookingData {
  name?: string;
  phone?: string;
  consultType?: string;
  contactTime?: string;
  briefHistory?: string;
}

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as BookingData) || {};

  const maskPhone = (phone: string): string => {
    if (phone.length !== 11) {
      return phone;
    }
    return `+86 ${phone.slice(0, 3)} **** ${phone.slice(7)}`;
  };

  return (
    <div className="px-6 py-8">
      {/* Success Status Card */}
      <section className="mb-10">
        <div className="bg-primary-container rounded-3xl p-8 shadow-elevated overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary opacity-10 rounded-full blur-3xl" />
          <div className="flex items-start gap-5">
            <div className="bg-secondary-container/20 p-3 rounded-full shrink-0">
              <Icon name="check_circle" filled size={32} className="text-white" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-white text-2xl tracking-tight mb-2">已成功提交预约</h2>
              <p className="text-on-primary-container font-body leading-relaxed text-sm">您的咨询请求已进入管家受理流程。专属健康顾问将在24小时内与您取得联系。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Read-only Summary */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-headline font-extrabold text-primary text-xl tracking-tight">已填写登记摘要</h3>
          <span className="text-xs font-semibold text-secondary px-3 py-1 bg-secondary/10 rounded-full">只读状态</span>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-8 space-y-8 shadow-ambient ghost-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-1.5">
              <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">客户姓名</p>
              <p className="text-on-surface font-semibold text-lg">{data.name || '—'}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">联系电话</p>
              <p className="text-on-surface font-semibold text-lg">{data.phone ? maskPhone(data.phone) : '—'}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">咨询需求</p>
              <p className="text-primary font-bold text-lg">{data.consultType || '—'}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">首选联系时间</p>
              <p className="text-on-surface font-semibold text-lg">{data.contactTime || '—'}</p>
            </div>
          </div>

          {data.briefHistory && (
            <div className="pt-6 border-t border-outline-variant/10">
              <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider mb-3">简要病史</p>
              <div className="bg-surface-container-low p-5 rounded-2xl">
                <p className="text-on-surface font-body leading-relaxed text-sm">{data.briefHistory}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA: Supplement Deep Archive */}
      <section className="mt-12">
        <div className="bg-primary/5 ghost-border rounded-3xl p-8 flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h4 className="font-headline font-bold text-primary text-2xl tracking-tight">更精准的建议？</h4>
            <p className="text-on-surface-variant font-body text-sm max-w-sm">补充您的深度健康档案，我们的专家团队能为您提供更具针对性的医疗分析。</p>
          </div>
          <button
            onClick={() => navigate('/health-form')}
            className="w-full bg-primary-container text-white font-headline font-bold py-5 rounded-2xl text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-elevated group"
          >
            <span>补充深度健康档案</span>
            <Icon name="arrow_forward" size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default BookingSuccess;
