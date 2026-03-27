import { Link } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const About = () => {
  return (
    <>
      <TopBar showBack showAccount />

      <main className="pt-24 pb-40 px-6 max-w-5xl mx-auto space-y-20">
        {/* Hero Section */}
        <section className="relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-8 z-10">
              <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">服务理念</div>
              <h2 className="font-headline text-5xl md:text-7xl font-extrabold text-primary tracking-tighter leading-none">
                渡人 <br /> 亦渡心
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md font-light italic">"一辈子静守河畔，渡人过河，不仅是身体的迁徙，更是心灵的安放。船夫精于倾听，在无声中感知生命的律动。"</p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-[1px] bg-primary"></div>
                <span className="text-sm font-semibold tracking-widest text-primary">黑塞《悉达多》的启示</span>
              </div>
            </div>
            <div className="md:col-span-5 relative">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden editorial-shadow transform rotate-3 hover:rotate-0 transition-transform duration-700">
                <img alt="Atmospheric high-end river landscape with a serene boat at dawn" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1000&fit=crop" />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/5 -z-10 blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h3 className="font-headline text-3xl font-bold text-primary border-l-4 border-primary pl-4">品牌故事</h3>
              <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">船夫健康成立于2020年，旨在为高净值人士构建一道坚实的健康护城河。我们将专业的医疗决策支持与人文关怀相结合，让每一位客户都能在数字时代重拾对健康的绝对掌控感。</p>
            </div>
            <div className="font-headline text-6xl md:text-8xl font-black text-outline-variant/20 tracking-tighter">成立于 2020</div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="space-y-10">
          <h3 className="font-headline text-3xl font-bold text-primary border-l-4 border-primary pl-4">品牌积淀</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4 border border-outline-variant/20 hover:bg-primary/5 transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-headline font-extrabold text-primary">5年</div>
                <div className="text-lg font-bold text-primary tracking-wide uppercase">深耕积淀</div>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">始于对生命的敬畏，历经五载精研，打磨出符合高净值人群期待的医疗管家体系。</p>
            </div>
            <div className="bg-surface-container-low p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4 border border-outline-variant/20 hover:bg-primary/5 transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-headline font-extrabold text-primary">1000+</div>
                <div className="text-lg font-bold text-primary tracking-wide uppercase">高净值客户服务经验</div>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">获得逾千位时代精英的深度信任，每一份健康托付都是对我们专业度的最高褒奖。</p>
            </div>
          </div>
        </section>

        {/* Expert Team Section */}
        <section className="space-y-10">
          <div className="space-y-1">
            <h3 className="font-headline text-3xl font-bold text-primary border-l-4 border-primary pl-4">跨学科专家团队</h3>
            <p className="pl-5 text-xs font-semibold tracking-widest text-outline uppercase">Professional Multi-disciplinary Team</p>
          </div>
          <div className="bg-surface-container-low p-8 md:p-12 rounded-[2.5rem] border border-outline-variant/20 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-outline-variant/20">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20">
                <img alt="Senior medical expert profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop" />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-headline font-extrabold text-primary">10年+</div>
                <div className="text-lg font-bold text-primary tracking-wide uppercase">高端医疗深耕积淀</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-sm">
                  <img alt="Corporate medical consulting team" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop" />
                </div>
                <div className="space-y-4">
                  <h4 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                    成员构成
                  </h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">源自全球头部医疗咨询机构及私人银行总行医健服务核心角色。</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-sm">
                  <img alt="High-end medical laboratory and research" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop" />
                </div>
                <div className="space-y-4">
                  <h4 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                    专业背景
                  </h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">由中美联合培养医学博士、前三甲医生及海外医疗服务专家组成。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Values Section */}
        <section className="bg-[#005a9e] text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
            <img alt="Abstract medical technology background" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=800&fit=crop" />
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h3 className="font-headline text-4xl font-bold leading-tight">专业医疗管家服务理念</h3>
              <p className="text-blue-100/80 text-lg leading-relaxed">我们不只是代办挂号，更是在复杂多变的医疗系统中为您导航。我们的承诺是：绝对的私密性、临床卓越表现以及前瞻性的预防。</p>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {[
                { icon: 'verified_user', title: '极致私密与信任', desc: '严谨是管家服务的基石。您的健康旅程仅属于您自己，绝不外泄。' },
                { icon: 'psychiatry', title: '身心同步疗愈', desc: '如同悉达多的船夫，我们关注言外之意，确保心理安适与生理健康齐头并进。' },
                { icon: 'public', title: '全球资源链接', desc: '跨越地域限制，为您连接全球顶尖专科医生与医疗科技。' },
              ].map((item) => (
                <div key={item.icon} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xl mb-2">{item.title}</h4>
                    <p className="text-blue-100/80 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center py-10 space-y-12">
          <div className="space-y-4">
            <h3 className="font-headline text-3xl font-bold text-primary">开启您的健康管理之旅</h3>
            <p className="text-on-surface-variant max-w-lg mx-auto leading-relaxed">私人咨询服务仅限受邀或推荐预约，诚邀您通过以下方式与我们取得联系。</p>
          </div>
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <Link to="/consultation" className="w-full bg-white border-2 border-primary text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined">calendar_month</span>
              <span>立即预约咨询</span>
            </Link>
            <div className="mt-6 p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined">chat</span>
                <span>专属微信管家</span>
              </div>
              <p className="text-xs text-on-surface-variant">扫描宣传手册二维码或点击下方按钮添加</p>
              <Link to="/account/contact" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-bold active:scale-95 transition-all">
                <span className="material-symbols-outlined text-sm">qr_code_2</span>
                <span>添加微信管家</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
};

export default About;
