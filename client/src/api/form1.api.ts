import api from '@/lib/axios';

// ==================== 类型定义 ====================

/** 咨询类型 */
export type ConsultationType = '重疾咨询' | '慢病管理' | '健康资产规划' | '其他';

/** 同步状态 */
export type SyncStatus = 'success' | 'pending' | 'failed';

/** 预约列表项 */
export interface BookingListItem {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  consultationType: ConsultationType;
  preferredDate: string;
  preferredTime: string;
  brief: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  versionNumber: number;
  feishuSyncStatus: SyncStatus;
  status?: 'active' | 'cancelled';
}

/** 预约详情 */
export interface BookingDetail extends BookingListItem {
  userId: number;
  feishuRecordId: string | null;
  status: 'active' | 'cancelled';
  cancelledAt: string | null;
}

/** 预约提交请求 */
export interface BookingSubmitRequest {
  name: string;
  phone: string;
  consultationType: ConsultationType;
  preferredDate: string;
  preferredTime: string;
  brief: string;
}

/** 预约更新请求 */
export type BookingUpdateRequest = Partial<BookingSubmitRequest>;

/** 预约提交响应 */
interface BookingSubmitResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    orderNo: string;
    submittedAt: string;
    versionNumber: number;
    consultationType: ConsultationType;
    preferredDate: string;
    preferredTime: string;
  };
}

// ==================== API 方法 ====================

/**
 * 提交咨询表单
 */
export const submitForm1 = async (data: BookingSubmitRequest): Promise<BookingSubmitResponse> => {
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

/**
 * 获取用户预约列表
 */
export const getBookingList = async (): Promise<BookingListItem[]> => {
  const res = await api.get('/form1');
  return res.data.data || [];
};

/**
 * 获取单个预约详情
 */
export const getBookingDetail = async (id: number): Promise<BookingDetail> => {
  const res = await api.get(`/form1/${id}`);
  return res.data.data;
};

/**
 * 更新预约（新增记录）
 */
export const updateBooking = async (id: number, data: BookingUpdateRequest): Promise<BookingSubmitResponse> => {
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

/**
 * 取消预约
 */
export const cancelBooking = async (id: number): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/form1/${id}`);
  return {
    success: true,
    message: res.data.message || '预约已取消',
  };
};

// 兼容旧导出
export type BookingData = BookingListItem;
