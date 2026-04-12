import { useNavigate, useSearchParams } from 'react-router-dom';

const SurveySuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'sleep';
  
  const title = type === 'sleep' ? '睡眠问卷' : '营养问卷';

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>
          check_circle
        </span>
      </div>
      
      <h1 className="font-headline text-2xl font-bold text-primary mb-2">{title}提交成功</h1>
      <p className="text-on-surface-variant text-sm text-center mb-8">
        感谢您的耐心填写，我们将为您进行专业分析
      </p>

      <div className="bg-surface-container-lowest p-6 rounded-3xl w-full max-w-sm border border-outline-variant/5">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-secondary">info</span>
          <span className="text-sm font-medium text-primary">下一步</span>
        </div>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          我们的专业团队将在 1-2 个工作日内完成分析，届时会有专属管家联系您沟通详情。
        </p>
      </div>

      <div className="mt-8">
        <button
          onClick={() => navigate('/account')}
          className="px-8 py-3 bg-secondary text-white font-bold text-sm rounded-2xl"
        >
          返回个人中心
        </button>
      </div>
    </div>
  );
};

export default SurveySuccess;
