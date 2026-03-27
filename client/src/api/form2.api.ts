import api from '@/lib/axios';

interface Form2SubmitRequest {
  // 基本信息
  fullName: string;
  gender: string;
  birthDate: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;

  // 健康信息
  bloodType: string;
  height: string;
  weight: string;
  allergies: string;
  currentMedications: string;
  pastSurgeries: string;
  chronicDiseases: string;
  familyHistory: string;

  // 生活方式
  smokingStatus: string;
  drinkingStatus: string;
  exerciseFrequency: string;
  dietaryPreferences: string;
  sleepQuality: string;

  // 咨询需求
  primaryConcern: string;
  expectedService: string;
  preferredHospital: string;
  budgetRange: string;
  additionalNotes: string;
}

interface Form2SubmitResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    version: string;
    submittedAt: string;
  };
}

// 提交健康档案
export const submitForm2 = async (data: Form2SubmitRequest): Promise<Form2SubmitResponse> => {
  // 将扁平数据结构转换为后端要求的嵌套结构
  const payload = {
    basicInfo: {
      name: data.fullName,
      customerId: data.idNumber || `CUS-${Date.now()}`,
      phone: data.phone,
      emergencyContact: {
        name: data.fullName,
        phone: data.phone,
      },
    },
    healthBackground: {
      currentDiseases: data.chronicDiseases
        ? [{ diagnosis: data.chronicDiseases, diagnosedAt: '' }]
        : [],
      medications: data.currentMedications
        ? [{ name: data.currentMedications, dosage: '' }]
        : [],
      surgeryHistory: {
        hasSurgery: !!data.pastSurgeries,
        details: data.pastSurgeries || undefined,
      },
      allergyHistory: {
        hasAllergy: !!data.allergies,
        details: data.allergies || undefined,
      },
      vascularAssessment: {
        result: '合格' as const,
      },
      familyHistory: {
        selected: data.familyHistory ? [data.familyHistory] : [],
      },
      medicalQuestions: data.primaryConcern || '',
    },
    lifestyle: {
      diet: {
        dietPatterns: data.dietaryPreferences ? [data.dietaryPreferences] : [],
        beverages: [],
        postMealFeelings: [],
        foodRestrictions: '',
      },
      exercise: {
        types: data.exerciseFrequency ? [data.exerciseFrequency] : [],
        frequencyPerWeek: 0,
        durationMinutes: 0,
      },
      sleep: {
        avgHours: data.sleepQuality || '',
        fallAsleep: '',
        morningFeeling: '',
      },
      stress: {
        stressScore: 5,
      },
      anxiety: {
        frequency: '',
      },
      brainFog: {
        symptoms: [],
      },
    },
  };

  const res = await api.post('/form2', payload);
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '健康档案提交成功',
    data: {
      id: String(result.id),
      version: `v${result.versionNumber || 1}`,
      submittedAt: result.submittedAt,
    },
  };
};
