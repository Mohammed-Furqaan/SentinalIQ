import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, BrainCircuit, Kanban, Zap, ArrowRight, Shield } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div 
    className={`p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:-translate-y-2 hover:bg-white/10 transition-all duration-300 group shadow-lg shadow-black/20 animate-fade-in-up`}
    style={{ animationDelay: delay }}
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
    </div>
    <h3 className="text-xl font-semibold text-slate-100 mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">
      {description}
    </p>
  </div>
);

const Sparkles = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] overflow-hidden relative selection:bg-blue-500/30">
      {/* Abstract Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            SentinelIQ
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8 animate-fade-in-down opacity-0" style={{ animationDelay: '0ms' }}>
          <Sparkles className="w-4 h-4" />
          <span>Next-Generation Project Intelligence</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-100 mb-8 leading-tight animate-fade-in-up opacity-0" style={{ animationDelay: '50ms' }}>
          Manage Projects with <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x bg-[length:200%_auto]">
            Predictive Intelligence
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
          SentinelIQ predicts delivery risks, detects bottlenecks, and tracks team productivity in real time, helping engineering teams ship with confidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
          <Link to="/register" className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5">
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="text-slate-300 hover:text-white px-8 py-4 font-medium transition-colors">
            Explore Platform
          </a>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-32">
        <div className="text-center mb-16 animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Everything you need to ship faster</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Powerful tools designed for modern engineering teams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={BrainCircuit}
            title="AI Risk Forecasting"
            description="Our Intelligence Engine analyzes tasks, sprints, and bugs to proactively alert you of potential project delays before they happen."
            delay="400ms"
          />
          <FeatureCard 
            icon={Kanban}
            title="Smart Kanban Boards"
            description="Drag and drop tasks seamlessly. Workflows automatically sync across your entire team in real-time."
            delay="500ms"
          />
          <FeatureCard 
            icon={Zap}
            title="Real-Time Telemetry"
            description="WebSockets provide instant notifications for bug reports, task assignments, and critical AI alerts without reloading."
            delay="600ms"
          />
          <FeatureCard 
            icon={Activity}
            title="Productivity Metrics"
            description="Visualize team performance and sprint completion rates with beautiful, interactive Recharts dashboards."
            delay="700ms"
          />
          <FeatureCard 
            icon={Shield}
            title="Enterprise Security"
            description="Secured by stateless JWT authentication, role-based access control, and robust BCrypt password hashing."
            delay="800ms"
          />
          <FeatureCard 
            icon={Activity}
            title="Agile Sprints"
            description="Organize work into sprints, set goals, and monitor progress. Keep the entire team aligned on delivery targets."
            delay="900ms"
          />
        </div>
      </section>
    </div>
  );
};

export default Landing;
