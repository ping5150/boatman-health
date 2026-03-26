// =============================================
// Mock 模式 - 不依赖后端即可跑通全流程
// =============================================

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

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// 用 Set 记录已重试成功的项，模拟重试后消失
const retriedItems = new Set<string>();

export const syncApi = {
  /**
   * 获取仪表盘统计 (Mock)
   */
  async getDashboard(): Promise<ApiResponse<DashboardStats>> {
    await delay(400);
    return {
      code: 0,
      message: 'success',
      data: {
        form1Total: 128,
        form1Today: 5,
        form2Total: 76,
        form2Today: 3,
        syncFailedTotal: Math.max(0, 3 - retriedItems.size),
      },
    };
  },

  /**
   * 获取同步失败列表 (Mock)
   */
  async getFailedList(): Promise<ApiResponse<SyncFailedList>> {
    await delay(400);

    const allForm1Failed: SyncFailedItem[] = [
      { id: 4, name: '陈女士', phone: '13800138004', submittedAt: '2026-03-26T09:00:00Z', feishuSyncStatus: 'failed' },
      { id: 8, name: '吴女士', phone: '13800138008', submittedAt: '2026-03-26T13:20:00Z', feishuSyncStatus: 'failed' },
    ];

    const allForm2Failed: SyncFailedItem[] = [
      { id: 4, name: '陈女士', phone: '13800138004', submittedAt: '2026-03-26T09:10:00Z', feishuSyncStatus: 'failed' },
    ];

    return {
      code: 0,
      message: 'success',
      data: {
        form1: allForm1Failed.filter((item) => !retriedItems.has(`form1-${item.id}`)),
        form2: allForm2Failed.filter((item) => !retriedItems.has(`form2-${item.id}`)),
      },
    };
  },

  /**
   * 重试飞书同步 (Mock) - 模拟重试成功
   */
  async retry(table: 'form1' | 'form2', recordId: number): Promise<ApiResponse<SyncRetryResult>> {
    await delay(1000);
    retriedItems.add(`${table}-${recordId}`);
    return {
      code: 0,
      message: '同步重试成功',
      data: {
        syncStatus: 'success',
        feishuRecordId: `rec_retry_${Date.now()}`,
      },
    };
  },
};
