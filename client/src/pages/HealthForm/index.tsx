import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import { submitForm2 } from '@/api/form2.api';

const familyHistoryOptions = ['心血管疾病', '糖尿病', '阿尔兹海默症', '肿瘤'];
const dietPatterns = ['混合膳食', '地中海饮食', '生酮饮食', '轻断食', '素食', '不规律'];
const beverages = ['水', '咖啡', '茶', '酒精', '含/无糖饮料'];
const mealFeelings = ['精力充沛', '昏昏欲睡', '腹胀', '很快饥饿', '其他'];
const exerciseTypes = ['球类', '跳绳', '跑步', '散步', '游泳', '登山', '健身房'];
const sleepDurations = ['< 6 小时', '6-7 小时', '7-8 小时', '> 8 小时'];
const sleepQualities = [
  '很快入睡（<15分钟），且夜间很少醒来',
  '需要一段时间（15-30分钟），或易醒但能再次入睡',
  '入睡困难、夜间多醒且难以再入睡，伴有焦虑',
];
const brainFogOptions = ['记忆力下降', '注意力不集中', '思维迟缓', '其他'];

const HealthForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Section 1: Basic Info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Section 2: Health Background
  const [diseases, setDiseases] = useState([{ name: '', diagnosisDate: '' }]);
  const [medications, setMedications] = useState([{ name: '', dosage: '' }]);
  const [hasSurgery, setHasSurgery] = useState('');
  const [surgeryDetail, setSurgeryDetail] = useState('');
  const [hasAllergy, setHasAllergy] = useState('');
  const [allergyDetail, setAllergyDetail] = useState('');
  const [vascularStatus, setVascularStatus] = useState('');
  const [vascularDetail, setVascularDetail] = useState('');
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [familyHistoryNote, setFamilyHistoryNote] = useState('');

  // Section 3: Lifestyle
  const [selectedDiet, setSelectedDiet] = useState<string[]>([]);
  const [selectedBeverages, setSelectedBeverages] = useState<string[]>([]);
  const [selectedMealFeelings, setSelectedMealFeelings] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseFrequency, setExerciseFrequency] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [sleepDuration, setSleepDuration] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [stressLevel, setStressLevel] = useState(5);
  const [anxietyFrequency, setAnxietyFrequency] = useState('没有');
  const [brainFog, setBrainFog] = useState<string[]>([]);

  // Section 4: Concerns
  const [primaryConcern, setPrimaryConcern] = useState('');

  const toggleArray = (arr: string[], item: string, setter: (v: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const addDynamic = <T,>(arr: T[], item: T, setter: (v: T[]) => void) => {
    setter([...arr, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('请输入姓名');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await submitForm2({
        fullName: fullName.trim(),
        gender: '',
        birthDate: '',
        idNumber: '',
        phone,
        email: '',
        address: '',
        bloodType: '',
        height: '',
        weight: '',
        allergies: hasAllergy === '有' ? allergyDetail : '无',
        currentMedications: medications.map((m) => `${m.name} ${m.dosage}`).join('; '),
        pastSurgeries: hasSurgery === '有' ? surgeryDetail : '无',
        chronicDiseases: diseases.map((d) => `${d.name} (${d.diagnosisDate})`).join('; '),
        familyHistory: `${familyHistory.join(', ')}${familyHistoryNote ? ` - ${familyHistoryNote}` : ''}`,
        smokingStatus: '',
        drinkingStatus: selectedBeverages.includes('酒精') ? '有' : '无',
        exerciseFrequency: `${exerciseFrequency}次/周, ${exerciseDuration}分钟/次, ${selectedExercises.join('/')}`,
        dietaryPreferences: selectedDiet.join(', '),
        sleepQuality: `${sleepDuration}, ${sleepQuality}`,
        primaryConcern,
        expectedService: '',
        preferredHospital: '',
        budgetRange: '',
        additionalNotes: `压力水平:${stressLevel}/10, 焦虑频率:${anxietyFrequency}, 脑雾:${brainFog.join('/')}`,
      });
      navigate('/archive-success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '提交失败，请重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-8">
      {/* Hero Header */}
      <section className="px-6 pt-8 pb-6">
        <span className="text-secondary font-headline font-bold tracking-widest uppercase text-xs mb-4 block">Personal Steward Service</span>
        <h2 className="font-headline text-3xl font-extrabold text-primary leading-tight tracking-tighter mb-4">医疗咨询登记<br />健康档案建立</h2>
        <p className="text-on-surface-variant font-body text-base leading-relaxed">为您的生活提供独立、客观且极具前瞻性的健康资产管理建议。</p>
      </section>

      {error && (
        <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-error-container/30 text-error text-sm">{error}</div>
      )}

      <form className="px-6 space-y-8" onSubmit={handleSubmit}>
        {/* Section 1: Basic Info */}
        <section className="bg-surface-container-low p-6 rounded-[2rem] shadow-ambient ghost-border">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-sm">01</span>
            <h3 className="font-headline font-bold text-primary text-lg tracking-tight">基本信息</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">姓名</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="请输入尊称" className="w-full bg-surface-container-lowest rounded-2xl p-4 text-on-surface font-body shadow-sm focus:ring-2 focus:ring-secondary/60 outline-none border-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">联系电话</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="主要联系号码" className="w-full bg-surface-container-lowest rounded-2xl p-4 text-on-surface font-body shadow-sm focus:ring-2 focus:ring-secondary/60 outline-none border-none" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">紧急联系人/电话</label>
              <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="紧急联系方式" className="w-full bg-surface-container-lowest rounded-2xl p-4 text-on-surface font-body shadow-sm focus:ring-2 focus:ring-secondary/60 outline-none border-none" />
            </div>
          </div>
        </section>

        {/* Section 2: Deep Health Background */}
        <section className="bg-surface-container-low p-6 rounded-[2rem] shadow-ambient ghost-border">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-sm">02</span>
            <h3 className="font-headline font-bold text-primary text-lg tracking-tight">深度生理健康背景</h3>
          </div>
          <div className="space-y-6">
            {/* Current Diseases */}
            <div className="space-y-3">
              <label className="text-xs font-headline font-bold text-primary uppercase tracking-widest block">当前疾病</label>
              {diseases.map((d, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input type="text" value={d.name} onChange={(e) => { const arr = [...diseases]; arr[i].name = e.target.value; setDiseases(arr); }} placeholder="诊断名称" className="w-full bg-surface-container-lowest rounded-xl p-3 text-sm font-body shadow-sm border-none outline-none" />
                  <input type="text" value={d.diagnosisDate} onChange={(e) => { const arr = [...diseases]; arr[i].diagnosisDate = e.target.value; setDiseases(arr); }} placeholder="确诊时间" className="w-full bg-surface-container-lowest rounded-xl p-3 text-sm font-body shadow-sm border-none outline-none" />
                </div>
              ))}
              <button type="button" onClick={() => addDynamic(diseases, { name: '', diagnosisDate: '' }, setDiseases)} className="text-secondary text-xs font-bold flex items-center gap-1">+ 添加其他诊断</button>
            </div>

            {/* Medications */}
            <div className="space-y-3">
              <label className="text-xs font-headline font-bold text-primary uppercase tracking-widest block">目前用药记录</label>
              {medications.map((m, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input type="text" value={m.name} onChange={(e) => { const arr = [...medications]; arr[i].name = e.target.value; setMedications(arr); }} placeholder="药物名称" className="w-full bg-surface-container-lowest rounded-xl p-3 text-sm font-body shadow-sm border-none outline-none" />
                  <input type="text" value={m.dosage} onChange={(e) => { const arr = [...medications]; arr[i].dosage = e.target.value; setMedications(arr); }} placeholder="剂量 / 频率" className="w-full bg-surface-container-lowest rounded-xl p-3 text-sm font-body shadow-sm border-none outline-none" />
                </div>
              ))}
              <button type="button" onClick={() => addDynamic(medications, { name: '', dosage: '' }, setMedications)} className="text-secondary text-xs font-bold flex items-center gap-1">+ 添加药物记录</button>
            </div>

            {/* Surgery & Allergy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">手术史</label>
                <div className="flex gap-4 items-center flex-wrap">
                  {['无', '有'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="surgery" value={opt} checked={hasSurgery === opt} onChange={(e) => setHasSurgery(e.target.value)} className="w-4 h-4 text-secondary focus:ring-secondary" />
                      <span className="text-sm font-body">{opt}</span>
                    </label>
                  ))}
                  {hasSurgery === '有' && (
                    <input type="text" value={surgeryDetail} onChange={(e) => setSurgeryDetail(e.target.value)} placeholder="请注明" className="flex-grow bg-surface-container-lowest rounded-lg p-2 text-xs font-body shadow-sm border-none outline-none min-w-[120px]" />
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">过敏史</label>
                <div className="flex gap-4 items-center flex-wrap">
                  {['无', '有'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="allergy" value={opt} checked={hasAllergy === opt} onChange={(e) => setHasAllergy(e.target.value)} className="w-4 h-4 text-secondary focus:ring-secondary" />
                      <span className="text-sm font-body">{opt}</span>
                    </label>
                  ))}
                  {hasAllergy === '有' && (
                    <input type="text" value={allergyDetail} onChange={(e) => setAllergyDetail(e.target.value)} placeholder="请注明" className="flex-grow bg-surface-container-lowest rounded-lg p-2 text-xs font-body shadow-sm border-none outline-none min-w-[120px]" />
                  )}
                </div>
              </div>
            </div>

            {/* Vascular */}
            <div className="space-y-3">
              <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">血管评估</label>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="vascular" value="合格" checked={vascularStatus === '合格'} onChange={(e) => setVascularStatus(e.target.value)} className="w-4 h-4 text-secondary focus:ring-secondary" />
                  <span className="text-sm font-body">合格（适合留置针操作）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="vascular" value="不合格" checked={vascularStatus === '不合格'} onChange={(e) => setVascularStatus(e.target.value)} className="w-4 h-4 text-secondary focus:ring-secondary" />
                  <span className="text-sm font-body">不合格</span>
                </label>
                {vascularStatus === '不合格' && (
                  <input type="text" value={vascularDetail} onChange={(e) => setVascularDetail(e.target.value)} placeholder="原因" className="flex-grow bg-surface-container-lowest rounded-lg p-2 text-xs font-body shadow-sm border-none outline-none min-w-[150px]" />
                )}
              </div>
            </div>

            {/* Family History */}
            <div className="space-y-3">
              <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">家族史 (直系亲属是否有以下情况)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {familyHistoryOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-lowest ghost-border cursor-pointer">
                    <input type="checkbox" checked={familyHistory.includes(opt)} onChange={() => toggleArray(familyHistory, opt, setFamilyHistory)} className="w-4 h-4 text-secondary focus:ring-secondary rounded" />
                    <span className="text-xs font-body">{opt}</span>
                  </label>
                ))}
              </div>
              <textarea value={familyHistoryNote} onChange={(e) => setFamilyHistoryNote(e.target.value)} placeholder="请注明具体类型或其他补充..." rows={2} className="w-full bg-surface-container-lowest rounded-2xl p-4 text-sm font-body shadow-sm border-none outline-none resize-none" />
            </div>
          </div>
        </section>

        {/* Section 3: Lifestyle */}
        <section className="bg-surface-container-low p-6 rounded-[2rem] shadow-ambient ghost-border">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-sm">03</span>
            <h3 className="font-headline font-bold text-primary text-lg tracking-tight">精细化生活方式评估</h3>
          </div>
          <div className="space-y-8">
            {/* Diet */}
            <div className="space-y-4">
              <h4 className="text-sm font-headline font-bold text-secondary-container bg-primary-container inline-block px-3 py-1 rounded-full">饮食模式</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dietPatterns.map((d) => (
                  <label key={d} className="flex items-center gap-2 p-3 bg-white rounded-xl text-xs cursor-pointer">
                    <input type="checkbox" checked={selectedDiet.includes(d)} onChange={() => toggleArray(selectedDiet, d, setSelectedDiet)} className="rounded text-secondary" />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-headline font-bold text-primary/60 uppercase px-1">常饮饮品</label>
                <div className="flex flex-wrap gap-4 text-xs">
                  {beverages.map((b) => (
                    <label key={b} className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={selectedBeverages.includes(b)} onChange={() => toggleArray(selectedBeverages, b, setSelectedBeverages)} className="rounded" />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-headline font-bold text-primary/60 uppercase px-1">餐后感受</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                  {mealFeelings.map((f) => (
                    <label key={f} className={`p-2 rounded cursor-pointer flex items-center justify-center text-center transition-colors ${selectedMealFeelings.includes(f) ? 'bg-secondary/10 text-secondary font-bold' : 'border border-outline-variant/30'}`}>
                      <input type="checkbox" className="sr-only" checked={selectedMealFeelings.includes(f)} onChange={() => toggleArray(selectedMealFeelings, f, setSelectedMealFeelings)} />
                      <span>{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Exercise */}
            <div className="space-y-4">
              <h4 className="text-sm font-headline font-bold text-secondary-container bg-primary-container inline-block px-3 py-1 rounded-full">运动习惯</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {exerciseTypes.map((ex) => (
                  <label key={ex} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedExercises.includes(ex)} onChange={() => toggleArray(selectedExercises, ex, setSelectedExercises)} className="rounded" />
                    <span>{ex}</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-primary/60 font-bold uppercase">运动频率</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={exerciseFrequency} onChange={(e) => setExerciseFrequency(e.target.value)} className="w-16 bg-white rounded-lg p-2 text-sm shadow-sm border-none outline-none" />
                    <span className="text-xs">周 / 次</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-primary/60 font-bold uppercase">平均时长</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={exerciseDuration} onChange={(e) => setExerciseDuration(e.target.value)} className="w-16 bg-white rounded-lg p-2 text-sm shadow-sm border-none outline-none" />
                    <span className="text-xs">分 / 次</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sleep */}
            <div className="space-y-4">
              <h4 className="text-sm font-headline font-bold text-secondary-container bg-primary-container inline-block px-3 py-1 rounded-full">睡眠情况</h4>
              <div className="space-y-2">
                <p className="text-xs font-bold text-primary">工作日平均睡眠时长？</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  {sleepDurations.map((sd) => (
                    <label key={sd} className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="sleep_len" value={sd} checked={sleepDuration === sd} onChange={(e) => setSleepDuration(e.target.value)} className="text-secondary" />
                      <span>{sd}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-primary">入睡与质量：</p>
                <div className="space-y-2">
                  {sleepQualities.map((sq) => (
                    <label key={sq} className="flex items-start gap-2 p-3 bg-white rounded-xl text-xs cursor-pointer">
                      <input type="radio" name="sleep_quality" value={sq} checked={sleepQuality === sq} onChange={(e) => setSleepQuality(e.target.value)} className="mt-0.5 text-secondary" />
                      <span>{sq}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Stress */}
            <div className="space-y-4">
              <h4 className="text-sm font-headline font-bold text-secondary-container bg-primary-container inline-block px-3 py-1 rounded-full">压力、情绪与脑雾</h4>
              <div className="space-y-2">
                <p className="text-xs font-bold text-primary">压力水平评价 (1-10, 1最小): <span className="text-secondary">{stressLevel}</span></p>
                <div className="bg-white p-3 rounded-2xl">
                  <input type="range" min="1" max="10" step="1" value={stressLevel} onChange={(e) => setStressLevel(Number(e.target.value))} className="w-full accent-secondary" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-primary">近两周焦虑/担忧频率？</p>
                  <select value={anxietyFrequency} onChange={(e) => setAnxietyFrequency(e.target.value)} className="w-full bg-white rounded-xl p-3 text-xs shadow-sm border-none outline-none">
                    {['没有', '几天', '一半以上', '每天'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-primary">脑雾/记忆力表现</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {brainFogOptions.map((bf) => (
                      <label key={bf} className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={brainFog.includes(bf)} onChange={() => toggleArray(brainFog, bf, setBrainFog)} className="rounded" />
                        <span>{bf}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Concerns */}
        <section className="bg-surface-container-low p-6 rounded-[2rem] shadow-ambient ghost-border">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-sm">04</span>
            <h3 className="font-headline font-bold text-primary text-lg tracking-tight">体检疑问 / 诉求</h3>
          </div>
          <textarea value={primaryConcern} onChange={(e) => setPrimaryConcern(e.target.value)} placeholder="请详细描述您最关注的健康问题或当前的体检报告疑问..." rows={5} className="w-full bg-surface-container-lowest rounded-3xl p-6 text-sm font-body shadow-sm border-none outline-none resize-none" />
        </section>

        {/* Submit */}
        <div className="pt-2 max-w-lg mx-auto">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-headline font-bold py-6 rounded-2xl text-lg tracking-tight shadow-elevated hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? '提交中...' : '提交详细咨询登记'}
            {!loading && <Icon name="arrow_forward_ios" size={18} />}
          </button>
          <p className="text-center text-[10px] text-outline mt-4 uppercase tracking-[0.2em]">Official Boatman Stewardship Channel</p>
        </div>
      </form>
    </div>
  );
};

export default HealthForm;
