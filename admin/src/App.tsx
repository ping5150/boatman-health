import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AuthGuard from './components/AuthGuard';
import AdminLayout from './components/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import BookingListPage from './pages/BookingList';
import ArchiveListPage from './pages/ArchiveList';
import FormDetailPage from './pages/FormDetail';
import SleepSurveyListPage from './pages/SleepSurveyList';
import NutritionSurveyListPage from './pages/NutritionSurveyList';
import SurveyDetailPage from './pages/SurveyDetail';
import UserListPage from './pages/UserList';
import UserDetailPage from './pages/UserDetail';

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <HashRouter>
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
            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/booking" element={<BookingListPage />} />
            <Route path="/booking/:id" element={<FormDetailPage />} />
            <Route path="/archive" element={<ArchiveListPage />} />
            <Route path="/archive/:id" element={<FormDetailPage />} />
            <Route path="/sleep-survey" element={<SleepSurveyListPage />} />
            <Route path="/sleep-survey/:id" element={<SurveyDetailPage />} />
            <Route path="/nutrition-survey" element={<NutritionSurveyListPage />} />
            <Route path="/nutrition-survey/:id" element={<SurveyDetailPage />} />
          </Route>

          {/* 未匹配路由重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
};

export default App;
