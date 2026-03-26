import Icon from '@/components/Icon';

const steps = [
  { icon: 'edit_note', title: '初次咨询', desc: '填写基础健康信息，让我们了解您的需求' },
  { icon: 'person_search', title: '专家匹配', desc: '根据您的情况，匹配最适合的首席顾问' },
  { icon: 'videocam', title: '深度沟通', desc: '与首席顾问进行一对一深度视频/电话沟通' },
  { icon: 'description', title: '方案制定', desc: '基于全面评估，制定个性化健康管理方案' },
  { icon: 'local_hospital', title: '资源协调', desc: '协调全球优质医疗资源，安排诊疗计划' },
  { icon: 'monitor_heart', title: '诊疗陪伴', desc: '全程陪同就诊，实时跟进诊疗进展' },
  { icon: 'healing', title: '康复管理', desc: '诊疗结束后的康复指导与生活方式调整' },
  { icon: 'auto_awesome', title: '持续关怀', desc: '定期健康回访，动态优化您的健康策略' },
];

const ServiceJourney = () => {
  return (
    <div>
      {/* Header */}
      <div className="bg-primary text-on-primary px-6 py-12">
        <span className="text-secondary-fixed-dim font-bold tracking-[0.2em] uppercase text-sm">Service Journey</span>
        <h1 className="font-headline text-3xl font-bold mt-4 mb-4">服务流程</h1>
        <p className="text-on-primary-container text-base opacity-80 leading-relaxed">从初次咨询到持续关怀，8 步旅程全程守护您的健康。</p>
      </div>

      {/* Timeline */}
      <div className="px-6 py-8">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-surface-container-high" />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.icon} className="relative flex gap-5">
                {/* Dot */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <Icon name={step.icon} size={22} className="text-secondary" />
                </div>
                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">STEP {index + 1}</span>
                  </div>
                  <h3 className="font-headline text-lg font-bold text-primary">{step.title}</h3>
                  <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceJourney;
