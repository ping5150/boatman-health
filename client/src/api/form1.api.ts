import api from '@/lib/axios';

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

// 提交咨询表单
export const submitForm1 = async (data: Form1SubmitRequest): Promise<Form1SubmitResponse> => {
  const res = await api.post('/form1', {
    name: data.name,
    phone: data.phone,
    consultationType: data.consultType,
    preferredTime: data.contactTime,
    brief: data.briefHistory,
  });
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '咨询表单提交成功',
    data: {
      id: String(result.id),
      submittedAt: result.submittedAt,
    },
  };
};
