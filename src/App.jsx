import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import CommunityPage from './CommunityPage';
import AdminLogin    from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

function AdminRoute() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem('admin_token')
  );

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<CommunityPage />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
