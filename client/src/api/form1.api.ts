import api from '@/lib/axios';

export interface BookingData {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  brief: string;
  submittedAt: string;
  versionNumber: number;
}

interface Form1SubmitRequest {
  name: string;
  phone: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  brief: string;
}

interface Form1SubmitResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    orderNo: string;
    submittedAt: string;
    versionNumber: number;
    consultationType: string;
    preferredDate: string;
    preferredTime: string;
  };
}

// 提交咨询表单
export const submitForm1 = async (data: Form1SubmitRequest): Promise<Form1SubmitResponse> => {
  const res = await api.post('/form1', data);
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '咨询表单提交成功',
    data: {
      id: result.id,
      orderNo: result.orderNo,
      submittedAt: result.submittedAt,
      versionNumber: result.versionNumber,
      consultationType: result.consultationType,
      preferredDate: result.preferredDate,
      preferredTime: result.preferredTime,
    },
  };
};

// 获取用户预约列表
export const getBookingList = async (): Promise<BookingData[]> => {
  const res = await api.get('/form1');
  return res.data.data || [];
};

// 获取单个预约详情
export const getBookingDetail = async (id: number): Promise<BookingData> => {
  const res = await api.get(`/form1/${id}`);
  return res.data.data;
};

// 更新预约（新增记录）
export const updateBooking = async (id: number, data: Partial<Form1SubmitRequest>): Promise<Form1SubmitResponse> => {
  const res = await api.put(`/form1/${id}`, data);
  const result = res.data.data;
  return {
    success: true,
    message: res.data.message || '预约更新成功',
    data: {
      id: result.id,
      orderNo: result.orderNo,
      submittedAt: result.submittedAt,
      versionNumber: result.versionNumber,
      consultationType: result.consultationType,
      preferredDate: result.preferredDate,
      preferredTime: result.preferredTime,
    },
  };
};
