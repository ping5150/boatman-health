import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  submitNutritionSurvey,
  getLatestNutritionSurvey,
  saveNutritionDraft,
  updateNutritionSurvey,
  NutritionSurveyData,
} from '@/api/nutrition-survey.api';
import { useUser } from '@/contexts/UserContext';

const TOTAL_STEPS = 10;
const LOCAL_STORAGE_KEY = 'nutrition_survey_draft';

// 频率选项
const FREQ_OPTIONS = ['每天', '每周3-6次', '每周1-2次', '每月1-3次', '几乎不', '从不'];

// 是/否选项
const YES_NO = ['是', '否'];

const initialFormData: NutritionSurveyData = {
  name: '',
  phone: '',
  consultationReason: '',
  nutritionistSupportGoals: '',
  height: 0,
  weight: 0,
  weightChange: '',
  chronicDiseases: '',
  medicationsSupplements: '',
  dailyMeals: '',
  breakfastHabit: '',
  commonSnacks: [],
  foodSources: [],
  foodAllergies: '',
  dislikedFoods: '',
  dietPlanType: '',
  typicalDietWorkday: '',
  typicalDietWeekend: '',
  typicalDietDescription: '',
  drinkWater: '',
  drinkCoffee: '',
  drinkTea: '',
  drinkMilk: '',
  drinkPlantMilk: '',
  drinkMilkTea: '',
  drinkSugarFree: '',
  drinkSugary: '',
  drinkEnergy: '',
  drinkOther: '',
  highSaltSweat: '',
  dietSatisfaction: '',
  exerciseLevel: '',
  exerciseTypes: [],
  exerciseDuration: '',
  exerciseFrequency: '',
  exerciseTime: '',
  exerciseMotivation: '',
  exerciseChallenges: '',
  exerciseGoals: '',
  hasExercisePartner: '',
  exercisePartnerDetail: '',
  stressLevel: '',
  isSmoker: '',
  smokingDetail: '',
  isDrinker: '',
  drinkingDetail: '',
  weekdayWakeTime: '',
  weekdaySleepTime: '',
  morningState: '',
  screenTimeTv: '',
  screenTimeReading: '',
  screenTimeElectronics: '',
  socialActivities: [],
  socialActivitiesOther: '',
  otherFeedback: '',
  freqRice: '',
  freqNoodlesBread: '',
  freqWholeGrains: '',
  freqFreshFruit: '',
  freqFruitJuice: '',
  freqDriedFruit: '',
  freqLeafyVegetables: '',
  freqStarchyVegetables: '',
  freqOtherVegetables: '',
  freqEggs: '',
  freqPoultry: '',
  freqFishSeafood: '',
  freqBeansSoy: '',
  freqRedMeat: '',
  freqMilkDairy: '',
  freqYogurt: '',
  freqCheese: '',
  freqNonDairyAlternatives: '',
  freqNutsSeeds: '',
  freqCookiesCake: '',
  freqChocolateCandy: '',
  freqSaltySnacks: '',
};

