import api from '@/lib/axios';

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: 'pdf' | 'image' | 'doc' | 'other';
}

/**
 * 上传文件到服务端（服务端代理转发至火山引擎 TOS）
 * @param files 文件列表
 * @param onProgress 上传进度回调 (0-100)
 */
export const uploadFiles = async (
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<UploadResult[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const res = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000, // 上传超时 2 分钟
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress(percent);
      }
    },
  });

  return res.data.data;
};

/**
 * 上传单个文件
 */
export const uploadFile = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> => {
  const results = await uploadFiles([file], onProgress);
  return results[0];
};
