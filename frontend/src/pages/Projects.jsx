import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { FolderKanban, Plus, Calendar, Target, Activity, Clock, ShieldAlert } from 'lucide-react';
import Modal from '../components/Modal';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PLANNING',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', status: 'PLANNING', startDate: '', endDate: '' });
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Loading Projects Data...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'PLANNING': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'DELAYED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'COMPLETED': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
            <FolderKanban className="w-8 h-8 mr-3 text-blue-500" />
            Projects
          </h1>
          <p className="text-slate-400 mt-1">Manage all organization initiatives and portfolios</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <div 
            key={project.id} 
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col animate-fade-in-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getStatusColor(project.status)} uppercase tracking-wider`}>
                {project.status}
              </span>
              {project.manager && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold shadow-inner" title={`Manager: ${project.manager.username}`}>
                  {project.manager.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">
              {project.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
                <div className="flex items-center text-slate-400 text-xs font-medium mb-1">
                  <Activity className="w-3 h-3 mr-1 text-emerald-400" /> Productivity
                </div>
                <div className="text-lg font-bold text-slate-200">
                  {project.productivityScore ? project.productivityScore.toFixed(1) : 'N/A'}%
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
                <div className="flex items-center text-slate-400 text-xs font-medium mb-1">
                  <ShieldAlert className="w-3 h-3 mr-1 text-red-400" /> AI Risk
                </div>
                <div className="text-lg font-bold text-slate-200">
                  {project.riskScore ? project.riskScore.toFixed(1) : '0.0'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {new Date(project.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {new Date(project.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
            <FolderKanban className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300">No projects found</h3>
            <p className="text-slate-500 mt-2">Get started by creating your first project.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g., Q3 Analytics Engine"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              placeholder="Brief overview of the project objectives..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
              <input 
                type="date" 
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Target End Date</label>
              <input 
                type="date" 
                required
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-lg shadow-blue-500/25"
            >
              Initialize Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
