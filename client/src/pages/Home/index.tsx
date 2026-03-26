import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden bg-primary text-on-primary asymmetric-clip">
        <div className="absolute inset-0 z-0 opacity-30 bg-gradient-to-br from-primary via-primary-container to-secondary" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 ghost-border backdrop-blur-md">
              <Icon name="verified_user" filled size={14} className="text-secondary-fixed-dim" />
              <span className="text-xs font-semibold tracking-widest text-secondary-fixed-dim uppercase">Premium Medical Stewardship</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-8">
              医疗级专业护航 <br />
              <span className="text-secondary-container">+</span> 首脑级健康体验
            </h1>
            <p className="font-body text-lg md:text-xl text-on-primary-container max-w-xl mb-10 leading-relaxed opacity-90">为全球高净值家庭提供从早期筛查到多学科精准诊疗的全程私享医疗管家服务。</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/consultation')}
                className="px-8 py-4 bg-secondary text-on-secondary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-cta"
              >
                即刻咨询
                <Icon name="arrow_forward" size={20} />
              </button>
              <button
                onClick={() => navigate('/service-journey')}
                className="px-8 py-4 bg-white/10 backdrop-blur-md ghost-border text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95"
              >
                了解服务流程
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5">
            <div className="relative rounded-[2rem] overflow-hidden shadow-elevated bg-surface-container-high aspect-square flex items-center justify-center">
              <Icon name="sailing" size={80} className="text-primary/30" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="mb-4">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">关于我们 / ABOUT US</span>
              <div className="h-1 w-12 bg-secondary mt-2" />
            </div>
            <h2 className="font-headline text-4xl font-bold text-primary mb-6">
              追寻健康的真义：<br />从《悉达多》到极致医疗交付
            </h2>
            <div className="space-y-6 font-body text-on-surface-variant text-lg leading-relaxed">
              <p>我们深信赫尔曼·黑塞在《悉达多》中所揭示的真谛：真理可以传授，但智慧只能亲自去体证。在健康的迷途中，我们不只是带路的向导，更是陪同您穿越风浪的"船夫"。</p>
              <p>船夫健康成立于2020年，旨在为高净值人群构建一道坚实的健康护城河。我们将专业的医疗决策支持与人文关怀相结合，让每一位客户都能在数字时代重拾对健康的绝对掌控感。</p>
            </div>
            <button
              onClick={() => navigate('/about')}
              className="inline-flex items-center gap-2 mt-8 text-secondary font-bold group"
            >
              探索品牌故事
              <Icon name="east" size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* New Paradigm Section */}
      <section className="py-24 relative overflow-hidden bg-primary text-on-primary">
        <div className="absolute inset-0 z-0 opacity-10 bg-gradient-to-br from-primary-container to-secondary" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-16">
            <span className="text-secondary-fixed-dim font-bold tracking-[0.2em] uppercase text-sm">Health Management Paradigm</span>
            <h2 className="font-headline text-4xl font-bold mt-4 mb-6">健康管理新范式</h2>
            <p className="text-on-primary-container text-lg opacity-80">摒弃碎片化的就医模式，我们通过"全生命周期管家制"构建预防、诊疗、康复的闭环生态。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'psychology', title: 'AI 辅助精准研判', desc: '整合顶尖算法与医学专家大脑，提供数据驱动的干预建议。' },
              { icon: 'groups', title: '全球顾问委员会', desc: '直连来自五大医学中心的资深顾问，打破地域医疗壁垒。' },
              { icon: 'analytics', title: '定制化健康资源库', desc: '实时更新的国际医疗前沿资讯，为您筛选最相关的资源。' },
              { icon: 'verified', title: '1对1 首席顾问', desc: '资深临床背景专家，为您提供 7x24 小时全时决策支持。' },
            ].map((card) => (
              <div
                key={card.icon}
                className="bg-primary-container/50 ghost-border p-8 rounded-3xl hover:bg-secondary-container/10 transition-colors backdrop-blur-sm"
              >
                <Icon name={card.icon} size={36} className="text-secondary-container mb-6" />
                <h3 className="text-xl font-bold mb-3 text-on-primary">{card.title}</h3>
                <p className="text-sm text-on-primary-container leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => navigate('/paradigm')}
              className="px-10 py-4 bg-white text-primary rounded-full font-bold hover:bg-secondary-fixed transition-colors"
            >
              查看详细范式指南
            </button>
          </div>
        </div>
      </section>

      {/* Case Center Section */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-6">
          <div className="flex items-end mb-16 justify-center">
            <div className="text-center">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">Case Center</span>
              <h2 className="font-headline text-4xl font-bold text-primary mt-4">案例中心</h2>
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <button
              onClick={() => navigate('/cases')}
              className="px-12 py-5 bg-secondary text-on-secondary rounded-2xl font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-cta relative z-10"
            >
              进入案例中心
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
