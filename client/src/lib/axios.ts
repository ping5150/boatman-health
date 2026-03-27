import axios from 'axios';

// 生产环境直接请求服务器，开发环境通过 vite proxy 代理
const baseURL = import.meta.env.PROD
  ? 'http://43.139.240.74:3000/api'
  : '/api';

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
      // 避免在登录页循环跳转
      if (window.location.hash !== '#/login') {
        window.location.href = '/#/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
