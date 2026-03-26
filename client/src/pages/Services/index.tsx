import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';

interface ServiceItem {
  icon: string;
  title: string;
  subtitle: string;
  path: string;
  accent?: boolean;
}

const services: ServiceItem[] = [
  { icon: 'edit_note', title: '即刻咨询', subtitle: '填写基础信息，开启健康旅程', path: '/consultation', accent: true },
  { icon: 'health_and_safety', title: '健康管理新范式', subtitle: '了解我们的全生命周期管家制', path: '/paradigm' },
  { icon: 'route', title: '服务流程', subtitle: '从初次咨询到持续关怀的 8 步旅程', path: '/service-journey' },
  { icon: 'auto_stories', title: '案例中心', subtitle: '真实案例，见证专业力量', path: '/cases' },
  { icon: 'info', title: '关于我们', subtitle: '追寻健康的真义，船夫的品牌故事', path: '/about' },
];

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">Our Services</span>
        <h1 className="font-headline text-3xl font-bold text-primary mt-2">专属服务</h1>
        <p className="text-on-surface-variant mt-2 font-body">为您精心打造的私享医疗管家服务</p>
      </div>

      <div className="space-y-4">
        {services.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all active:scale-[0.98] ${
              item.accent
                ? 'bg-secondary text-on-secondary shadow-cta'
                : 'bg-surface-container-lowest shadow-ambient hover:shadow-elevated'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              item.accent ? 'bg-white/20' : 'bg-secondary/10'
            }`}>
              <Icon name={item.icon} size={24} className={item.accent ? 'text-white' : 'text-secondary'} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-base">{item.title}</h3>
              <p className={`text-sm mt-0.5 ${item.accent ? 'text-white/80' : 'text-on-surface-variant'}`}>{item.subtitle}</p>
            </div>
            <Icon name="chevron_right" size={20} className={item.accent ? 'text-white/60' : 'text-outline'} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Services;
