import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  submitNutritionSurvey,
  getLatestNutritionSurvey,
  saveNutritionDraft,
  updateNutritionSurvey,
  NutritionSurveyData,
} from '@/api/nutrition-survey.api';
import { uploadFile } from '@/api/upload.api';
import { useUser } from '@/contexts/UserContext';

// 上传文件类型
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  type?: 'pdf' | 'image' | 'doc' | 'other';
  source?: 'weekday' | 'weekend'; // 文件来源：工作日/周末
}

const TOTAL_STEPS = 13;

// 频率选项
const FREQ_OPTIONS = ['每天', '每周3-6次', '每周1-2次', '每月1-3次', '几乎不', '从不'];

const initialFormData: NutritionSurveyData = {
  name: '',
  phone: '',
  consultationReason: '',
  nutritionistSupportGoals: '',
  height: 0,
  weight: 0,
  weightChange: '',
  weightChangeHistory: '',
  weightGoal: '',
  bodyComposition: '',
  chronicDiseases: '',
  medicationsSupplements: '',
  dailyMeals: '',
  breakfastHabit: '',
  commonSnacks: [],
  commonSnacksOther: '',
  foodSources: [],
  foodSourcesOther: '',
  foodAllergies: '',
  macroRatio: '',
  foodQuality: '',
  mealRegularity: '',
  bingeFrequency: undefined as number | undefined,
  emotionalEatingFrequency: undefined as number | undefined,
  lateNightSnackFrequency: undefined as number | undefined,
  eatingOutFrequency: undefined as number | undefined,
  hasHousekeeper: '',
  takeoutFrequency: undefined as number | undefined,
  socialDiningFrequency: undefined as number | undefined,
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
  uploadedDietFiles: [],
  serviceTypes: [],
  serviceTypesOther: '',
  personalizationPreferences: '',
  complianceScore: undefined as number | undefined,
  feedbackFrequency: '',
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
  const [uploadedDietFiles, setUploadedDietFiles] = useState<UploadedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const weekdayFileInputRef = useRef<HTMLInputElement>(null);
  const weekendFileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { user } = useUser();

  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => { setToast(null); toastTimerRef.current = null; }, 2500);
  }, []);

  useEffect(() => {
    const loadLatest = async () => {
      // 只从 API 获取数据
      try {
        const survey = await getLatestNutritionSurvey();

        if (survey?.formData) {
          // 服务器有数据：使用服务器数据
          setFormData({ ...initialFormData, ...survey.formData });
          setSurveyId(survey.id);

          // 恢复已上传的文件列表
          if (survey.formData.uploadedDietFiles && survey.formData.uploadedDietFiles.length > 0) {
            setUploadedDietFiles(survey.formData.uploadedDietFiles.map(f => ({
              id: f.url || Date.now().toString() + Math.random().toString(36).slice(2, 11),
              name: f.name,
              size: f.size,
              progress: 100,
              status: 'success' as const,
              url: f.url,
              type: f.type,
            })));
          }
        }
        // 服务器无数据：保持表单为空白（initialFormData）
      } catch (error) {
        console.error('加载问卷失败:', error);
        // 网络错误时不自动填充，保持空白
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
  }, [user]);

  // localStorage实时自动保存
  useEffect(() => {
    // 将上传的文件同步到 formData
    if (uploadedDietFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        uploadedDietFiles: uploadedDietFiles
          .filter(f => f.status === 'success' && f.url)
          .map(f => ({
            name: f.name,
            size: f.size,
            url: f.url!,
            type: f.type || 'other',
          })),
      }));
    }
  }, [uploadedDietFiles]);

  const showSaveIndicator = useCallback(() => { setSaveIndicator(true); setTimeout(() => setSaveIndicator(false), 1500); }, []);

  const updateField = (field: keyof NutritionSurveyData, value: string | number | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleArray = (field: keyof NutritionSurveyData, value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    updateField(field, updated);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, source: 'weekday' | 'weekend') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 检查已上传文件数量，最多10个
    const currentCount = uploadedDietFiles.filter(f => f.status !== 'error').length;
    const availableSlots = 10 - currentCount;
    if (availableSlots <= 0) {
      showToast('最多只能上传10个附件');
      e.target.value = '';
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      showToast(`最多还能上传${availableSlots}个文件，已自动选择前${availableSlots}个`);
    }

    filesToUpload.forEach((file) => {
      // 限制文件大小 50MB
      if (file.size > 50 * 1024 * 1024) {
        showToast(`文件 ${file.name} 超过 50MB 限制`);
        return;
      }

      const fileId = Date.now().toString() + Math.random().toString(36).slice(2, 11);
      const fileType: UploadedFile['type'] = file.name.endsWith('.pdf') ? 'pdf' :
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name) ? 'image' :
        /\.(doc|docx)$/i.test(file.name) ? 'doc' : 'other';

      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading',
        type: fileType,
        source, // 记录文件来源
      };

      setUploadedDietFiles((prev) => [...prev, newFile]);

      // 调用上传 API
      uploadFile(file, (percent) => {
        setUploadedDietFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: Math.min(percent, 99) } : f))
        );
      }).then((result) => {
        setUploadedDietFiles((prev) =>
          prev.map((f) => (f.id === fileId ? {
            ...f,
            progress: 100,
            status: 'success' as const,
            url: result.url,
          } : f))
        );
      }).catch((err) => {
        setUploadedDietFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: 0, status: 'error' as const } : f))
        );
        showToast(err instanceof Error ? err.message : `文件 ${file.name} 上传失败`);
      });
    });

    e.target.value = '';
  };

  // 移除文件
  const removeDietFile = (fileId: string) => {
    setUploadedDietFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const validateStep1 = (): boolean => {
    // 姓名和电话已移除，由后端自动从用户信息获取
    return true;
  };

  // 清理表单数据：移除无效的数值字段（0 值会被后端 positive() 校验拒绝）
  const cleanFormData = (data: NutritionSurveyData): Partial<NutritionSurveyData> => {
    const cleaned: Partial<NutritionSurveyData> = { ...data };
    // 移除值为 0 的数值字段，避免后端 positive() 校验失败
    if (cleaned.height === 0 || cleaned.height === undefined || cleaned.height === null) {
      delete cleaned.height;
    }
    if (cleaned.weight === 0 || cleaned.weight === undefined || cleaned.weight === null) {
      delete cleaned.weight;
    }
    return cleaned;
  };

  // 获取带有用户信息的表单数据
  const getFormDataWithUserInfo = () => {
    return {
      ...formData,
      name: formData.name || user?.username || '',
      phone: formData.phone || user?.phone || '',
    };
  };

  const handleSaveStep = async () => {
    setSaving(true);
    try {
      const dataToSave = getFormDataWithUserInfo();
      const cleanedData = cleanFormData(dataToSave);
      if (surveyId) {
        try {
          await updateNutritionSurvey(surveyId, cleanedData);
        } catch (updateError: unknown) {
          // 如果更新失败（如记录不存在），重新创建草稿
          const err = updateError as { response?: { data?: { code?: number } } };
          if (err.response?.data?.code === 404) {
            console.log('问卷记录不存在，重新创建草稿');
            const result = await saveNutritionDraft(cleanedData);
            setSurveyId(result.data.id);
          } else {
            throw updateError;
          }
        }
      } else {
        const result = await saveNutritionDraft(cleanedData);
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

  // 步骤变化时自动滚动到顶部
  useEffect(() => {
    const scrollToTop = () => {
      // 方式1: 标准方法
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // 方式2: 找到所有可能的滚动容器
      const findAndScrollAllContainers = () => {
        // 检查 html 元素
        const html = document.documentElement;
        if (html.scrollTop > 0) {
          html.scrollTop = 0;
        }

        // 检查 body 元素
        const body = document.body;
        if (body.scrollTop > 0) {
          body.scrollTop = 0;
        }

        // 检查所有可能的滚动容器
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            const style = window.getComputedStyle(el);
            const overflow = style.overflow + style.overflowY;
            if ((overflow.includes('auto') || overflow.includes('scroll')) && el.scrollTop > 0) {
              el.scrollTop = 0;
            }
          }
        });
      };

      findAndScrollAllContainers();

      // 使用 scrollIntoView 作为最终方案
      const header = document.querySelector('header');
      if (header) {
        header.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    };

    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);
    const timer2 = setTimeout(scrollToTop, 150);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [currentStep]);

  // 判断是否跳过步骤6、7（运动习惯详情）
  const shouldSkipExerciseDetails = formData.exerciseLevel === '日常活动量';

  const handleNextStep = async () => {
    if (currentStep === 0 && !validateStep1()) return;
    try {
      await handleSaveStep();
      if (currentStep < TOTAL_STEPS - 1) {
        let nextStep = currentStep + 1;

        // 步骤5 -> 如果选择"日常活动量"，跳过步骤6、7
        if (currentStep === 4 && shouldSkipExerciseDetails) {
          nextStep = 7; // 跳到步骤8
        }

        setCurrentStep(nextStep);
      }
    } catch (error) {
      console.error('handleNextStep error:', error);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1;

      // 步骤8 -> 如果跳过了步骤6、7，返回步骤5
      if (currentStep === 7 && shouldSkipExerciseDetails) {
        prevStep = 4; // 返回步骤5
      }

      setCurrentStep(prevStep);
    }
  };

  const handleFinalSubmit = async () => {
    setSaving(true);
    try {
      // 获取带有用户信息的表单数据，并将上传的文件数据添加到表单数据中
      const baseData = getFormDataWithUserInfo();
      const submitData: NutritionSurveyData = {
        ...baseData,
        uploadedDietFiles: uploadedDietFiles
          .filter(f => f.status === 'success' && f.url)
          .map(f => ({
            name: f.name,
            size: f.size,
            url: f.url!,
            type: f.type || 'other',
          })),
      };

      console.log('提交营养问卷, surveyId:', surveyId, 'formData:', submitData);
      let result;
      if (surveyId) {
        result = await updateNutritionSurvey(surveyId, cleanFormData(submitData));
        console.log('更新问卷结果:', result);
      } else {
        result = await submitNutritionSurvey(submitData);
        console.log('提交问卷结果:', result);
      }
      console.log('准备跳转到成功页面');
      navigate('/survey-success?type=nutrition');
    } catch (error) {
      console.error('提交失败:', error);
      showToast('提交失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 动态计算实际步骤数和当前步骤序号
  const getActualStepInfo = () => {
    // 基础步骤: 1(健康信息), 2(饮食1), 3(饮食2), 4(饮食3), 5(饮食4)
    // 条件步骤: 6,7(运动详情 - 取决于是否选择"日常活动量")
    // 基础步骤: 8(生活1), 9(生活2)
    // 基础步骤: 10,11,12(饮食频率)

    let actualStep = currentStep + 1; // 1-based
    let totalActualSteps = TOTAL_STEPS;

    // 如果跳过运动详情（步骤6、7）
    if (shouldSkipExerciseDetails) {
      totalActualSteps -= 2; // 总步骤减少2
      if (currentStep >= 7) {
        actualStep -= 2; // 当前步骤序号减少2
      }
    }

    return { actualStep, totalActualSteps };
  };

  const { actualStep, totalActualSteps } = getActualStepInfo();
  const progress = (actualStep / totalActualSteps) * 100;

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface">
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
      <main className="relative pb-4 overflow-x-hidden">
        <div className="transition-all duration-300 opacity-100">
        
        {/* ================= 步骤 1: 健康信息 ================= */}
        {currentStep === 0 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">健康信息</h2>
              <p className="text-on-surface-variant text-sm mb-8">为了提供精准的私人管家式营养服务，请详细填写您的基础现状与核心诉求。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
              {/* 咨询主要原因 */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-primary font-bold text-base mb-1.5 block leading-snug">您此次咨询的主要原因或关注点是什么？</span>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)]"
                    placeholder="例如：近期感到疲劳、希望通过饮食改善血糖等..."
                    rows={2}
                    value={formData.consultationReason || ''}
                    onChange={e => updateField('consultationReason', e.target.value)}
                  />
                </label>
              </div>
              {/* 希望营养师支持领域 */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-primary font-bold text-base mb-1.5 block leading-snug">您希望营养师在哪些具体目标或领域上为您提供支持？</span>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)]"
                    placeholder="例如：减脂增肌方案、慢病调理、每日配餐建议等..."
                    rows={2}
                    value={formData.nutritionistSupportGoals || ''}
                    onChange={e => updateField('nutritionistSupportGoals', e.target.value)}
                  />
                </label>
              </div>
              {/* 基础体征 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-[2px] bg-secondary" />
                  <h2 className="font-headline font-bold text-base text-primary tracking-tight">基础体征</h2>
                </div>
                {/* 身高和体重 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-low p-3 rounded-xl shadow-[0_4px_16px_rgba(0,30,64,0.04)] transition-all flex flex-col justify-center">
                    <span className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-widest block mb-1 opacity-60">身高</span>
                    <div className="flex items-baseline gap-1">
                      <input
                        className="bg-transparent border-none p-0 text-xl font-headline font-bold text-primary w-14 focus:ring-0 placeholder:text-outline-variant"
                        placeholder="000"
                        type="number"
                        value={formData.height || ''}
                        onChange={e => updateField('height', parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-on-surface-variant font-bold text-[10px]">厘米</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl shadow-[0_4px_16px_rgba(0,30,64,0.04)] transition-all flex flex-col justify-center">
                    <span className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-widest block mb-1 opacity-60">体重</span>
                    <div className="flex items-baseline gap-1">
                      <input
                        className="bg-transparent border-none p-0 text-xl font-headline font-bold text-primary w-14 focus:ring-0 placeholder:text-outline-variant"
                        placeholder="00.0"
                        type="number"
                        value={formData.weight || ''}
                        onChange={e => updateField('weight', parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-on-surface-variant font-bold text-[10px]">千克</span>
                    </div>
                  </div>
                </div>
              </section>
              {/* 体重变化 */}
              <div className="space-y-2">
                <h3 className="text-primary font-bold text-base leading-snug">在过去一个月内，您的体重有明显变化吗？</h3>
                <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl">
                  {['是', '否', '其他'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (opt === '其他') {
                          // 选中"其他"时，设置空格作为占位符，表示选中了"其他"选项
                          updateField('weightChange', ' ');
                        } else {
                          updateField('weightChange', opt);
                        }
                      }}
                      className={`flex items-center justify-center py-3 rounded-xl transition-all ${
                        (opt === '其他'
                          ? formData.weightChange && !['是', '否'].includes(formData.weightChange)
                          : formData.weightChange === opt)
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-container'
                      }`}
                    >
                      <span className={`text-xs font-medium text-center leading-tight ${
                        (opt === '其他'
                          ? formData.weightChange && !['是', '否'].includes(formData.weightChange)
                          : formData.weightChange === opt)
                          ? 'text-white'
                          : 'text-outline'
                      }`}>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
                {/* 其他输入框 - 选中"其他"时显示 */}
                {formData.weightChange && !['是', '否'].includes(formData.weightChange) && (
                  <input
                    type="text"
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all"
                    placeholder="请说明具体情况..."
                    value={formData.weightChange === ' ' ? '' : formData.weightChange}
                    onChange={e => updateField('weightChange', e.target.value || ' ')}
                  />
                )}
              </div>

              {/* 体重变化史 */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-primary font-bold text-base mb-1.5 block leading-snug">体重变化史</span>
                  <span className="text-outline text-xs block mb-1.5">请描述减重次数、方式、速度、是否反弹等</span>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)]"
                    placeholder="请描述您的体重变化历史..."
                    rows={3}
                    value={formData.weightChangeHistory || ''}
                    onChange={e => updateField('weightChangeHistory', e.target.value)}
                  />
                </label>
              </div>

              {/* 体重目标 */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-primary font-bold text-base mb-1.5 block leading-snug">体重目标</span>
                  <span className="text-outline text-xs block mb-1.5">目标体重、体脂、时间周期、优先级</span>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)]"
                    placeholder="请描述您的体重目标..."
                    rows={3}
                    value={formData.weightGoal || ''}
                    onChange={e => updateField('weightGoal', e.target.value)}
                  />
                </label>
              </div>

              {/* 体成分情况的变化 */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-primary font-bold text-base mb-1.5 block leading-snug">体成分情况的变化</span>
                  <span className="text-outline text-xs block mb-1.5">体脂率、内脏脂肪、肌肉量、骨量</span>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)]"
                    placeholder="请描述您的体成分情况..."
                    rows={3}
                    value={formData.bodyComposition || ''}
                    onChange={e => updateField('bodyComposition', e.target.value)}
                  />
                </label>
              </div>

              {/* 慢性疾病 */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-primary font-bold text-base mb-1.5 block leading-snug">您是否有任何慢性疾病或健康问题？如果有，请说明。</span>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)]"
                    placeholder="请详细描述病情或目前的健康状况..."
                    rows={2}
                    value={formData.chronicDiseases || ''}
                    onChange={e => updateField('chronicDiseases', e.target.value)}
                  />
                </label>
              </div>
              {/* 药物或补充剂 */}
              <div className="space-y-2">
                <label className="block">
                  <span className="text-primary font-bold text-base mb-1.5 block leading-snug">您目前是否正在服用任何药物、补充剂或草药？如果是，请说明药物或补充剂名字、服用频率、是否是医生推荐或者其他专业人士推荐</span>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)]"
                    placeholder="请列出名称、剂量、频率及来源..."
                    rows={3}
                    value={formData.medicationsSupplements || ''}
                    onChange={e => updateField('medicationsSupplements', e.target.value)}
                  />
                </label>
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

        {/* ================= 步骤 2: 饮食习惯（1/4） ================= */}
        {currentStep === 1 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">饮食习惯 (1/4)</h2>
              <p className="text-on-surface-variant text-sm mb-8">了解您的日常饮食习惯，帮助我们制定更精准的方案。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
              {/* Question 1: Single Choice */}
              <section className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-primary/10 font-headline text-2xl font-bold">1</span>
                  <h3 className="text-lg font-bold text-primary leading-snug">您通常每天的主餐有几餐？</h3>
                </div>
                <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl">
                  {['1餐', '2餐', '3餐', '其他'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (opt === '其他') {
                          // 选中"其他"时，设置空格作为占位符
                          updateField('dailyMeals', ' ');
                        } else {
                          updateField('dailyMeals', opt);
                        }
                      }}
                      className={`flex items-center justify-center py-3 rounded-xl transition-all ${
                        (opt === '其他'
                          ? formData.dailyMeals && !['1餐', '2餐', '3餐'].includes(formData.dailyMeals)
                          : formData.dailyMeals === opt)
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-container'
                      }`}
                    >
                      <span className={`text-xs font-medium text-center leading-tight ${
                        (opt === '其他'
                          ? formData.dailyMeals && !['1餐', '2餐', '3餐'].includes(formData.dailyMeals)
                          : formData.dailyMeals === opt)
                          ? 'text-white'
                          : 'text-outline'
                      }`}>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
                {/* 其他输入框 */}
                {formData.dailyMeals && !['1餐', '2餐', '3餐'].includes(formData.dailyMeals) && (
                  <input
                    type="text"
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all"
                    placeholder="请说明具体餐数..."
                    value={formData.dailyMeals === ' ' ? '' : formData.dailyMeals}
                    onChange={e => updateField('dailyMeals', e.target.value || ' ')}
                  />
                )}
              </section>
              {/* Question 2: Yes/No */}
              <section className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-primary/10 font-headline text-2xl font-bold">2</span>
                  <h3 className="text-lg font-bold text-primary">您是否有固定的早餐习惯？</h3>
                </div>
                <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl">
                  {['是', '否'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('breakfastHabit', opt)}
                      className={`flex items-center justify-center py-3 rounded-xl transition-all ${
                        formData.breakfastHabit === opt
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-container'
                      }`}
                    >
                      <span className={`text-xs font-medium text-center leading-tight ${formData.breakfastHabit === opt ? 'text-white' : 'text-outline'}`}>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              {/* Question 3: Multi Choice */}
              <section className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-primary/10 font-headline text-2xl font-bold">3</span>
                  <h3 className="text-lg font-bold text-primary">您在一天中常吃的零食有哪些？<span className="text-xs font-normal text-on-surface-variant inline ml-2">(可多选)</span></h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['水果', '坚果', '薯片', '巧克力', '饼干', '其他'].map(opt => (
                    <label key={opt} className="cursor-pointer">
                      <input
                        className="sr-only peer"
                        type="checkbox"
                        checked={opt === '其他' ? (formData.commonSnacksOther !== undefined && formData.commonSnacksOther !== '') : ((formData.commonSnacks as string[]) || []).includes(opt)}
                        onChange={() => {
                          if (opt === '其他') {
                            // 点击"其他"：切换状态
                            if (formData.commonSnacksOther !== undefined && formData.commonSnacksOther !== '') {
                              updateField('commonSnacksOther', '');
                            } else {
                              updateField('commonSnacksOther', ' '); // 设置一个空格作为占位符，表示选中
                            }
                          } else {
                            toggleArray('commonSnacks', opt);
                          }
                        }}
                      />
                      <div className="px-4 py-2 rounded-full bg-surface-container-low shadow-[0_4px_16px_rgba(0,30,64,0.04)] border border-transparent peer-checked:border-secondary peer-checked:bg-secondary/5 transition-all">
                        <span className="text-xs font-bold text-primary">{opt}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {/* 其他输入框 - 当选中"其他"时显示 */}
                {formData.commonSnacksOther && formData.commonSnacksOther !== '' && (
                  <input
                    type="text"
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all"
                    placeholder="请说明具体零食..."
                    value={formData.commonSnacksOther?.trim() || ''}
                    onChange={e => updateField('commonSnacksOther', e.target.value || ' ')}
                  />
                )}
              </section>
              {/* Question 4: Source Checklist */}
              <section className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-primary/10 font-headline text-2xl font-bold">4</span>
                  <h3 className="text-lg font-bold text-primary">请列出您食物的前三个来源：</h3>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {['食堂', '餐馆', '外卖', '超市购买的现成食品', '家人做饭', '自己做饭', '其他'].map(opt => (
                    <label key={opt} className="flex items-center p-3 rounded-xl hover:bg-surface-container transition-colors group cursor-pointer">
                      <input
                        className="w-4 h-4 rounded text-secondary border-outline/30 focus:ring-secondary/20 transition-all"
                        type="checkbox"
                        checked={opt === '其他' ? (formData.foodSourcesOther !== undefined && formData.foodSourcesOther !== '') : ((formData.foodSources as string[]) || []).includes(opt)}
                        onChange={() => {
                          if (opt === '其他') {
                            if (formData.foodSourcesOther !== undefined && formData.foodSourcesOther !== '') {
                              updateField('foodSourcesOther', '');
                            } else {
                              updateField('foodSourcesOther', ' ');
                            }
                          } else {
                            toggleArray('foodSources', opt);
                          }
                        }}
                      />
                      <span className="ml-3 text-sm font-bold text-primary">{opt}</span>
                    </label>
                  ))}
                </div>
                {/* 其他输入框 */}
                {formData.foodSourcesOther && formData.foodSourcesOther !== '' && (
                  <input
                    type="text"
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all"
                    placeholder="请说明具体来源..."
                    value={formData.foodSourcesOther?.trim() || ''}
                    onChange={e => updateField('foodSourcesOther', e.target.value || ' ')}
                  />
                )}
              </section>
              {/* Question 5: Text Input */}
              <section className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-primary/10 font-headline text-2xl font-bold">5</span>
                  <h3 className="text-lg font-bold text-primary">您是否有任何已知的食物过敏或不耐受？</h3>
                </div>
                <div className="relative">
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)]"
                    placeholder="如果有，请简要说明..."
                    rows={2}
                    value={formData.foodAllergies || ''}
                    onChange={e => updateField('foodAllergies', e.target.value)}
                  />
                </div>
              </section>

              {/* 当前的饮食结构 */}
              <section className="space-y-4 pt-4 border-t border-outline-variant/10">
                <h3 className="text-primary font-bold text-base">当前的饮食结构</h3>
                
                {/* 碳水/蛋白/脂肪比例 */}
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-on-surface text-sm font-medium">碳水/蛋白/脂肪比例</span>
                    <input
                      type="text"
                      className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all mt-1"
                      placeholder="例如：5:3:2"
                      value={formData.macroRatio || ''}
                      onChange={e => updateField('macroRatio', e.target.value)}
                    />
                  </label>
                </div>

                {/* 食物质量 */}
                <div className="space-y-2">
                  <span className="text-on-surface text-sm font-medium">食物质量</span>
                  <div className="flex gap-2">
                    {['高', '中', '低'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField('foodQuality', opt)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                          formData.foodQuality === opt
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 进餐规律 */}
                <div className="space-y-2">
                  <span className="text-on-surface text-sm font-medium">进餐规律</span>
                  <div className="flex gap-2">
                    {['是', '否'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField('mealRegularity', opt)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                          formData.mealRegularity === opt
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* 当前的饮食行为 */}
              <section className="space-y-4 pt-4 border-t border-outline-variant/10">
                <h3 className="text-primary font-bold text-base">当前的饮食行为</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* 暴食 */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-on-surface text-sm font-medium">暴食</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-outline text-xs">每周</span>
                        <input
                          type="number"
                          className="w-16 bg-surface-container-low border-none rounded-lg p-2 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm text-center"
                          placeholder=""
                          min="0"
                          value={formData.bingeFrequency ?? ''}
                          onChange={e => updateField('bingeFrequency', e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <span className="text-outline text-xs">次</span>
                      </div>
                    </label>
                  </div>

                  {/* 情绪性进食 */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-on-surface text-sm font-medium">情绪性进食</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-outline text-xs">每周</span>
                        <input
                          type="number"
                          className="w-16 bg-surface-container-low border-none rounded-lg p-2 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm text-center"
                          placeholder=""
                          min="0"
                          value={formData.emotionalEatingFrequency ?? ''}
                          onChange={e => updateField('emotionalEatingFrequency', e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <span className="text-outline text-xs">次</span>
                      </div>
                    </label>
                  </div>

                  {/* 夜宵 */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-on-surface text-sm font-medium">夜宵</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-outline text-xs">每月</span>
                        <input
                          type="number"
                          className="w-16 bg-surface-container-low border-none rounded-lg p-2 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm text-center"
                          placeholder=""
                          min="0"
                          value={formData.lateNightSnackFrequency ?? ''}
                          onChange={e => updateField('lateNightSnackFrequency', e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <span className="text-outline text-xs">次</span>
                      </div>
                    </label>
                  </div>

                  {/* 外食频率 */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-on-surface text-sm font-medium">外食频率</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-outline text-xs">每月</span>
                        <input
                          type="number"
                          className="w-16 bg-surface-container-low border-none rounded-lg p-2 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm text-center"
                          placeholder=""
                          min="0"
                          value={formData.eatingOutFrequency ?? ''}
                          onChange={e => updateField('eatingOutFrequency', e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <span className="text-outline text-xs">次</span>
                      </div>
                    </label>
                  </div>
                </div>
              </section>

              {/* 烹饪及执行条件 */}
              <section className="space-y-4 pt-4 border-t border-outline-variant/10">
                <h3 className="text-primary font-bold text-base">烹饪及执行条件</h3>
                
                {/* 是否有保姆 */}
                <div className="space-y-2">
                  <span className="text-on-surface text-sm font-medium">日常是否有保姆？</span>
                  <div className="flex gap-2">
                    {['有', '无'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField('hasHousekeeper', opt)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                          formData.hasHousekeeper === opt
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 叫外卖频次 */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-on-surface text-sm font-medium">叫外卖频次</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-outline text-xs">每月</span>
                        <input
                          type="number"
                          className="w-16 bg-surface-container-low border-none rounded-lg p-2 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm text-center"
                          placeholder=""
                          min="0"
                          value={formData.takeoutFrequency ?? ''}
                          onChange={e => updateField('takeoutFrequency', e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <span className="text-outline text-xs">次</span>
                      </div>
                    </label>
                  </div>

                  {/* 应酬频次 */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-on-surface text-sm font-medium">应酬频次</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-outline text-xs">每月</span>
                        <input
                          type="number"
                          className="w-16 bg-surface-container-low border-none rounded-lg p-2 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm text-center"
                          placeholder=""
                          min="0"
                          value={formData.socialDiningFrequency ?? ''}
                          onChange={e => updateField('socialDiningFrequency', e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <span className="text-outline text-xs">次</span>
                      </div>
                    </label>
                  </div>
                </div>
              </section>
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

        {/* ================= 步骤 3: 饮食习惯（2/4） ================= */}
        {currentStep === 2 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">饮食习惯 (2/4)</h2>
              <p className="text-on-surface-variant text-sm mb-8">继续了解您的饮食偏好和细节。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
              {/* Question 6: Textarea */}
              <section className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-primary/10 font-headline text-2xl font-bold">6</span>
                  <h2 className="text-lg font-bold text-primary leading-snug">您是否有不喜欢或避免的食物？请说明原因。</h2>
                </div>
                <div className="relative">
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)] outline-none"
                    placeholder="例如：海鲜（过敏）、香菜（味道）、深加工食品（健康考虑）..."
                    rows={2}
                    value={formData.dislikedFoods || ''}
                    onChange={e => updateField('dislikedFoods', e.target.value)}
                  />
                </div>
              </section>
              {/* Question 7: Selection List */}
              <section className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-primary/10 font-headline text-2xl font-bold">7</span>
                  <h2 className="text-lg font-bold text-primary leading-snug">您是否遵循特定的饮食计划？</h2>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {['生酮饮食', '间歇性禁食', '素食主义', '无麸质饮食', '无特定饮食计划'].map(opt => (
                    <label key={opt} className="flex items-center p-3 rounded-xl hover:bg-surface-container transition-colors group cursor-pointer">
                      <input
                        className="w-4 h-4 rounded-full text-secondary border-outline/30 focus:ring-secondary/20 transition-all"
                        type="radio"
                        name="dietPlanType"
                        checked={formData.dietPlanType === opt}
                        onChange={() => updateField('dietPlanType', opt)}
                      />
                      <span className="ml-3 text-sm font-bold text-primary">{opt}</span>
                    </label>
                  ))}
                </div>
              </section>
              {/* Question 8: Textareas */}
              <section className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-primary/10 font-headline text-2xl font-bold">8</span>
                  <h2 className="text-lg font-bold text-primary leading-snug">您典型的一天饮食是什么样的？</h2>
                </div>
                <p className="text-on-surface-variant text-[11px] leading-tight opacity-70 mb-2">请上传2天的饮食记录，包括早餐、午餐、晚餐及任何小吃。支持文字或图片。工作日和周末各一天。</p>

                {/* 两个上传区域 */}
                <div className="grid grid-cols-2 gap-3">
                  {/* 工作日饮食上传 */}
                  <div
                    onClick={() => weekdayFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface cursor-pointer hover:bg-surface-variant transition"
                  >
                    <input
                      ref={weekdayFileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileSelect(e, 'weekday')}
                      className="hidden"
                    />
                    <span className="material-symbols-outlined text-xl text-secondary mb-1">work</span>
                    <p className="text-[11px] text-outline font-medium">工作日饮食</p>
                    <p className="text-[10px] text-outline/60 mt-0.5">点击上传</p>
                  </div>

                  {/* 周末饮食上传 */}
                  <div
                    onClick={() => weekendFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface cursor-pointer hover:bg-surface-variant transition"
                  >
                    <input
                      ref={weekendFileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileSelect(e, 'weekend')}
                      className="hidden"
                    />
                    <span className="material-symbols-outlined text-xl text-secondary mb-1">weekend</span>
                    <p className="text-[11px] text-outline font-medium">周末饮食</p>
                    <p className="text-[10px] text-outline/60 mt-0.5">点击上传</p>
                  </div>
                </div>

                <p className="text-[10px] text-outline/60 text-center">单个文件最大 50MB，最多10个</p>

                {/* 已上传文件列表 - 按来源排序：工作日在前，周末在后 */}
                {uploadedDietFiles.length > 0 && (
                  <div className="space-y-2">
                    {[...uploadedDietFiles]
                      .sort((a, b) => {
                        // 工作日排前面，周末排后面
                        if (a.source === 'weekday' && b.source !== 'weekday') return -1;
                        if (a.source !== 'weekday' && b.source === 'weekday') return 1;
                        return 0;
                      })
                      .map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-outline-variant/10">
                        {/* 缩略图/图标 */}
                        {file.type === 'image' && file.url ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                            onClick={() => setPreviewFile(file)}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-secondary text-2xl flex-shrink-0">
                            {file.type === 'pdf' ? 'picture_as_pdf' : file.type === 'doc' ? 'article' : 'description'}
                          </span>
                        )}
                        {/* 文件信息 */}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs block truncate">{file.name}</span>
                          <span className="text-[10px] text-outline">{formatFileSize(file.size)}</span>
                        </div>
                        {/* 操作按钮 */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {file.status === 'uploading' ? (
                            <span className="text-[10px] text-primary">{file.progress}%</span>
                          ) : file.status === 'error' ? (
                            <span className="text-[10px] text-error font-medium">上传失败</span>
                          ) : file.url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewFile(file)}
                              className="p-1 hover:bg-primary/10 rounded"
                            >
                              <span className="material-symbols-outlined text-primary text-sm">visibility</span>
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => removeDietFile(file.id)}
                            className="p-1 hover:bg-error/10 rounded"
                          >
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 文字描述输入 */}
                <div className="mt-2">
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all shadow-[0_4px_16px_rgba(0,30,64,0.04)] outline-none"
                    placeholder="或在此手动输入您的饮食记录..."
                    rows={3}
                    value={formData.typicalDietDescription || ''}
                    onChange={e => updateField('typicalDietDescription', e.target.value)}
                  />
                </div>
              </section>
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

        {/* ================= 步骤 4: 饮食习惯（3/4）饮品频率 ================= */}
        {currentStep === 3 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">饮食习惯 (3/4)</h2>
              <p className="text-on-surface-variant text-sm mb-8">请评估您过去一个月中，下列饮品的通常摄入频率。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-3">
                {[
                  { field: 'drinkWater', label: '水' },
                  { field: 'drinkCoffee', label: '咖啡' },
                  { field: 'drinkTea', label: '茶' },
                  { field: 'drinkMilk', label: '牛奶' },
                  { field: 'drinkPlantMilk', label: '植物奶' },
                  { field: 'drinkMilkTea', label: '奶茶' },
                  { field: 'drinkSugarFree', label: '无糖饮料' },
                  { field: 'drinkSugary', label: '含糖饮料' },
                  { field: 'drinkEnergy', label: '能量饮料' },
                ].map(item => (
                  <div key={item.field} className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,30,64,0.04)]">
                    <div className="font-semibold text-on-surface text-sm mb-3">{item.label}</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {FREQ_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => updateField(item.field as keyof NutritionSurveyData, opt)}
                          className={`py-2 px-2 rounded-lg text-[10px] font-medium transition-all text-center leading-tight ${
                            formData[item.field as keyof NutritionSurveyData] === opt
                              ? 'bg-primary text-white'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {/* 其他输入框 */}
                <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,30,64,0.04)]">
                  <div className="font-semibold text-on-surface text-sm mb-3">其他</div>
                  <input
                    className="w-full bg-surface-container border-none rounded-lg py-2.5 px-3 text-xs text-on-surface placeholder:text-outline-variant focus:ring-1 focus:ring-secondary focus:bg-white transition-all"
                    placeholder="请输入具体说明..."
                    type="text"
                    value={formData.drinkOther || ''}
                    onChange={e => updateField('drinkOther', e.target.value)}
                  />
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

        {/* ================= 步骤 5: 饮食习惯（4/4） ================= */}
        {currentStep === 4 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">饮食习惯 (4/4)</h2>
              <p className="text-on-surface-variant text-sm mb-8">继续了解您的饮食习惯细节。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                {/* Question 10: 高盐出汗 */}
                <section className="bg-surface-container-low rounded-xl p-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)] mb-4">
              <div className="flex items-start gap-3">
                <span className="font-headline font-extrabold text-primary/20 text-2xl leading-none">10</span>
                <div className="space-y-2 flex-1">
                  <h2 className="font-headline font-bold text-primary text-base leading-snug">您觉得自己是出汗含盐量高的人吗？</h2>
                  <p className="text-on-surface-variant text-xs leading-relaxed opacity-80">*通常，如果您的皮肤在出汗后感觉有粘性，或者汗干后留下白色的盐渍痕迹，这可能表明您出汗的含盐量较高。</p>
                  <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl mt-3">
                    {['是', '否'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField('highSaltSweat', opt)}
                        className={`flex items-center justify-center py-3 rounded-xl transition-all ${
                          formData.highSaltSweat === opt
                            ? 'bg-primary text-white'
                            : 'hover:bg-surface-container'
                        }`}
                      >
                        <span className={`text-xs font-medium text-center leading-tight ${formData.highSaltSweat === opt ? 'text-white' : 'text-outline'}`}>
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            {/* Question 11: 饮食满意度 */}
            <section className="bg-surface-container-low rounded-xl p-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)] mb-4">
              <div className="flex items-start gap-3">
                <span className="font-headline font-extrabold text-primary/20 text-2xl leading-none">11</span>
                <div className="space-y-3 w-full">
                  <h2 className="font-headline font-bold text-primary text-base leading-snug">您对目前的饮食习惯满意吗？</h2>
                  <div className="grid grid-cols-5 gap-1 bg-white p-1 rounded-xl">
                    {['非常满意', '较满意', '中立', '不太满意', '不满意'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField('dietSatisfaction', opt)}
                        className={`flex items-center justify-center py-3 px-1 rounded-xl transition-all ${
                          formData.dietSatisfaction === opt
                            ? 'bg-primary text-white'
                            : 'hover:bg-surface-container'
                        }`}
                      >
                        <span className={`text-[10px] font-medium text-center leading-tight ${formData.dietSatisfaction === opt ? 'text-white' : 'text-outline'}`}>
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            {/* 运动习惯卡片 */}
            <section className="bg-primary-container rounded-xl p-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-on-primary-container">directions_run</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">开始</span>
                  <h3 className="text-on-primary-container font-headline font-bold text-xs">运动习惯评估</h3>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-headline font-extrabold text-on-primary-container/30 text-2xl leading-none">01</span>
                  <div className="space-y-3 w-full">
                    <h2 className="font-headline font-bold text-on-primary-container text-base leading-snug">请评估您当前的运动水平：</h2>
                    <div className="space-y-2">
                      {[
                        { label: '高活动量', desc: '每天进行高强度的体育活动或参与竞技类运动，运动强度和持续时间较长。' },
                        { label: '中高活动量', desc: '每周至少进行三次高强度的身体活动，例如跑步、快速骑行或高强度有氧运动。' },
                        { label: '中等活动量', desc: '每周进行一次或多次中等强度的运动，例如快步走、适度骑行等。' },
                        { label: '轻度活动量', desc: '偶尔进行轻度的运动，例如散步、轻度园艺工作或缓和的瑜伽。' },
                        { label: '日常活动量', desc: '主要进行日常生活中的活动，未进行专门的身体锻炼。' },
                      ].map(opt => (
                        <label key={opt.label} className="block cursor-pointer group">
                          <div className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <input
                              className="w-5 h-5 rounded-full text-secondary border-none bg-surface-container-highest focus:ring-secondary mt-1 flex-shrink-0"
                              type="radio"
                              name="exerciseLevel"
                              checked={formData.exerciseLevel === opt.label}
                              onChange={() => updateField('exerciseLevel', opt.label)}
                            />
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-white">{opt.label}</p>
                              <p className="text-[11px] text-on-primary-container/80 leading-relaxed">{opt.desc}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
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

        {/* ================= 步骤 6: 运动习惯（1/2） ================= */}
        {currentStep === 5 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">运动习惯 (1/2)</h2>
              <p className="text-on-surface-variant text-sm mb-8">了解您的运动习惯，帮助我们评估您的能量消耗。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
            {/* Question 2: 运动类型 */}
            <section className="bg-surface-container-low rounded-xl p-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)] mb-4">
              <h2 className="text-sm font-bold text-primary mb-3 flex items-start gap-2">
                <span className="w-1.5 h-4 bg-secondary rounded-full shrink-0 mt-0.5" />
                <span>2. 您通常进行哪些类型的运动？(请勾选所有适用项)</span>
              </h2>
              <div className="space-y-2">
                {[
                  { label: '有氧运动（例如：跑步、游泳、骑自行车等）' },
                  { label: '力量训练（例如：举重、阻力训练等）' },
                  { label: '柔韧性训练（例如：瑜伽、普拉提等）' },
                  { label: '团队运动（例如：足球、篮球、羽毛球等）' },
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest hover:bg-white transition-colors cursor-pointer">
                    <input
                      className="w-4 h-4 rounded text-secondary border-none bg-surface-container-highest focus:ring-secondary"
                      type="checkbox"
                      checked={((formData.exerciseTypes as string[]) || []).includes(opt.label)}
                      onChange={() => toggleArray('exerciseTypes', opt.label)}
                    />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>
            {/* Question 3: 运动时长 */}
            <section className="bg-surface-container-low rounded-xl p-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)] mb-4">
              <h2 className="text-sm font-bold text-primary mb-3 flex items-start gap-2">
                <span className="w-1.5 h-4 bg-secondary rounded-full shrink-0 mt-0.5" />
                <span>3. 您每次运动的时长通常是多少？</span>
              </h2>
              <div className="space-y-2">
                {['少于 30 分钟', '30 分钟至 1 小时', '1 至 2 小时', '2 小时以上'].map(opt => (
                  <label key={opt} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest cursor-pointer group">
                    <span className="text-xs font-medium">{opt}</span>
                    <input
                      className="w-4 h-4 text-secondary border-none bg-surface-container-highest focus:ring-secondary"
                      type="radio"
                      name="exerciseDuration"
                      checked={formData.exerciseDuration === opt}
                      onChange={() => updateField('exerciseDuration', opt)}
                    />
                  </label>
                ))}
              </div>
            </section>
            {/* Question 4: 运动频率 */}
            <section className="bg-surface-container-low rounded-xl p-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)] mb-4">
              <h2 className="text-sm font-bold text-primary mb-3 flex items-start gap-2">
                <span className="w-1.5 h-4 bg-secondary rounded-full shrink-0 mt-0.5" />
                <span>4. 您每周运动的频率大概是多少？</span>
              </h2>
              <div className="flex gap-2">
                {['每周 1-2 次', '每周 3-4 次', '每周 5 次或以上'].map(opt => (
                  <label key={opt} className="flex-1 text-center py-3 px-1 rounded-lg bg-surface-container-lowest cursor-pointer border border-transparent has-[:checked]:border-secondary has-[:checked]:bg-blue-50 transition-all">
                    <input
                      className="hidden"
                      type="radio"
                      name="exerciseFrequency"
                      checked={formData.exerciseFrequency === opt}
                      onChange={() => updateField('exerciseFrequency', opt)}
                    />
                    <span className="text-xs font-semibold block">{opt}</span>
                  </label>
                ))}
              </div>
            </section>
            {/* Question 5: 运动时间 */}
            <section className="bg-surface-container-low rounded-xl p-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)] mb-4">
              <h2 className="text-sm font-bold text-primary mb-3 flex items-start gap-2">
                <span className="w-1.5 h-4 bg-secondary rounded-full shrink-0 mt-0.5" />
                <span>5. 您主要在什么时间段进行运动？</span>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '早上', icon: 'light_mode' },
                  { label: '下午', icon: 'wb_sunny' },
                  { label: '晚上', icon: 'dark_mode' },
                ].map(opt => (
                  <label key={opt.label} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface-container-lowest cursor-pointer border border-transparent has-[:checked]:bg-blue-50 has-[:checked]:border-secondary transition-all">
                    <input
                      className="hidden"
                      type="radio"
                      name="exerciseTime"
                      checked={formData.exerciseTime === opt.label}
                      onChange={() => updateField('exerciseTime', opt.label)}
                    />
                    <span className="material-symbols-outlined text-secondary">{opt.icon}</span>
                    <span className="text-xs font-bold">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>
            {/* Question 6: 运动激励 */}
            <section className="bg-surface-container-low rounded-xl p-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)]">
              <h2 className="text-sm font-bold text-primary mb-3 flex items-start gap-2">
                <span className="w-1.5 h-4 bg-secondary rounded-full shrink-0 mt-0.5" />
                <span>6. 是什么激励您保持运动？</span>
              </h2>
              <textarea
                className="w-full text-xs p-4 bg-surface-container-lowest border-none rounded-xl focus:ring-1 focus:ring-secondary/30 transition-all outline-none resize-none"
                placeholder="请在此输入您的激励因素..."
                rows={4}
                value={formData.exerciseMotivation || ''}
                onChange={e => updateField('exerciseMotivation', e.target.value)}
              />
            </section>
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

        {/* ================= 步骤 7: 运动习惯（2/2） ================= */}
        {currentStep === 6 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">运动习惯 (2/2)</h2>
              <p className="text-on-surface-variant text-sm mb-8">继续了解您的运动习惯细节。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                {/* <section>
                  <h2 className="text-3xl font-headline font-extrabold text-primary leading-tight mb-4">04 运动习惯（2/2）</h2>
                  <p className="text-on-surface-variant leading-relaxed"><br /></p>
                </section> */}
            {/* Question 7 */}
            <div className="mb-10 bg-surface-container-low rounded-xl p-6 shadow-[0_8px_24px_rgba(0,30,64,0.06)]">
              <label className="block text-sm font-semibold text-primary mb-3">7. 您在保持规律运动方面面临的最大挑战或障碍是什么？</label>
              <p className="text-xs text-on-surface-variant mb-4 opacity-70">（例如：时间不足、体力不足、健康问题等）</p>
              <textarea
                className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant resize-none"
                placeholder="在此输入您的详细情况..."
                rows={3}
                value={formData.exerciseChallenges || ''}
                onChange={e => updateField('exerciseChallenges', e.target.value)}
              />
            </div>
            {/* Question 8 */}
            <div className="mb-10 bg-surface-container-low rounded-xl p-6 shadow-[0_8px_24px_rgba(0,30,64,0.06)]">
              <label className="block text-sm font-semibold text-primary mb-3">8. 您是否有特定的运动目标？</label>
              <p className="text-xs text-on-surface-variant mb-4 opacity-70">（例如：减肥、增肌、提升耐力等）</p>
              <textarea
                className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant resize-none"
                placeholder="例如：我希望在三个月内通过增加力量训练来减少5%的体脂..."
                rows={3}
                value={formData.exerciseGoals || ''}
                onChange={e => updateField('exerciseGoals', e.target.value)}
              />
            </div>
            {/* Question 9 & Follow-up */}
            <div className="mb-10 bg-surface-container-low rounded-xl p-6 shadow-[0_8px_24px_rgba(0,30,64,0.06)]">
              <label className="block text-sm font-semibold text-primary mb-6">9. 您是否与他人一起运动？</label>
              <div className="flex gap-4 mb-8">
                {['是', '否'].map(opt => (
                  <label key={opt} className="flex-1 group cursor-pointer">
                    <input
                      className="hidden peer"
                      type="radio"
                      name="hasExercisePartner"
                      checked={formData.hasExercisePartner === opt}
                      onChange={() => updateField('hasExercisePartner', opt)}
                    />
                    <div className="w-full py-4 text-center rounded-xl bg-surface-container-highest text-on-surface peer-checked:bg-primary peer-checked:text-white transition-all duration-200">
                      {opt}
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 pt-6 border-t border-white/40">
                <label className="block text-xs font-semibold text-primary mb-3 opacity-80">如果是，通常是和谁一起？</label>
                <input
                  className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant"
                  placeholder="例如：朋友、家人、运动伙伴、教练等"
                  type="text"
                  value={formData.exercisePartnerDetail || ''}
                  onChange={e => updateField('exercisePartnerDetail', e.target.value)}
                />
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

        {/* ================= 步骤 8: 生活方式（1/2） ================= */}
        {currentStep === 7 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">生活方式 (1/2)</h2>
              <p className="text-on-surface-variant text-sm mb-8">了解您的生活方式，帮助我们全面评估您的健康状况。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                <form className="space-y-8">
              {/* Question 1: Stress Level */}
              <div className="space-y-4">
                <label className="text-lg font-headline font-bold text-primary block">1. 请评估您当前的压力水平：</label>
                <div className="bg-surface-container-low rounded-xl p-2 space-y-1">
                  {[
                    '无：没有感到任何压力',
                    '轻微：感受到轻微的压力，但对日常活动影响不大',
                    '一般：偶尔感到压力，能够较好地应对',
                    '相当大：经常感到压力，对工作和生活有一定影响',
                    '无法忍受：压力非常大，已经严重影响生活和工作',
                  ].map(opt => (
                    <label key={opt} className="flex p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group items-start">
                      <input
                        className="w-5 h-5 text-secondary border-none bg-surface-container-highest focus:ring-secondary mt-0.5"
                        type="radio"
                        name="stressLevel"
                        checked={formData.stressLevel === opt.split('：')[0]}
                        onChange={() => updateField('stressLevel', opt.split('：')[0])}
                      />
                      <span className="ml-3 text-on-surface font-medium text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Question 2: Smoking */}
              <div className="space-y-4">
                <label className="text-lg font-headline font-bold text-primary block">2. 您是否吸烟？</label>
                <div className="flex gap-4">
                  {['是', '否'].map(opt => (
                    <label key={opt} className="flex-1 bg-surface-container-low p-4 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                      <input
                        className="w-5 h-5 text-secondary border-none bg-surface-container-highest"
                        type="radio"
                        name="isSmoker"
                        checked={formData.isSmoker === opt}
                        onChange={() => updateField('isSmoker', opt)}
                      />
                      <span className="ml-2 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
                <div className="bg-surface-container-low p-5 rounded-xl space-y-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)]">
                  <p className="text-sm font-medium text-on-surface-variant">如果是，每天几支烟？持续多长时间？</p>
                  <input
                    className="w-full bg-surface-container-highest border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline"
                    placeholder="例如：10支/天，持续5年"
                    type="text"
                    value={formData.smokingDetail || ''}
                    onChange={e => updateField('smokingDetail', e.target.value)}
                  />
                </div>
              </div>
              {/* Question 3: Alcohol */}
              <div className="space-y-4">
                <label className="text-lg font-headline font-bold text-primary block">3. 您是否饮酒？</label>
                <div className="flex gap-4">
                  {['是', '否'].map(opt => (
                    <label key={opt} className="flex-1 bg-surface-container-low p-4 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                      <input
                        className="w-5 h-5 text-secondary border-none bg-surface-container-highest"
                        type="radio"
                        name="isDrinker"
                        checked={formData.isDrinker === opt}
                        onChange={() => updateField('isDrinker', opt)}
                      />
                      <span className="ml-2 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
                <div className="bg-surface-container-low p-5 rounded-xl space-y-4 shadow-[0_8px_24px_rgba(0,30,64,0.06)]">
                  <p className="text-sm font-medium text-on-surface-variant">如果是，您每周饮酒几次？通常饮用哪种酒类？每次饮用的量是多少？</p>
                  <input
                    className="w-full bg-surface-container-highest border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline"
                    placeholder="次数、酒类与饮用量详情"
                    type="text"
                    value={formData.drinkingDetail || ''}
                    onChange={e => updateField('drinkingDetail', e.target.value)}
                  />
                </div>
              </div>
              {/* Question 4: Sleep Schedule */}
              <div className="space-y-4">
                <label className="text-lg font-headline font-bold text-primary block">4. 您平时工作日：</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-secondary tracking-widest uppercase">起床时间</span>
                    <input
                      className="w-full bg-transparent border-none p-0 text-xl font-bold text-primary focus:ring-0"
                      type="time"
                      value={formData.weekdayWakeTime || ''}
                      onChange={e => updateField('weekdayWakeTime', e.target.value)}
                    />
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-secondary tracking-widest uppercase">睡觉时间</span>
                    <input
                      className="w-full bg-transparent border-none p-0 text-xl font-bold text-primary focus:ring-0"
                      type="time"
                      value={formData.weekdaySleepTime || ''}
                      onChange={e => updateField('weekdaySleepTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Question 5: Morning State */}
              <div className="space-y-4">
                <label className="text-lg font-headline font-bold text-primary block">5. 您起床时感觉精神状态如何？</label>
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary/20 placeholder:text-outline"
                  placeholder="请描述您清晨的感受，例如：清醒、疲倦或头痛..."
                  rows={3}
                  value={formData.morningState || ''}
                  onChange={e => updateField('morningState', e.target.value)}
                />
              </div>
              {/* Question 6: Screen Time */}
              <div className="space-y-4">
                <label className="text-lg font-headline font-bold text-primary block">6. 您每天花多少时间：</label>
                <div className="bg-surface-container-low rounded-xl divide-y-2 divide-surface">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-secondary mr-3">tv</span>
                      <span className="font-medium">看电视</span>
                    </div>
                    <input
                      className="w-24 bg-surface-container-highest border-none rounded-lg p-2 text-right text-sm focus:ring-secondary"
                      placeholder="小时/分"
                      type="text"
                      value={formData.screenTimeTv || ''}
                      onChange={e => updateField('screenTimeTv', e.target.value)}
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-secondary mr-3">menu_book</span>
                      <span className="font-medium">阅读</span>
                    </div>
                    <input
                      className="w-24 bg-surface-container-highest border-none rounded-lg p-2 text-right text-sm focus:ring-secondary"
                      placeholder="小时/分"
                      type="text"
                      value={formData.screenTimeReading || ''}
                      onChange={e => updateField('screenTimeReading', e.target.value)}
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-secondary mr-3">devices</span>
                      <span className="font-medium">使用电子屏幕</span>
                    </div>
                    <input
                      className="w-24 bg-surface-container-highest border-none rounded-lg p-2 text-right text-sm focus:ring-secondary"
                      placeholder="小时/分"
                      type="text"
                      value={formData.screenTimeElectronics || ''}
                      onChange={e => updateField('screenTimeElectronics', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              </form>
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

        {/* ================= 步骤 9: 生活方式（2/2） ================= */}
        {currentStep === 8 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">生活方式 (2/2)</h2>
              <p className="text-on-surface-variant text-sm mb-8">继续了解您的生活方式细节。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
            {/* Questionnaire Options */}
            <div className="space-y-2 mb-8">
              {[
                { label: '朋友聚会', desc: '例如: 定期的晚餐、咖啡或娱乐活动' },
                { label: '家庭聚餐或家庭活动', desc: '' },
                { label: '体育活动', desc: '例如: 健身、足球、篮球、瑜伽等' },
                { label: '社区活动或志愿者服务', desc: '' },
                { label: '兴趣小组或俱乐部', desc: '例如: 读书会、摄影俱乐部等' },
                { label: '公司或职业社交活动', desc: '例如: 商务聚餐、团队建设活动' },
              ].map(opt => (
                <label key={opt.label} className="group flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer transition-all hover:bg-surface-container-high active:scale-[0.99]">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      className="peer h-5 w-5 rounded border-outline-variant bg-surface-container-lowest text-secondary focus:ring-secondary/20 transition-colors"
                      type="checkbox"
                      checked={((formData.socialActivities as string[]) || []).includes(opt.label)}
                      onChange={() => toggleArray('socialActivities', opt.label)}
                    />
                  </div>
                  <div className="flex-grow">
                    <span className="font-semibold text-primary block text-sm mb-0.5">{opt.label}</span>
                    {opt.desc && <span className="text-xs text-on-surface-variant leading-tight">{opt.desc}</span>}
                  </div>
                </label>
              ))}
              {/* Other */}
              <div className="group flex flex-col gap-2 p-3.5 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container-high">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      className="peer h-5 w-5 rounded border-outline-variant bg-surface-container-lowest text-secondary focus:ring-secondary/20 transition-colors"
                      type="checkbox"
                      checked={((formData.socialActivities as string[]) || []).includes('其他')}
                      onChange={() => toggleArray('socialActivities', '其他')}
                    />
                  </div>
                  <span className="font-semibold text-primary text-sm">其他 (请说明)</span>
                </label>
                <input
                  className="ml-8 bg-surface-container-lowest border-none rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-secondary-container placeholder-on-surface-variant/30"
                  placeholder="请输入具体活动内容..."
                  type="text"
                  value={formData.socialActivitiesOther || ''}
                  onChange={e => updateField('socialActivitiesOther', e.target.value)}
                />
              </div>
            </div>
            {/* Feedback Section */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-secondary-container rounded-full" />
                <h3 className="font-headline text-lg font-bold text-primary">其他反馈</h3>
              </div>
              <div className="rounded-xl bg-surface-container-low p-0.5 shadow-[0_4px_16px_rgba(0,30,64,0.04)] transition-all focus-within:ring-2 focus-within:ring-secondary-container/20">
                <textarea
                  className="w-full bg-surface-container-lowest border-none rounded-[10px] p-4 text-sm text-on-surface leading-relaxed resize-none focus:ring-0 placeholder-on-surface-variant/30"
                  placeholder="您还有其他想与营养师分享的信息或反馈吗？"
                  rows={3}
                  value={formData.otherFeedback || ''}
                  onChange={e => updateField('otherFeedback', e.target.value)}
                />
              </div>
            </section>
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

        {/* ================= 步骤 10: 饮食频率（1/3）谷薯与水果 ================= */}
        {currentStep === 9 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">饮食频率 (1/3)</h2>
              <p className="text-on-surface-variant text-sm mb-8">谷薯与水果</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                <div className="space-y-12">
              {/* Category: Grains */}
              <div className="bg-surface-container-low rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <h3 className="font-headline font-bold text-xl text-primary mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-secondary rounded-full" />
                  谷物类
                </h3>
                <div className="space-y-8">
                  {[
                    { field: 'freqRice', label: '米饭' },
                    { field: 'freqNoodlesBread', label: '面条、面包等小麦制品' },
                    { field: 'freqWholeGrains', label: '燕麦、全麦面包等全谷物制品' },
                  ].map(item => (
                    <div key={item.field} className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="font-medium text-on-surface">{item.label}</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1 bg-surface-container-lowest rounded-2xl p-1 shadow-sm">
                        {FREQ_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateField(item.field as keyof NutritionSurveyData, opt)}
                            className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all ${
                              formData[item.field as keyof NutritionSurveyData] === opt
                                ? 'bg-primary text-white shadow-md'
                                : 'hover:bg-surface-container'
                            }`}
                          >
                            <span className={`text-[10px] font-medium text-center leading-tight ${formData[item.field as keyof NutritionSurveyData] === opt ? 'text-white' : 'text-outline'}`}>
                              {opt}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Category: Fruits */}
              <div className="bg-surface-container-low rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <h3 className="font-headline font-bold text-xl text-primary mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-secondary rounded-full" />
                  水果类
                </h3>
                <div className="space-y-8">
                  {[
                    { field: 'freqFreshFruit', label: '新鲜水果' },
                    { field: 'freqFruitJuice', label: '果汁' },
                    { field: 'freqDriedFruit', label: '果干' },
                  ].map(item => (
                    <div key={item.field} className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="font-medium text-on-surface">{item.label}</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1 bg-surface-container-lowest rounded-2xl p-1 shadow-sm">
                        {FREQ_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateField(item.field as keyof NutritionSurveyData, opt)}
                            className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all ${
                              formData[item.field as keyof NutritionSurveyData] === opt
                                ? 'bg-primary text-white shadow-md'
                                : 'hover:bg-surface-container'
                            }`}
                          >
                            <span className={`text-[10px] font-medium text-center leading-tight ${formData[item.field as keyof NutritionSurveyData] === opt ? 'text-white' : 'text-outline'}`}>
                              {opt}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
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
          </div>
        )}

        {/* ================= 步骤 11: 饮食频率（2/3）蔬菜与蛋白质 ================= */}
        {currentStep === 10 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">饮食频率 (2/3)</h2>
              <p className="text-on-surface-variant text-sm mb-8">蔬菜、蛋白质与海鲜</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                <div className="bg-surface-container-low rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-12 space-y-10">
                  {/* Vegetables Section */}
                  <section>
                    <h3 className="font-headline font-bold text-xl text-primary mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-secondary rounded-full" />
                      蔬菜类
                    </h3>
                <div className="space-y-6">
                  {[
                    { field: 'freqLeafyVegetables', label: '绿叶蔬菜', sub: '(菠菜、生菜等)' },
                    { field: 'freqStarchyVegetables', label: '淀粉类蔬菜', sub: '(土豆、玉米、豌豆)' },
                    { field: 'freqOtherVegetables', label: '其他蔬菜', sub: '(胡萝卜、辣椒等)' },
                  ].map(item => (
                    <div key={item.field} className="space-y-2">
                      <p className="text-sm font-medium text-on-surface px-1">
                        {item.label} <span className="text-[10px] text-outline font-normal ml-1">{item.sub}</span>
                      </p>
                      <div className="grid grid-cols-6 gap-1 bg-surface-container-lowest rounded-2xl p-1">
                        {FREQ_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateField(item.field as keyof NutritionSurveyData, opt)}
                            className={`flex items-center justify-center py-2.5 rounded-xl transition-colors ${
                              formData[item.field as keyof NutritionSurveyData] === opt
                                ? 'bg-primary text-white'
                                : 'hover:bg-surface-container'
                            }`}
                          >
                            <span className={`text-[9px] text-center leading-tight ${formData[item.field as keyof NutritionSurveyData] === opt ? 'text-white font-bold' : 'text-outline'}`}>
                              {opt}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              {/* Proteins Section */}
              <section>
                <h3 className="font-headline font-bold text-xl text-primary mb-6 flex items-center gap-2 border-t border-outline-variant pt-8">
                  <span className="w-1.5 h-6 bg-secondary rounded-full" />
                  蛋白质类
                </h3>
                <div className="space-y-6">
                  {[
                    { field: 'freqEggs', label: '鸡蛋', sub: '' },
                    { field: 'freqPoultry', label: '家禽', sub: '(鸡、鸭、火鸡)' },
                    { field: 'freqFishSeafood', label: '鱼类和海鲜', sub: '' },
                    { field: 'freqBeansSoy', label: '豆类 / 大豆', sub: '' },
                    { field: 'freqRedMeat', label: '红肉', sub: '(牛、猪、羊等)' },
                  ].map(item => (
                    <div key={item.field} className="space-y-2">
                      <p className="text-sm font-medium text-on-surface px-1">
                        {item.label} {item.sub && <span className="text-[10px] text-outline font-normal ml-1">{item.sub}</span>}
                      </p>
                      <div className="grid grid-cols-6 gap-1 bg-surface-container-lowest rounded-2xl p-1">
                        {FREQ_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateField(item.field as keyof NutritionSurveyData, opt)}
                            className={`flex items-center justify-center py-2.5 rounded-xl transition-colors ${
                              formData[item.field as keyof NutritionSurveyData] === opt
                                ? 'bg-primary text-white'
                                : 'hover:bg-surface-container'
                            }`}
                          >
                            <span className={`text-[9px] text-center leading-tight ${formData[item.field as keyof NutritionSurveyData] === opt ? 'text-white font-bold' : 'text-outline'}`}>
                              {opt}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
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
          </div>
        )}

        {/* ================= 步骤 12: 饮食频率（3/3）乳制品与零食 ================= */}
        {currentStep === 11 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">饮食频率 (3/3)</h2>
              <p className="text-on-surface-variant text-sm mb-8">乳制品与零食</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                <div className="space-y-6">
                  {/* Category: Dairy */}
                  <div className="bg-surface-container-low rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-secondary rounded-full" />
                  乳制品及替代品
                </h2>
                <div className="space-y-8">
                  {[
                    { field: 'freqMilkDairy', label: '牛奶' },
                    { field: 'freqYogurt', label: '酸奶' },
                    { field: 'freqCheese', label: '奶酪' },
                    { field: 'freqNonDairyAlternatives', label: '非乳制品替代品', sub: '(如杏仁奶、豆奶)' },
                  ].map(item => (
                    <div key={item.field} className="space-y-3">
                      <p className="text-on-surface font-medium text-sm pl-1">
                        {item.label} {item.sub && <span className="text-outline text-[10px] font-normal">{item.sub}</span>}
                      </p>
                      <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl">
                        {FREQ_OPTIONS.slice(0, 4).map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateField(item.field as keyof NutritionSurveyData, opt)}
                            className={`flex items-center justify-center py-3 rounded-xl transition-all ${
                              formData[item.field as keyof NutritionSurveyData] === opt
                                ? 'bg-primary text-white'
                                : 'hover:bg-surface-container'
                            }`}
                          >
                            <span className={`text-[10px] font-medium text-center leading-tight ${formData[item.field as keyof NutritionSurveyData] === opt ? 'text-white' : 'text-outline'}`}>
                              {opt}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Category: Snacks */}
              <div className="bg-surface-container-low rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-secondary-container rounded-full" />
                  零食和甜食
                </h2>
                <div className="space-y-8">
                  {[
                    { field: 'freqNutsSeeds', label: '坚果和种子类' },
                    { field: 'freqCookiesCake', label: '饼干、蛋糕等甜点' },
                    { field: 'freqChocolateCandy', label: '巧克力及糖果类' },
                    { field: 'freqSaltySnacks', label: '咸味小吃', sub: '(如薯片、饼干)' },
                  ].map(item => (
                    <div key={item.field} className="space-y-3">
                      <p className="text-on-surface font-medium text-sm pl-1">
                        {item.label} {item.sub && <span className="text-outline text-[10px] font-normal">{item.sub}</span>}
                      </p>
                      <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl">
                        {FREQ_OPTIONS.slice(0, 4).map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateField(item.field as keyof NutritionSurveyData, opt)}
                            className={`flex items-center justify-center py-3 rounded-xl transition-all ${
                              formData[item.field as keyof NutritionSurveyData] === opt
                                ? 'bg-primary text-white'
                                : 'hover:bg-surface-container'
                            }`}
                          >
                            <span className={`text-[10px] font-medium text-center leading-tight ${formData[item.field as keyof NutritionSurveyData] === opt ? 'text-white' : 'text-outline'}`}>
                              {opt}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
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
          </div>
        )}

        {/* ================= 步骤 13: 期望的服务类型 ================= */}
        {currentStep === 12 && (
          <div className="px-4 pb-4">
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step {actualStep} of {totalActualSteps}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">期望的服务类型</h2>
              <p className="text-on-surface-variant text-sm mb-8">请告诉我们您期望的服务类型和个性化偏好。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                {/* 服务类型 */}
                <section className="space-y-3">
                  <h3 className="text-primary font-bold text-base">服务类型（可多选）</h3>
                  <div className="space-y-2">
                    {[
                      { value: '食谱定制', label: '食谱定制' },
                      { value: '外卖推荐', label: '外卖推荐' },
                      { value: '餐厅选择', label: '餐厅选择' },
                      { value: '代执行方案', label: '代执行方案' },
                    ].map(item => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          const current = formData.serviceTypes || [];
                          const updated = current.includes(item.value)
                            ? current.filter(v => v !== item.value)
                            : [...current, item.value];
                          updateField('serviceTypes', updated);
                        }}
                        className={`w-full py-3 px-4 rounded-xl border text-sm font-medium text-left transition-colors ${
                          (formData.serviceTypes || []).includes(item.value)
                            ? 'bg-secondary/10 border-secondary text-secondary'
                            : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{item.label}</span>
                          <span className={`material-symbols-outlined text-lg ${
                            (formData.serviceTypes || []).includes(item.value) ? 'text-secondary' : 'text-outline/40'
                          }`}>
                            {(formData.serviceTypes || []).includes(item.value) ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* 其他 */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-on-surface text-sm font-medium">其他</span>
                      <input
                        type="text"
                        className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all mt-1"
                        placeholder="请输入其他服务类型..."
                        value={formData.serviceTypesOther || ''}
                        onChange={e => updateField('serviceTypesOther', e.target.value)}
                      />
                    </label>
                  </div>
                </section>

                {/* 个性化偏好 */}
                <section className="space-y-3 pt-4 border-t border-outline-variant/10">
                  <h3 className="text-primary font-bold text-base">个性化偏好</h3>
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-outline text-xs">是否有饮食禁忌、口味、文化/宗教限制</span>
                      <textarea
                        className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-secondary/20 text-on-surface text-sm placeholder:text-outline/40 transition-all mt-1"
                        placeholder="请描述您的个性化偏好..."
                        rows={3}
                        value={formData.personalizationPreferences || ''}
                        onChange={e => updateField('personalizationPreferences', e.target.value)}
                      />
                    </label>
                  </div>
                </section>

                {/* 依从性评估 */}
                <section className="space-y-4 pt-4 border-t border-outline-variant/10">
                  <h3 className="text-primary font-bold text-base">依从性评估</h3>
                  
                  {/* 执行力评分 */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-on-surface text-sm font-medium">您对自己配合我们完成饮食营养及运动改善的执行力评分如何？</span>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-outline text-xs">1</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.complianceScore || 5}
                          onChange={e => updateField('complianceScore', Number(e.target.value))}
                          className="flex-1 h-2 bg-surface-container-low rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-outline text-xs">10</span>
                        <span className="text-secondary font-bold text-lg w-8 text-center">{formData.complianceScore || 5}</span>
                      </div>
                    </label>
                  </div>

                  {/* 反馈频率 */}
                  <div className="space-y-2">
                    <span className="text-on-surface text-sm font-medium">您希望我们对您的配合度和执行情况复盘总结的反馈频率是？</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: '每天1次', label: '每天1次' },
                        { value: '每周1次', label: '每周1次' },
                        { value: '每两周1次', label: '每两周1次' },
                        { value: '每月1次', label: '每月1次' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('feedbackFrequency', opt.value)}
                          className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                            formData.feedbackFrequency === opt.value
                              ? 'bg-secondary text-white border-secondary'
                              : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* 步骤底部按钮 - 最后一步显示提交按钮 */}
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

      {/* 文件预览弹窗 */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewFile(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
            >
              <span className="material-symbols-outlined text-on-surface text-lg">close</span>
            </button>
            {previewFile.type === 'image' && previewFile.url ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
              />
            ) : previewFile.type === 'pdf' && previewFile.url ? (
              <iframe
                src={previewFile.url}
                title={previewFile.name}
                className="w-[90vw] h-[85vh] rounded-2xl bg-white"
              />
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center min-w-[280px]">
                <span className="material-symbols-outlined text-5xl text-secondary mb-3 block">
                  {previewFile.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                </span>
                <p className="text-sm font-medium mb-1 break-all">{previewFile.name}</p>
                <p className="text-xs text-outline mb-4">{formatFileSize(previewFile.size)}</p>
                {previewFile.url ? (
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-secondary font-medium hover:opacity-80"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    下载查看
                  </a>
                ) : (
                  <p className="text-xs text-outline">暂不支持在线预览此文件类型</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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