
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Plus, Target, CheckCircle2, AlertCircle, Loader2, BarChart3, ArrowUpRight, Scale } from 'lucide-react';
import { api } from '../services/apiService';
import { GoalProgress } from '../types';

interface ProgressTrackerProps {
  childId: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ childId }) => {
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    goalName: '',
    currentValue: '',
    targetValue: '',
    status: 'Emerging' as GoalProgress['status']
  });

  useEffect(() => {
    loadProgress();
  }, [childId]);

  const loadProgress = async () => {
    try {
      const data = await api.getGoalProgress(childId);
      setGoals(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const masteryData = useMemo(() => {
    const total = goals.length;
    if (total === 0) return { percent: 0, statusBreakdown: [] };
    
    const mastered = goals.filter(g => g.status === 'Mastered').length;
    const progressing = goals.filter(g => g.status === 'Progressing').length;
    
    return {
      percent: Math.round(((mastered + (progressing * 0.5)) / total) * 100),
      masteredCount: mastered,
      totalCount: total
    };
  }, [goals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goalName) return;
    try {
      await api.addGoalProgress({ ...formData, childId });
      loadProgress();
      setShowForm(false);
      setFormData({ goalName: '', currentValue: '', targetValue: '', status: 'Emerging' });
    } catch (e) { alert("Failed to save."); }
  };

  const getStatusColor = (status: GoalProgress['status']) => {
    switch (status) {
      case 'Mastered': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Progressing': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Emerging': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Regression': return 'text-rose-600 bg-rose-50 border-rose-100';
    }
  };

  const getBarColor = (status: GoalProgress['status']) => {
    switch (status) {
      case 'Mastered': return 'bg-emerald-500 shadow-emerald-100';
      case 'Progressing': return 'bg-blue-500 shadow-blue-100';
      case 'Emerging': return 'bg-amber-500 shadow-amber-100';
      case 'Regression': return 'bg-rose-500 shadow-rose-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Goal Progress Tracker</h2>
          <p className="text-slate-500 font-medium leading-relaxed">Quantifiable data is your child's strongest legal advocate.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
            showForm 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
          }`}
        >
          {showForm ? 'Cancel Update' : <><Plus className="w-5 h-5" /> Log Update</>}
        </button>
      </div>

      {/* Mastery Dashboard Header */}
      {!isLoading && goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Overall Mastery Index
              </h3>
              <span className="text-2xl font-black text-indigo-600">{masteryData.percent}%</span>
            </div>
            <div className="h-4 bg-slate-50 rounded-full overflow-hidden shadow-inner flex">
              <div 
                className="h-full bg-emerald-500 border-r border-white/20 transition-all duration-1000" 
                style={{ width: `${(goals.filter(g => g.status === 'Mastered').length / goals.length) * 100}%` }} 
              />
              <div 
                className="h-full bg-blue-500 border-r border-white/20 transition-all duration-1000" 
                style={{ width: `${(goals.filter(g => g.status === 'Progressing').length / goals.length) * 100}%` }} 
              />
              <div 
                className="h-full bg-amber-500 border-r border-white/20 transition-all duration-1000" 
                style={{ width: `${(goals.filter(g => g.status === 'Emerging').length / goals.length) * 100}%` }} 
              />
              <div 
                className="h-full bg-rose-500 transition-all duration-1000" 
                style={{ width: `${(goals.filter(g => g.status === 'Regression').length / goals.length) * 100}%` }} 
              />
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Goal Spectrum</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Mastery</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> Regression</span>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex flex-col items-center justify-center text-center shadow-xl shadow-indigo-100">
            <Scale className="w-10 h-10 mb-4 opacity-50" />
            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Educational Benefit</p>
            <h4 className="text-3xl font-black">{masteryData.masteredCount} / {masteryData.totalCount}</h4>
            <p className="text-sm font-medium opacity-80 mt-2">Goals Mastered to Date</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-indigo-100 shadow-2xl space-y-8 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">IEP Goal or Milestone</label>
              <input 
                autoFocus
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
                placeholder="e.g. Reads 40 words per minute"
                value={formData.goalName}
                onChange={e => setFormData({...formData, goalName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Current Score</label>
                <input 
                  type="number"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                  placeholder="25"
                  value={formData.currentValue}
                  onChange={e => setFormData({...formData, currentValue: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">IEP Target</label>
                <input 
                  type="number"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                  placeholder="40"
                  value={formData.targetValue}
                  onChange={e => setFormData({...formData, targetValue: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Current Status</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['Emerging', 'Progressing', 'Mastered', 'Regression'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({...formData, status: s})}
                  className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                    formData.status === s 
                      ? (s === 'Emerging' ? 'bg-amber-600 text-white border-amber-600' : 
                         s === 'Mastered' ? 'bg-emerald-600 text-white border-emerald-600' :
                         s === 'Progressing' ? 'bg-blue-600 text-white border-blue-600' :
                         'bg-rose-600 text-white border-rose-600')
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
            Commit Progress Update to Vault
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-300" /></div>
      ) : goals.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-[40px] text-center">
          <BarChart3 className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-800 mb-2">No data points recorded yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">Start recording your child's milestones to see their growth visualized over time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {goals.map(goal => {
            const current = parseFloat(goal.current_value) || 0;
            const target = parseFloat(goal.target_value) || 1;
            const percentage = Math.min(100, Math.round((current / target) * 100));
            const barColor = getBarColor(goal.status);
            
            return (
              <div key={goal.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Log Timestamp</p>
                      <p className="text-xs font-black text-slate-600">{new Date(goal.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{goal.goal_name}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Current Performance</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900 leading-none">{goal.current_value}</span>
                          <span className="text-slate-300 font-bold">/ {goal.target_value}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 text-emerald-500 font-black text-xs mb-1">
                          <ArrowUpRight className="w-3 h-3" /> Growth Detected
                        </div>
                        <p className={`text-4xl font-black leading-none ${goal.status === 'Mastered' ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="relative w-full h-5 bg-slate-50 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100">
                      <div 
                        className={`h-full ${barColor} transition-all duration-1000 ease-out shadow-sm rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressTracker;
