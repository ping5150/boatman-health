// =============================================
// Mock 模式 - 不依赖后端即可跑通全流程
// =============================================

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

interface PaginatedResult<T> {
  total: number;
  page: number;
  limit: number;
  list: T[];
}

interface Form1ListItem {
  id: number;
  name: string;
  phone: string;
  consultationType: string;
  submittedAt: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

interface Form1Detail {
  id: number;
  userId: number;
  name: string;
  phone: string;
  consultationType: string;
  preferredTime: string;
  brief: string;
  submittedAt: string;
  versionNumber: number;
  feishuRecordId: string | null;
  feishuSyncStatus: string;
}

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock 数据生成
const mockForm1List: Form1ListItem[] = [
  { id: 1, name: '王先生', phone: '13800138001', consultationType: '重疾咨询', submittedAt: '2026-03-25T10:30:00Z', versionNumber: 1, feishuSyncStatus: 'success' },
  { id: 2, name: '李女士', phone: '13800138002', consultationType: '慢病管理', submittedAt: '2026-03-25T11:45:00Z', versionNumber: 1, feishuSyncStatus: 'success' },
  { id: 3, name: '张先生', phone: '13800138003', consultationType: '健康资产规划', submittedAt: '2026-03-25T14:20:00Z', versionNumber: 1, feishuSyncStatus: 'pending' },
  { id: 4, name: '陈女士', phone: '13800138004', consultationType: '重疾咨询', submittedAt: '2026-03-26T09:00:00Z', versionNumber: 1, feishuSyncStatus: 'failed' },
  { id: 5, name: '赵先生', phone: '13800138005', consultationType: '慢病管理', submittedAt: '2026-03-26T09:30:00Z', versionNumber: 2, feishuSyncStatus: 'success' },
  { id: 6, name: '孙女士', phone: '13800138006', consultationType: '健康资产规划', submittedAt: '2026-03-26T10:15:00Z', versionNumber: 1, feishuSyncStatus: 'success' },
  { id: 7, name: '周先生', phone: '13800138007', consultationType: '重疾咨询', submittedAt: '2026-03-26T11:00:00Z', versionNumber: 1, feishuSyncStatus: 'success' },
  { id: 8, name: '吴女士', phone: '13800138008', consultationType: '慢病管理', submittedAt: '2026-03-26T13:20:00Z', versionNumber: 1, feishuSyncStatus: 'failed' },
];

const mockForm1Details: Record<number, Form1Detail> = {
  1: { id: 1, userId: 101, name: '王先生', phone: '13800138001', consultationType: '重疾咨询', preferredTime: '工作日 上午 (09:00 - 12:00)', brief: '近期体检发现肺部有小结节，希望获得专业评估和后续建议。', submittedAt: '2026-03-25T10:30:00Z', versionNumber: 1, feishuRecordId: 'rec_001', feishuSyncStatus: 'success' },
  2: { id: 2, userId: 102, name: '李女士', phone: '13800138002', consultationType: '慢病管理', preferredTime: '工作日 下午 (14:00 - 18:00)', brief: '糖尿病二型，目前在服用二甲双胍，希望获取更好的管理方案。', submittedAt: '2026-03-25T11:45:00Z', versionNumber: 1, feishuRecordId: 'rec_002', feishuSyncStatus: 'success' },
  3: { id: 3, userId: 103, name: '张先生', phone: '13800138003', consultationType: '健康资产规划', preferredTime: '周末 全天', brief: '企业家，47岁，希望做一次全面的健康资产规划，家族有心血管疾病史。', submittedAt: '2026-03-25T14:20:00Z', versionNumber: 1, feishuRecordId: null, feishuSyncStatus: 'pending' },
  4: { id: 4, userId: 104, name: '陈女士', phone: '13800138004', consultationType: '重疾咨询', preferredTime: '工作日 晚间 (19:00 - 21:00)', brief: '甲状腺结节4a级，希望咨询是否需要手术。', submittedAt: '2026-03-26T09:00:00Z', versionNumber: 1, feishuRecordId: null, feishuSyncStatus: 'failed' },
  5: { id: 5, userId: 105, name: '赵先生', phone: '13800138005', consultationType: '慢病管理', preferredTime: '工作日 上午 (09:00 - 12:00)', brief: '高血压+高血脂，长期服药中，希望优化用药方案。', submittedAt: '2026-03-26T09:30:00Z', versionNumber: 2, feishuRecordId: 'rec_005', feishuSyncStatus: 'success' },
  6: { id: 6, userId: 106, name: '孙女士', phone: '13800138006', consultationType: '健康资产规划', preferredTime: '周末 全天', brief: '希望为全家（4口人）建立完整的健康管理档案。', submittedAt: '2026-03-26T10:15:00Z', versionNumber: 1, feishuRecordId: 'rec_006', feishuSyncStatus: 'success' },
  7: { id: 7, userId: 107, name: '周先生', phone: '13800138007', consultationType: '重疾咨询', preferredTime: '工作日 下午 (14:00 - 18:00)', brief: '父亲确诊肝癌，希望咨询海外治疗方案。', submittedAt: '2026-03-26T11:00:00Z', versionNumber: 1, feishuRecordId: 'rec_007', feishuSyncStatus: 'success' },
  8: { id: 8, userId: 108, name: '吴女士', phone: '13800138008', consultationType: '慢病管理', preferredTime: '工作日 晚间 (19:00 - 21:00)', brief: '类风湿关节炎，目前用药效果不理想，希望获取新的治疗方案。', submittedAt: '2026-03-26T13:20:00Z', versionNumber: 1, feishuRecordId: null, feishuSyncStatus: 'failed' },
};

export const form1Api = {
  /**
   * 获取表单1列表 (Mock)
   */
  async getList(params: { page: number; limit: number; search?: string }): Promise<ApiResponse<PaginatedResult<Form1ListItem>>> {
    await delay(400);
    let list = [...mockForm1List];

    // 搜索过滤
    if (params.search) {
      const keyword = params.search.toLowerCase();
      list = list.filter((item) => item.name.includes(keyword) || item.phone.includes(keyword));
    }

    // 分页
    const start = (params.page - 1) * params.limit;
    const pageList = list.slice(start, start + params.limit);

    return {
      code: 0,
      message: 'success',
      data: {
        total: list.length,
        page: params.page,
        limit: params.limit,
        list: pageList,
      },
    };
  },

  /**
   * 获取表单1详情 (Mock)
   */
  async getDetail(id: number): Promise<ApiResponse<Form1Detail>> {
    await delay(300);
    const detail = mockForm1Details[id];
    if (!detail) {
      return { code: 1, message: '记录不存在' };
    }
    return { code: 0, message: 'success', data: detail };
  },
};
