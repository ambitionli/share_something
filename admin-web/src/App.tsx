import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCNAntd from 'antd/locale/zh_CN';
import enUSAntd from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Company from './pages/Company';
import Users from './pages/Users';
import Orders from './pages/Orders';
import AutonomyWebViz from './pages/AutonomyWebViz';
import { useAuthStore } from './stores/auth';
import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loadUser } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      loadUser().catch(() => {});
    }
  }, []);

  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { i18n } = useTranslation();
  const antdLocale = i18n.language === 'zh-CN' ? zhCNAntd : enUSAntd;

  return (
    <ConfigProvider locale={antdLocale} theme={{ token: { colorPrimary: '#6366f1' } }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="company" element={<Company />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<Orders />} />
            <Route path="autonomy-webviz" element={<AutonomyWebViz />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
