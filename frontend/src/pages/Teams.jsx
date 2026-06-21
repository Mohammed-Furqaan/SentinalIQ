import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Users, Plus, BarChart2 } from 'lucide-react';
import Modal from '../components/Modal';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    memberIds: []
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams', formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', memberIds: [] });
      fetchTeams();
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const openAnalytics = (team) => {
    setSelectedTeam(team);
    setIsAnalyticsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Loading Organization Structure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
            <Users className="w-8 h-8 mr-3 text-purple-500" />
            Teams
          </h1>
          <p className="text-slate-400 mt-1">Manage organizational units and user access</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {teams.map((team, idx) => (
          <div 
            key={team.id} 
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg flex flex-col animate-fade-in-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-slate-100">{team.name}</h3>
              <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">
                {team.members?.length || 0} Members
              </span>
            </div>

            <div className="flex-1 mb-6">
              <h4 className="text-sm font-medium text-slate-500 mb-3">Team Roster</h4>
              <div className="space-y-2">
                {team.members && team.members.length > 0 ? (
                  team.members.map(member => (
                    <div key={member.id} className="flex items-center p-3 rounded-xl bg-slate-900/50 border border-white/5 group hover:bg-slate-800/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold shadow-inner mr-3 group-hover:scale-110 transition-transform">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{member.username}</p>
                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-sm italic py-2 text-center bg-slate-900/30 rounded-xl border border-dashed border-white/10">No members assigned</div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-4">
              <button 
                onClick={() => openAnalytics(team)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-white/5 ml-auto"
              >
                <BarChart2 className="w-4 h-4" /> Analytics
              </button>
            </div>
          </div>
        ))}

        {teams.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
            <Users className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300">No teams found</h3>
            <p className="text-slate-500 mt-2">Create a team to start collaborating.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Team Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g., Frontend Avengers"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-lg shadow-blue-500/25"
            >
              Create Team
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAnalyticsModalOpen} onClose={() => setIsAnalyticsModalOpen(false)} title="Team Analytics">
        <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-white/10 border-dashed">
          <BarChart2 className="w-16 h-16 text-blue-500/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-200 mb-2">Analytics Coming Soon</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            The AI-powered productivity telemetry for {selectedTeam?.name} is currently training. Check back later for real-time velocity metrics.
          </p>
          <button 
            onClick={() => setIsAnalyticsModalOpen(false)}
            className="mt-6 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors border border-white/10"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Teams;
