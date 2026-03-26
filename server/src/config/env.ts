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

  // 表单1 飞书表格
  FORM1_APP_TOKEN: process.env.FORM1_APP_TOKEN || '',
  FORM1_TABLE_ID: process.env.FORM1_TABLE_ID || '',

  // 表单2 飞书表格
  FORM2_APP_TOKEN: process.env.FORM2_APP_TOKEN || '',
  FORM2_TABLE_ID: process.env.FORM2_TABLE_ID || '',

  // 是否为开发模式
  isDev: process.env.NODE_ENV === 'development',
};
