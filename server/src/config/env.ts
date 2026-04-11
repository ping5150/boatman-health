import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  // 服务配置
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // 数据库
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  JWT_EXPIRES_IN: '7d',

  // 飞书
  FEISHU_APP_ID: process.env.FEISHU_APP_ID || '',
  FEISHU_APP_SECRET: process.env.FEISHU_APP_SECRET || '',

  // 用户表 飞书表格
  USER_APP_TOKEN: process.env.USER_APP_TOKEN || '',
  USER_TABLE_ID: process.env.USER_TABLE_ID || '',

  // 表单1 飞书表格（预约表）
  FORM1_APP_TOKEN: process.env.FORM1_APP_TOKEN || '',
  FORM1_TABLE_ID: process.env.FORM1_TABLE_ID || '',

  // 表单2 飞书表格（档案表）
  FORM2_APP_TOKEN: process.env.FORM2_APP_TOKEN || '',
  FORM2_TABLE_ID: process.env.FORM2_TABLE_ID || '',

  // 睡眠问卷 飞书表格
  SLEEP_SURVEY_APP_TOKEN: process.env.SLEEP_SURVEY_APP_TOKEN || '',
  SLEEP_SURVEY_TABLE_ID: process.env.SLEEP_SURVEY_TABLE_ID || '',

  // 营养问卷 飞书表格
  NUTRITION_SURVEY_APP_TOKEN: process.env.NUTRITION_SURVEY_APP_TOKEN || '',
  NUTRITION_SURVEY_TABLE_ID: process.env.NUTRITION_SURVEY_TABLE_ID || '',

  // 火山引擎 TOS 对象存储
  TOS_ACCESS_KEY_ID: process.env.TOS_ACCESS_KEY_ID || '',
  TOS_ACCESS_KEY_SECRET: process.env.TOS_ACCESS_KEY_SECRET || '',
  TOS_REGION: process.env.TOS_REGION || 'cn-guangzhou',
  TOS_ENDPOINT: process.env.TOS_ENDPOINT || 'tos-cn-guangzhou.volces.com',
  TOS_BUCKET: process.env.TOS_BUCKET || 'boatman-health',

  // 是否为开发模式
  isDev: process.env.NODE_ENV === 'development',
};
