// =============================================
// Mock 模式 - 不依赖后端即可跑通全流程
// 切换回真实接口：将下方注释打开，删除 mock 实现
// =============================================

// import api from '@/lib/axios';

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

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// 提交健康档案 (Mock)
export const submitForm2 = async (_data: Form2SubmitRequest): Promise<Form2SubmitResponse> => {
  await delay(1000);
  return {
    success: true,
    message: '健康档案提交成功',
    data: {
      id: 'FORM2-' + Date.now(),
      version: 'v1',
      submittedAt: new Date().toISOString(),
    },
  };
};
