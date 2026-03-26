import { useNavigate } from 'react-router-dom';

const HealthArchiveEdit = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-b-3xl bg-primary-container mb-8 px-8 py-12 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <p className="font-label text-secondary-fixed-dim text-xs tracking-widest uppercase mb-2">医疗档案</p>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight">深度健康档案</h2>
        </div>
      </div>

      <div className="px-6">
        <p className="text-on-surface-variant text-base leading-relaxed mb-8">以绝对的精度维护您的私人健康档案。这些记录构成了我们定制化咨询策略的基础。</p>

        {/* 复用健康表单页，跳转到 /health-form */}
        <div className="bg-surface-container-low rounded-3xl p-8 shadow-ambient ghost-border text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-secondary text-3xl">edit_document</span>
          </div>
          <h3 className="font-headline font-bold text-xl text-primary">编辑您的健康档案</h3>
          <p className="text-on-surface-variant text-sm">点击下方按钮进入完整的健康档案编辑页面，包括疾病史、用药记录、生活方式评估等。</p>
          <button
            onClick={() => navigate('/health-form')}
            className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-2xl text-lg shadow-elevated active:scale-[0.98] transition-all hover:bg-primary-container flex items-center justify-center gap-3"
          >
            进入编辑
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthArchiveEdit;
