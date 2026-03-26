import axios from 'axios';
import { message } from 'antd';
import { tokenUtil } from '../utils/token';

const request = axios.create({
  baseURL: '',
  timeout: 15000,
});

// 请求拦截器：注入 Token
request.interceptors.request.use(
  (config) => {
    const token = tokenUtil.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.code !== 0) {
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message));
    }
    return data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        message.error('登录已过期，请重新登录');
        tokenUtil.clear();
        window.location.href = '/admin/#/login';
      } else if (status === 403) {
        message.error('无权限访问');
      } else {
        message.error(data?.message || '请求失败');
      }
    } else {
      message.error('网络异常，请检查网络连接');
    }
    return Promise.reject(error);
  },
);

export default request;
