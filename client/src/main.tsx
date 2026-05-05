import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UserProvider } from '@/contexts/UserContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { ToastProvider } from '@/components/Toast';
import './index.css';
import App from './App';

// 主动触发 Material Symbols 字体加载，加载成功后显示图标，失败则隐藏（避免显示英文文本）
let fontLoaded = false;

function addFontLoadedClass(el: Element) {
  if (fontLoaded) {
    el.classList.add('font-loaded');
  }
}

function markAllIcons() {
  document.querySelectorAll('.material-symbols-outlined').forEach((el) => {
    el.classList.add('font-loaded');
  });
}

// 监听后续动态添加的图标元素（始终注册，不依赖字体是否已加载）
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        if (node.classList?.contains('material-symbols-outlined')) {
          addFontLoadedClass(node);
        }
        node.querySelectorAll?.('.material-symbols-outlined').forEach(addFontLoadedClass);
      }
    });
  });
});
observer.observe(document.body, { childList: true, subtree: true });

// 主动触发字体下载（即使当前页面没有使用图标的元素，也会下载字体）
document.fonts.load('24px "Material Symbols Outlined"').then(() => {
  fontLoaded = true;
  markAllIcons();
}).catch(() => {
  // 字体加载失败，图标保持 visibility:hidden，避免显示英文图标名
  console.warn('[Icon] Material Symbols Outlined 字体加载失败');
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
