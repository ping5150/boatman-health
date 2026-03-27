import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';

interface HealthData {
  // 基础生理健康背景
  bloodType: string;
  allergies: string[];
  chronicDiseases: string[];
  familyHistory: string[];
  medications: string;
  // 生活方式评估
  sleepHours: number;
  exerciseFrequency: string;
  dietType: string;
  smokingStatus: string;
  drinkingStatus: string;
  // 压力与情绪
  stressLevel: number;
  mentalHealthConcerns: string[];
  // 体检相关
  lastCheckupDate: string;
  healthConcerns: string;
}

const defaultHealthData: HealthData = {
  bloodType: '',
  allergies: [],
  chronicDiseases: [],
  familyHistory: [],
  medications: '',
  sleepHours: 7,
  exerciseFrequency: '',
  dietType: '',
  smokingStatus: '',
  drinkingStatus: '',
  stressLevel: 5,
  mentalHealthConcerns: [],
  lastCheckupDate: '',
  healthConcerns: '',
};

const HealthProfile = () => {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState<HealthData>(defaultHealthData);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // 从 sessionStorage 加载已保存的数据
  useEffect(() => {
    const saved = sessionStorage.getItem('healthFormData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHealthData({ ...defaultHealthData, ...parsed });
      } catch {
        // 忽略解析错误
      }
    }
  }, []);

  const sections = [
    {
      id: 'basic',
      icon: 'vital_signs',
      title: '基础生理健康背景',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      items: [
        { label: '血型', value: healthData.bloodType || '未填写' },
        { label: '过敏原', value: healthData.allergies.length > 0 ? healthData.allergies.join('、') : '无' },
        { label: '慢性疾病', value: healthData.chronicDiseases.length > 0 ? healthData.chronicDiseases.join('、') : '无' },
        { label: '家族病史', value: healthData.familyHistory.length > 0 ? healthData.familyHistory.join('、') : '无' },
        { label: '用药记录', value: healthData.medications || '无' },
      ],
    },
    {
      id: 'lifestyle',
      icon: 'self_care',
      title: '精细化生活方式评估',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      items: [
        { label: '日均睡眠', value: `${healthData.sleepHours} 小时` },
        { label: '运动频率', value: healthData.exerciseFrequency || '未填写' },
        { label: '饮食习惯', value: healthData.dietType || '未填写' },
        { label: '吸烟状况', value: healthData.smokingStatus || '未填写' },
        { label: '饮酒状况', value: healthData.drinkingStatus || '未填写' },
      ],
    },
    {
      id: 'mental',
      icon: 'psychology',
      title: '压力情绪与精神健康',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      items: [
        { label: '压力等级', value: `${healthData.stressLevel}/10` },
        { label: '心理健康关注', value: healthData.mentalHealthConcerns.length > 0 ? healthData.mentalHealthConcerns.join('、') : '无特殊关注' },
      ],
    },
    {
      id: 'checkup',
      icon: 'medical_information',
      title: '体检与健康诉求',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      items: [
        { label: '最近体检日期', value: healthData.lastCheckupDate || '未填写' },
        { label: '健康疑问/诉求', value: healthData.healthConcerns || '无' },
      ],
    },
  ];

  const completionRate = () => {
    let filled = 0;
    let total = 0;
    const fields = [
      healthData.bloodType,
      healthData.allergies.length > 0,
      healthData.chronicDiseases.length > 0,
      healthData.familyHistory.length > 0,
      healthData.medications,
      healthData.exerciseFrequency,
      healthData.dietType,
      healthData.smokingStatus,
      healthData.drinkingStatus,
      healthData.lastCheckupDate,
      healthData.healthConcerns,
    ];
    fields.forEach((f) => {
      total++;
      if (f) filled++;
    });
    return Math.round((filled / total) * 100);
  };

  const rate = completionRate();

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <section className="px-6 pt-4 mb-6">
        <div className="relative bg-primary rounded-3xl p-6 text-on-primary overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-widest uppercase opacity-70 mb-2">Health Profile</p>
            <h2 className="font-headline text-2xl font-bold mb-3">我的健康档案</h2>
            <p className="text-sm opacity-80 leading-relaxed mb-4">全面掌握您的健康状况，为精准医疗咨询提供数据支撑。</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${rate}%` }}
                />
              </div>
              <span className="text-sm font-bold">{rate}%</span>
            </div>
            <p className="text-xs opacity-60 mt-1">档案完成度</p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="px-6 space-y-4 mb-8">
        {sections.map((section) => (
          <div key={section.id} className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-5 active:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${section.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon name={section.icon} size={20} className={section.color} />
                </div>
                <h3 className="font-headline font-bold text-sm text-on-surface">{section.title}</h3>
              </div>
              <Icon
                name={activeSection === section.id ? 'expand_less' : 'expand_more'}
                size={22}
                className="text-on-surface-variant"
              />
            </button>
            {activeSection === section.id && (
              <div className="px-5 pb-5 space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-start justify-between py-2 border-b border-surface-container-high last:border-0">
                    <span className="text-xs text-on-surface-variant shrink-0 w-24">{item.label}</span>
                    <span className="text-sm text-on-surface text-right flex-1">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Action Buttons */}
      <section className="px-6 space-y-3">
        <button
          onClick={() => navigate('/health-form')}
          className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-elevated active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Icon name="edit" size={20} />
          编辑健康档案
        </button>
        <button
          onClick={() => navigate('/account')}
          className="w-full py-4 border-2 border-primary/10 text-primary font-bold rounded-xl hover:bg-surface-container-high active:scale-[0.98] transition-all text-center"
        >
          返回账户中心
        </button>
      </section>
    </div>
  );
};

export default HealthProfile;
