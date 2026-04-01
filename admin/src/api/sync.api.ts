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

interface SyncFailedUserItem {
  id: string;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

interface SyncFailedItem {
  id: number;
  orderNo?: string;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

interface SyncFailedList {
  user: SyncFailedUserItem[];
  booking: SyncFailedItem[];
  archive: SyncFailedItem[];
}

interface SyncStats {
  user: { total: number; success: number; failed: number; pending: number };
  booking: { total: number; success: number; failed: number; pending: number };
  archive: { total: number; success: number; failed: number; pending: number };
}

interface SyncResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
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
   * 获取同步统计
   */
  async getStats(): Promise<ApiResponse<SyncStats>> {
    return request.get('/admin/sync/stats');
  },

  /**
   * 获取同步失败列表
   */
  async getFailedList(): Promise<ApiResponse<SyncFailedList>> {
    return request.get('/admin/sync/failed');
  },

  /**
   * 一键同步用户
   */
  async syncAllUsers(): Promise<ApiResponse<SyncResult>> {
    return request.post('/admin/sync/user');
  },

  /**
   * 一键同步预约
   */
  async syncAllBookings(): Promise<ApiResponse<SyncResult>> {
    return request.post('/admin/sync/booking');
  },

  /**
   * 一键同步档案
   */
  async syncAllArchives(): Promise<ApiResponse<SyncResult>> {
    return request.post('/admin/sync/archive');
  },

  /**
   * 重试飞书同步
   */
  async retry(table: 'user' | 'booking' | 'archive', recordId: string | number): Promise<ApiResponse<SyncRetryResult>> {
    return request.post('/admin/sync/retry', { table, recordId });
  },
};
