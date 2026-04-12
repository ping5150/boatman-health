import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://118.145.239.169:3002',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://118.145.239.169:3002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // 构建产物目录
    outDir: 'dist',
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生产环境移除 console 和 debugger
    minify: true,
    // 代码分割策略
    rollupOptions: {
      output: {
        // 静态资源分类打包
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
        },
      },
    },
    // chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
  },
});
