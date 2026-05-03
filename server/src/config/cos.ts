import { env } from './env';

export const cosConfig = {
  secretId: env.COS_SECRET_ID,
  secretKey: env.COS_SECRET_KEY,
  bucket: env.COS_BUCKET,
  region: env.COS_REGION,
  // 公开访问的 CDN 地址
  publicBaseUrl: `https://${env.COS_BUCKET}.cos.${env.COS_REGION}.myqcloud.com`,
};
