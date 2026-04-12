import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  submitSleepSurvey,
  getLatestSleepSurvey,
  saveSleepDraft,
  updateSleepSurvey,
  SleepSurveyData,
} from '@/api/sleep-survey.api';
import { useUser } from '@/contexts/UserContext';

const TOTAL_STEPS = 6;
const LOCAL_STORAGE_KEY = 'sleep_survey_draft';

const initialFormData: SleepSurveyData = {
  name: '',
  phone: '',
  bedtime: '',
  sleepLatency: '',
  wakeTime: '',
  sleepDurationHours: 0,
  sleepDurationMinutes: 0,
  cantFallAsleep30min: '',
  wakeUpEarly: '',
  getUpToilet: '',
  breathingDiscomfort: '',
  coughSnore: '',
  feelCold: '',
  feelHot: '',
  nightmares: '',
  pain: '',
  otherSleepIssues: '',
  sleepQualityRating: '',
  sleepMedication: '',
  stayAwakeDifficulty: '',
  taskCompletionDifficulty: '',
  sleepPartner: '',
  snoring: '',
  breathingPause: '',
  legTwitch: '',
  disorientation: '',
  otherRestlessSleep: '',
};

const SleepSurvey = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SleepSurveyData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [surveyId, setSurveyId] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  // 检测是否为预览模式
  const isPreviewMode = location.pathname.includes('/preview/');

  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => { setToast(null); toastTimerRef.current = null; }, 2500);
  }, []);

  useEffect(() => {
    const loadLatest = async () => {
      // 预览模式：直接加载本地存储数据，不调用 API
      if (isPreviewMode) {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          setFormData({ ...initialFormData, ...parsed.formData });
          if (parsed.surveyId) setSurveyId(parsed.surveyId);
        }
        setLoading(false);
        return;
      }

      // 正常模式：尝试加载已有数据
      try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          setFormData({ ...initialFormData, ...parsed.formData });
          if (parsed.surveyId) setSurveyId(parsed.surveyId);
          setLoading(false);
          return;
        }

        const survey = await getLatestSleepSurvey();
        if (survey?.formData) {
          setFormData({ ...initialFormData, ...survey.formData });
          setSurveyId(survey.id);
        } else if (user) {
          setFormData(prev => ({ ...prev, name: user.username || '', phone: user.phone || '' }));
        }
      } catch (error) {
        console.error('加载问卷失败:', error);
        if (user) setFormData(prev => ({ ...prev, name: user.username || '', phone: user.phone || '' }));
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
  }, [user, isPreviewMode]);

  useEffect(() => {
    const dataToSave = {
      formData,
      surveyId,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData, surveyId]);

  const showSaveIndicator = useCallback(() => {
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1500);
  }, []);
  
  console.log('saveIndicator', saveIndicator); // 暂时添加以消除未使用警告

  const updateField = (field: keyof SleepSurveyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSaveStep = async () => {
    // 预览模式：只保存到本地存储，不调用 API
    if (isPreviewMode) {
      showSaveIndicator();
      return;
    }

    setSaving(true);
    try {
      if (surveyId) await updateSleepSurvey(surveyId, formData);
      else { const result = await saveSleepDraft(formData); setSurveyId(result.data.id); }
      showSaveIndicator();
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败，请重试');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleNextStep = async () => {
    try {
      await handleSaveStep();
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(prev => prev + 1);
        scrollToTop();
      }
    } catch {}
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      scrollToTop();
    }
  };

  const handleFinalSubmit = async () => {
    // 预览模式：显示提示
    if (isPreviewMode) {
      showToast('预览模式：数据已保存到本地存储', 'success');
      return;
    }

    setSaving(true);
    try {
      if (surveyId) await updateSleepSurvey(surveyId, formData);
      else await submitSleepSurvey(formData);
      navigate('/survey-success?type=sleep');
    } catch (error) {
      console.error('提交失败:', error);
      showToast('提交失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* 顶部导航 & 进度条 */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shrink-0">
        <div className="grid grid-cols-3 items-center w-full px-4 py-3">
          <div className="flex justify-start">
            {currentStep > 0 ? (
              <button
                onClick={handlePrevStep}
                className="text-primary hover:opacity-70 transition-opacity"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            ) : (
              <button
                onClick={() => navigate(-1)}
                className="text-primary hover:opacity-70 transition-opacity"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
          </div>
          <div className="flex justify-center">
            <h1 className="font-headline font-bold tracking-tight text-lg text-primary">船夫健康</h1>
          </div>
          <div className="flex justify-end items-center gap-2">
            <span
              id="save-indicator"
              className={`text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full transition-opacity duration-300 ${saveIndicator ? 'opacity-100' : 'opacity-0'}`}
            >
              已保存
            </span>
            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full px-4 pb-2">
          <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* 主体内容区域 */}
      <main className="relative pb-28">
        <div className="transition-all duration-300 opacity-100">
          
          {/* ================= 步骤 1: 基础睡眠模式 ================= */}
          {currentStep === 0 && (
            <div className="px-4 pb-4">
              <div className="max-w-md mx-auto pt-2">
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                  Step 1 of {TOTAL_STEPS}
                </span>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">基础睡眠模式</h2>
                <p className="text-on-surface-variant text-sm mb-8">请填写您过去一个月的睡眠情况</p>

                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                  {/* Q1: 上床时间 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">
                      1. 过去一个月通常上床睡觉的时间是？
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={formData.bedtime || ''}
                        onChange={e => updateField('bedtime', e.target.value)}
                        className="w-full bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                        <span className="material-symbols-outlined text-xl">schedule</span>
                      </div>
                    </div>
                  </div>

                  {/* Q2: 入睡时间 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">
                      2. 过去一个月每晚通常需要多长时间才能入睡？
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['<15min', '16-30min', '31-60min', '>60min'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => updateField('sleepLatency', opt)}
                          className={`p-4 rounded-2xl font-bold text-sm transition-all ${
                            formData.sleepLatency === opt
                              ? 'bg-secondary text-white shadow-md'
                              : 'bg-surface text-on-surface-variant border border-outline-variant/20'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3: 起床时间 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">
                      3. 过去一个月每天早上通常什么时候起床？
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={formData.wakeTime || ''}
                        onChange={e => updateField('wakeTime', e.target.value)}
                        className="w-full bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                        <span className="material-symbols-outlined text-xl">wb_sunny</span>
                      </div>
                    </div>
                  </div>

                  {/* Q4: 实际睡眠时间 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">
                      4. 过去一个月每晚实际睡眠时间有多少？
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={formData.sleepDurationHours || ''}
                            onChange={e => updateField('sleepDurationHours', parseInt(e.target.value) || 0)}
                            className="w-full bg-surface border-none rounded-2xl p-4 text-on-surface text-sm shadow-input focus:ring-2 focus:ring-secondary/60 transition-all"
                            placeholder="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium text-xs">小时</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={formData.sleepDurationMinutes || ''}
                            onChange={e => updateField('sleepDurationMinutes', parseInt(e.target.value) || 0)}
                            className="w-full bg-surface border-none rounded-2xl p-4 text-on-surface text-sm shadow-input focus:ring-2 focus:ring-secondary/60 transition-all"
                            placeholder="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium text-xs">分钟</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 步骤底部按钮 */}
                <div className="flex gap-3 mt-6 pb-10">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 py-4 rounded-2xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
                  >
                    返回
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '下一步'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 步骤 2: 入睡与夜间干扰（第1部分） ================= */}
          {currentStep === 1 && (
            <div className="px-4 pb-4">
              <div className="max-w-md mx-auto pt-2">
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                  Step 2 of {TOTAL_STEPS}
                </span>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">入睡与夜间干扰</h2>
                <p className="text-on-surface-variant text-sm mb-8">请填写过去一个月的睡眠干扰情况</p>

                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">
                      5. 过去一个月是否因为以下问题而经常睡眠不好？
                    </label>
                  </div>

                  {/* Q5A */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">A</span>
                      <p className="text-sm font-semibold text-primary">不能在30min内入睡</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周平均不足1个晚上', '每周平均1-2个晚上', '每周平均3个或更多晚上'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="cantFallAsleep30min"
                            checked={formData.cantFallAsleep30min === opt}
                            onChange={() => updateField('cantFallAsleep30min', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q5B */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">B</span>
                      <p className="text-sm font-semibold text-primary">在晚上睡眠中醒来或早醒</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周平均不足1个晚上', '每周平均1-2个晚上', '每周平均3个或更多晚上'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="wakeUpEarly"
                            checked={formData.wakeUpEarly === opt}
                            onChange={() => updateField('wakeUpEarly', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q5C */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">C</span>
                      <p className="text-sm font-semibold text-primary">晚上有无起床上洗手间</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周平均不足1个晚上', '每周平均1-2个晚上', '每周平均3个或更多晚上'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="getUpToilet"
                            checked={formData.getUpToilet === opt}
                            onChange={() => updateField('getUpToilet', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 步骤底部按钮 */}
                <div className="flex gap-3 mt-6 pb-10">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-4 rounded-2xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '下一步'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 步骤 3: 入睡与夜间干扰（第2部分） ================= */}
          {currentStep === 2 && (
            <div className="px-4 pb-4">
              <div className="max-w-md mx-auto pt-2">
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                  Step 3 of {TOTAL_STEPS}
                </span>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">入睡与夜间干扰</h2>
                <p className="text-on-surface-variant text-sm mb-8">继续填写睡眠干扰情况</p>

                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                  {/* Q5D */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">D</span>
                      <p className="text-sm font-semibold text-primary">不舒服的呼吸</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周不足1晚', '每周1-2晚', '每周3晚或更多'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="breathingDiscomfort"
                            checked={formData.breathingDiscomfort === opt}
                            onChange={() => updateField('breathingDiscomfort', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q5E */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">E</span>
                      <p className="text-sm font-semibold text-primary">大声咳嗽或打鼾</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周不足1晚', '每周1-2晚', '每周3晚或更多'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="coughSnore"
                            checked={formData.coughSnore === opt}
                            onChange={() => updateField('coughSnore', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q5F */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">F</span>
                      <p className="text-sm font-semibold text-primary">感到寒冷</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周不足1晚', '每周1-2晚', '每周3晚或更多'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="feelCold"
                            checked={formData.feelCold === opt}
                            onChange={() => updateField('feelCold', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q5G */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">G</span>
                      <p className="text-sm font-semibold text-primary">感到太热</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周不足1晚', '每周1-2晚', '每周3晚或更多'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="feelHot"
                            checked={formData.feelHot === opt}
                            onChange={() => updateField('feelHot', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 步骤底部按钮 */}
                <div className="flex gap-3 mt-6 pb-10">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-4 rounded-2xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '下一步'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 步骤 4: 梦境与整体评估 ================= */}
          {currentStep === 3 && (
            <div className="px-4 pb-4">
              <div className="max-w-md mx-auto pt-2">
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                  Step 4 of {TOTAL_STEPS}
                </span>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">梦境与整体评估</h2>
                <p className="text-on-surface-variant text-sm mb-8">请填写梦境体验和整体睡眠质量评价</p>

                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                  {/* Q5H: 做噩梦 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">H</span>
                      <p className="text-sm font-semibold text-primary">做噩梦</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周不足1晚', '每周1-2晚', '每周3晚或更多'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="nightmares"
                            checked={formData.nightmares === opt}
                            onChange={() => updateField('nightmares', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q5I: 出现疼痛 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">I</span>
                      <p className="text-sm font-semibold text-primary">出现疼痛</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周不足1晚', '每周1-2晚', '每周3晚或更多'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="pain"
                            checked={formData.pain === opt}
                            onChange={() => updateField('pain', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q5J: 其他影响睡眠的事情 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">J</span>
                      <p className="text-sm font-semibold text-primary">其他影响睡眠的事情</p>
                    </div>
                    <textarea
                      value={formData.otherSleepIssues || ''}
                      onChange={e => updateField('otherSleepIssues', e.target.value)}
                      className="w-full min-h-[100px] bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input transition-all placeholder:text-outline/40"
                      placeholder="请输入具体情况..."
                    />
                  </div>

                  {/* Q6: 睡眠质量评分 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">6</span>
                      <p className="text-sm font-semibold text-primary">对过去一个月睡眠质量评分</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '非常好', icon: 'sentiment_very_satisfied' },
                        { value: '尚好', icon: 'sentiment_satisfied' },
                        { value: '不好', icon: 'sentiment_dissatisfied' },
                        { value: '非常差', icon: 'sentiment_very_dissatisfied' },
                      ].map(item => (
                        <button
                          key={item.value}
                          onClick={() => updateField('sleepQualityRating', item.value)}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${
                            formData.sleepQualityRating === item.value
                              ? 'bg-secondary text-white border-secondary shadow-md'
                              : 'bg-surface border-outline-variant/20'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-3xl mb-2 ${formData.sleepQualityRating === item.value ? 'text-white' : 'text-secondary'}`}>
                            {item.icon}
                          </span>
                          <span className={`font-bold text-sm ${formData.sleepQualityRating === item.value ? 'text-white' : 'text-primary'}`}>{item.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 步骤底部按钮 */}
                <div className="flex gap-3 mt-6 pb-10">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-4 rounded-2xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '下一步'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 步骤 5: 药物与日间影响 ================= */}
          {currentStep === 4 && (
            <div className="px-4 pb-4">
              <div className="max-w-md mx-auto pt-2">
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                  Step 5 of {TOTAL_STEPS}
                </span>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">药物与日间影响</h2>
                <p className="text-on-surface-variant text-sm mb-8">请填写药物使用情况和日间影响</p>

                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                  {/* Q7 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">7</span>
                      <p className="text-sm font-semibold text-primary">近1个月使用催眠药物的情况</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周不足1晚', '每周1-2晚', '每周3晚或更多'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="sleepMedication"
                            checked={formData.sleepMedication === opt}
                            onChange={() => updateField('sleepMedication', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q8 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">8</span>
                      <p className="text-sm font-semibold text-primary">过去1个月在开车、吃饭或参加社会活动时难以保持清醒状态？</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周不足1晚', '每周1-2晚', '每周3晚或更多'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="stayAwakeDifficulty"
                            checked={formData.stayAwakeDifficulty === opt}
                            onChange={() => updateField('stayAwakeDifficulty', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q9 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">9</span>
                      <p className="text-sm font-semibold text-primary">过去1个月在积极完成事情上有无困难？</p>
                    </div>
                    <div className="space-y-2">
                      {['没有困难', '有一点困难', '比较困难', '非常困难'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="taskCompletionDifficulty"
                            checked={formData.taskCompletionDifficulty === opt}
                            onChange={() => updateField('taskCompletionDifficulty', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q10 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">10</span>
                      <p className="text-sm font-semibold text-primary">是否与人同睡一床</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        '没有与人同睡',
                        '同伴或室友在另外房间',
                        '同伴在同一房间但不睡同床',
                        '同伴在同一床上'
                      ].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="sleepPartner"
                            checked={formData.sleepPartner === opt}
                            onChange={() => updateField('sleepPartner', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 步骤底部按钮 */}
                <div className="flex gap-3 mt-6 pb-10">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-4 rounded-2xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '下一步'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 步骤 6: 睡眠质量观察 ================= */}
          {currentStep === 5 && (
            <div className="px-4 pb-4">
              <div className="max-w-md mx-auto pt-2">
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                  Step 6 of {TOTAL_STEPS}
                </span>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">睡眠质量观察</h2>
                <p className="text-on-surface-variant text-sm mb-8">最后一步，请填写睡眠时的观察情况</p>

                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                  {/* Q11 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">11</span>
                      <p className="text-sm font-semibold text-primary">在你睡觉时，有无打鼾声</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周平均不足1个晚上', '每周平均1-2个晚上', '每周平均3个或更多晚上'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="snoring"
                            checked={formData.snoring === opt}
                            onChange={() => updateField('snoring', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q12 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">12</span>
                      <p className="text-sm font-semibold text-primary">在你睡觉时，呼吸之间有没有长时间停顿</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周平均不足1个晚上', '每周平均1-2个晚上', '每周平均3个或更多晚上'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="breathingPause"
                            checked={formData.breathingPause === opt}
                            onChange={() => updateField('breathingPause', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q13 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">13</span>
                      <p className="text-sm font-semibold text-primary">在你睡觉时，你的腿有无抽动或者有痉挛</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周平均不足1个晚上', '每周平均1-2个晚上', '每周平均3个或更多晚上'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="legTwitch"
                            checked={formData.legTwitch === opt}
                            onChange={() => updateField('legTwitch', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q14 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">14</span>
                      <p className="text-sm font-semibold text-primary">在你睡觉时是否出现不能辨认方向或混乱状态</p>
                    </div>
                    <div className="space-y-2">
                      {['过去1个月没有', '每周平均不足1个晚上', '每周平均1-2个晚上', '每周平均3个或更多晚上'].map(opt => (
                        <label key={opt} className="flex items-center p-4 rounded-2xl bg-surface border-none cursor-pointer hover:bg-surface-container-low transition-all">
                          <input
                            type="radio"
                            name="disorientation"
                            checked={formData.disorientation === opt}
                            onChange={() => updateField('disorientation', opt)}
                            className="w-4 h-4 border-2 border-outline text-secondary focus:ring-secondary"
                          />
                          <span className="ml-3 text-on-surface text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q15 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-none w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">15</span>
                      <p className="text-sm font-semibold text-primary">在你睡觉时你有无其他睡不安宁的情况</p>
                    </div>
                    <textarea
                      value={formData.otherRestlessSleep || ''}
                      onChange={e => updateField('otherRestlessSleep', e.target.value)}
                      className="w-full min-h-[100px] bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input transition-all placeholder:text-outline/40"
                      placeholder="例如：做恶梦、磨牙、梦游等..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Editorial Element */}
                <div className="mt-8 mb-4 text-center px-4">
                  <div className="h-1 w-16 bg-secondary/20 mx-auto rounded-full mb-6"></div>
                  <p className="text-sm text-on-surface-variant leading-relaxed italic">
                    "优质的睡眠不仅是休息，更是生命的重塑。感谢您完成此次调研，这将成为我们为您规划健康蓝图的关键基石。"
                  </p>
                </div>

                {/* 步骤底部按钮 */}
                <div className="flex gap-3 mt-6 pb-10">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-4 rounded-2xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {saving ? '提交中...' : '提交问卷'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-toast-in">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium ${
            toast.type === 'error' ? 'bg-error/90 text-white' : 'bg-secondary/90 text-white'
          }`}>
            <span className="material-symbols-outlined text-lg">
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-toast-in { animation: toast-in 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default SleepSurvey;
