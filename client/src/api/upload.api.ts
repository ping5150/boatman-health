import api from '@/lib/axios';
import axios from 'axios';

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: 'pdf' | 'image' | 'doc' | 'other';
}

// 开发环境下直接请求生产服务器，绕过 Vite 代理的 body size 限制
const UPLOAD_BASE_URL = import.meta.env.DEV
  ? 'https://www.boatmanhealth.com/api'
  : '/api';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * 上传文件到服务端（服务端代理转发至火山引擎 TOS）
 * @param files 文件列表
 * @param onProgress 上传进度回调 (0-100)
 */
export const uploadFiles = async (
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<UploadResult[]> => {
  // 前置校验：单个文件不超过 50MB
  const oversized = files.find(file => file.size > MAX_FILE_SIZE);
  if (oversized) {
    throw new Error(`文件 ${oversized.name} 超过 50MB 限制，请压缩后重试`);
  }

  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const token = localStorage.getItem('token');
  const res = await axios.post(`${UPLOAD_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 120000, // 上传超时 2 分钟
    withCredentials: false,
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
