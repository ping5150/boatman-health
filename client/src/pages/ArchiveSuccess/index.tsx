import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';

const ArchiveSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-8">
      {/* Success Hero */}
      <section className="flex flex-col items-center text-center mb-12">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-secondary-container opacity-20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Icon name="check" size={48} className="text-on-primary" />
          </div>
        </div>
        <h2 className="font-headline font-extrabold text-3xl text-primary tracking-tight mb-4">档案已成功更新</h2>
        <p className="text-on-surface-variant leading-relaxed px-4 text-lg">您的个人深度健康档案已安全同步至云端，隐私信息已按银行级标准加密。</p>
      </section>

      {/* Summary */}
      <section className="mb-12">
        <div className="bg-surface-container-low p-1 rounded-[2rem]">
          <div className="bg-surface-container-lowest p-8 rounded-[1.8rem] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2">
                更新摘要
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
              </h3>
              <span className="text-xs font-semibold text-secondary-container uppercase tracking-widest">Updated Today</span>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center rounded-xl shrink-0">
                  <Icon name="vital_signs" size={20} className="text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-base mb-1">基础生理健康背景</h4>
                  <p className="text-sm text-on-surface-variant">包含近期体检数据、遗传病史及过敏原信息的全面同步。</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center rounded-xl shrink-0">
                  <Icon name="self_care" size={20} className="text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-base mb-1">精细化生活方式评估</h4>
                  <p className="text-sm text-on-surface-variant">涵盖睡眠模式、运动频率及营养膳食习惯的模块化分析。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/account')}
          className="w-full py-5 bg-primary text-on-primary font-bold rounded-xl shadow-elevated active:scale-[0.98] transition-all text-center"
        >
          返回账户中心
        </button>
        <button
          onClick={() => navigate('/health-form')}
          className="w-full py-5 border-2 border-primary/10 text-primary font-bold rounded-xl hover:bg-surface-container-high active:scale-[0.98] transition-all text-center"
        >
          继续完善档案
        </button>
      </div>
    </div>
  );
};

export default ArchiveSuccess;
