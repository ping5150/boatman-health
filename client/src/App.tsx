import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import SubPageLayout from '@/layouts/SubPageLayout';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import Login from '@/pages/Login';
import About from '@/pages/About';
import Paradigm from '@/pages/Paradigm';
import Cases from '@/pages/Cases';
import Consultation from '@/pages/Consultation';
import HealthForm from '@/pages/HealthForm';
import BookingSuccess from '@/pages/BookingSuccess';
import Account from '@/pages/Account';
import AccountProfile from '@/pages/AccountProfile';
import HealthArchiveEdit from '@/pages/HealthArchiveEdit';
import HealthProfile from '@/pages/HealthProfile';
import Settings from '@/pages/Settings';
import Logout from '@/pages/Logout';
import Contact from '@/pages/Contact';
import ArchiveSuccess from '@/pages/ArchiveSuccess';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        {/* 登录页 - 无布局 */}
        <Route path="/login" element={<Login />} />

        {/* 主布局页面（带底部导航） */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/account" element={<Account />} />
        </Route>

        {/* 子页面布局（带返回按钮 + 底部导航） */}
        <Route element={<SubPageLayout />}>
          <Route path="/about" element={<About />} />
          <Route path="/paradigm" element={<Paradigm />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/health-form" element={<HealthForm />} />
          <Route path="/health-profile" element={<HealthProfile />} />
          <Route path="/account/profile" element={<AccountProfile />} />
          <Route path="/account/health-archive" element={<HealthArchiveEdit />} />
          <Route path="/account/settings" element={<Settings />} />
          <Route path="/account/contact" element={<Contact />} />
          <Route path="/account/logout" element={<Logout />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/archive-success" element={<ArchiveSuccess />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
