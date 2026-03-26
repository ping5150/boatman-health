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

interface Form2ListItem {
  id: number;
  name: string;
  customerId: string;
  phone: string;
  submittedAt: string;
  versionNumber: number;
  feishuSyncStatus: string;
}

interface Form2Detail {
  id: number;
  userId: number;
  formData: Record<string, unknown>;
  submittedAt: string;
  versionNumber: number;
  feishuRecordId: string | null;
  feishuSyncStatus: string;
}

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const mockForm2List: Form2ListItem[] = [
  { id: 1, name: '王先生', customerId: 'CUS-2026001', phone: '13800138001', submittedAt: '2026-03-25T10:35:00Z', versionNumber: 1, feishuSyncStatus: 'success' },
  { id: 2, name: '李女士', customerId: 'CUS-2026002', phone: '13800138002', submittedAt: '2026-03-25T12:00:00Z', versionNumber: 1, feishuSyncStatus: 'success' },
  { id: 3, name: '张先生', customerId: 'CUS-2026003', phone: '13800138003', submittedAt: '2026-03-25T14:30:00Z', versionNumber: 2, feishuSyncStatus: 'success' },
  { id: 4, name: '陈女士', customerId: 'CUS-2026004', phone: '13800138004', submittedAt: '2026-03-26T09:10:00Z', versionNumber: 1, feishuSyncStatus: 'failed' },
  { id: 5, name: '赵先生', customerId: 'CUS-2026005', phone: '13800138005', submittedAt: '2026-03-26T09:45:00Z', versionNumber: 3, feishuSyncStatus: 'success' },
  { id: 6, name: '孙女士', customerId: 'CUS-2026006', phone: '13800138006', submittedAt: '2026-03-26T10:30:00Z', versionNumber: 1, feishuSyncStatus: 'pending' },
];

