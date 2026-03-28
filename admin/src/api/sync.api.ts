import request from './request';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

interface DashboardStats {
  userTotal: number;
  userToday: number;
  userGrowthRate: number;
  bookingTotal: number;
  bookingToday: number;
  bookingGrowthRate: number;
  archiveTotal: number;
  archiveToday: number;
  archiveGrowthRate: number;
  bookingStatusDistribution: {
    submitted: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
}

interface SyncFailedItem {
  id: number;
  orderNo: string;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

interface SyncFailedList {
  booking: SyncFailedItem[];
  archive: SyncFailedItem[];
}

interface SyncRetryResult {
  syncStatus: string;
  feishuRecordId: string | null;
}

export const syncApi = {
  /**
   * 获取仪表盘统计
   */
  async getDashboard(): Promise<ApiResponse<DashboardStats>> {
    return request.get('/admin/dashboard');
  },

  /**
   * 获取同步失败列表
   */
  async getFailedList(): Promise<ApiResponse<SyncFailedList>> {
    return request.get('/admin/sync/failed');
  },

  /**
   * 重试飞书同步
   */
  async retry(table: 'booking' | 'archive', recordId: number): Promise<ApiResponse<SyncRetryResult>> {
    return request.post('/admin/sync/retry', { table, recordId });
  },
};
