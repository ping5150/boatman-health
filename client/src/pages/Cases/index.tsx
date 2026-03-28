import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const Cases = () => {
  return (
    <>
      <TopBar showBack showAccount />

      <main className="pt-20 sm:pt-24 px-4 sm:px-6 max-w-5xl mx-auto pb-32 sm:pb-40">
        <section className="mb-8 sm:mb-12">
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-primary leading-tight mb-4">卓越医疗案例</h2>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed text-base sm:text-lg">秉持"私人管家"式的服务理念,我们为高净值人士提供超越边界的医疗咨询与健康管理方案。</p>
        </section>

        {/* Case Study 1 */}
        <article className="bg-surface-container-lowest rounded-[2rem] editorial-shadow mb-16 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-5 relative min-h-[300px]">
              <img className="absolute inset-0 w-full h-full object-cover" alt="Modern high-end medical facility interior" src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <div className="bg-secondary-container/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">Surgical Excellence</div>
                <h3 className="font-headline text-2xl font-bold leading-tight text-white">脊柱鞘瘤微创剥离手术</h3>
              </div>
            </div>
            <div className="md:col-span-7 p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: 'FILL 1' }}>person</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary">客户画像</p>
                  <p className="font-medium">50+ 女性企业家</p>
                </div>
              </div>
              <div className="space-y-8">
                <section>
                  <h4 className="font-headline text-lg font-bold text-primary mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-secondary rounded-full"></span>核心成果
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[{ label: '慢性疼痛', value: '-70%' }, { label: '恢复周期', value: '45天' }, { label: '额外就医', value: '0次' }].map((d) => (
                      <div key={d.label} className="bg-surface-container-low p-4 rounded-2xl border-l-4 border-secondary">
                        <p className="text-xs text-on-surface-variant mb-1">{d.label}</p>
                        <p className="text-2xl font-black text-primary">{d.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h4 className="font-headline text-lg font-bold text-primary mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-secondary rounded-full"></span>管家方案
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['中西医结合康复体系,深度整合全球顶级医疗资源', '提供全球第二诊疗意见,确保方案的权威性与前瞻性', '100% 专家覆盖,全程由各领域顶尖主任医师亲理', '24小时极速响应机制,应对术后任何突发康复需求'].map((text) => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-secondary mt-0.5">check_circle</span>
                        <p className="text-sm leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </article>

        {/* Case Study 2 */}
        <article className="bg-primary text-white rounded-[2rem] editorial-shadow mb-16 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-7 p-8 md:p-12 order-2 md:order-1">
              <div className="mb-8">
                <h3 className="font-headline text-3xl font-extrabold leading-tight text-white">从碎片化信息到系统性守护,重构家族健康蓝图</h3>
              </div>
              <div className="flex items-center gap-4 mb-10 pb-10 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: 'FILL 1' }}>groups</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary-container">客户画像</p>
                  <p className="font-medium text-lg">50+ 女性企业家及其家族</p>
                </div>
              </div>
              <div className="space-y-10">
                <div>
                  <h4 className="font-headline text-xl font-bold mb-4 flex items-center gap-3 text-white">
                    <span className="w-2 h-2 rounded-full bg-secondary-container"></span>家族保障体系
                  </h4>
                  <div className="space-y-4">
                    {[{ title: '定制化健康档案', desc: '定制化数字健康档案,实现家族成员全生命周期数据集成与实时监控。' }, { title: '精准诊断', desc: '精准医学诊断,基于家族病史与基因图谱进行前置性风险预判与管理。' }, { title: '全球匹配', desc: '全球医疗资源精准匹配,打通跨国转诊与顶尖实验室研究成果应用渠道。' }].map((item) => (
                      <div key={item.title} className="bg-white/5 p-5 rounded-2xl border border-white/10">
                        <p className="text-secondary-container font-bold mb-1">{item.title}</p>
                        <p className="text-sm text-white/80">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-black text-secondary-container mb-1">3+</p>
                    <p className="text-xs text-white/60 uppercase tracking-widest">覆盖三代</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-secondary-container mb-1">24/7</p>
                    <p className="text-xs text-white/60 uppercase tracking-widest">管家服务</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-5 relative min-h-[400px] order-1 md:order-2">
              <img className="absolute inset-0 w-full h-full object-cover grayscale opacity-60" alt="Elegant multi-generational family gathering" src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=600&fit=crop" />
              <div className="absolute inset-0 bg-gradient-to-l from-primary via-primary/40 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-secondary/20 glass-effect p-8 rounded-full border border-white/20">
                  <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: 'FILL 1' }}>security</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <BottomNav />
    </>
  );
};

export default Cases;
