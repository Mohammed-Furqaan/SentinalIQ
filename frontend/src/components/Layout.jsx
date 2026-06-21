import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  FolderKanban, 
  Bug, 
  Users, 
  BrainCircuit,
  Settings,
  LogOut,
  Bell,
  Menu,
  Activity
} from 'lucide-react';
import Modal from './Modal';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/dashboard/projects', icon: FolderKanban },
    { name: 'Kanban Board', path: '/dashboard/kanban', icon: KanbanSquare },
    { name: 'Teams', path: '/dashboard/teams', icon: Users },
    { name: 'Bugs', path: '/dashboard/bugs', icon: Bug },
    { name: 'AI Intelligence', path: '/dashboard/ai', icon: BrainCircuit },
  ];

  if (user?.role === 'ROLE_ADMIN') {
    navItems.push({ name: 'Admin Panel', path: '/dashboard/admin', icon: Settings });
  }

  return (
    <div className="flex h-screen bg-[#0a0f1c] text-slate-100 overflow-hidden selection:bg-blue-500/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/5 border-r border-white/10 backdrop-blur-xl transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 tracking-tight">
            SentinelIQ
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group font-medium text-sm
                ${isActive 
                  ? 'bg-blue-500/15 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`
              }
            >
              <item.icon className="w-5 h-5 transition-colors" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold shadow-inner">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate text-emerald-400">{user?.role?.replace('ROLE_', '')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-xl border-b border-white/10 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNotifModalOpen(true)}
              className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {/* Abstract Glow for content area */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
          <Outlet />
        </main>
      </div>

      <Modal isOpen={isNotifModalOpen} onClose={() => setIsNotifModalOpen(false)} title="Recent Notifications">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10 flex gap-3">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-200">Welcome to SentinelIQ</p>
              <p className="text-xs text-slate-400 mt-1">Your AI-Powered Engineering Intelligence Platform is ready.</p>
              <p className="text-[10px] text-slate-500 mt-2">Just now</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10 flex gap-3 opacity-75">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-200">System Update Complete</p>
              <p className="text-xs text-slate-400 mt-1">Version 2.0 has been deployed with Tailwind v4 improvements.</p>
              <p className="text-[10px] text-slate-500 mt-2">1 hour ago</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Layout;
