import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Bug as BugIcon, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

const Bugs = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    projectId: '',
    status: 'OPEN'
  });

  useEffect(() => {
    fetchBugs();
    fetchProjects();
  }, []);

  const fetchBugs = async () => {
    try {
      const response = await api.get('/bugs');
      setBugs(response.data);
    } catch (error) {
      console.error("Failed to fetch bugs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, projectId: response.data[0].id }));
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const handleReportBug = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bugs', formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', severity: 'MEDIUM', projectId: projects[0]?.id || '', status: 'OPEN' });
      fetchBugs();
    } catch (error) {
      console.error("Failed to report bug:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Loading Defect Tracker...</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'HIGH': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'MEDIUM': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'LOW': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
            <BugIcon className="w-8 h-8 mr-3 text-red-500" />
            Bug Tracker
          </h1>
          <p className="text-slate-400 mt-1">Identify, triage, and resolve defects efficiently</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/25 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400 uppercase text-xs tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Issue</th>
                <th className="px-6 py-4 font-semibold">Project</th>
                <th className="px-6 py-4 font-semibold text-center">Severity</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Assignee</th>
                <th className="px-6 py-4 font-semibold text-right">Reported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bugs.map((bug, idx) => (
                <tr key={bug.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 text-slate-500 group-hover:text-red-400 transition-colors" />
                      <div>
                        <div className="font-medium text-slate-200 mb-1 group-hover:text-blue-400 transition-colors">{bug.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-md">{bug.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-xs font-medium bg-slate-800 text-slate-300 border border-white/10 px-2.5 py-1 rounded-md">
                      {bug.project?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getSeverityColor(bug.severity)}`}>
                      {bug.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {bug.status === 'RESOLVED' || bug.status === 'CLOSED' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> RESOLVED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" /> OPEN
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    {bug.assignee ? (
                      <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded-full border border-white/5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold shadow-inner text-white">
                          {bug.assignee.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-300 pr-1">{bug.assignee.username}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400">
                    {new Date(bug.reportedAt || Date.now()).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {bugs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">
                    No bugs found. The codebase is clean!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report New Issue">
        <form onSubmit={handleReportBug} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Issue Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              placeholder="e.g., API returning 500 on checkout"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Description & Steps to Reproduce</label>
            <textarea 
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
              placeholder="1. Go to page... 2. Click button... 3. See error..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Severity</label>
              <select 
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors appearance-none"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Target Project</label>
              <select 
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors appearance-none"
                required
              >
                <option value="" disabled>Select a project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors shadow-lg shadow-red-500/25"
            >
              Submit Issue
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Bugs;
