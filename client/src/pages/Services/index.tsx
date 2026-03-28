import { Link } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const Services = () => {
  const steps = [
    { number: '01', title: '初步需求沟通', icon: 'chat_bubble', description: '您的专属健康管家将与您进行深度访谈,了解您的家族史、现病史及个人生活习惯,建立初步的数字健康档案。', isPrimary: true },
    { number: '02', title: '精密体检定制', icon: 'biotech', description: '基于初步沟通,医学团队将为您量身定制专属的高端体检方案,剔除冗余项目,聚焦潜在健康风险点。', isPrimary: false },
    { number: '03', title: '全维度健康数据采集', icon: 'analytics', description: '在顶级合作医疗机构完成深度检查,所有数据将同步至船夫健康云平台,由多学科专家团队联合审阅。', isPrimary: true },
    { number: '04', title: '多学科联合专家会诊', icon: 'groups', description: '由心血管、内分泌、影像学等多领域资深专家针对体检结果进行横向与纵向深度对比,挖掘隐藏的健康信号。', isPrimary: false },
    { number: '05', title: '年度报告生成与解读', icon: 'assignment', description: '为您呈递一份深度且易读的年度健康报告,不仅包含数据,更有医学专家针对各项指标的专业建议与生活方式指导。', isPrimary: true },
    { number: '06', title: '个性化干预计划', icon: 'medical_information', description: '根据报告结论,定制包含精准营养、运动处方、压力管理在内的全套干预方案,并协助预约必要的深度诊疗。', isPrimary: false },
    { number: '07', title: '动态健康监测', icon: 'watch', description: '利用可穿戴设备完成定期随访,全天关注您的身体变化,任何预警信号都将触发管家的响应机制。', isPrimary: true },
    { number: '08', title: '长期管家式守护', icon: 'shield', description: '这并非终点,而是新的开始。船夫健康将作为您的长期医学顾问,为您及您的家人提供永不落幕的健康安全保障。', isPrimary: false },
  ];

  return (
    <>
      <TopBar showBack showAccount />

      <main className="pt-20 sm:pt-24 pb-32 sm:pb-40 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Hero Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl md:text-5xl text-primary leading-tight mb-6">专业服务流程</h2>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-2xl">秉承"私人管家"式的服务理念,我们为您构建了一套严谨且富有温度的全程健康管理体系。从首次接触到持续守护,每一步都经过精密设计。</p>
        </section>

        {/* Service Journey Timeline */}
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={step.number} className="relative pl-16 pb-12">
              {/* Timeline connector line */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute left-[23px] top-[40px] bottom-[-20px] w-[2px] opacity-30"
                  style={{ background: 'linear-gradient(to bottom, #70aeff 0%, transparent 100%)' }}
                />
              )}

              <div className={`absolute left-0 top-0 w-12 h-12 ${step.isPrimary ? 'bg-primary' : 'bg-primary-container'} rounded-full flex items-center justify-center text-white z-10 editorial-shadow`}>
                <span className="font-headline font-bold">{step.number}</span>
              </div>

              <div className={`${step.isPrimary ? 'bg-surface-container-lowest' : 'bg-surface-container-low'} p-8 rounded-2xl ${step.isPrimary ? 'editorial-shadow' : ''} transition-all duration-300 hover:bg-white`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-headline font-bold text-xl text-primary">{step.title}</h3>
                  <span className="material-symbols-outlined text-secondary text-2xl">{step.icon}</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <section className="mt-12 sm:mt-16">
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-on-primary">
            <h3 className="font-headline text-2xl sm:text-3xl font-bold mb-4 text-center text-white">开启您的专属健康航程</h3>
            <p className="text-on-primary-container text-base sm:text-lg text-center mb-8 max-w-2xl mx-auto">现在预约，由健康管家为您讲解更多服务细节</p>
            <div className="flex justify-center">
              <Link to="/consultation" className="px-8 sm:px-12 py-4 bg-white text-primary rounded-full font-bold text-base sm:text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg touch-manipulation min-h-[52px] flex items-center justify-center">立即预约咨询</Link>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
};

export default Services;
