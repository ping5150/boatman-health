import Icon from '@/components/Icon';

const paradigmCards = [
  { icon: 'psychology', title: 'AI 辅助精准研判', desc: '整合顶尖算法与医学专家大脑，提供数据驱动的干预建议。以智能技术赋能传统诊疗，实现精准化、个性化的健康管理。' },
  { icon: 'groups', title: '全球顾问委员会', desc: '直连来自五大医学中心的资深顾问，打破地域医疗壁垒。无论您身在何处，都能获得全球最前沿的医学智慧。' },
  { icon: 'analytics', title: '定制化健康资源库', desc: '实时更新的国际医疗前沿资讯，为您筛选最相关的资源。告别信息焦虑，掌握真正有价值的健康知识。' },
  { icon: 'verified', title: '1对1 首席顾问', desc: '资深临床背景专家，为您提供 7×24 小时全时决策支持。从日常健康咨询到紧急医疗事件，始终有人为您守候。' },
  { icon: 'monitoring', title: '动态健康监测', desc: '通过可穿戴设备与定期体检数据，构建个人健康数字孪生。早期预警，防患于未然。' },
  { icon: 'handshake', title: '终身健康伙伴', desc: '不是一次性的诊疗服务，而是贯穿全生命周期的健康伙伴。我们与您共同成长，持续优化您的健康策略。' },
];

const Paradigm = () => {
  return (
    <div>
      {/* Header */}
      <div className="bg-primary text-on-primary px-6 py-12">
        <span className="text-secondary-fixed-dim font-bold tracking-[0.2em] uppercase text-sm">Health Management Paradigm</span>
        <h1 className="font-headline text-3xl font-bold mt-4 mb-4">健康管理新范式</h1>
        <p className="text-on-primary-container text-base opacity-80 leading-relaxed">摒弃碎片化的就医模式，我们通过"全生命周期管家制"构建预防、诊疗、康复的闭环生态。</p>
      </div>

      {/* Cards */}
      <div className="px-6 py-8 space-y-4">
        {paradigmCards.map((card) => (
          <div key={card.icon} className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
              <Icon name={card.icon} size={24} className="text-secondary" />
            </div>
            <h3 className="font-headline text-lg font-bold text-primary mb-2">{card.title}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Paradigm;
