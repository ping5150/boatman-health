import Icon from '@/components/Icon';

const cases = [
  {
    title: '早期肺结节精准筛查',
    tag: '肿瘤早筛',
    desc: '通过 AI 辅助低剂量 CT 筛查，及时发现 3mm 微小结节，后经多学科会诊明确良性，避免了不必要的手术焦虑。',
  },
  {
    title: '跨国心脏瓣膜手术协调',
    tag: '心血管',
    desc: '为客户协调全球 Top 3 心脏中心资源，从术前评估到术后康复全程陪伴，手术成功率达到国际领先水平。',
  },
  {
    title: '罕见病精准诊断之路',
    tag: '罕见病',
    desc: '历经 3 国 5 家医院辗转未果的罕见代谢病，通过全基因组测序与国际专家远程会诊，最终明确诊断并获得靶向治疗。',
  },
  {
    title: '全家族健康档案管理',
    tag: '家族健康',
    desc: '为某企业家家族三代人建立全面健康档案，通过定期体检与动态监测，实现从被动就医到主动健康管理的转变。',
  },
];

const Cases = () => {
  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">Case Center</span>
        <h1 className="font-headline text-3xl font-bold text-primary mt-2">案例中心</h1>
        <p className="text-on-surface-variant mt-2">真实案例，见证专业力量</p>
      </div>

      <div className="space-y-4">
        {cases.map((item) => (
          <div key={item.title} className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">{item.tag}</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-primary mb-2">{item.title}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
            <button className="inline-flex items-center gap-1 mt-4 text-secondary text-sm font-medium group">
              查看详情
              <Icon name="east" size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cases;
