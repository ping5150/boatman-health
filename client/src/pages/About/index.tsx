import Icon from '@/components/Icon';

const About = () => {
  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">About Us</span>
        <h1 className="font-headline text-3xl font-bold text-primary mt-2">关于我们</h1>
      </div>

      {/* Brand Story */}
      <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-ambient mb-8">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
          <Icon name="sailing" size={32} className="text-secondary" />
        </div>
        <h2 className="font-headline text-2xl font-bold text-primary mb-4">船夫的故事</h2>
        <div className="space-y-4 text-on-surface-variant leading-relaxed">
          <p>在赫尔曼·黑塞的《悉达多》中，船夫是一位智者。他不急于给出答案，而是耐心地倾听河水的声音，陪伴求索者找到属于自己的领悟。</p>
          <p>我们以"船夫"为名，正是承袭这份理念——在您的健康旅途中，我们不只是诊疗的执行者，更是全程陪伴的私享管家。</p>
        </div>
      </div>

      {/* Mission */}
      <div className="bg-primary text-on-primary rounded-3xl p-8 mb-8">
        <h2 className="font-headline text-2xl font-bold mb-4">我们的使命</h2>
        <p className="text-on-primary-container leading-relaxed opacity-90">为全球高净值家庭提供从早期筛查到多学科精准诊疗的全程私享医疗管家服务，让每一位客户在数字时代重拾对健康的绝对掌控感。</p>
      </div>

      {/* Values */}
      <div className="space-y-4">
        {[
          { icon: 'shield', title: '专业守护', desc: '汇聚全球顶尖医疗资源，为您构筑坚实的健康护城河' },
          { icon: 'favorite', title: '人文关怀', desc: '超越冷冰冰的诊疗流程，以温度和耐心陪伴每一程' },
          { icon: 'visibility', title: '透明可信', desc: '全程信息透明，让您对每一项医疗决策心中有数' },
        ].map((item) => (
          <div key={item.icon} className="flex gap-4 p-5 bg-surface-container-lowest rounded-2xl shadow-ambient">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <Icon name={item.icon} size={24} className="text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-primary">{item.title}</h3>
              <p className="text-sm text-on-surface-variant mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
