import axios from 'axios';

// 生产环境通过 EdgeOne 反向代理，开发环境通过 vite proxy 代理
const baseURL = '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动注入 JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：处理 401 未授权
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 触发自定义事件，通知 AuthModal 打开
      window.dispatchEvent(new CustomEvent('auth:required'));
    }
    return Promise.reject(error);
  },
);

export default api;
