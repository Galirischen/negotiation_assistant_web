import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// 页面导入
import Login from './pages/Login';
import Intelligence from './pages/Intelligence';
import LiveCopilot from './pages/LiveCopilot';
import Workflow from './pages/Workflow';
import TeamDashboard from './pages/Dashboard/TeamDashboard';

// 导航布局
import AppLayout from './components/AppLayout';

import './App.css';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        color: '#fff'
      }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 登录页面 */}
          <Route path="/login" element={<Login />} />

          {/* 受保护的页面 */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/intelligence" replace />} />
                    <Route path="/intelligence" element={<Intelligence />} />
                    <Route path="/live-copilot" element={<LiveCopilot />} />
                    <Route path="/workflow" element={<Workflow />} />
                    <Route path="/dashboard/team" element={<TeamDashboard />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
