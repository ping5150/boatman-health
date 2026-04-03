import { Link } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const Paradigm = () => {
  const paradigmFeatures = [
    { icon: 'psychology', title: 'AI 辅助精准研判', subtitle: '人工智能与医学智慧的完美融合', description: '我们整合了顶尖的医疗AI算法与资深医学专家的临床经验，通过多维度数据分析，为您提供精准、个性化的健康干预建议。系统持续学习最新的医学研究成果，确保每一次研判都基于最前沿的科学依据。', benefits: ['深度学习模型分析个人健康数据', '实时监测健康指标变化趋势', '预测潜在健康风险', '提供个性化干预方案'] },
    { icon: 'groups', title: '全球顾问委员会', subtitle: '打破地域限制的顶级医疗资源', description: '直连来自全球五大顶级医学中心的资深顾问团队。无论您身在何处，都能获得与国际同步的诊疗建议。我们的顾问网络覆盖心血管、肿瘤、神经内科、内分泌等所有主要医学领域。', benefits: ['跨学科专家联合会诊', '第二诊疗意见服务', '国际前沿疗法接入', '24小时紧急咨询通道'] },
    { icon: 'analytics', title: '定制化健康资源库', subtitle: '为您精准筛选的医学知识库', description: '基于您的个人健康状况和需求，我们为您构建专属的健康资源库。系统实时跟踪国际医疗前沿资讯，筛选出与您最相关的最新研究、临床试验和治疗突破，让您始终掌握健康管理的主动权。', benefits: ['个性化健康资讯推送', '权威医学文献解读', '临床试验匹配服务', '前沿治疗技术介绍'] },
    { icon: 'verified', title: '1对1 首席顾问', subtitle: '专属健康管家，全程陪伴守护', description: '每位客户配备一位具有资深临床背景的首席健康顾问，为您提供7*12小时全时决策支持。从健康评估、方案制定到康复跟进，您的首席顾问将全程陪伴，确保每一个决策都经过深思熟虑的专业分析。', benefits: ['专属健康档案管理', '定期健康评估报告', '就医陪同与专家预约', '紧急情况快速响应'] },
  ];

  const processSteps = [
    { step: '01', title: '全面评估', description: '多维度数据采集，建立完整的个人健康画像' },
    { step: '02', title: '精准分析', description: 'AI算法与专家团队双重研判，识别健康风险' },
    { step: '03', title: '方案制定', description: '基于科学证据，制定个性化干预策略' },
    { step: '04', title: '持续跟踪', description: '动态监测健康变化，及时优化干预方案' },
  ];

  return (
    <>
      <TopBar showBack showAccount />

      <main className="pt-20 sm:pt-24 pb-32 sm:pb-40 px-4 sm:px-6 max-w-5xl mx-auto">
        <section className="mb-12 sm:mb-16">
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-primary leading-tight mb-6">健康管理新范式</h2>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-3xl">摒弃碎片化的就医模式，我们通过"全生命周期管家制"构建预防、诊疗、康复的闭环生态，为您开启全新的健康管理体验。</p>
        </section>

        <section className="mb-16 sm:mb-24">
          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-primary mb-8">服务流程</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {processSteps.map((s) => (
              <div key={s.step} className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-secondary">
                <span className="text-3xl font-black text-secondary mb-3 block font-headline">{s.step}</span>
                <h4 className="font-bold text-primary text-lg mb-2">{s.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-12 sm:space-y-16">
          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-primary mb-8">核心体系</h3>
          {paradigmFeatures.map((feature, index) => (
            <div key={index} className="bg-surface-container-lowest p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] editorial-shadow">
              <div className="flex items-start gap-4 sm:gap-6 mb-6">
                <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container text-2xl sm:text-4xl">{feature.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-headline text-xl sm:text-2xl font-bold text-primary mb-2">{feature.title}</h4>
                  <p className="text-sm sm:text-base text-secondary font-semibold mb-3">{feature.subtitle}</p>
                  <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed mb-6">{feature.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-3">核心优势</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-on-surface-variant">
                          <span className="material-symbols-outlined text-secondary text-lg mt-0.5 flex-shrink-0">check_circle</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-16 sm:mt-24 bg-gradient-to-br from-primary to-primary-container rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-on-primary">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-headline text-2xl sm:text-3xl font-bold mb-4 text-white">开启您的专属健康管理之旅</h3>
            <p className="text-on-primary-container text-base sm:text-lg mb-8">立即预约咨询，让我们的专业团队为您制定个性化的健康守护方案</p>
            <Link to="/consultation" className="inline-flex items-center gap-2 px-8 sm:px-12 py-4 bg-white text-primary rounded-full font-bold text-base sm:text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg touch-manipulation min-h-[52px]">
              立即预约咨询
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
};

export default Paradigm;
