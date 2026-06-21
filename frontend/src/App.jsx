import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Layout from './components/Layout';
import DashboardOverview from './pages/DashboardOverview';
import KanbanBoard from './pages/KanbanBoard';
import Projects from './pages/Projects';
import Teams from './pages/Teams';
import Bugs from './pages/Bugs';
import AIntelligence from './pages/AIntelligence';
import AdminPanel from './pages/AdminPanel';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="bg-slate-900 min-h-screen text-slate-50 font-sans selection:bg-blue-500/30">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Dashboard Routes using Nested Layout */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<DashboardOverview />} />
          <Route path="projects" element={<Projects />} />
          <Route path="kanban" element={<KanbanBoard />} />
          <Route path="teams" element={<Teams />} />
          <Route path="bugs" element={<Bugs />} />
          <Route path="ai" element={<AIntelligence />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
