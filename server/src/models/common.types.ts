import { JwtPayload } from '../utils/jwt';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// 分页参数
export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
}

// 分页响应
export interface PaginatedResult<T> {
  total: number;
  page: number;
  limit: number;
  list: T[];
}

// 表单2完整数据结构
export interface Form2Data {
  basicInfo: {
    name: string;
    customerId: string;
    phone: string;
    emergencyContact: {
      name: string;
      phone: string;
    };
  };
  healthBackground: {
    currentDiseases: Array<{ diagnosis: string; diagnosedAt: string }>;
    medications: Array<{ name: string; dosage: string }>;
    surgeryHistory: {
      hasSurgery: boolean;
      details?: string;
    };
    allergyHistory: {
      hasAllergy: boolean;
      details?: string;
    };
    vascularAssessment: {
      result: '合格' | '不合格';
      reason?: string;
    };
    familyHistory: {
      selected: string[];
      tumorType?: string;
      other?: string;
    };
    medicalQuestions: string;
  };
  lifestyle: {
    diet: {
      dietPatterns: string[];
      beverages: string[];
      beverageOther?: string;
      postMealFeelings: string[];
      postMealOther?: string;
      foodRestrictions: string;
    };
    exercise: {
      types: string[];
      frequencyPerWeek: number;
      durationMinutes: number;
    };
    sleep: {
      avgHours: string;
      fallAsleep: string;
      morningFeeling: string;
    };
    stress: {
      stressScore: number;
    };
    anxiety: {
      frequency: string;
    };
    brainFog: {
      symptoms: string[];
      other?: string;
    };
  };
}

// 同步重试请求
export interface SyncRetryRequest {
  table: 'form1' | 'form2';
  recordId: number;
}
