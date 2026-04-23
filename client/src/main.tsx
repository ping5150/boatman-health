import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UserProvider } from '@/contexts/UserContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { ToastProvider } from '@/components/Toast';
import './index.css';
import App from './App';

// 检测 Material Symbols 字体是否加载成功，成功后显示图标，失败则隐藏（避免显示英文文本）
document.fonts.ready.then(() => {
  const loaded = document.fonts.check('24px "Material Symbols Outlined"');
  if (loaded) {
    document.querySelectorAll('.material-symbols-outlined').forEach((el) => {
      el.classList.add('font-loaded');
    });
    // 监听后续动态添加的图标元素
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.classList?.contains('material-symbols-outlined')) {
              node.classList.add('font-loaded');
            }
            node.querySelectorAll?.('.material-symbols-outlined').forEach((el) => {
              el.classList.add('font-loaded');
            });
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <UserProvider>
        <AuthModalProvider>
          <App />
        </AuthModalProvider>
      </UserProvider>
    </ToastProvider>
  </StrictMode>,
);
