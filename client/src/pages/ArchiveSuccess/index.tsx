import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';

const ArchiveSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center px-6 pt-12 pb-32 max-w-lg mx-auto w-full">
      {/* Success Feedback Icon */}
      <div className="relative mb-10">
        <div className="w-24 h-24 bg-primary-container rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(0,30,64,0.06)]">
          <Icon name="check" size={48} className="text-white" />
        </div>
        {/* Decorative element */}
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary-container rounded-full opacity-20 blur-sm" />
      </div>

      {/* Feedback Text */}
      <div className="text-center mb-12">
        <h2 className="font-headline font-extrabold text-3xl text-primary mb-4 tracking-tight">基本信息已保存成功</h2>
        <p className="text-on-surface-variant leading-relaxed px-4">您的基础信息已安全更新，我们将据此为您提供更精准的服务。</p>
      </div>

      {/* Action Button */}
      <div className="w-full flex flex-col gap-4">
        <button
          onClick={() => navigate('/account')}
          className="w-full bg-primary text-white font-bold py-5 rounded-xl shadow-[0_8px_24px_rgba(0,30,64,0.06)] hover:opacity-90 transition-all active:scale-[0.98]"
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
