import COS from 'cos-nodejs-sdk-v5';
import { cosConfig } from '../config/cos';
import { logger } from '../utils/logger';
import path from 'path';

// 初始化 COS 客户端
const cosClient = new COS({
  SecretId: cosConfig.secretId,
  SecretKey: cosConfig.secretKey,
});

/**
 * 上传文件到腾讯云 COS
 */
export const uploadService = {
  /**
   * 上传单个文件
   * @param file multer 文件对象
   * @param userId 用户 ID（用于文件路径隔离）
   * @returns 上传后的公开访问 URL
   */
  async uploadFile(file: Express.Multer.File, userId: string): Promise<{
    url: string;
    name: string;
    size: number;
    type: 'pdf' | 'image' | 'doc' | 'other';
  }> {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileType = getFileType(ext);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).slice(2, 8);
    const objectKey = `BMHdata/health-archives/${userId}/${timestamp}-${randomStr}${ext}`;

    try {
      await cosClient.putObject({
        Bucket: cosConfig.bucket,
        Region: cosConfig.region,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      const url = `${cosConfig.publicBaseUrl}/${objectKey}`;

      logger.info('Upload', `文件上传成功: ${file.originalname} -> ${url}`);

      return {
        url,
        name: file.originalname,
        size: file.size,
        type: fileType,
      };
    } catch (error) {
      logger.error('Upload', `文件上传失败: ${(error as Error).message}`);
      throw { code: 500, message: '文件上传失败' };
    }
  },

  /**
   * 批量上传文件
   */
  async uploadFiles(files: Express.Multer.File[], userId: string) {
    const results = await Promise.all(
      files.map(file => this.uploadFile(file, userId))
    );
    return results;
  },
};

/**
 * 根据文件扩展名判断文件类型
 */
const getFileType = (ext: string): 'pdf' | 'image' | 'doc' | 'other' => {
  if (ext === '.pdf') return 'pdf';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'image';
  if (['.doc', '.docx'].includes(ext)) return 'doc';
  return 'other';
};
