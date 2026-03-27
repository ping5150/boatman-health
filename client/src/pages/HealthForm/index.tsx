import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const HealthForm = () => {
  const [formData, setFormData] = useState({
    patientName: '王清华',
    healthHistory: ['原发性高血压（1级）', '脂肪肝', '高尿酸血症'],
    hypertensionMedication: '50mg/每日',
    smokingHistory: 'no',
    drinkingHistory: 'no',
    dietStructure: 'reasonable',
    sleepQuality: 'sleep-ok',
    sleepTime: '22:00',
    wakeTime: '07:00',
    sleepProblems: '',
    dietModes: ['mediterranean'] as string[],
    waterType: 'water',
    waterTemp: 'hot',
    waterAmount: '2000',
    exerciseTypes: ['running', 'swimming'] as string[],
    exerciseFrequency: '3',
    exerciseDuration: '45',
    stressLevel: 5,
    recentFatigue: 'no',
    energyLevel: ['energetic'] as string[],
    healthConcerns: '',
  });

  const navigate = useNavigate();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('更新健康档案:', formData);
    navigate('/archive-success');
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleArray = (field: string, value: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  return (
    <>
      <TopBar showBack showAccount={false} />

      <main className="pt-24 pb-32 sm:pb-40 px-4 sm:px-6 max-w-lg mx-auto">
        <section className="mb-6">
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 text-white mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">medical_services</span>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1 opacity-80">健康档案</p>
              <h2 className="font-headline text-2xl font-bold">深度健康档案</h2>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">档案姓名</label>
            <input type="text" value={formData.patientName} onChange={(e) => handleChange('patientName', e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface font-body" />
          </div>
        </section>

        <form className="space-y-6" onSubmit={handleFormSubmit}>
          {/* Module 1 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">01</div>
              <h3 className="font-headline font-bold text-primary text-lg">深度生活健康背景</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">健康史</label>
                <div className="bg-surface-container-low rounded-xl p-4">
                  <ul className="space-y-1">
                    {formData.healthHistory.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-on-surface">
                        <span className="text-secondary mt-1">•</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">高血压记录</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface-container-low rounded-lg p-3 text-center"><p className="text-xs text-on-surface-variant mb-1">药物名称</p><p className="text-sm font-semibold text-primary">氨氯地平</p></div>
                  <div className="bg-surface-container-low rounded-lg p-3 text-center"><p className="text-xs text-on-surface-variant mb-1">使用剂量</p><p className="text-sm font-semibold text-primary">{formData.hypertensionMedication}</p></div>
                  <div className="bg-surface-container-low rounded-lg p-3 text-center"><p className="text-xs text-on-surface-variant mb-1">用药频率</p><p className="text-sm font-semibold text-primary">每日1次</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">烟酒史</label>
                <div className="flex gap-3">
                  {(['smokingHistory', '吸烟史'] as const).map((_, i) => {
                    const field = i === 0 ? 'smokingHistory' : 'drinkingHistory';
                    const label = i === 0 ? '吸烟史' : '饮酒史';
                    return (
                      <div key={field} className="flex-1">
                        <p className="text-sm text-on-surface mb-2">{label}</p>
                        <div className="flex gap-2">
                          {['no', 'yes'].map((v) => (
                            <button key={v} type="button" onClick={() => handleChange(field, v)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${formData[field as keyof typeof formData] === v ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>
                              {v === 'no' ? '无' : '有'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">饮食结构</label>
                <div className="flex gap-2">
                  {['reasonable', 'unreasonable'].map((v) => (
                    <button key={v} type="button" onClick={() => handleChange('dietStructure', v)} className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${formData.dietStructure === v ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>
                      {v === 'reasonable' ? '合理' : '不合理'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">睡眠情况</label>
                <select value={formData.sleepQuality} onChange={(e) => handleChange('sleepQuality', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-body appearance-none">
                  <option value="sleep-ok">睡眠尚可</option>
                  <option value="sleep-poor">睡眠较差</option>
                  <option value="sleep-bad">睡眠很差</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-on-surface-variant mb-1 block">入睡时间</label><input type="time" value={formData.sleepTime} onChange={(e) => handleChange('sleepTime', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-body" /></div>
                  <div><label className="text-xs text-on-surface-variant mb-1 block">起床时间</label><input type="time" value={formData.wakeTime} onChange={(e) => handleChange('wakeTime', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-body" /></div>
                </div>
                <div><label className="text-xs text-on-surface-variant mb-1 block">请说明具体睡眠问题或异常</label><textarea rows={2} value={formData.sleepProblems} onChange={(e) => handleChange('sleepProblems', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-body resize-none" placeholder="可选" /></div>
              </div>
            </div>
          </section>

          {/* Module 2 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">02</div>
              <h3 className="font-headline font-bold text-primary text-lg">精细化生活方式评估</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">饮食模式（可多选）</label>
                <div className="grid grid-cols-2 gap-2">
                  {['少盐饮食', '地中海饮食', '低碳水饮食', '生酮饮食', 'DASH饮食', '16+8轻断食'].map((mode) => (
                    <button key={mode} type="button" onClick={() => handleToggleArray('dietModes', mode)} className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${formData.dietModes.includes(mode) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>{mode}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">饮水习惯</label>
                <div className="flex gap-2 flex-wrap">
                  {['白开水', '咖啡', '茶', '碳酸'].map((type) => (
                    <button key={type} type="button" onClick={() => handleChange('waterType', type)} className={`py-2 px-4 rounded-lg text-xs font-medium transition-all ${formData.waterType === type ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>{type}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-on-surface-variant mb-1 block">饮水温度</label><select value={formData.waterTemp} onChange={(e) => handleChange('waterTemp', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-body text-sm"><option value="hot">偏热</option><option value="normal">常温</option><option value="cool">偏凉</option><option value="other">其他</option></select></div>
                  <div><label className="text-xs text-on-surface-variant mb-1 block">饮水量</label><input type="number" value={formData.waterAmount} onChange={(e) => handleChange('waterAmount', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-body text-sm" placeholder="ml" /></div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">运动习惯（可多选）</label>
                <div className="grid grid-cols-4 gap-2">
                  {['跑步', '游泳', '骑行', '力量', '瑜伽', '拉伸', '其他'].map((type) => (
                    <button key={type} type="button" onClick={() => handleToggleArray('exerciseTypes', type)} className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${formData.exerciseTypes.includes(type) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>{type}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-on-surface-variant mb-1 block">运动频率</label><div className="flex items-center gap-2"><input type="number" value={formData.exerciseFrequency} onChange={(e) => handleChange('exerciseFrequency', e.target.value)} className="flex-1 bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-body text-sm" /><span className="text-sm text-on-surface-variant">次/天</span></div></div>
                  <div><label className="text-xs text-on-surface-variant mb-1 block">运动时长</label><div className="flex items-center gap-2"><input type="number" value={formData.exerciseDuration} onChange={(e) => handleChange('exerciseDuration', e.target.value)} className="flex-1 bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-body text-sm" /><span className="text-sm text-on-surface-variant">分/次</span></div></div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">睡眠重点</label>
                <div className="flex gap-2">
                  {['<22:00', '22:00-24:00', '>24:00'].map((time) => (
                    <button key={time} type="button" onClick={() => handleChange('sleepTime', time)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${formData.sleepTime.includes(time) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>{time}</button>
                  ))}
                </div>
                <div><label className="text-xs text-on-surface-variant mb-1 block">睡眠质量</label>
                  <div className="flex gap-2 flex-wrap">
                    {['睡眠充足（7-9小时）', '睡眠偏少（5-7小时）', '睡眠严重不足（<5小时）'].map((quality) => (
                      <button key={quality} type="button" onClick={() => handleChange('sleepQuality', quality)} className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${formData.sleepQuality === quality ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>{quality}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Module 3 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">03</div>
              <h3 className="font-headline font-bold text-primary text-lg">压力、情绪与精神</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">压力水平</label>
                <div className="bg-surface-container-low rounded-lg p-4">
                  <input type="range" min="1" max="10" value={formData.stressLevel} onChange={(e) => handleChange('stressLevel', parseInt(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-xs text-on-surface-variant mt-2"><span>低（1）</span><span className="font-bold text-primary">{formData.stressLevel}</span><span>高（10）</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">补充问题</label>
                <select value={formData.recentFatigue} onChange={(e) => handleChange('recentFatigue', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-body appearance-none"><option value="no">否</option><option value="yes">是</option></select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">精力情况（可多选）</label>
                <div className="flex gap-2 flex-wrap">
                  {['精力充沛', '一般', '疲劳', '乏力'].map((level) => (
                    <button key={level} type="button" onClick={() => handleToggleArray('energyLevel', level)} className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${formData.energyLevel.includes(level) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>{level}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Module 4 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">04</div>
              <h3 className="font-headline font-bold text-primary text-lg">体检疑问/诉求</h3>
            </div>
            <div className="space-y-3">
              <textarea rows={5} value={formData.healthConcerns} onChange={(e) => handleChange('healthConcerns', e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface font-body resize-none" placeholder="请详细描述您关注的健康问题或您的体检咨询疑问，以便我们为您提供更精准的服务" />
            </div>
          </section>

          <div className="pt-4">
            <button type="submit" className="w-full bg-primary text-on-primary rounded-full font-bold text-lg px-8 py-4 hover:bg-primary-container transition-all active:scale-95 shadow-lg flex items-center justify-center touch-manipulation min-h-[56px]">更新档案</button>
          </div>
        </form>
      </main>

      <BottomNav />
    </>
  );
};

export default HealthForm;