const mockForm2Details: Record<number, Form2Detail> = {
  1: {
    id: 1, userId: 101, submittedAt: '2026-03-25T10:35:00Z', versionNumber: 1, feishuRecordId: 'rec_f2_001', feishuSyncStatus: 'success',
    formData: {
      fullName: '王先生', phone: '13800138001', gender: '男', birthDate: '1978-05-12',
      bloodType: 'A', height: '175', weight: '78', allergies: '青霉素',
      currentMedications: '阿司匹林 100mg/日', pastSurgeries: '2018年 阑尾切除术',
      chronicDiseases: '高血压 (2015年确诊)', familyHistory: '心血管疾病, 糖尿病',
      smokingStatus: '已戒烟5年', drinkingStatus: '偶尔', exerciseFrequency: '3次/周, 40分钟/次, 跑步/游泳',
      dietaryPreferences: '混合膳食', sleepQuality: '7-8 小时, 偶尔入睡困难',
      primaryConcern: '近期体检发现血压控制不够理想，希望调整方案。',
    },
  },
  2: {
    id: 2, userId: 102, submittedAt: '2026-03-25T12:00:00Z', versionNumber: 1, feishuRecordId: 'rec_f2_002', feishuSyncStatus: 'success',
    formData: {
      fullName: '李女士', phone: '13800138002', gender: '女', birthDate: '1985-09-20',
      bloodType: 'O', height: '162', weight: '55', allergies: '无',
      currentMedications: '二甲双胍 500mg 2次/日', pastSurgeries: '无',
      chronicDiseases: '2型糖尿病 (2020年确诊)', familyHistory: '糖尿病',
      smokingStatus: '从不吸烟', drinkingStatus: '无', exerciseFrequency: '2次/周, 30分钟/次, 散步',
      dietaryPreferences: '地中海饮食', sleepQuality: '6-7 小时, 质量尚可',
      primaryConcern: '血糖波动较大，希望获取更精准的饮食方案。',
    },
  },
  3: {
    id: 3, userId: 103, submittedAt: '2026-03-25T14:30:00Z', versionNumber: 2, feishuRecordId: 'rec_f2_003', feishuSyncStatus: 'success',
    formData: {
      fullName: '张先生', phone: '13800138003', gender: '男', birthDate: '1979-02-14',
      bloodType: 'B', height: '180', weight: '85', allergies: '海鲜',
      currentMedications: '无', pastSurgeries: '无',
      chronicDiseases: '无', familyHistory: '心血管疾病, 阿尔兹海默症',
      smokingStatus: '偶尔', drinkingStatus: '社交饮酒', exerciseFrequency: '1次/周, 60分钟/次, 高尔夫',
      dietaryPreferences: '不规律', sleepQuality: '< 6 小时, 入睡困难',
      primaryConcern: '工作压力大，睡眠差，希望全面评估健康状况并制定管理方案。',
    },
  },
  4: {
    id: 4, userId: 104, submittedAt: '2026-03-26T09:10:00Z', versionNumber: 1, feishuRecordId: null, feishuSyncStatus: 'failed',
    formData: {
      fullName: '陈女士', phone: '13800138004', gender: '女', birthDate: '1990-11-08',
      bloodType: 'AB', height: '158', weight: '48', allergies: '花粉, 灰尘',
      currentMedications: '左甲状腺素钠 50μg/日', pastSurgeries: '无',
      chronicDiseases: '甲状腺功能减退 (2023年确诊)', familyHistory: '肿瘤',
      smokingStatus: '从不吸烟', drinkingStatus: '无', exerciseFrequency: '4次/周, 45分钟/次, 瑜伽/跑步',
      dietaryPreferences: '轻断食', sleepQuality: '7-8 小时, 质量良好',
      primaryConcern: '甲状腺结节4a级，需要专家会诊。',
    },
  },
  5: {
    id: 5, userId: 105, submittedAt: '2026-03-26T09:45:00Z', versionNumber: 3, feishuRecordId: 'rec_f2_005', feishuSyncStatus: 'success',
    formData: {
      fullName: '赵先生', phone: '13800138005', gender: '男', birthDate: '1970-07-30',
      bloodType: 'A', height: '172', weight: '82', allergies: '磺胺类药物',
      currentMedications: '氨氯地平 5mg/日, 阿托伐他汀 20mg/日', pastSurgeries: '2010年 膝关节镜手术',
      chronicDiseases: '高血压 (2008年确诊), 高血脂 (2012年确诊)', familyHistory: '心血管疾病, 糖尿病',
      smokingStatus: '已戒烟10年', drinkingStatus: '偶尔', exerciseFrequency: '5次/周, 30分钟/次, 散步/游泳',
      dietaryPreferences: '地中海饮食', sleepQuality: '6-7 小时, 易醒',
      primaryConcern: '希望优化用药方案，同时做心脑血管的全面评估。',
    },
  },
  6: {
    id: 6, userId: 106, submittedAt: '2026-03-26T10:30:00Z', versionNumber: 1, feishuRecordId: null, feishuSyncStatus: 'pending',
    formData: {
      fullName: '孙女士', phone: '13800138006', gender: '女', birthDate: '1982-04-15',
      bloodType: 'O', height: '165', weight: '58', allergies: '无',
      currentMedications: '无', pastSurgeries: '无',
      chronicDiseases: '无', familyHistory: '无',
      smokingStatus: '从不吸烟', drinkingStatus: '偶尔红酒', exerciseFrequency: '3次/周, 60分钟/次, 健身房/瑜伽',
      dietaryPreferences: '混合膳食', sleepQuality: '7-8 小时, 质量良好',
      primaryConcern: '希望为全家建立健康管理档案，定期体检方案规划。',
    },
  },
};

export const form2Api = {
  /**
   * 获取表单2列表 (Mock)
   */
  async getList(params: { page: number; limit: number; search?: string }): Promise<ApiResponse<PaginatedResult<Form2ListItem>>> {
    await delay(400);
    let list = [...mockForm2List];

    if (params.search) {
      const keyword = params.search.toLowerCase();
      list = list.filter((item) => item.name.includes(keyword) || item.customerId.toLowerCase().includes(keyword));
    }

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
   * 获取表单2详情 (Mock)
   */
  async getDetail(id: number): Promise<ApiResponse<Form2Detail>> {
    await delay(300);
    const detail = mockForm2Details[id];
    if (!detail) {
      return { code: 1, message: '记录不存在' };
    }
    return { code: 0, message: 'success', data: detail };
  },
};
