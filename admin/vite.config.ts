import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // 管理后台部署在 /admin/ 子路径下（生产环境）
  base: process.env.NODE_ENV === 'production' ? '/admin/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // 构建产物目录
    outDir: 'dist',
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 使用默认压缩（oxc，比 terser 更快）
    minify: true,
    // 代码分割策略
    rollupOptions: {
      output: {
        // 静态资源分类打包
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks(id) {
          // Ant Design 和 @ant-design 先匹配（但不包含 react）
          if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design')) {
            return 'antd-vendor';
          }
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          if (id.includes('node_modules/dayjs')) {
            return 'dayjs';
          }
        },
      },
    },
    // chunk 大小警告阈值（antd 较大，适当放宽）
    chunkSizeWarningLimit: 600,
  },
});
