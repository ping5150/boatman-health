import request from './request';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

interface DashboardStats {
  form1Total: number;
  form1Today: number;
  form2Total: number;
  form2Today: number;
  syncFailedTotal: number;
}

interface SyncFailedItem {
  id: number;
  name: string;
  phone: string;
  submittedAt: string;
  feishuSyncStatus: string;
}

interface SyncFailedList {
  form1: SyncFailedItem[];
  form2: SyncFailedItem[];
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
  async retry(table: 'form1' | 'form2', recordId: number): Promise<ApiResponse<SyncRetryResult>> {
    return request.post('/admin/sync/retry', { table, recordId });
  },
};