const NutritionSurvey = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<NutritionSurveyData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [surveyId, setSurveyId] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const mainRef = useRef<HTMLDivElement>(null);

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
        // 先尝试从localStorage加载
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          setFormData({ ...initialFormData, ...parsed.formData });
          if (parsed.surveyId) setSurveyId(parsed.surveyId);
          setLoading(false);
          return;
        }

        // 如果localStorage没有，从服务器加载
        const survey = await getLatestNutritionSurvey();
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
  }, [user]);

  // localStorage实时自动保存
  useEffect(() => {
    const dataToSave = {
      formData,
      surveyId,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData, surveyId]);

  const showSaveIndicator = useCallback(() => { setSaveIndicator(true); setTimeout(() => setSaveIndicator(false), 1500); }, []);

  const updateField = (field: keyof NutritionSurveyData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleArray = (field: keyof NutritionSurveyData, value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    updateField(field, updated);
  };

  // 手势滑动处理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = async () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) < threshold || isTransitioning) return;

    if (diff > 0 && currentStep < TOTAL_STEPS - 1) {
      setIsTransitioning(true);
      await handleNextStep();
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (diff < 0 && currentStep > 0) {
      setIsTransitioning(true);
      handlePrevStep();
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = '请输入姓名';
    if (!formData.phone?.trim()) errors.phone = '请输入联系电话';
    else if (!/^1[3-9]\d{9}$/.test(formData.phone)) errors.phone = '请输入正确的手机号码';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) { showToast(Object.values(errors)[0]); return false; }
    return true;
  };

  const handleSaveStep = async () => {
    // 预览模式：只保存到本地存储，不调用 API
    if (isPreviewMode) {
      showSaveIndicator();
      return;
    }

    setSaving(true);
    try {
      if (surveyId) await updateNutritionSurvey(surveyId, formData);
      else { const result = await saveNutritionDraft(formData); setSurveyId(result.data.id); }
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
      if (currentStep < TOTAL_STEPS - 1) { setCurrentStep(prev => prev + 1); scrollToTop(); }
    } catch {}
  };

  const handlePrevStep = () => { if (currentStep > 0) { setCurrentStep(prev => prev - 1); scrollToTop(); } };

  const goToStep = async (index: number) => {
    if (index === currentStep) return;
    try { if (index > currentStep) await handleSaveStep(); setCurrentStep(index); scrollToTop(); } catch {}
  };

  const handleFinalSubmit = async () => {
    // 预览模式：显示提示
    if (isPreviewMode) {
      showToast('预览模式：数据已保存到本地存储', 'success');
      return;
    }

    setSaving(true);
    try {
      if (surveyId) await updateNutritionSurvey(surveyId, formData);
      else await submitNutritionSurvey(formData);
      navigate('/survey-success?type=nutrition');
    } catch (error) {
      console.error('提交失败:', error);
      showToast('提交失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // 渲染单选按钮组
  const renderRadioGroup = (field: keyof NutritionSurveyData, options: string[], cols = 2) => (
    <div className={`grid grid-cols-${cols} gap-2`}>
      {options.map(opt => (
        <label key={opt} className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer text-sm ${formData[field] === opt ? 'bg-secondary/10 border border-secondary/30' : 'bg-surface'}`}>
          <input type="radio" name={field} checked={formData[field] === opt} onChange={() => updateField(field, opt)} className="text-secondary" />
          {opt}
        </label>
      ))}
    </div>
  );

  // 渲染多选按钮组
  const renderCheckboxGroup = (field: keyof NutritionSurveyData, options: string[]) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <label key={opt} className={`px-3 py-2 rounded-full text-xs cursor-pointer ${((formData[field] as string[]) || []).includes(opt) ? 'bg-secondary text-white' : 'bg-surface border border-outline-variant/30'}`}>
          <input type="checkbox" checked={((formData[field] as string[]) || []).includes(opt)} onChange={() => toggleArray(field, opt)} className="hidden" />
          {opt}
        </label>
      ))}
    </div>
  );

  // 渲染频率选择器
  const renderFreqSelector = (field: keyof NutritionSurveyData, label: string) => (
    <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {FREQ_OPTIONS.map(opt => (
          <label key={opt} className={`px-3 py-1.5 rounded-full text-xs cursor-pointer ${formData[field] === opt ? 'bg-secondary text-white' : 'bg-surface border border-outline-variant/30'}`}>
            <input type="radio" name={field} checked={formData[field] === opt} onChange={() => updateField(field, opt)} className="hidden" />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* 顶部导航 & 进度条 */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shrink-0">
        <div className="grid grid-cols-3 items-center w-full px-4 py-3">
          <div className="flex justify-start">
            {currentStep > 0 ? (
              <button onClick={handlePrevStep} className="text-primary hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            ) : (
              <button onClick={() => navigate(-1)} className="text-primary hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
          </div>
          <div className="flex justify-center">
            <h1 className="font-headline font-bold tracking-tight text-lg text-primary">船夫健康</h1>
          </div>
          <div className="flex justify-end items-center gap-2">
            <span id="save-indicator" className={`text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full transition-opacity duration-300 ${saveIndicator ? 'opacity-100' : 'opacity-0'}`}>
              已保存
            </span>
            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full px-4 pb-2">
          <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {/* 主体内容区域 */}
      <main 
        ref={mainRef}
        className="relative pb-28"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* ================= 步骤 1: 基本信息 ================= */}
          {currentStep === 0 && (
            <div className="px-4 pb-4">
              <div className="max-w-md mx-auto pt-2">
                <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                  Step 1 of {TOTAL_STEPS}
                </span>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">基本信息</h2>
                <p className="text-on-surface-variant text-sm mb-8">开启您的私人管家级营养健康管理。</p>

                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">
                      姓名 <span className="text-error">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => updateField('name', e.target.value)} 
                      className={`w-full bg-surface border rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input transition-colors ${fieldErrors.name ? 'border-error/60 ring-1 ring-error/30' : 'border-transparent'}`}
                      placeholder="请输入姓名" 
                    />
                    {fieldErrors.name && <p className="text-error text-[10px] px-1 font-medium">{fieldErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">
                      联系电话 <span className="text-error">*</span>
                    </label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => updateField('phone', e.target.value)} 
                      className={`w-full bg-surface border rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input transition-colors ${fieldErrors.phone ? 'border-error/60 ring-1 ring-error/30' : 'border-transparent'}`}
                      placeholder="请输入手机号" 
                    />
                    {fieldErrors.phone && <p className="text-error text-[10px] px-1 font-medium">{fieldErrors.phone}</p>}
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

          {/* 步骤 2: 健康信息 */}
          {currentStep === 1 && (
            <>
              <div><span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 2 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">健康信息</h2></div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">咨询主要原因或关注点</label>
                  <textarea value={formData.consultationReason || ''} onChange={e => updateField('consultationReason', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={3} placeholder="请描述..." />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">希望营养师支持的领域</label>
                  <textarea value={formData.nutritionistSupportGoals || ''} onChange={e => updateField('nutritionistSupportGoals', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={2} placeholder="请描述..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <label className="text-xs font-bold text-primary/60 uppercase">身高 (cm)</label>
                    <input type="number" value={formData.height || ''} onChange={e => updateField('height', parseFloat(e.target.value) || 0)} className="w-full bg-surface-container-highest rounded-xl p-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" />
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <label className="text-xs font-bold text-primary/60 uppercase">体重 (kg)</label>
                    <input type="number" value={formData.weight || ''} onChange={e => updateField('weight', parseFloat(e.target.value) || 0)} className="w-full bg-surface-container-highest rounded-xl p-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" />
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">过去6个月内体重是否有明显变化？</label>
                  {renderRadioGroup('weightChange', YES_NO)}
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">慢性疾病或健康问题</label>
                  <textarea value={formData.chronicDiseases || ''} onChange={e => updateField('chronicDiseases', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={2} placeholder="请描述..." />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">目前服用的药物或补充剂</label>
                  <textarea value={formData.medicationsSupplements || ''} onChange={e => updateField('medicationsSupplements', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={2} placeholder="请描述..." />
                </div>
              </div>
            </>
          )}

          {/* 步骤 3: 饮食习惯（1/4） */}
          {currentStep === 2 && (
            <>
              <div><span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 3 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">饮食习惯</h2></div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您每天吃几顿主餐？</label>
                  {renderRadioGroup('dailyMeals', ['1餐', '2餐', '3餐', '其他'])}
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您是否有固定吃早餐的习惯？</label>
                  {renderRadioGroup('breakfastHabit', YES_NO)}
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您平时常吃的零食有哪些？</label>
                  {renderCheckboxGroup('commonSnacks', ['水果', '坚果', '薯片', '巧克力', '饼干', '其他'])}
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您的主要食物来源？</label>
                  {renderCheckboxGroup('foodSources', ['食堂', '餐馆', '外卖', '超市现成食品', '家人做饭', '自己做饭', '其他'])}
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">食物过敏或不耐受</label>
                  <textarea value={formData.foodAllergies || ''} onChange={e => updateField('foodAllergies', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={2} placeholder="请描述..." />
                </div>
              </div>
            </>
          )}

          {/* 步骤 4: 典型饮食模式 */}
          {currentStep === 3 && (
            <>
              <div><span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 4 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">典型饮食模式</h2>
                <p className="text-on-surface-variant text-sm mt-1">请描述您的典型饮食习惯</p></div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您的饮食类型？</label>
                  {renderRadioGroup('dietPlanType', ['普通饮食', '素食', '低碳水饮食', '生酮饮食', '其他'])}
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">工作日典型饮食安排</label>
                  <textarea value={formData.typicalDietWorkday || ''} onChange={e => updateField('typicalDietWorkday', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={4} placeholder="请描述您工作日一天的典型饮食安排..." />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">周末典型饮食安排</label>
                  <textarea value={formData.typicalDietWeekend || ''} onChange={e => updateField('typicalDietWeekend', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={4} placeholder="请描述您周末一天的典型饮食安排..." />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">其他饮食说明</label>
                  <textarea value={formData.typicalDietDescription || ''} onChange={e => updateField('typicalDietDescription', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={3} placeholder="如有其他需要说明的饮食习惯..." />
                </div>
              </div>
            </>
          )}

          {/* 步骤 5: 饮品习惯 */}
          {currentStep === 4 && (
            <>
              <div><span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 5 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">饮品习惯</h2>
                <p className="text-on-surface-variant text-sm mt-1">请选择您饮用以下饮品的频率</p></div>
              <div className="space-y-3">
                {renderFreqSelector('drinkWater', '水')}
                {renderFreqSelector('drinkCoffee', '咖啡')}
                {renderFreqSelector('drinkTea', '茶')}
                {renderFreqSelector('drinkMilk', '牛奶')}
                {renderFreqSelector('drinkPlantMilk', '植物奶')}
                {renderFreqSelector('drinkMilkTea', '奶茶')}
                {renderFreqSelector('drinkSugarFree', '无糖饮料')}
                {renderFreqSelector('drinkSugary', '含糖饮料')}
                {renderFreqSelector('drinkEnergy', '能量饮料')}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">其他饮品</label>
                  <input type="text" value={formData.drinkOther || ''} onChange={e => updateField('drinkOther', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" placeholder="请输入..." />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您在高温或高强度运动时是否出汗较多？</label>
                  {renderRadioGroup('highSaltSweat', YES_NO)}
                </div>
              </div>
            </>
          )}

          {/* 步骤 6: 饮食满意度与运动水平 */}
          {currentStep === 5 && (
            <>
              <div><span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 6 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">饮食满意度与运动水平</h2></div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您对当前饮食的满意度？</label>
                  {renderRadioGroup('dietSatisfaction', ['非常满意', '比较满意', '一般', '不太满意', '非常不满意'])}
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您当前的运动水平？</label>
                  {renderRadioGroup('exerciseLevel', ['高活动量', '中高活动量', '中等活动量', '轻度活动量', '日常活动量'])}
                </div>
              </div>
            </>
          )}

          {/* 步骤 7: 运动习惯详细 */}
          {currentStep === 6 && (
            <>
              <div><span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 7 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">运动习惯详细</h2></div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您常做的运动类型？</label>
                  {renderCheckboxGroup('exerciseTypes', ['有氧运动', '力量训练', '柔韧性训练', '团队运动', '其他'])}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <label className="text-sm font-medium mb-2 block">每次运动时长</label>
                    {renderRadioGroup('exerciseDuration', ['<30分钟', '30-60分钟', '1-2小时', '>2小时'], 1)}
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <label className="text-sm font-medium mb-2 block">每周运动频率</label>
                    {renderRadioGroup('exerciseFrequency', ['1-2次', '3-4次', '5次+'], 1)}
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">运动时间段</label>
                  {renderRadioGroup('exerciseTime', ['早上', '下午', '晚上'])}
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">运动激励因素</label>
                  <textarea value={formData.exerciseMotivation || ''} onChange={e => updateField('exerciseMotivation', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={2} />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">运动挑战</label>
                  <textarea value={formData.exerciseChallenges || ''} onChange={e => updateField('exerciseChallenges', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={2} placeholder="请描述您在运动中遇到的困难或挑战..." />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">运动目标</label>
                  <textarea value={formData.exerciseGoals || ''} onChange={e => updateField('exerciseGoals', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={2} placeholder="请描述您的运动目标..." />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">是否有运动伙伴？</label>
                  {renderRadioGroup('hasExercisePartner', YES_NO)}
                  {formData.hasExercisePartner === '是' && (
                    <input type="text" value={formData.exercisePartnerDetail || ''} onChange={e => updateField('exercisePartnerDetail', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-2 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" placeholder="请描述..." />
                  )}
                </div>
              </div>
            </>
          )}

          {/* 步骤 8: 生活方式 */}
          {currentStep === 7 && (
            <>
              <div><span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 8 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">生活方式</h2></div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您目前的压力水平？</label>
                  {renderRadioGroup('stressLevel', ['无', '轻微', '一般', '相当大', '无法忍受'])}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <label className="text-sm font-medium mb-2 block">是否吸烟？</label>
                    {renderRadioGroup('isSmoker', YES_NO)}
                    {formData.isSmoker === '是' && (
                      <input type="text" value={formData.smokingDetail || ''} onChange={e => updateField('smokingDetail', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-2 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" placeholder="支/天，年数" />
                    )}
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <label className="text-sm font-medium mb-2 block">是否饮酒？</label>
                    {renderRadioGroup('isDrinker', YES_NO)}
                    {formData.isDrinker === '是' && (
                      <input type="text" value={formData.drinkingDetail || ''} onChange={e => updateField('drinkingDetail', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-2 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" placeholder="频率/种类" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <label className="text-xs font-bold text-primary/60 uppercase">工作日起床时间</label>
                    <input type="time" value={formData.weekdayWakeTime || ''} onChange={e => updateField('weekdayWakeTime', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" />
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <label className="text-xs font-bold text-primary/60 uppercase">工作日睡觉时间</label>
                    <input type="time" value={formData.weekdaySleepTime || ''} onChange={e => updateField('weekdaySleepTime', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" />
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">起床时的精神状态</label>
                  <textarea value={formData.morningState || ''} onChange={e => updateField('morningState', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={2} />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-xs font-bold text-primary/60 uppercase">日常屏幕使用时间</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-surface-container-highest rounded-xl p-2">
                      <label className="text-[10px] font-bold text-primary/60 uppercase">电视</label>
                      <input type="text" value={formData.screenTimeTv || ''} onChange={e => updateField('screenTimeTv', e.target.value)} className="w-full bg-transparent text-sm mt-1 focus:outline-none" placeholder="小时/天" />
                    </div>
                    <div className="bg-surface-container-highest rounded-xl p-2">
                      <label className="text-[10px] font-bold text-primary/60 uppercase">阅读</label>
                      <input type="text" value={formData.screenTimeReading || ''} onChange={e => updateField('screenTimeReading', e.target.value)} className="w-full bg-transparent text-sm mt-1 focus:outline-none" placeholder="小时/天" />
                    </div>
                    <div className="bg-surface-container-highest rounded-xl p-2">
                      <label className="text-[10px] font-bold text-primary/60 uppercase">电子设备</label>
                      <input type="text" value={formData.screenTimeElectronics || ''} onChange={e => updateField('screenTimeElectronics', e.target.value)} className="w-full bg-transparent text-sm mt-1 focus:outline-none" placeholder="小时/天" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 步骤 9: 社交活动与其他反馈 */}
          {currentStep === 8 && (
            <>
              <div><span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 9 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">社交活动与其他反馈</h2></div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">您常参与的社交活动？</label>
                  {renderCheckboxGroup('socialActivities', ['朋友聚会', '家庭聚餐', '体育活动', '社区活动', '兴趣小组', '公司活动', '其他'])}
                </div>
                {((formData.socialActivities as string[]) || []).includes('其他') && (
                  <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                    <label className="text-sm font-medium mb-2 block">其他社交活动</label>
                    <input type="text" value={formData.socialActivitiesOther || ''} onChange={e => updateField('socialActivitiesOther', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" placeholder="请描述..." />
                  </div>
                )}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5">
                  <label className="text-sm font-medium mb-2 block">其他反馈或建议</label>
                  <textarea value={formData.otherFeedback || ''} onChange={e => updateField('otherFeedback', e.target.value)} className="w-full bg-surface-container-highest rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-all" rows={4} placeholder="如有其他补充请在此填写..." />
                </div>
              </div>
            </>
          )}

          {/* 步骤 10: 食物频率 */}
          {currentStep === 9 && (
            <>
              <div><span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px]">Step 10 of {TOTAL_STEPS}</span>
                <h2 className="font-headline text-2xl font-bold text-primary mt-2">食物频率</h2>
                <p className="text-on-surface-variant text-sm mt-1">请选择您食用以下食物的频率</p></div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-primary/60 uppercase mt-4 mb-2">谷薯与水果</p>
                {renderFreqSelector('freqRice', '米饭')}
                {renderFreqSelector('freqNoodlesBread', '面条、面包')}
                {renderFreqSelector('freqWholeGrains', '全谷物制品')}
                {renderFreqSelector('freqFreshFruit', '新鲜水果')}
                {renderFreqSelector('freqFruitJuice', '果汁')}
                {renderFreqSelector('freqDriedFruit', '干果')}
                
                <p className="text-xs font-bold text-primary/60 uppercase mt-4 mb-2">蔬菜</p>
                {renderFreqSelector('freqLeafyVegetables', '绿叶蔬菜')}
                {renderFreqSelector('freqStarchyVegetables', '淀粉类蔬菜')}
                {renderFreqSelector('freqOtherVegetables', '其他蔬菜')}
                
                <p className="text-xs font-bold text-primary/60 uppercase mt-4 mb-2">蛋白质</p>
                {renderFreqSelector('freqEggs', '鸡蛋')}
                {renderFreqSelector('freqPoultry', '家禽')}
                {renderFreqSelector('freqFishSeafood', '鱼类和海鲜')}
                {renderFreqSelector('freqBeansSoy', '豆类和豆制品')}
                {renderFreqSelector('freqRedMeat', '红肉')}
                
                <p className="text-xs font-bold text-primary/60 uppercase mt-4 mb-2">乳制品</p>
                {renderFreqSelector('freqMilkDairy', '牛奶')}
                {renderFreqSelector('freqYogurt', '酸奶')}
                {renderFreqSelector('freqCheese', '奶酪')}
                {renderFreqSelector('freqNonDairyAlternatives', '非乳制品替代品')}
                
                <p className="text-xs font-bold text-primary/60 uppercase mt-4 mb-2">零食</p>
                {renderFreqSelector('freqNutsSeeds', '坚果和种子')}
                {renderFreqSelector('freqCookiesCake', '饼干、蛋糕')}
                {renderFreqSelector('freqChocolateCandy', '巧克力、糖果')}
                {renderFreqSelector('freqSaltySnacks', '咸味零食')}
              </div>
              
              <div className="bg-primary p-5 rounded-3xl text-white mt-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary-container text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>security</span>
                  <div>
                    <h3 className="font-headline font-bold text-sm mb-1">隐私保护承诺</h3>
                    <p className="text-white/70 text-xs leading-relaxed">您的信息均受管家级加密保护。我们将严格遵守隐私保护协议。</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 步骤按钮 */}
          <div className="flex gap-3 mt-6">
            {currentStep > 0 && <button onClick={handlePrevStep} className="flex-1 py-4 rounded-2xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm">上一步</button>}
            {currentStep < TOTAL_STEPS - 1 ? (
              <button onClick={handleNextStep} disabled={saving} className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm disabled:opacity-50">{saving ? '保存中...' : '下一步'}</button>
            ) : (
              <button onClick={handleFinalSubmit} disabled={saving} className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? '提交中...' : '完成提交'} {!saving && <span className="material-symbols-outlined text-lg">check_circle</span>}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-toast-in">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-error/90 text-white' : 'bg-secondary/90 text-white'}`}>
            <span className="material-symbols-outlined text-lg">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
            {toast.message}
          </div>
        </div>
      )}

      <style>{`@keyframes toast-in { from { opacity: 0; transform: translate(-50%, -12px); } to { opacity: 1; transform: translate(-50%, 0); } } .animate-toast-in { animation: toast-in 0.25s ease-out; }`}</style>
    </div>
  );
};

export default NutritionSurvey;