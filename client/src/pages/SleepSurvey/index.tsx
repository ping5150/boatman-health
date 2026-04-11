import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  submitSleepSurvey,
  getLatestSleepSurvey,
  saveDraft,
  updateSleepSurvey,
  SleepSurveyData,
} from '@/api/sleep-survey.api';
import { useUser } from '@/contexts/UserContext';

const TOTAL_STEPS = 6;

// 频率选项
const FREQ_OPTIONS = [
  '过去1个月没有',
  '每周不足1晚',
  '每周1-2晚',
  '每周3晚或更多',
];

// 入睡时长选项
const LATENCY_OPTIONS = ['<15min', '16-30min', '31-60min', '>60min'];

// 睡眠质量评分选项
const QUALITY_OPTIONS = ['非常好', '尚好', '不好', '非常差'];

// 睡眠伴侣选项
const PARTNER_OPTIONS = [
  '没有与人同睡',
  '同伴或室友在另外房间',
  '同伴在同一房间但不睡同床',
  '同伴在同一床上',
];

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
  const { user } = useUser();

  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2500);
  }, []);

  // 加载已有问卷
  useEffect(() => {
    const loadLatest = async () => {
      try {
        const survey = await getLatestSleepSurvey();
        if (survey?.formData) {
          setFormData({ ...initialFormData, ...survey.formData });
          setSurveyId(survey.id);
        } else if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.username || '',
            phone: user.phone || '',
          }));
        }
      } catch (error) {
        console.error('加载问卷失败:', error);
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.username || '',
            phone: user.phone || '',
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
  }, [user]);

  const showSaveIndicator = useCallback(() => {
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1500);
  }, []);

  const updateField = (field: keyof SleepSurveyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = '请输入姓名';
    if (!formData.phone?.trim()) errors.phone = '请输入联系电话';
    else if (!/^1[3-9]\d{9}$/.test(formData.phone)) errors.phone = '请输入正确的手机号码';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast(Object.values(errors)[0]);
      return false;
    }
    return true;
  };

  const handleSaveStep = async () => {
    setSaving(true);
    try {
      if (surveyId) {
        await updateSleepSurvey(surveyId, formData);
      } else {
        const result = await saveDraft(formData);
        setSurveyId(result.data.id);
      }
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
    if (currentStep === 0 && !validateStep1()) return;
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

  const goToStep = async (index: number) => {
    if (index === currentStep) return;
    try {
      if (index > currentStep) await handleSaveStep();
      setCurrentStep(index);
      scrollToTop();
    } catch {}
  };

  const handleFinalSubmit = async () => {
    setSaving(true);
    try {
      if (surveyId) {
        await updateSleepSurvey(surveyId, formData);
      } else {
        await submitSleepSurvey(formData);
      }
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
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* 顶部导航 */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl">
        <div className="grid grid-cols-3 items-center w-full px-4 py-3">
          <div className="flex justify-start">
            <button onClick={() => navigate(-1)} className="text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
          <div className="flex justify-center">
            <h1 className="font-headline font-bold text-lg text-primary">睡眠调研问卷</h1>
          </div>
          <div className="flex justify-end items-center gap-2">
            <span className={`text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full transition-opacity ${saveIndicator ? 'opacity-100' : 'opacity-0'}`}>
              已保存
            </span>
          </div>
        </div>
        <div className="w-full px-4 pb-2">
          <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="pt-20 pb-28 px-4">
        <div className="max-w-md mx-auto">
          {/* 步骤 1: 基本信息 */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 1 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">基本信息</h2>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-primary/60 uppercase">姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    className={`w-full bg-surface border rounded-xl p-3 mt-1 text-sm ${fieldErrors.name ? 'border-error' : 'border-transparent'}`}
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/60 uppercase">联系电话 *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    className={`w-full bg-surface border rounded-xl p-3 mt-1 text-sm ${fieldErrors.phone ? 'border-error' : 'border-transparent'}`}
                    placeholder="请输入手机号"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 步骤 2: 基础睡眠模式 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 2 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">基础睡眠模式</h2>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-primary/60 uppercase">上床时间</label>
                    <input
                      type="time"
                      value={formData.bedtime || ''}
                      onChange={e => updateField('bedtime', e.target.value)}
                      className="w-full bg-surface border border-transparent rounded-xl p-3 mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-primary/60 uppercase">起床时间</label>
                    <input
                      type="time"
                      value={formData.wakeTime || ''}
                      onChange={e => updateField('wakeTime', e.target.value)}
                      className="w-full bg-surface border border-transparent rounded-xl p-3 mt-1 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/60 uppercase block mb-2">入睡所需时长</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LATENCY_OPTIONS.map(opt => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer text-sm ${formData.sleepLatency === opt ? 'bg-secondary/10 border border-secondary/30' : 'bg-surface'}`}
                      >
                        <input type="radio" name="sleepLatency" checked={formData.sleepLatency === opt} onChange={() => updateField('sleepLatency', opt)} className="text-secondary" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/60 uppercase block mb-2">实际睡眠时长</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.sleepDurationHours || ''}
                      onChange={e => updateField('sleepDurationHours', parseInt(e.target.value) || 0)}
                      className="w-20 bg-surface border border-transparent rounded-xl p-3 text-sm text-center"
                      placeholder="小时"
                      min={0}
                      max={24}
                    />
                    <span className="text-sm">小时</span>
                    <input
                      type="number"
                      value={formData.sleepDurationMinutes || ''}
                      onChange={e => updateField('sleepDurationMinutes', parseInt(e.target.value) || 0)}
                      className="w-20 bg-surface border border-transparent rounded-xl p-3 text-sm text-center"
                      placeholder="分钟"
                      min={0}
                      max={59}
                    />
                    <span className="text-sm">分钟</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤 3: 入睡与夜间干扰 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 3 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">入睡与夜间干扰</h2>
                <p className="text-on-surface-variant text-sm mt-1">过去1个月，您是否因以下原因遇到睡眠困难？</p>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'cantFallAsleep30min', label: 'A. 不能在30分钟内入睡' },
                  { key: 'wakeUpEarly', label: 'B. 晚上睡眠中醒来或早醒' },
                  { key: 'getUpToilet', label: 'C. 晚上起床上洗手间' },
                  { key: 'breathingDiscomfort', label: 'D. 不舒服的呼吸' },
                  { key: 'coughSnore', label: 'E. 大声咳嗽或打鼾' },
                  { key: 'feelCold', label: 'F. 感到寒冷' },
                  { key: 'feelHot', label: 'G. 感到太热' },
                  { key: 'nightmares', label: 'H. 做噩梦' },
                  { key: 'pain', label: 'I. 出现疼痛' },
                ].map(item => (
                  <div key={item.key} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <p className="text-sm font-medium mb-2">{item.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {FREQ_OPTIONS.map(opt => (
                        <label
                          key={opt}
                          className={`px-3 py-1.5 rounded-full text-xs cursor-pointer ${formData[item.key as keyof SleepSurveyData] === opt ? 'bg-secondary text-white' : 'bg-surface border border-outline-variant/30'}`}
                        >
                          <input
                            type="radio"
                            name={item.key}
                            checked={formData[item.key as keyof SleepSurveyData] === opt}
                            onChange={() => updateField(item.key as keyof SleepSurveyData, opt)}
                            className="hidden"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <p className="text-sm font-medium mb-2">J. 其他影响睡眠的事情</p>
                  <textarea
                    value={formData.otherSleepIssues || ''}
                    onChange={e => updateField('otherSleepIssues', e.target.value)}
                    className="w-full bg-surface border border-transparent rounded-xl p-3 text-sm resize-none"
                    placeholder="请描述..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 步骤 4: 睡眠质量评估 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 4 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">睡眠质量评估</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/5">
                  <label className="text-sm font-bold text-primary uppercase block mb-3">您对自己整体的睡眠质量如何评价？</label>
                  <div className="grid grid-cols-2 gap-2">
                    {QUALITY_OPTIONS.map(opt => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer text-sm ${formData.sleepQualityRating === opt ? 'bg-secondary/10 border border-secondary/30' : 'bg-surface'}`}
                      >
                        <input type="radio" name="sleepQualityRating" checked={formData.sleepQualityRating === opt} onChange={() => updateField('sleepQualityRating', opt)} className="text-secondary" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/5">
                  <label className="text-sm font-bold text-primary uppercase block mb-3">过去1个月，您多久服用一次催眠药物？</label>
                  <div className="flex flex-wrap gap-2">
                    {FREQ_OPTIONS.map(opt => (
                      <label
                        key={opt}
                        className={`px-3 py-2 rounded-full text-xs cursor-pointer ${formData.sleepMedication === opt ? 'bg-secondary text-white' : 'bg-surface border border-outline-variant/30'}`}
                      >
                        <input type="radio" name="sleepMedication" checked={formData.sleepMedication === opt} onChange={() => updateField('sleepMedication', opt)} className="hidden" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/5">
                  <label className="text-sm font-bold text-primary uppercase block mb-3">过去1个月，您在白天难以保持清醒状态吗？</label>
                  <div className="flex flex-wrap gap-2">
                    {FREQ_OPTIONS.map(opt => (
                      <label
                        key={opt}
                        className={`px-3 py-2 rounded-full text-xs cursor-pointer ${formData.stayAwakeDifficulty === opt ? 'bg-secondary text-white' : 'bg-surface border border-outline-variant/30'}`}
                      >
                        <input type="radio" name="stayAwakeDifficulty" checked={formData.stayAwakeDifficulty === opt} onChange={() => updateField('stayAwakeDifficulty', opt)} className="hidden" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/5">
                  <label className="text-sm font-bold text-primary uppercase block mb-3">过去1个月，您在积极完成事情（工作、家务、学习）时感到困难吗？</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['没有困难', '有一点困难', '比较困难', '非常困难'].map(opt => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer text-sm ${formData.taskCompletionDifficulty === opt ? 'bg-secondary/10 border border-secondary/30' : 'bg-surface'}`}
                      >
                        <input type="radio" name="taskCompletionDifficulty" checked={formData.taskCompletionDifficulty === opt} onChange={() => updateField('taskCompletionDifficulty', opt)} className="text-secondary" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤 5: 睡眠质量观察 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 5 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">睡眠质量观察</h2>
                <p className="text-on-surface-variant text-sm mt-1">请回答以下关于您睡眠的问题</p>
              </div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/5">
                  <label className="text-sm font-bold text-primary uppercase block mb-3">您是否与人同睡一床/同室？</label>
                  <div className="space-y-2">
                    {PARTNER_OPTIONS.map(opt => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer text-sm ${formData.sleepPartner === opt ? 'bg-secondary/10' : 'bg-surface'}`}
                      >
                        <input type="radio" name="sleepPartner" checked={formData.sleepPartner === opt} onChange={() => updateField('sleepPartner', opt)} className="text-secondary" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                {[
                  { key: 'snoring', label: '您是否有打鼾声？' },
                  { key: 'breathingPause', label: '您是否有呼吸停顿？' },
                  { key: 'legTwitch', label: '您是否有腿部抽动或痉挛？' },
                  { key: 'disorientation', label: '您是否有不能辨认方向或混乱？' },
                ].map(item => (
                  <div key={item.key} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <p className="text-sm font-medium mb-2">{item.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {FREQ_OPTIONS.map(opt => (
                        <label
                          key={opt}
                          className={`px-3 py-1.5 rounded-full text-xs cursor-pointer ${formData[item.key as keyof SleepSurveyData] === opt ? 'bg-secondary text-white' : 'bg-surface border border-outline-variant/30'}`}
                        >
                          <input type="radio" name={item.key} checked={formData[item.key as keyof SleepSurveyData] === opt} onChange={() => updateField(item.key as keyof SleepSurveyData, opt)} className="hidden" />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <p className="text-sm font-medium mb-2">其他睡不安宁的情况</p>
                  <textarea
                    value={formData.otherRestlessSleep || ''}
                    onChange={e => updateField('otherRestlessSleep', e.target.value)}
                    className="w-full bg-surface border border-transparent rounded-xl p-3 text-sm resize-none"
                    placeholder="请描述..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 步骤 6: 确认提交 */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 6 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">确认提交</h2>
              </div>
              <div className="bg-primary p-5 rounded-3xl text-white">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary-container text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>security</span>
                  <div>
                    <h3 className="font-headline font-bold text-sm mb-1">隐私保护承诺</h3>
                    <p className="text-white/70 text-xs leading-relaxed">您的信息均受管家级加密保护。我们将严格遵守隐私保护协议。</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤按钮 */}
          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <button onClick={handlePrevStep} className="flex-1 py-4 rounded-2xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm">
                上一步
              </button>
            )}
            {currentStep < TOTAL_STEPS - 1 ? (
              <button onClick={handleNextStep} disabled={saving} className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm disabled:opacity-50">
                {saving ? '保存中...' : '下一步'}
              </button>
            ) : (
              <button onClick={handleFinalSubmit} disabled={saving} className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? '提交中...' : '完成提交'}
                {!saving && <span className="material-symbols-outlined text-lg">check_circle</span>}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* 底部步骤指示器 */}
      <footer className="fixed bottom-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/10">
        <div className="px-4 py-3 flex items-center justify-center">
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`transition-all duration-300 cursor-pointer ${i === currentStep ? 'w-4 h-2 rounded-full bg-primary' : 'w-2 h-2 rounded-full bg-outline-variant/40'}`}
              />
            ))}
          </div>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-toast-in">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-error/90 text-white' : 'bg-secondary/90 text-white'}`}>
            <span className="material-symbols-outlined text-lg">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translate(-50%, -12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-toast-in { animation: toast-in 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default SleepSurvey;
