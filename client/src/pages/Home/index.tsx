import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { useUser } from '@/contexts/UserContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  // 检查登录状态，未登录跳转到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <TopBar title="船夫健康" showAccount />

      <main className="pt-16 pb-32 sm:pb-40">
        {/* Hero Section */}
        <section className="relative min-h-[500px] md:min-h-[700px] flex items-center overflow-hidden bg-primary text-on-primary asymmetric-clip">
          <div className="absolute inset-0 z-0 opacity-50">
            <img
              alt="Professional medical team providing healthcare services"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&h=900&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-8">
                医疗级专业护航 <br />
                <span className="text-secondary-container">+</span> 首脑级健康体验
              </h1>

              <p className="font-body text-lg md:text-xl text-on-primary-container max-w-xl mb-10 leading-relaxed opacity-90">为全球高净值家庭提供从早期筛查到多学科精准诊疗的全程私享医疗管家服务。</p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  to="/consultation"
                  className="w-full sm:w-auto px-8 py-4 min-h-[52px] bg-secondary text-on-secondary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-secondary/20 touch-manipulation"
                >即刻咨询</Link>
                <Link
                  to="/services"
                  className="w-full sm:w-auto px-8 py-4 min-h-[52px] bg-white/10 backdrop-blur-md border border-white/20 text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95 touch-manipulation"
                >了解服务流程</Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl">
                <img
                  alt="Professional healthcare consultation with medical experts"
                  className="w-full aspect-square object-cover"
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=600&fit=crop"
                />
                <div className="absolute inset-0 bg-primary/20"></div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="mb-4">
                <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs sm:text-sm">关于我们</span>
                <div className="h-1 w-12 bg-secondary mt-2"></div>
              </div>

              <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary mb-6 leading-tight">
                追寻健康的真义：<br />从《悉达多》到极致医疗交付
              </h2>

              <div className="space-y-6 font-body text-on-surface-variant text-base sm:text-lg leading-relaxed">
                <p>我们深信赫尔曼·黑塞在《悉达多》中所揭示的真谛：真理可以传授，但智慧只能亲自去体证。在健康的迷途中，我们不只是带路的向导，更是陪同您穿越风浪的"船夫"。</p>
                <p>船夫健康成立于2020年，旨在为高净值人群构建一道坚实的健康护城河。我们将专业的医疗决策支持与人文关怀相结合，让每一位客户都能在数字时代重拾对健康的绝对掌控感。</p>
              </div>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 mt-8 text-secondary font-bold group cursor-pointer"
              >
                探索品牌故事
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
              </Link>
            </div>
          </div>
        </section>

        {/* New Paradigm Section */}
        <section className="py-16 sm:py-24 relative overflow-hidden bg-primary text-on-primary">
          <div className="absolute inset-0 z-0 opacity-10">
            <img
              alt="Futuristic medical technology and global medical network"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=1600&h=600&fit=crop"
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl mb-12 sm:mb-16">
              <h2 className="font-headline text-3xl sm:text-4xl font-bold mt-4 mb-6">健康管理新范式</h2>
              <p className="text-on-primary-container text-base sm:text-lg opacity-80">摒弃碎片化的就医模式，我们通过"全生命周期管家制"构建预防、诊疗、康复的闭环生态。</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: 'psychology', title: 'AI 辅助精准研判', desc: '整合顶尖算法与医学专家大脑，提供数据驱动的干预建议。' },
                { icon: 'groups', title: '全球顾问委员会', desc: '直连来自五大医学中心的资深顾问，打破地域医疗壁垒。' },
                { icon: 'analytics', title: '定制化健康资源库', desc: '实时更新的国际医疗前沿资讯，为您筛选最相关的资源。' },
                { icon: 'verified', title: '1对1 首席顾问', desc: '资深临床背景专家，为您提供 7x24 小时全时决策支持。' },
              ].map((item) => (
                <div key={item.icon} className="bg-primary-container/50 border border-white/10 p-6 sm:p-8 rounded-3xl hover:bg-secondary-container/10 transition-colors backdrop-blur-sm">
                  <span className="material-symbols-outlined text-secondary-container text-4xl mb-6">{item.icon}</span>
                  <h3 className="text-lg sm:text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-on-primary-container leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 sm:mt-12 flex justify-center">
              <Link
                to="/paradigm"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-white text-primary rounded-full font-bold hover:bg-primary-fixed transition-colors text-sm sm:text-base touch-manipulation min-h-[52px] flex items-center justify-center"
              >查看详细范式指南</Link>
            </div>
          </div>
        </section>

        {/* Case Center Section */}
        <section className="py-16 sm:py-24 bg-surface">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-end mb-12 sm:mb-16 justify-center">
              <div className="text-center">
                <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary mt-4">案例中心</h2>
              </div>
            </div>

            <div className="flex justify-center mt-10 sm:mt-12">
              <Link
                to="/cases"
                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-secondary text-on-secondary rounded-2xl font-bold text-lg sm:text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl shadow-secondary/40 relative z-10 touch-manipulation min-h-[52px] flex items-center justify-center"
              >进入案例中心</Link>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
};

export default Home;
