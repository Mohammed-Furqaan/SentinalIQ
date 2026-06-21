import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Shield, Users, Activity, Database, Server, Terminal, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ROLE_DEVELOPER'
  });

  const handleInviteUser = async (e) => {
    e.preventDefault();
    try {
      // Create user via the auth/register endpoint since there's no dedicated invite endpoint yet
      await api.post('/auth/register', formData);
      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'ROLE_DEVELOPER' });
      // Re-fetch or locally append the new user to refresh the table
      const response = await api.get('/users').catch(() => null);
      if (response && response.data) {
        setUsers(response.data);
      } else {
        // Fallback update if the endpoint isn't fully set up yet
        setUsers(prev => [...prev, { 
          id: Date.now(), 
          ...formData, 
          enabled: true 
        }]);
      }
    } catch (error) {
      console.error("Failed to invite user:", error);
    }
  };

  // Mock server stats for the dashboard
  const serverStats = {
    cpu: 34,
    ram: 68,
    storage: 45,
    uptime: '14d 6h 22m',
    activeConnections: 142
  };

  const auditLogs = [
    { id: 1, action: 'User Login', user: 'admin', ip: '192.168.1.104', time: '2 mins ago', status: 'SUCCESS' },
    { id: 2, action: 'Data Export', user: 'sarah_pm', ip: '10.0.0.45', time: '15 mins ago', status: 'SUCCESS' },
    { id: 3, action: 'Failed Login', user: 'unknown', ip: '114.55.20.1', time: '1 hour ago', status: 'FAILED' },
    { id: 4, action: 'Role Update', user: 'admin', ip: '192.168.1.104', time: '3 hours ago', status: 'SUCCESS' },
    { id: 5, action: 'API Key Gen', user: 'mike_dev', ip: '10.0.0.22', time: '5 hours ago', status: 'SUCCESS' }
  ];

  useEffect(() => {
    // Attempt to fetch users if the endpoint exists, otherwise fallback to seeded mocks for the UI demo
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        // Fallback mock data if endpoint isn't exposed yet
        setUsers([
          { id: 1, username: 'admin', email: 'admin@sentineliq.com', role: 'ROLE_ADMIN', enabled: true },
          { id: 2, username: 'sarah_pm', email: 'sarah@sentineliq.com', role: 'ROLE_PROJECT_MANAGER', enabled: true },
          { id: 3, username: 'mike_dev', email: 'mike@sentineliq.com', role: 'ROLE_DEVELOPER', enabled: true },
          { id: 4, username: 'alex_qa', email: 'alex@sentineliq.com', role: 'ROLE_DEVELOPER', enabled: false }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
        <Shield className="w-16 h-16 text-emerald-500 mb-6 animate-pulse" />
        <p className="text-xl font-medium tracking-wide">Authenticating Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400 flex items-center">
            <Shield className="w-8 h-8 mr-3" />
            System Administration
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Manage users, monitor server telemetry, and review security logs.</p>
        </div>
      </div>

      {/* Telemetry Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> CPU Load
          </span>
          <div className="mt-auto flex items-end gap-2">
            <span className="text-3xl font-black text-slate-100">{serverStats.cpu}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${serverStats.cpu}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center">
            <Database className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> RAM Usage
          </span>
          <div className="mt-auto flex items-end gap-2">
            <span className="text-3xl font-black text-slate-100">{serverStats.ram}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${serverStats.ram}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center">
            <Server className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Storage
          </span>
          <div className="mt-auto flex items-end gap-2">
            <span className="text-3xl font-black text-slate-100">{serverStats.storage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${serverStats.storage}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center">
            <Terminal className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Uptime
          </span>
          <span className="text-xl font-bold text-slate-200">{serverStats.uptime}</span>
        </div>

        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col justify-between hidden lg:flex">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center">
            <Users className="w-3.5 h-3.5 mr-1.5 text-pink-400" /> Active Conns
          </span>
          <span className="text-3xl font-black text-slate-100">{serverStats.activeConnections}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h2 className="text-xl font-bold text-slate-100 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              User Access Control
            </h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-inner"
            >
              + Invite User
            </button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{user.username}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center text-xs font-bold bg-slate-800 text-slate-300 border border-white/10 px-2.5 py-1 rounded-md">
                        {user.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.enabled ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <Lock className="w-3.5 h-3.5" /> DISABLED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors">
                        Edit Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Security Audit Log */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-bold text-slate-100 flex items-center">
              <Terminal className="w-5 h-5 mr-2 text-emerald-400" />
              Security Audit Log
            </h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex gap-4 items-start p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <div className="mt-0.5">
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-200">{log.action}</p>
                      <span className="text-[10px] text-slate-500">{log.time}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      User: <span className="font-medium text-slate-300">{log.user}</span> • IP: {log.ip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-white/10 bg-slate-900/50">
            <button className="w-full text-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
              View Full Audit Trail &rarr;
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite New User">
        <form onSubmit={handleInviteUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
            <input 
              type="text" 
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="e.g., new_developer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="user@sentineliq.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Role Assignment</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none"
            >
              <option value="ROLE_DEVELOPER">Developer</option>
              <option value="ROLE_PROJECT_MANAGER">Project Manager</option>
              <option value="ROLE_ADMIN">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Temporary Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-lg shadow-emerald-500/25"
            >
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPanel;
