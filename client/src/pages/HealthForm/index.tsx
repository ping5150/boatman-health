import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { submitForm2, getLatestArchive, saveDraft, updateArchive, HealthFormData } from '@/api/form2.api';
import { uploadFile } from '@/api/upload.api';
import { useUser } from '@/contexts/UserContext';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  type?: 'pdf' | 'image' | 'doc' | 'other';
}

const TOTAL_STEPS = 7;

const initialFormData = {
  name: '',
  phone: '',
  age: undefined as number | undefined,
  gender: '',
  height: undefined as number | undefined,
  weight: undefined as number | undefined,
  maxWeight: undefined as number | undefined,
  minWeight: undefined as number | undefined,
  emergencyName: '',
  emergencyPhone: '',
  diseases: [{ name: '', date: '' }],
  medications: [{ name: '', dosage: '' }],
  surgery: { has: '', detail: '' },
  allergy: { has: '', detail: '' },
  vascular: { qualified: '', reason: '' },
  familyHistory: [] as string[],
  familyHistoryOther: '',
  familyHistoryNote: '',
  dietModes: [] as string[],
  drinksOther: '',
  mealFeelingOther: '',
  brainFogOther: '',
  drinks: [] as string[],
  mealFeeling: [] as string[],
  dietRestriction: '',
  exerciseTypes: [] as string[],
  exerciseFrequency: '',
  exerciseDuration: '',
  sleepDuration: '',
  sleepQuality: '',
  wakeUpFeeling: [] as string[],
  stressLevel: 5,
  anxietyFrequency: '',
  brainFog: [] as string[],
  healthConcerns: '',
};

const HealthForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDocRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const navigate = useNavigate();
  const { user } = useUser();

  // 显示 Toast 提示
  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2500);
  }, []);

  // 校验第一步必填项
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    const name = formData.name.trim();
    const phone = formData.phone.trim();

    if (!name) {
      errors.name = '请输入姓名';
    }

    if (!phone) {
      errors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      errors.phone = '请输入正确的手机号码';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      showToast(firstError);
      return false;
    }

    return true;
  };

  // 加载已有档案数据
  useEffect(() => {
    const loadLatestArchive = async () => {
      try {
        const archive = await getLatestArchive();
        if (archive?.formData) {
          // 兼容旧数据：如果存在 emergencyContact 但不存在 emergencyName/emergencyPhone
          const oldData = archive.formData as any;
          const emergencyName = oldData.emergencyName || '';
          const emergencyPhone = oldData.emergencyPhone || '';
          
          setFormData(prev => ({
            ...prev,
            ...archive.formData,
            emergencyName,
            emergencyPhone,
            diseases: archive.formData.diseases || prev.diseases,
            medications: archive.formData.medications || prev.medications,
          }));
          setArchiveId(archive.id);

          // 反显已上传的附件
          if (archive.formData.uploadedFiles && archive.formData.uploadedFiles.length > 0) {
            setUploadedFiles(archive.formData.uploadedFiles.map(f => ({
              id: f.url || Date.now().toString() + Math.random().toString(36).slice(2, 11),
              name: f.name,
              size: f.size,
              progress: 100,
              status: 'success' as const,
              url: f.url,
              type: f.type,
            })));
          }
        } else if (user) {
          // 无已有档案时，从用户信息自动带入姓名和手机号
          setFormData(prev => ({
            ...prev,
            name: prev.name || user.username || '',
            phone: prev.phone || user.phone || '',
          }));
        }
      } catch (error) {
        console.error('加载档案失败:', error);
        // 加载失败也尝试带入用户信息
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: prev.name || user.username || '',
            phone: prev.phone || user.phone || '',
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadLatestArchive();
  }, [user]);

  // 显示保存指示器
  const showSaveIndicator = useCallback(() => {
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1500);
  }, []);

  // 保存当前步骤数据
  const handleSaveStep = async () => {
    setSaving(true);
    try {
      const partialData: Partial<HealthFormData> = { ...formData };
      
      if (archiveId) {
        await updateArchive(archiveId, partialData);
      } else {
        const result = await saveDraft(partialData);
        setArchiveId(result.data.id);
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

  // 切换步骤后滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 下一步
  const handleNextStep = async () => {
    // 第一步需要校验必填项
    if (currentStep === 0 && !validateStep1()) {
      return;
    }

    try {
      await handleSaveStep();
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(prev => prev + 1);
        scrollToTop();
      }
    } catch {
      // 错误已在 handleSaveStep 中处理
    }
  };

  // 上一步
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      scrollToTop();
    }
  };

  // 跳转到指定步骤
  const goToStep = async (index: number) => {
    if (index === currentStep) return;
    try {
      if (index > currentStep) {
        // 向前跳转需要先保存
        await handleSaveStep();
      }
      setCurrentStep(index);
      scrollToTop();
    } catch {
      // 错误已处理
    }
  };

  // 最终提交
  const handleFinalSubmit = async () => {
    setSaving(true);
    try {
      const submitData: HealthFormData = {
        ...formData,
        uploadedFiles: uploadedFiles
          .filter(f => f.status === 'success' && f.url)
          .map(f => ({
            name: f.name,
            size: f.size,
            url: f.url!,
            type: f.type || 'other',
          })),
      };

      if (archiveId) {
        // 已有档案：覆盖更新，保持档案编号不变
        await updateArchive(archiveId, submitData);
      } else {
        // 首次提交：创建新档案
        await submitForm2(submitData);
      }
      navigate('/archive-success');
    } catch (error) {
      console.error('提交失败:', error);
      showToast('提交失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 输入时清除对应字段的错误提示
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleArray = (field: string, value: string) => {
    const current = formData[field as keyof typeof formData] as string[];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateField(field, updated);
  };

  const addDisease = () => {
    updateField('diseases', [...formData.diseases, { name: '', date: '' }]);
  };

  const addMedication = () => {
    updateField('medications', [...formData.medications, { name: '', dosage: '' }]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // 文件大小校验
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
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // 调用真实上传 API
      uploadFile(file, (percent) => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: Math.min(percent, 99) } : f))
        );
      }).then((result) => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? {
            ...f,
            progress: 100,
            status: 'success' as const,
            url: result.url,
          } : f))
        );
      }).catch(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: 0, status: 'error' as const } : f))
        );
        showToast(`文件 ${file.name} 上传失败`);
      });
    });

    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  if (loading) {
    return (
      <>
        <TopBar showBack showAccount={false} />
        <main className="pt-4 pb-12 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <BottomNav />
      </>
    );
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
        <div ref={sliderRef}>
          {/* ================= 步骤 1: 基本信息 ================= */}
          <div className={`px-4 pb-4 ${currentStep !== 0 ? 'hidden' : ''}`}>
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step 1 of {TOTAL_STEPS}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">基本信息</h2>
              <p className="text-on-surface-variant text-sm mb-8">开启您的私人管家级健康资产管理。</p>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">姓名 <span className="text-error">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`w-full bg-surface border rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input transition-colors ${fieldErrors.name ? 'border-error/60 ring-1 ring-error/30' : 'border-transparent'}`}
                    placeholder="请输入姓名"
                  />
                  {fieldErrors.name && <p className="text-error text-[10px] px-1 font-medium">{fieldErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">联系电话 <span className="text-error">*</span></label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={`w-full bg-surface border rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input transition-colors ${fieldErrors.phone ? 'border-error/60 ring-1 ring-error/30' : 'border-transparent'}`}
                    placeholder="主要联系号码"
                  />
                  {fieldErrors.phone && <p className="text-error text-[10px] px-1 font-medium">{fieldErrors.phone}</p>}
                </div>
                
                {/* 年龄、性别、身高、体重 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">年龄</label>
                    <input
                      type="number"
                      value={formData.age ?? ''}
                      onChange={(e) => updateField('age', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input"
                      placeholder="岁"
                      min="0"
                      max="150"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">性别</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateField('gender', '男')}
                        className={`flex-1 py-4 rounded-2xl border text-sm font-medium transition-colors ${
                          formData.gender === '男'
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
                        }`}
                      >
                        男
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('gender', '女')}
                        className={`flex-1 py-4 rounded-2xl border text-sm font-medium transition-colors ${
                          formData.gender === '女'
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
                        }`}
                      >
                        女
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">身高</label>
                    <input
                      type="number"
                      value={formData.height ?? ''}
                      onChange={(e) => updateField('height', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input"
                      placeholder="cm"
                      min="0"
                      max="300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">当前体重</label>
                    <input
                      type="number"
                      value={formData.weight ?? ''}
                      onChange={(e) => updateField('weight', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input"
                      placeholder="kg"
                      min="0"
                      max="500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">成年后最高体重</label>
                    <input
                      type="number"
                      value={formData.maxWeight ?? ''}
                      onChange={(e) => updateField('maxWeight', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input"
                      placeholder="kg（可选）"
                      min="0"
                      max="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">成年后最低体重</label>
                    <input
                      type="number"
                      value={formData.minWeight ?? ''}
                      onChange={(e) => updateField('minWeight', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input"
                      placeholder="kg（可选）"
                      min="0"
                      max="500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">紧急联系人</label>
                  <input
                    type="text"
                    value={formData.emergencyName}
                    onChange={(e) => updateField('emergencyName', e.target.value)}
                    className="w-full bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input"
                    placeholder="紧急联系人姓名"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-headline font-bold text-primary/60 uppercase tracking-widest px-1">紧急联系人电话</label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => updateField('emergencyPhone', e.target.value)}
                    className="w-full bg-surface border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface text-sm shadow-input"
                    placeholder="紧急联系人电话"
                  />
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

          {/* ================= 步骤 2: 生理健康背景 ================= */}
          <div className={`px-4 pb-4 ${currentStep !== 1 ? 'hidden' : ''}`}>
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step 2 of {TOTAL_STEPS}
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">生理健康背景</h2>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-8">
                {/* 当前疾病 */}
                <div className="space-y-3">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">当前疾病</label>
                  <div className="space-y-3">
                    {formData.diseases.map((disease, index) => (
                      <div key={index} className="relative bg-surface rounded-xl p-4">
                        {formData.diseases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.diseases.filter((_, i) => i !== index);
                              updateField('diseases', updated);
                            }}
                            className="absolute top-2 right-2 p-1 hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
                          </button>
                        )}
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            value={disease.name}
                            onChange={(e) => {
                              const updated = [...formData.diseases];
                              updated[index].name = e.target.value;
                              updateField('diseases', updated);
                            }}
                            className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm shadow-input"
                            placeholder="诊断名称 (选填)"
                          />
                          <input
                            type="text"
                            value={disease.date}
                            onChange={(e) => {
                              const updated = [...formData.diseases];
                              updated[index].date = e.target.value;
                              updateField('diseases', updated);
                            }}
                            className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm shadow-input"
                            placeholder="确诊时间"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addDisease}
                      className="text-secondary text-xs font-bold flex items-center gap-1"
                    >
                      + 添加其他诊断
                    </button>
                  </div>
                </div>

                {/* 目前用药记录 */}
                <div className="space-y-3">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">目前用药记录</label>
                  <div className="space-y-3">
                    {formData.medications.map((med, index) => (
                      <div key={index} className="relative bg-surface rounded-xl p-4">
                        {formData.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.medications.filter((_, i) => i !== index);
                              updateField('medications', updated);
                            }}
                            className="absolute top-2 right-2 p-1 hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
                          </button>
                        )}
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => {
                              const updated = [...formData.medications];
                              updated[index].name = e.target.value;
                              updateField('medications', updated);
                            }}
                            className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm shadow-input"
                            placeholder="药物名称 (选填)"
                          />
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => {
                              const updated = [...formData.medications];
                              updated[index].dosage = e.target.value;
                              updateField('medications', updated);
                            }}
                            className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm shadow-input"
                            placeholder="剂量 / 频率"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMedication}
                      className="text-secondary text-xs font-bold flex items-center gap-1"
                    >
                      + 添加药物记录
                    </button>
                  </div>
                </div>

                {/* 既往史 */}
                <div className="space-y-3">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">既往史</label>
                  <div className="flex items-center gap-4 bg-surface p-3 rounded-xl">
                    <span className="text-xs w-12 text-on-surface-variant">手术史</span>
                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="surgery"
                        checked={formData.surgery.has === 'no'}
                        onChange={() => updateField('surgery', { ...formData.surgery, has: 'no', detail: '' })}
                        className="text-secondary"
                      />
                      无
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="surgery"
                        checked={formData.surgery.has === 'yes'}
                        onChange={() => updateField('surgery', { ...formData.surgery, has: 'yes' })}
                        className="text-secondary"
                      />
                      有
                    </label>
                  </div>
                  {formData.surgery.has === 'yes' && (
                    <input
                      type="text"
                      value={formData.surgery.detail}
                      onChange={(e) => updateField('surgery', { ...formData.surgery, detail: e.target.value })}
                      className="w-full bg-surface border-none rounded-xl p-3 text-sm shadow-input"
                      placeholder="请说明手术名称及时间..."
                    />
                  )}
                  <div className="flex items-center gap-4 bg-surface p-3 rounded-xl">
                    <span className="text-xs w-12 text-on-surface-variant">过敏史</span>
                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="allergy"
                        checked={formData.allergy.has === 'no'}
                        onChange={() => updateField('allergy', { ...formData.allergy, has: 'no', detail: '' })}
                        className="text-secondary"
                      />
                      无
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="allergy"
                        checked={formData.allergy.has === 'yes'}
                        onChange={() => updateField('allergy', { ...formData.allergy, has: 'yes' })}
                        className="text-secondary"
                      />
                      有
                    </label>
                  </div>
                  {formData.allergy.has === 'yes' && (
                    <input
                      type="text"
                      value={formData.allergy.detail}
                      onChange={(e) => updateField('allergy', { ...formData.allergy, detail: e.target.value })}
                      className="w-full bg-surface border-none rounded-xl p-3 text-sm shadow-input"
                      placeholder="请说明过敏源..."
                    />
                  )}
                </div>
              </div>

              {/* 步骤底部按钮 */}
              <div className="flex gap-3 mt-6">
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

          {/* ================= 步骤 3: 饮食模式 ================= */}
          <div className={`px-4 pb-4 ${currentStep !== 2 ? 'hidden' : ''}`}>
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step 3 of {TOTAL_STEPS} · 生活方式评估
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">饮食模式</h2>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">您平时的饮食偏好？</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['混合膳食', '地中海饮食', '轻断食', '素食'].map((mode) => (
                      <label
                        key={mode}
                        className={`flex items-center gap-2 p-3 rounded-xl text-xs cursor-pointer transition-all ${
                          formData.dietModes.includes(mode)
                            ? 'bg-secondary/10 border border-secondary/30'
                            : 'bg-surface'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.dietModes.includes(mode)}
                          onChange={() => toggleArray('dietModes', mode)}
                          className="rounded text-secondary"
                        />
                        {mode}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">常饮饮品 (多选)</label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['水', '咖啡', '茶', '酒精', '含糖饮料'].map((drink) => (
                      <label
                        key={drink}
                        className={`px-3 py-2 rounded-full flex items-center gap-1 cursor-pointer transition-all ${
                          formData.drinks.includes(drink)
                            ? 'bg-secondary/10 border border-secondary/30'
                            : 'border border-outline-variant/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.drinks.includes(drink)}
                          onChange={() => toggleArray('drinks', drink)}
                          className="rounded text-secondary w-3 h-3"
                        />
                        {drink}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-headline font-bold text-primary/60 uppercase px-1">特殊忌口</label>
                  <input
                    type="text"
                    value={formData.dietRestriction}
                    onChange={(e) => updateField('dietRestriction', e.target.value)}
                    className="w-full bg-surface border-none rounded-xl p-3 text-sm shadow-input"
                    placeholder="如有特殊饮食忌口请注明"
                  />
                </div>
              </div>

              {/* 步骤底部按钮 */}
              <div className="flex gap-3 mt-6">
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

          {/* ================= 步骤 4: 运动习惯 ================= */}
          <div className={`px-4 pb-4 ${currentStep !== 3 ? 'hidden' : ''}`}>
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step 4 of {TOTAL_STEPS} · 生活方式评估
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">运动习惯</h2>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">常做的运动类型 (多选)</label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {['球类', '跑步', '游泳', '健身房', '散步', '基本不运动'].map((sport) => (
                      <label
                        key={sport}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                          formData.exerciseTypes.includes(sport)
                            ? 'bg-secondary/10 border border-secondary/30'
                            : 'bg-surface'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.exerciseTypes.includes(sport)}
                          onChange={() => toggleArray('exerciseTypes', sport)}
                          className="rounded text-secondary"
                        />
                        {sport}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase">每周频率</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.exerciseFrequency}
                        onChange={(e) => updateField('exerciseFrequency', e.target.value)}
                        className="w-full bg-surface border-none rounded-xl p-3 text-sm shadow-input pr-10"
                        placeholder="次数"
                      />
                      <span className="absolute right-3 top-3 text-xs text-outline">次</span>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] font-headline font-bold text-primary/60 uppercase">每次时长</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.exerciseDuration}
                        onChange={(e) => updateField('exerciseDuration', e.target.value)}
                        className="w-full bg-surface border-none rounded-xl p-3 text-sm shadow-input pr-10"
                        placeholder="分钟"
                      />
                      <span className="absolute right-3 top-3 text-xs text-outline">分</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 步骤底部按钮 */}
              <div className="flex gap-3 mt-6">
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

          {/* ================= 步骤 5: 睡眠情况 ================= */}
          <div className={`px-4 pb-4 ${currentStep !== 4 ? 'hidden' : ''}`}>
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step 5 of {TOTAL_STEPS} · 生活方式评估
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">睡眠情况</h2>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">工作日平均睡眠时长</label>
                  <div className="flex flex-col gap-2 text-xs">
                    {['< 6 小时', '6-7 小时', '7-8 小时', '> 8 小时'].map((duration) => (
                      <label
                        key={duration}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          formData.sleepDuration === duration ? 'bg-secondary/10' : 'bg-surface hover:bg-surface-variant'
                        }`}
                      >
                        <input
                          type="radio"
                          name="sleepDuration"
                          checked={formData.sleepDuration === duration}
                          onChange={() => updateField('sleepDuration', duration)}
                          className="text-secondary w-4 h-4"
                        />
                        {duration}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">入睡质量评估</label>
                  <div className="flex flex-col gap-2 text-xs">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        formData.sleepQuality === 'good' ? 'bg-secondary/10' : 'bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sleepQuality"
                        checked={formData.sleepQuality === 'good'}
                        onChange={() => updateField('sleepQuality', 'good')}
                        className="text-secondary w-4 h-4 mt-0.5"
                      />
                      <span className="leading-relaxed">很快入睡，夜间少醒</span>
                    </label>
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        formData.sleepQuality === 'mid' ? 'bg-secondary/10' : 'bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sleepQuality"
                        checked={formData.sleepQuality === 'mid'}
                        onChange={() => updateField('sleepQuality', 'mid')}
                        className="text-secondary w-4 h-4 mt-0.5"
                      />
                      <span className="leading-relaxed">需15-30分钟，或易醒但能再入睡</span>
                    </label>
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        formData.sleepQuality === 'bad' ? 'bg-secondary/10' : 'bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sleepQuality"
                        checked={formData.sleepQuality === 'bad'}
                        onChange={() => updateField('sleepQuality', 'bad')}
                        className="text-secondary w-4 h-4 mt-0.5"
                      />
                      <span className="leading-relaxed">入睡困难，多醒且难入睡</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 步骤底部按钮 */}
              <div className="flex gap-3 mt-6">
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

          {/* ================= 步骤 6: 压力与情绪 ================= */}
          <div className={`px-4 pb-4 ${currentStep !== 5 ? 'hidden' : ''}`}>
            <div className="max-w-md mx-auto pt-2">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step 6 of {TOTAL_STEPS} · 生活方式评估
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">情绪与压力</h2>

              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5 space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">主观压力水平 (1最轻松，10最紧绷)</label>
                  <div className="bg-surface p-4 rounded-2xl shadow-input">
                    <div className="flex justify-between text-[10px] text-outline mb-2 font-bold">
                      <span>1</span>
                      <span className="text-primary font-bold">{formData.stressLevel}</span>
                      <span>10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.stressLevel}
                      onChange={(e) => updateField('stressLevel', parseInt(e.target.value))}
                      className="w-full accent-secondary"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-headline font-bold text-primary uppercase block">是否有以下表现？(多选)</label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {['记忆力下降', '注意力不集中', '思维迟缓', '情绪易波动'].map((symptom) => (
                      <label
                        key={symptom}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                          formData.brainFog.includes(symptom) ? 'bg-secondary/10 border border-secondary/30' : 'bg-surface'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.brainFog.includes(symptom)}
                          onChange={() => toggleArray('brainFog', symptom)}
                          className="rounded text-secondary"
                        />
                        {symptom}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 步骤底部按钮 */}
              <div className="flex gap-3 mt-6">
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

          {/* ================= 步骤 7: 诉求与附件 ================= */}
          <div className={`px-4 pb-4 ${currentStep !== 6 ? 'hidden' : ''}`}>
            <div className="max-w-md mx-auto pt-2 pb-4">
              <span className="text-secondary font-headline font-bold tracking-widest uppercase text-[10px] mb-2 block">
                Step 7 of {TOTAL_STEPS} · 诉求与资料
              </span>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-6">体检诉求与附件</h2>

              <div className="space-y-6">
                {/* 诉求输入 */}
                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5">
                  <label className="text-xs font-headline font-bold text-primary uppercase block mb-3">体检疑问 / 诉求</label>
                  <textarea
                    value={formData.healthConcerns}
                    onChange={(e) => updateField('healthConcerns', e.target.value)}
                    className="w-full bg-surface border-none rounded-2xl p-4 text-sm shadow-input resize-none"
                    placeholder="请描述您最关注的健康问题，以便我们为您匹配专家..."
                    rows={4}
                  />
                </div>

                {/* 上传附件 */}
                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-editorial border border-outline-variant/5">
                  <label className="text-xs font-headline font-bold text-primary uppercase block mb-3">上传近3年体检报告或其他相关检查报告（非必填）</label>
                  <div className="flex gap-3">
                    {/* 上传图片 */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center flex-1 h-28 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface cursor-pointer hover:bg-surface-variant transition"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <span className="material-symbols-outlined text-2xl text-secondary mb-1">image</span>
                      <p className="text-[10px] text-outline">上传图片</p>
                      <p className="text-[9px] text-outline/60 mt-0.5">JPG / PNG / WebP</p>
                    </div>
                    {/* 上传文件 */}
                    <div
                      onClick={() => fileDocRef.current?.click()}
                      className="flex flex-col items-center justify-center flex-1 h-28 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface cursor-pointer hover:bg-surface-variant transition"
                    >
                      <input
                        ref={fileDocRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <span className="material-symbols-outlined text-2xl text-secondary mb-1">upload_file</span>
                      <p className="text-[10px] text-outline">上传文件</p>
                      <p className="text-[9px] text-outline/60 mt-0.5">PDF / Word / Excel</p>
                    </div>
                  </div>

                  {/* 已上传文件列表 */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center gap-3 p-2.5 bg-surface rounded-xl border border-outline-variant/10">
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
                              onClick={() => removeFile(file.id)}
                              className="p-1 hover:bg-error/10 rounded"
                            >
                              <span className="material-symbols-outlined text-on-surface-variant text-sm">close</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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

                {/* 隐私承诺卡片 */}
                <div className="bg-primary p-5 rounded-3xl shadow-editorial flex items-start gap-4 text-white">
                  <span
                    className="material-symbols-outlined text-secondary-container text-2xl"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    security
                  </span>
                  <div>
                    <h3 className="text-white/70 font-headline font-bold text-sm mb-1">隐私与独立视角承诺</h3>
                    <p className="text-white/70 text-[10px] leading-relaxed">
                      您的信息均受管家级加密保护。坚持第三方立场，剔除利益干扰，还原医学逻辑。
                    </p>
                  </div>
                </div>

                {/* 步骤底部按钮 */}
                <div className="flex gap-3 pt-4 pb-10">
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
                    className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-sm hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? '提交中...' : '完成并提交'}
                    {!saving && <span className="material-symbols-outlined text-lg">check_circle</span>}
                  </button>
                </div>
                <p className="text-center text-[9px] text-outline mt-4 uppercase tracking-widest font-label">
                  Official Boatman Stewardship
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 固定底部：步骤指示点 */}
      <footer className="fixed bottom-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/10 z-40">
        <div className="px-4 py-3 flex items-center justify-center max-w-md mx-auto">
          {/* 步骤指示点 */}
          <div className="flex gap-2 items-center">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`transition-all duration-300 cursor-pointer ${
                  i === currentStep
                    ? 'w-4 h-2 rounded-full bg-primary'
                    : 'w-2 h-2 rounded-full bg-outline-variant/40 hover:bg-outline-variant/60'
                }`}
              />
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .editorial-shadow { box-shadow: 0 8px 32px rgba(0, 30, 64, 0.08); }
        .shadow-input { box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05); }
      `}</style>

      {/* Toast 提示 */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] animate-toast-in">
          <div
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg backdrop-blur-xl text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-error/90 text-white'
                : 'bg-secondary/90 text-white'
            }`}
          >
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
        .animate-toast-in {
          animation: toast-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HealthForm;
