import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { BrainCircuit, Zap, ShieldAlert, AlertTriangle, Activity, TrendingDown, RefreshCcw, CheckCircle2 } from 'lucide-react';

const AIntelligence = () => {
  const [projects, setProjects] = useState([]);
  const [reportsMap, setReportsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects');
      const projData = projRes.data;
      setProjects(projData);

      const map = {};
      for (const p of projData) {
        try {
          const repRes = await api.get(`/projects/${p.id}/ai-reports`);
          if (repRes.data && repRes.data.length > 0) {
            map[p.id] = repRes.data[0]; // Latest report
          }
        } catch (e) {
          console.error(`Failed to fetch AI report for project ${p.id}`, e);
        }
      }
      setReportsMap(map);
    } catch (error) {
      console.error("Failed to fetch intelligence data:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async (projectId) => {
    setAnalyzingId(projectId);
    try {
      const res = await api.post(`/projects/${projectId}/ai-analyze`);
      setReportsMap(prev => ({
        ...prev,
        [projectId]: res.data
      }));
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
        <BrainCircuit className="w-16 h-16 text-blue-500 mb-6 animate-pulse" />
        <p className="text-xl font-medium tracking-wide">Initializing SentinelIQ Engine...</p>
        <p className="text-sm mt-2">Computing risk vectors and trajectory forecasts</p>
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/30 shadow-[0_0_15px_rgba(248,113,113,0.2)]';
      case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'LOW': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex items-center">
            <BrainCircuit className="w-8 h-8 mr-3 text-blue-400" />
            SentinelIQ Intelligence
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Predictive project health, risk forecasting, and automated recommendations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {projects.map((project, idx) => {
          const report = reportsMap[project.id];
          const isAnalyzing = analyzingId === project.id;

          return (
            <div 
              key={project.id} 
              className="bg-[#0f172a]/80 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Decorative background glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none transition-opacity group-hover:bg-blue-500/20" />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">{project.name}</h3>
                  {report ? (
                    <p className="text-slate-400 text-sm flex items-center">
                      <Activity className="w-4 h-4 mr-1.5 text-blue-400" />
                      Last analyzed: {new Date(report.createdAt).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-slate-500 text-sm italic">No AI report generated yet.</p>
                  )}
                </div>
                
                <button 
                  onClick={() => triggerAnalysis(project.id)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCcw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-blue-400' : 'text-purple-400'}`} />
                  {isAnalyzing ? 'Analyzing Data...' : 'Run Diagnostics'}
                </button>
              </div>

              {report ? (
                <div className="space-y-6 relative z-10">
                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 flex flex-col">
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center">
                        <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Risk Level
                      </span>
                      <span className={`mt-auto text-lg font-bold px-3 py-1 rounded-lg border w-fit ${getRiskColor(report.riskLevel)}`}>
                        {report.riskLevel}
                      </span>
                    </div>
                    
                    <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 flex flex-col">
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Risk Score
                      </span>
                      <span className="mt-auto text-3xl font-black text-slate-100">
                        {report.riskScore.toFixed(0)}<span className="text-sm font-medium text-slate-500 ml-1">/100</span>
                      </span>
                    </div>

                    <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 flex flex-col">
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center">
                        <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Productivity
                      </span>
                      <span className="mt-auto text-3xl font-black text-slate-100">
                        {report.productivityScore.toFixed(0)}<span className="text-sm font-medium text-slate-500 ml-1">%</span>
                      </span>
                    </div>

                    <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 flex flex-col">
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 flex items-center">
                        <TrendingDown className="w-3.5 h-3.5 mr-1.5 text-red-400" /> Delay Pred.
                      </span>
                      <span className="mt-auto text-xl font-bold text-slate-100">
                        {report.sprintDelayPrediction} <span className="text-sm font-medium text-slate-500">Days</span>
                      </span>
                    </div>
                  </div>

                  {/* Summary & Recommendations */}
                  <div className="bg-slate-900/40 rounded-2xl p-5 border border-white/5 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                        <BrainCircuit className="w-4 h-4 mr-2 text-purple-400" /> Executive Summary
                      </h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{report.summary}</p>
                    </div>
                    
                    <div className="h-px w-full bg-white/5 my-4" />

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> AI Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {report.recommendations.split('\n').filter(Boolean).map((rec, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-400 bg-black/20 p-3 rounded-xl border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            {rec.replace(/^- /, '')}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {report.bugForecasting && (
                       <div className="pt-2">
                         <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" /> Bug Forecasting
                         </h4>
                         <p className="text-amber-400/80 text-sm bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">{report.bugForecasting}</p>
                       </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center text-center relative z-10">
                  <BrainCircuit className="w-12 h-12 text-slate-600 mb-4" />
                  <p className="text-slate-300 font-medium mb-1">No telemetrics analyzed</p>
                  <p className="text-slate-500 text-sm">Run diagnostics to generate the first AI report for this project.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIntelligence;
