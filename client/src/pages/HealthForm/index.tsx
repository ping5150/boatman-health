import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { submitForm2, HealthFormData } from '@/api/form2.api';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

const HealthForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
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
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData: HealthFormData = {
        ...formData,
        uploadedFiles: uploadedFiles.map(f => ({
          name: f.name,
          size: f.size,
          url: f.id, // 实际应该是上传后的 URL
          type: f.name.endsWith('.pdf') ? 'pdf' :
                /\.(jpg|jpeg|png|gif)$/i.test(f.name) ? 'image' :
                /\.(doc|docx)$/i.test(f.name) ? 'doc' : 'other',
        })),
      };

      await submitForm2(submitData);
      navigate('/archive-success');
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const fileId = Date.now().toString() + Math.random().toString(36).slice(2, 11);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading',
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // 模拟上传进度
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: 100, status: 'success' } : f))
          );
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: Math.min(progress, 99) } : f))
          );
        }
      }, 200);
    });

    // 清空 input 以允许重复选择同一文件
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <>
      <TopBar showBack showAccount={false} />

      <main className="pt-4 pb-12 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Hero Header Section */}
        <section className="mb-8 md:ml-4">
          <span className="text-secondary font-headline font-bold tracking-widest uppercase text-xs mb-4 block">
            Personal Steward Service
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary leading-tight tracking-tighter mb-4">
            医疗咨询登记<br />健康档案建立
          </h2>
          <p className="text-on-surface-variant font-body text-base max-w-xl leading-relaxed">
            为您的生活提供独立、客观且极具前瞻性的健康资产管理建议。我们不仅是咨询者，更是您的私人健康舵手。
          </p>
        </section>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <section className="bg-surface-container-low p-6 md:p-8 rounded-[2rem] editorial-shadow border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-sm">01</span>
              <h3 className="font-headline font-bold text-primary text-lg tracking-tight">基本信息</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface font-body input-shadow"
                  placeholder="请输入尊称"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">联系电话</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface font-body input-shadow"
                  placeholder="主要联系号码"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">紧急联系人/电话</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => updateField('emergencyContact', e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary/60 text-on-surface font-body input-shadow"
                  placeholder="紧急联系方式"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Deep Physiological Health Background */}
          <section className="bg-surface-container-low p-6 md:p-8 rounded-[2rem] editorial-shadow border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-sm">02</span>
              <h3 className="font-headline font-bold text-primary text-lg tracking-tight">深度生理健康背景</h3>
            </div>
            <div className="space-y-6">
              {/* Current Diseases */}
              <div className="space-y-3">
                <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">当前疾病</label>
                <div className="space-y-2">
                  {formData.diseases.map((disease, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={disease.name}
                        onChange={(e) => {
                          const updated = [...formData.diseases];
                          updated[index].name = e.target.value;
                          updateField('diseases', updated);
                        }}
                        className="w-full bg-surface-container-lowest border-none rounded-xl p-3 text-sm font-body input-shadow"
                        placeholder="诊断名称"
                      />
                      <input
                        type="text"
                        value={disease.date}
                        onChange={(e) => {
                          const updated = [...formData.diseases];
                          updated[index].date = e.target.value;
                          updateField('diseases', updated);
                        }}
                        className="w-full bg-surface-container-lowest border-none rounded-xl p-3 text-sm font-body input-shadow"
                        placeholder="确诊时间"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDisease}
                    className="text-secondary text-xs font-bold flex items-center gap-1 hover:opacity-70"
                  >
                    + 添加其他诊断
                  </button>
                </div>
              </div>

              {/* Medication */}
              <div className="space-y-3">
                <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">目前用药记录</label>
                <div className="space-y-2">
                  {formData.medications.map((med, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => {
                          const updated = [...formData.medications];
                          updated[index].name = e.target.value;
                          updateField('medications', updated);
                        }}
                        className="w-full bg-surface-container-lowest border-none rounded-xl p-3 text-sm font-body input-shadow"
                        placeholder="药物名称"
                      />
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => {
                          const updated = [...formData.medications];
                          updated[index].dosage = e.target.value;
                          updateField('medications', updated);
                        }}
                        className="w-full bg-surface-container-lowest border-none rounded-xl p-3 text-sm font-body input-shadow"
                        placeholder="剂量 / 频率"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMedication}
                    className="text-secondary text-xs font-bold flex items-center gap-1 hover:opacity-70"
                  >
                    + 添加药物记录
                  </button>
                </div>
              </div>

              {/* Surgery & Allergy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">手术史</label>
                  <div className="flex gap-3 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="surgery"
                        checked={formData.surgery.has === 'no'}
                        onChange={() => updateField('surgery', { ...formData.surgery, has: 'no', detail: '' })}
                        className="w-4 h-4 text-secondary focus:ring-secondary rounded-full"
                      />
                      <span className="text-sm font-body">无</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="surgery"
                        checked={formData.surgery.has === 'yes'}
                        onChange={() => updateField('surgery', { ...formData.surgery, has: 'yes' })}
                        className="w-4 h-4 text-secondary focus:ring-secondary rounded-full"
                      />
                      <span className="text-sm font-body">有</span>
                    </label>
                  </div>
                  {formData.surgery.has === 'yes' && (
                    <input
                      type="text"
                      value={formData.surgery.detail}
                      onChange={(e) => updateField('surgery', { ...formData.surgery, detail: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-secondary/30 rounded-lg p-2 text-xs font-body input-shadow"
                      placeholder="请说明手术名称及时间..."
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">过敏史</label>
                  <div className="flex gap-3 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="allergy"
                        checked={formData.allergy.has === 'no'}
                        onChange={() => updateField('allergy', { ...formData.allergy, has: 'no', detail: '' })}
                        className="w-4 h-4 text-secondary focus:ring-secondary rounded-full"
                      />
                      <span className="text-sm font-body">无</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="allergy"
                        checked={formData.allergy.has === 'yes'}
                        onChange={() => updateField('allergy', { ...formData.allergy, has: 'yes' })}
                        className="w-4 h-4 text-secondary focus:ring-secondary rounded-full"
                      />
                      <span className="text-sm font-body">有</span>
                    </label>
                  </div>
                  {formData.allergy.has === 'yes' && (
                    <input
                      type="text"
                      value={formData.allergy.detail}
                      onChange={(e) => updateField('allergy', { ...formData.allergy, detail: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-secondary/30 rounded-lg p-2 text-xs font-body input-shadow"
                      placeholder="请说明过敏源..."
                    />
                  )}
                </div>
              </div>

              {/* Vascular Evaluation */}
              <div className="space-y-2">
                <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">血管评估</label>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="vascular"
                      checked={formData.vascular.qualified === 'yes'}
                      onChange={() => updateField('vascular', { ...formData.vascular, qualified: 'yes' })}
                      className="w-4 h-4 text-secondary focus:ring-secondary rounded-full"
                    />
                    <span className="text-sm font-body">合格（适合留置针操作）</span>
                  </label>
                  <div className="flex items-center gap-2 flex-grow min-w-[200px]">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="vascular"
                        checked={formData.vascular.qualified === 'no'}
                        onChange={() => updateField('vascular', { ...formData.vascular, qualified: 'no' })}
                        className="w-4 h-4 text-secondary focus:ring-secondary rounded-full"
                      />
                      <span className="text-sm font-body">不合格</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vascular.reason}
                      onChange={(e) => updateField('vascular', { ...formData.vascular, reason: e.target.value })}
                      className="flex-grow bg-surface-container-lowest border-none rounded-lg p-2 text-xs font-body input-shadow"
                      placeholder="原因"
                    />
                  </div>
                </div>
              </div>

              {/* Family History */}
              <div className="space-y-3">
                <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest block">家族史 (直系亲属是否有以下情况)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {['心血管疾病', '糖尿病', '阿尔兹海默症', '肿瘤', '其他'].map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                        formData.familyHistory.includes(item)
                          ? 'bg-secondary/10 border border-secondary/30'
                          : 'bg-surface-container-lowest border border-outline-variant/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.familyHistory.includes(item)}
                        onChange={() => toggleArray('familyHistory', item)}
                        className="w-4 h-4 text-secondary focus:ring-secondary rounded"
                      />
                      <span className="text-xs font-body">{item}</span>
                    </label>
                  ))}
                </div>
                {formData.familyHistory.includes('其他') && (
                  <input
                    type="text"
                    value={formData.familyHistoryOther}
                    onChange={(e) => updateField('familyHistoryOther', e.target.value)}
                    className="w-full bg-surface-container-lowest border border-secondary/30 rounded-xl p-3 text-sm font-body input-shadow"
                    placeholder="请补充其他家族病史..."
                  />
                )}
                <div className="space-y-2 mt-3">
                  <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">体检疑问/诉求</label>
                  <textarea
                    value={formData.familyHistoryNote}
                    onChange={(e) => updateField('familyHistoryNote', e.target.value)}
                    className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 text-sm font-body input-shadow"
                    placeholder="请注明具体类型或其他补充..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Refined Lifestyle Assessment */}
          <section className="bg-surface-container-low p-6 md:p-8 rounded-[2rem] editorial-shadow border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-sm">03</span>
              <h3 className="font-headline font-bold text-primary text-lg tracking-tight">精细化生活方式评估</h3>
            </div>
            <div className="space-y-8">
              {/* Diet Pattern */}
              <div className="space-y-4">
                <h4 className="text-sm font-headline font-bold text-secondary-container bg-primary-container inline-block px-3 py-1 rounded-full">
                  饮食模式
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['混合膳食', '地中海饮食', '生酮饮食', '轻断食', '素食', '不规律'].map((mode) => (
                    <label
                      key={mode}
                      className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                        formData.dietModes.includes(mode)
                          ? 'bg-secondary/10'
                          : 'bg-surface-container-lowest'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.dietModes.includes(mode)}
                        onChange={() => toggleArray('dietModes', mode)}
                        className="rounded text-secondary"
                      />
                      <span className="text-xs">{mode}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">常饮饮品</label>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {['水', '咖啡', '茶', '酒精', '含/无糖饮料', '其他'].map((drink) => (
                      <label key={drink} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.drinks.includes(drink)}
                          onChange={() => toggleArray('drinks', drink)}
                          className="rounded"
                        />
                        {drink}
                      </label>
                    ))}
                  </div>
                  {formData.drinks.includes('其他') && (
                    <input
                      type="text"
                      value={formData.drinksOther}
                      onChange={(e) => updateField('drinksOther', e.target.value)}
                      className="w-full bg-surface-container-lowest border border-secondary/30 rounded-xl p-3 text-sm font-body input-shadow mt-2"
                      placeholder="请补充其他常饮饮品..."
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">餐后感受</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
                    {['精力充沛', '昏昏欲睡', '腹胀', '很快饥饿', '其他'].map((feeling) => (
                      <label
                        key={feeling}
                        className={`p-2 border rounded flex items-center justify-center text-center cursor-pointer transition-all ${
                          formData.mealFeeling.includes(feeling)
                            ? 'border-secondary text-secondary'
                            : 'border-outline-variant/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.mealFeeling.includes(feeling)}
                          onChange={() => toggleArray('mealFeeling', feeling)}
                          className="sr-only peer"
                        />
                        <span>{feeling}</span>
                      </label>
                    ))}
                  </div>
                  {formData.mealFeeling.includes('其他') && (
                    <input
                      type="text"
                      value={formData.mealFeelingOther}
                      onChange={(e) => updateField('mealFeelingOther', e.target.value)}
                      className="w-full bg-surface-container-lowest border border-secondary/30 rounded-xl p-3 text-sm font-body input-shadow mt-2"
                      placeholder="请补充其他餐后感受..."
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest px-1">饮食忌口</label>
                  <input
                    type="text"
                    value={formData.dietRestriction}
                    onChange={(e) => updateField('dietRestriction', e.target.value)}
                    className="w-full bg-surface-container-lowest border-none rounded-xl p-3 text-sm font-body input-shadow"
                    placeholder="如有特殊饮食忌口请注明"
                  />
                </div>
              </div>

              {/* Exercise */}
              <div className="space-y-4">
                <h4 className="text-sm font-headline font-bold text-secondary-container bg-primary-container inline-block px-3 py-1 rounded-full">
                  运动习惯
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {['球类', '跳绳', '跑步', '散步', '游泳', '登山', '健身房'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.exerciseTypes.includes(type)}
                        onChange={() => toggleArray('exerciseTypes', type)}
                        className="rounded"
                      />
                      {type}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest">运动频率</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.exerciseFrequency}
                        onChange={(e) => updateField('exerciseFrequency', e.target.value)}
                        className="w-16 bg-surface-container-lowest border-none rounded-lg p-2 text-sm input-shadow"
                      />
                      <span className="text-xs">周 / 次</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest">平均时长</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.exerciseDuration}
                        onChange={(e) => updateField('exerciseDuration', e.target.value)}
                        className="w-16 bg-surface-container-lowest border-none rounded-lg p-2 text-sm input-shadow"
                      />
                      <span className="text-xs">分 / 次</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sleep */}
              <div className="space-y-4">
                <h4 className="text-sm font-headline font-bold text-secondary-container bg-primary-container inline-block px-3 py-1 rounded-full">
                  睡眠情况
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest">工作日平均睡眠时长？</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      {['< 6 小时', '6-7 小时', '7-8 小时', '> 8 小时'].map((duration) => (
                        <label key={duration} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="sleepDuration"
                            checked={formData.sleepDuration === duration}
                            onChange={() => updateField('sleepDuration', duration)}
                            className="text-secondary"
                          />
                          {duration}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest">入睡与质量：</p>
                    <div className="space-y-2">
                      {[
                        '很快入睡（<15分钟），且夜间很少醒来',
                        '需要一段时间（15-30分钟），或易醒但能再次入睡',
                        '入睡困难、夜间多醒且难以再入睡，伴有焦虑',
                      ].map((quality) => (
                        <label
                          key={quality}
                          className="flex items-start gap-2 p-3 bg-surface-container-lowest rounded-xl text-xs cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="sleepQuality"
                            checked={formData.sleepQuality === quality}
                            onChange={() => updateField('sleepQuality', quality)}
                            className="mt-0.5 text-secondary"
                          />
                          <span>{quality}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest">早晨醒来后的感受：</p>
                    <div className="space-y-2">
                      {[
                        '神清气爽，精力充沛，白天几乎不困',
                        '需要一点时间"开机"，但白天状态尚可',
                        '感觉疲惫，仿佛没睡够，白天需要靠咖啡/茶提神',
                        '无论睡多久都感觉疲惫，白天精神不济，影响注意力',
                      ].map((feeling) => (
                        <label
                          key={feeling}
                          className="flex items-start gap-2 p-3 bg-surface-container-lowest rounded-xl text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.wakeUpFeeling.includes(feeling)}
                            onChange={() => toggleArray('wakeUpFeeling', feeling)}
                            className="mt-0.5 text-secondary"
                          />
                          <span>{feeling}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stress & Emotion */}
              <div className="space-y-4">
                <h4 className="text-sm font-headline font-bold text-secondary-container bg-primary-container inline-block px-3 py-1 rounded-full">
                  压力、情绪与脑雾
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest">压力水平评价 (1-10, 1最小)</p>
                    <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-2xl px-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.stressLevel}
                        onChange={(e) => updateField('stressLevel', parseInt(e.target.value))}
                        className="w-full accent-secondary"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>低（1）</span>
                      <span className="font-bold text-primary">{formData.stressLevel}</span>
                      <span>高（10）</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest">近两周焦虑/担忧频率？</p>
                      <select
                        value={formData.anxietyFrequency}
                        onChange={(e) => updateField('anxietyFrequency', e.target.value)}
                        className="w-full bg-surface-container-lowest border-none rounded-xl p-3 text-xs input-shadow"
                      >
                        <option value="">请选择</option>
                        <option value="none">没有</option>
                        <option value="few">几天</option>
                        <option value="half">一半以上</option>
                        <option value="daily">每天</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-headline font-bold text-primary/60 uppercase tracking-widest">脑雾/记忆力表现</p>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {['记忆力下降', '注意力不集中', '思维迟缓', '其他'].map((symptom) => (
                          <label key={symptom} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.brainFog.includes(symptom)}
                              onChange={() => toggleArray('brainFog', symptom)}
                              className="rounded"
                            />
                            {symptom}
                          </label>
                        ))}
                      </div>
                      {formData.brainFog.includes('其他') && (
                        <input
                          type="text"
                          value={formData.brainFogOther}
                          onChange={(e) => updateField('brainFogOther', e.target.value)}
                          className="w-full bg-surface-container-lowest border border-secondary/30 rounded-xl p-3 text-sm font-body input-shadow mt-2"
                          placeholder="请补充其他脑雾/记忆力表现..."
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Upload Attachments */}
          <section className="bg-surface-container-low p-6 md:p-8 rounded-[2rem] editorial-shadow border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-sm">04</span>
              <h3 className="font-headline font-bold text-primary text-lg tracking-tight">上传附件</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              支持上传体检报告、病历资料等相关文件（支持多选）
            </p>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-8 text-center cursor-pointer hover:border-secondary/60 hover:bg-surface-container-lowest/50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="material-symbols-outlined text-4xl text-secondary mb-2">upload_file</span>
              <p className="text-sm font-body text-on-surface-variant">
                点击或拖拽文件到此处上传
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-1">
                支持 PDF、Word、Excel、图片格式
              </p>
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body text-on-surface truncate">{file.name}</p>
                      <p className="text-xs text-on-surface-variant">{formatFileSize(file.size)}</p>
                      {file.status === 'uploading' && (
                        <div className="mt-2 h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary rounded-full transition-all duration-200"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {file.status === 'uploading' && (
                        <span className="text-xs text-secondary">{Math.round(file.progress)}%</span>
                      )}
                      {file.status === 'success' && (
                        <span className="material-symbols-outlined text-green-600">check_circle</span>
                      )}
                      {file.status === 'error' && (
                        <span className="material-symbols-outlined text-error">error</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="p-1 hover:bg-error/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submit Button */}
          <div className="pt-4 max-w-lg mx-auto">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-full text-base tracking-tight editorial-shadow hover:bg-primary-container active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '提交中...' : '提交详细档案'}
              {!submitting && <span className="material-symbols-outlined">arrow_forward_ios</span>}
            </button>
            {/* <p className="text-center text-[10px] text-outline-variant mt-12 uppercase tracking-[0.2em]">
              Official Boatman Stewardship Channel
            </p> */}
          </div>
        </form>
        
        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 mt-8">
          <div className="bg-surface-container-lowest p-5 rounded-3xl editorial-shadow border border-outline-variant/10 flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
            <div>
              <h3 className="font-headline font-bold text-primary text-base mb-1">隐私承诺</h3>
              <p className="text-on-surface-variant text-xs font-body leading-relaxed">
                您的所有病史与个人身份信息均受严格的私人管家级加密保护，绝不流向任何医疗机构或商业实体。
              </p>
            </div>
          </div>
          <div className="bg-primary-container p-5 rounded-3xl editorial-shadow relative overflow-hidden flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary-container text-3xl">anchor</span>
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-base mb-1 text-white">独立视角</h3>
              <p className="text-on-primary-container text-xs font-body leading-relaxed">
                坚持第三方立场，为您剔除医疗链条中的利益干扰，还原医学最真实的诊断逻辑。
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
};

export default HealthForm;
