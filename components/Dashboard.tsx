
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  FileSearch,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Quote,
  Clock,
  ExternalLink,
  ChevronRight,
  Target,
  BarChart4,
  Activity,
  PenTool
} from 'lucide-react';
import { ChildProfile, ViewType, GoalProgress, ComplianceLog } from '../types';
import { api } from '../services/apiService';

interface DashboardProps {
  child: ChildProfile;
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ child, onNavigate }) => {
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [complianceLogs, setComplianceLogs] = useState<ComplianceLog[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [progress, compliance] = await Promise.all([
          api.getGoalProgress(child.id),
          api.getComplianceLogs(child.id)
        ]);
        setGoals(progress);
        setComplianceLogs(compliance);
      } catch (e) { console.error(e); }
    };
    loadData();
  }, [child.id]);

  const stats = useMemo(() => {
    const total = complianceLogs.length;
    if (total === 0) return { complianceRate: 0, received: 0 };
    const received = complianceLogs.filter(l => l.status === 'Received').length;
    const partial = complianceLogs.filter(l => l.status === 'Partial').length;
    const rate = Math.round(((received + (partial * 0.5)) / total) * 100);
    return { complianceRate: rate, received };
  }, [complianceLogs]);

  const goalSummary = useMemo(() => {
    return {
      mastered: goals.filter(g => g.status === 'Mastered').length,
      progressing: goals.filter(g => g.status === 'Progressing').length,
      emerging: goals.filter(g => g.status === 'Emerging').length,
      total: goals.length
    };
  }, [goals]);

  const advocacyTips = [
    "Remember: You are an equal member of the IEP team. Your input is vital.",
    "Always ask for data. 'Progress' should be measured, not guessed.",
    "The 'I' in IEP stands for Individualized. One size does not fit all.",
    "FAPE means your child is entitled to a 'meaningful' educational benefit."
  ];

  const currentTip = advocacyTips[Math.floor(Date.now() / 86400000) % advocacyTips.length];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Dynamic Hero Section */}
      <section className="relative overflow-hidden rounded-[40px] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Advocacy Hub Active
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">{child.name}'s</span> Future.
          </h2>
          <p className="text-indigo-100/70 text-lg mb-8 leading-relaxed">
            You are your child's best advocate. AskIEP gives you the tools, data, and confidence to ensure {child.name} thrives.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              id="dashboard-hero-analyze"
              onClick={() => onNavigate('analyzer')}
              className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95"
            >
              <FileSearch className="w-5 h-5 text-indigo-600" />
              Analyze New IEP
            </button>
            <button 
              id="dashboard-hero-lab"
              onClick={() => onNavigate('prep')}
              className="bg-indigo-600/30 backdrop-blur-xl border border-white/10 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-600/50 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <MessageSquare className="w-5 h-5" />
              Advocacy Lab
            </button>
          </div>
        </div>
      </section>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Compliance Meter */}
        <div id="dashboard-compliance-meter" className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Compliance Health
          </h4>
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle 
                  className="text-indigo-600 transition-all duration-1000 ease-out" 
                  strokeWidth="10" 
                  strokeDasharray={`${stats.complianceRate * 2.51}, 251.2`}
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" cx="50" cy="50" 
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 leading-none">{stats.complianceRate}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Delivery</span>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500 text-center">
              {stats.complianceRate > 80 ? "Service delivery is within optimal IDEA bounds." : "Service delivery gap detected. Documentation required."}
            </p>
          </div>
        </div>

        {/* Mastery Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Goal Mastery
          </h4>
          <div className="space-y-4 pt-2">
            {[
              { label: 'Mastered', count: goalSummary.mastered, color: 'bg-emerald-500' },
              { label: 'Progressing', count: goalSummary.progressing, color: 'bg-indigo-500' },
              { label: 'Emerging', count: goalSummary.emerging, color: 'bg-amber-500' }
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-900">{item.count} Goals</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-700`} 
                    style={{ width: `${goalSummary.total ? (item.count / goalSummary.total) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('progress')} className="w-full py-3 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors">
            View Progress Roadmap
          </button>
        </div>

        {/* Advocacy Wisdom */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
          <Quote className="absolute -top-4 -left-4 w-24 h-24 text-white/10" />
          <h4 className="relative z-10 text-xs font-black uppercase tracking-widest text-indigo-200 mb-4">Advocacy Wisdom</h4>
          <p className="relative z-10 text-lg font-medium leading-relaxed italic mb-8">
            "{currentTip}"
          </p>
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold opacity-60">Daily Insight</span>
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Tool Modules */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Advocacy Toolbox</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              id="dashboard-card-goals"
              onClick={() => onNavigate('progress')}
              className="group relative bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <TrendingUp className="w-24 h-24 text-indigo-900" />
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Goal Tracker</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Record real-world data points to prove whether {child.name} is making progress.
              </p>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                Log New Data <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            <button 
              id="dashboard-card-behavior"
              onClick={() => onNavigate('behavior')}
              className="group relative bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <Activity className="w-24 h-24 text-purple-900" />
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Behavior Log</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Track ABC data (Antecedent, Behavior, Consequence) to identify triggers.
              </p>
              <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                Log Incident <ChevronRight className="w-4 h-4" />
              </div>
            </button>

             <button 
              id="dashboard-card-letters"
              onClick={() => onNavigate('letters')}
              className="group relative bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <PenTool className="w-24 h-24 text-amber-900" />
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <PenTool className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Letter Writer</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Generate formal, legally-sound letters for requests and disputes instantly.
              </p>
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                Draft New Letter <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            <button 
              id="dashboard-card-comms"
              onClick={() => onNavigate('comms')}
              className="group relative bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <Activity className="w-24 h-24 text-blue-900" />
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Contact Log</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                The "Paper Trail" is your best defense. Record every call, email, and meeting.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                Secure Log Entry <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          {/* Upcoming Reminders */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
            <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              Action Items
            </h4>
            <div className="space-y-4">
              {[
                { text: 'Finalize Transition Plan', date: 'Due in 4 days', color: 'bg-rose-500' },
                { text: 'Quarterly Progress Report', date: 'Next Week', color: 'bg-amber-500' }
              ].map((rem, i) => (
                <div key={i} className="flex gap-4 items-start group cursor-pointer">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${rem.color}`} />
                  <div>
                    <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{rem.text}</p>
                    <p className="text-xs text-slate-400 font-medium">{rem.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful Links */}
          <div className="bg-indigo-50 rounded-[40px] p-8 border border-indigo-100">
            <h4 className="font-black text-indigo-900 mb-4">Quick Resources</h4>
            <div className="space-y-2">
              <a href="#" className="flex items-center justify-between text-sm font-bold text-indigo-700 hover:text-indigo-900 transition-colors py-2 border-b border-indigo-100 last:border-0">
                IDEA Rights Guide <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="flex items-center justify-between text-sm font-bold text-indigo-700 hover:text-indigo-900 transition-colors py-2 border-b border-indigo-100 last:border-0">
                Drafting Parent Concerns <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
