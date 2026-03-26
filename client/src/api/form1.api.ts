// =============================================
// Mock 模式 - 不依赖后端即可跑通全流程
// 切换回真实接口：将下方注释打开，删除 mock 实现
// =============================================

// import api from '@/lib/axios';

interface Form1SubmitRequest {
  name: string;
  phone: string;
  consultType: string;
  contactTime: string;
  briefHistory: string;
}

interface Form1SubmitResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    submittedAt: string;
  };
}

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// 提交咨询表单 (Mock)
export const submitForm1 = async (_data: Form1SubmitRequest): Promise<Form1SubmitResponse> => {
  await delay(800);
  return {
    success: true,
    message: '咨询表单提交成功',
    data: {
      id: 'FORM1-' + Date.now(),
      submittedAt: new Date().toISOString(),
    },
  };
};
