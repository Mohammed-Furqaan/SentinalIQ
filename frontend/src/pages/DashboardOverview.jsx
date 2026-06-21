import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Activity, Target, ShieldAlert, Bug as BugIcon, BrainCircuit, TrendingUp } from 'lucide-react';

const DashboardOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Loading Intelligence Telemetry...</p>
      </div>
    );
  }

  if (!data) return <div className="text-red-400 p-8">Error loading dashboard data. Please try again.</div>;

  // Format bug severity for BarChart
  const bugData = Object.keys(data.bugSeverityDistribution || {}).map(key => ({
    name: key,
    count: data.bugSeverityDistribution[key]
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const StatCard = ({ title, value, subtext, icon: Icon, trend, iconColor, bgClass }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg flex flex-col hover:-translate-y-1 transition-transform animate-fade-in-up">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {trend && (
          <span className="flex items-center text-emerald-400 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-4 h-4 mr-1" /> {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-slate-100">{value}</div>
      <p className="text-slate-500 text-sm mt-2">{subtext}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Intelligence Hub</h1>
          <p className="text-slate-400 mt-1">Real-time metrics from the SentinelIQ engine</p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Projects" 
          value={data.activeProjects || 0} 
          subtext={`Out of ${data.totalProjects || 0} total projects`}
          icon={Activity} 
          iconColor="text-blue-400"
          bgClass="bg-blue-400/20"
        />
        <StatCard 
          title="Avg Productivity" 
          value={`${(data.averageProductivityScore || 0).toFixed(1)}%`} 
          subtext="Team throughput score"
          icon={Target} 
          trend="+5.2%"
          iconColor="text-emerald-400"
          bgClass="bg-emerald-400/20"
        />
        <StatCard 
          title="AI Risk Index" 
          value={(data.averageRiskScore || 0).toFixed(1)} 
          subtext="Predicted delay likelihood"
          icon={ShieldAlert} 
          iconColor={(data.averageRiskScore || 0) > 50 ? "text-red-400" : "text-purple-400"}
          bgClass={(data.averageRiskScore || 0) > 50 ? "bg-red-400/20" : "bg-purple-400/20"}
        />
        <StatCard 
          title="Open Bugs" 
          value={data.openBugs || 0} 
          subtext="Issues requiring attention"
          icon={BugIcon} 
          iconColor="text-amber-400"
          bgClass="bg-amber-400/20"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md lg:col-span-2 shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-blue-400" />
            Sprint Velocity & Forecasting
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sprintVelocity || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Area type="monotone" dataKey="velocity" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVelocity)" name="Actual Velocity" />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Target Velocity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Project Status</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.projectStatusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(data.projectStatusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
             <BugIcon className="w-5 h-5 mr-2 text-red-400" />
             Bug Severity Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bugData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff0a' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {bugData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'CRITICAL' ? '#ef4444' : entry.name === 'HIGH' ? '#f59e0b' : entry.name === 'MEDIUM' ? '#3b82f6' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-400" />
            Project Health Overview
          </h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Project Name</th>
                  <th className="px-4 py-3 font-medium text-right">Productivity Score</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {(data.projectMetricsList || []).map((project, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">{project.projectName}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${project.score > 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {project.score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${project.risk > 50 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                        {project.risk.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
