import { env } from './env';

export const feishuConfig = {
  appId: env.FEISHU_APP_ID,
  appSecret: env.FEISHU_APP_SECRET,
  form1: {
    appToken: env.FORM1_APP_TOKEN,
    tableId: env.FORM1_TABLE_ID,
  },
  form2: {
    appToken: env.FORM2_APP_TOKEN,
    tableId: env.FORM2_TABLE_ID,
  },
  // 飞书 API 基础地址
  baseUrl: 'https://open.feishu.cn/open-apis',

  // 是否启用飞书同步（配置不完整时自动禁用）
  get isEnabled(): boolean {
    return !!(this.appId && this.appSecret);
  },
};
