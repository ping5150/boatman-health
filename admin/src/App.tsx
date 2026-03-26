import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AuthGuard from './components/AuthGuard';
import AdminLayout from './components/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import Form1ListPage from './pages/Form1List';
import Form2ListPage from './pages/Form2List';
import FormDetailPage from './pages/FormDetail';
import SyncManagementPage from './pages/SyncManagement';

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 需要认证的路由 */}
          <Route
            element={
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/form1" element={<Form1ListPage />} />
            <Route path="/form2" element={<Form2ListPage />} />
            <Route path="/form1/:id" element={<FormDetailPage />} />
            <Route path="/form2/:id" element={<FormDetailPage />} />
            <Route path="/sync" element={<SyncManagementPage />} />
          </Route>

          {/* 未匹配路由重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
