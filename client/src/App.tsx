import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ExpensesPage from './pages/ExpensesPage';
import ApprovalsPage from './pages/ApprovalsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import Sidebar from './components/Sidebar';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const [view, setView] = useState<'expenses' | 'approvals' | 'admin'>('expenses');
  const [role, setRole] = useState('EMPLOYEE');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsedUser = JSON.parse(u);
      setRole(parsedUser.role);
      
      // If employee somehow gets into admin or approvals view, reset them
      if (parsedUser.role === 'EMPLOYEE' && (view === 'admin' || view === 'approvals')) {
        setView('expenses');
      }
    }
  }, [view]);

  const renderPage = () => {
    switch (view) {
      case 'approvals': return <ApprovalsPage />;
      case 'admin': return <AdminPanelPage />;
      default: return <ExpensesPage role={role} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={view} onChange={setView} role={role} />
      <div className="page-wrap" style={{ flex: 1 }}>
        {renderPage()}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        } />
      </Routes>
    </Router>
  );
}

export default App;
