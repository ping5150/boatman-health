import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import SubPageLayout from '@/layouts/SubPageLayout';
import ScrollToTop from '@/components/ScrollToTop';
import AuthGuard from '@/components/AuthGuard';
import AuthModal from '@/components/AuthModal';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import Login from '@/pages/Login';
import About from '@/pages/About';
import Paradigm from '@/pages/Paradigm';
import Cases from '@/pages/Cases';
import Consultation from '@/pages/Consultation';
import HealthForm from '@/pages/HealthForm';
import BookingSuccess from '@/pages/BookingSuccess';
import BookingDetail from '@/pages/BookingDetail';
import Account from '@/pages/Account';
import AccountProfile from '@/pages/AccountProfile';
import HealthArchiveEdit from '@/pages/HealthArchiveEdit';
import HealthProfile from '@/pages/HealthProfile';
import Settings from '@/pages/Settings';
import Logout from '@/pages/Logout';
import Contact from '@/pages/Contact';
import ArchiveSuccess from '@/pages/ArchiveSuccess';
import SleepSurvey from '@/pages/SleepSurvey';
import NutritionSurvey from '@/pages/NutritionSurvey';
import SurveySuccess from '@/pages/SurveySuccess';
import LegalNotice from '@/pages/LegalNotice';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

const App = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* 登录页 - 无布局 */}
        <Route path="/login" element={<Login />} />

        {/* 首页 - 独立布局 */}
        <Route path="/" element={<Home />} />

        {/* 主布局页面（带底部导航） */}
        <Route element={<MainLayout />}>
          <Route path="/services" element={<Services />} />
          <Route
            path="/account"
            element={
              <AuthGuard>
                <Account />
              </AuthGuard>
            }
          />
        </Route>

        {/* 子页面布局（带返回按钮 + 底部导航） */}
        <Route element={<SubPageLayout />}>
          <Route path="/about" element={<About />} />
          <Route path="/paradigm" element={<Paradigm />} />
          <Route path="/cases" element={<Cases />} />
          <Route
            path="/consultation"
            element={
              <AuthGuard>
                <Consultation />
              </AuthGuard>
            }
          />
          <Route
            path="/health-form"
            element={
              <AuthGuard>
                <HealthForm />
              </AuthGuard>
            }
          />
          <Route path="/health-profile" element={<HealthProfile />} />
          <Route
            path="/account/profile"
            element={
              <AuthGuard>
                <AccountProfile />
              </AuthGuard>
            }
          />
          <Route path="/account/health-archive" element={
            <AuthGuard>
              <HealthArchiveEdit />
            </AuthGuard>
          } />
          <Route path="/account/settings" element={
            <AuthGuard>
              <Settings />
            </AuthGuard>
          } />
          <Route path="/account/contact" element={
            <AuthGuard>
              <Contact />
            </AuthGuard>
          } />
          <Route path="/account/logout" element={
            <AuthGuard>
              <Logout />
            </AuthGuard>
          } />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/booking/:id" element={<BookingDetail />} />
          <Route path="/archive-success" element={<ArchiveSuccess />} />
          <Route
            path="/sleep-survey"
            element={
              <AuthGuard>
                <SleepSurvey />
              </AuthGuard>
            }
          />
          <Route
            path="/nutrition-survey"
            element={
              <AuthGuard>
                <NutritionSurvey />
              </AuthGuard>
            }
          />
          <Route path="/survey-success" element={<SurveySuccess />} />
        </Route>

        {/* 独立页面 - 无布局 */}
        <Route path="/legal-notice" element={<LegalNotice />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* 预览路由 - 无需登录 */}
        <Route path="/preview/sleep-survey" element={<SleepSurvey />} />
        <Route path="/preview/nutrition-survey" element={<NutritionSurvey />} />
      </Routes>
      {/* 登录/注册弹窗 */}
      <AuthModal />
    </HashRouter>
  );
};

export default App;
