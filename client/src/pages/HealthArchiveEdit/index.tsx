import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const HealthArchiveEdit = () => {
  const navigate = useNavigate();

  return (
    <>
      <TopBar showBack showAccount={false} />

      <main className="pt-4 pb-32 px-6 max-w-4xl mx-auto">
        {/* Hero Header Section */}
        <section className="mb-8 md:ml-4">
          <span className="text-secondary font-headline font-bold tracking-widest uppercase text-xs mb-4 block">
            Personal Steward Service
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary leading-tight tracking-tighter mb-4">
            医疗咨询登记<br />健康档案建立
          </h2>
          <p className="text-on-surface-variant font-body text-base max-w-xl leading-relaxed">
            为您的生活提供独立、客观且极具前瞻性的健康资产管理建议。我们不仅是咨询者，更是您的私人健康舵手。
          </p>
        </section>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest p-5 rounded-3xl editorial-shadow border border-outline-variant/10 flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
            <div>
              <h3 className="font-headline font-bold text-primary text-base mb-1">隐私承诺</h3>
              <p className="text-on-surface-variant text-xs font-body leading-relaxed">
                您的所有病史与个人身份信息均受严格的私人管家级加密保护，绝不流向任何医疗机构或商业实体。
              </p>
            </div>
          </div>
          <div className="bg-primary-container p-5 rounded-3xl editorial-shadow relative overflow-hidden flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary-container text-3xl">anchor</span>
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-base mb-1 text-white">独立视角</h3>
              <p className="text-on-primary-container text-xs font-body leading-relaxed">
                坚持第三方立场，为您剔除医疗链条中的利益干扰，还原医学最真实的诊断逻辑。
              </p>
            </div>
          </div>
        </div>

        {/* Entry Card */}
        <div className="bg-surface-container-low p-6 md:p-8 rounded-[2rem] editorial-shadow border border-outline-variant/5 text-center">
          <div className="flex flex-col items-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-3xl">edit_document</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-xl text-primary">编辑您的健康档案</h3>
              <p className="text-on-surface-variant text-sm max-w-md">
                点击下方按钮进入完整的健康档案编辑页面，包括疾病史、用药记录、生活方式评估等。
              </p>
            </div>
            <button
              onClick={() => navigate('/health-form')}
              className="w-full max-w-sm bg-primary text-on-primary font-headline font-bold py-4 rounded-full text-base editorial-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              进入编辑
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-outline-variant mt-8 uppercase tracking-[0.2em]">
          Official Boatman Stewardship Channel
        </p>
      </main>

      <BottomNav />
    </>
  );
};

export default HealthArchiveEdit;
