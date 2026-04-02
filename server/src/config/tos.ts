import { env } from './env';

export const tosConfig = {
  accessKeyId: env.TOS_ACCESS_KEY_ID,
  accessKeySecret: env.TOS_ACCESS_KEY_SECRET,
  region: env.TOS_REGION,
  endpoint: env.TOS_ENDPOINT,
  bucket: env.TOS_BUCKET,
  // 公开访问的 CDN 地址
  publicBaseUrl: `https://${env.TOS_BUCKET}.${env.TOS_ENDPOINT}`,
};
