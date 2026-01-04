
import React, { useState, useEffect } from 'react';
import { Activity, Plus, Clock, AlertTriangle, ArrowRight, Loader2, Info } from 'lucide-react';
import { api } from '../services/apiService';
import { BehaviorLog } from '../types';

interface BehaviorTrackerProps {
  childId: string;
}

const BehaviorTracker: React.FC<BehaviorTrackerProps> = ({ childId }) => {
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    antecedent: '',
    behavior: '',
    consequence: '',
    intensity: 1 as 1 | 2 | 3 | 4 | 5,
    duration_minutes: 0,
    notes: ''
  });

  useEffect(() => {
    loadLogs();
  }, [childId]);

  const loadLogs = async () => {
    try {
      const data = await api.getBehaviorLogs(childId);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.antecedent.trim()) newErrors.antecedent = "Required";
    if (!formData.behavior.trim()) newErrors.behavior = "Required";
    if (!formData.consequence.trim()) newErrors.consequence = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await api.addBehaviorLog({ ...formData, childId });
      loadLogs();
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        antecedent: '',
        behavior: '',
        consequence: '',
        intensity: 1,
        duration_minutes: 0,
        notes: ''
      });
      setErrors({});
    } catch (e) {
      alert("Failed to save log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIntensityColor = (level: number) => {
    if (level <= 2) return 'bg-emerald-500';
    if (level === 3) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Behavior Log (ABC)</h2>
          <p className="text-slate-500 font-medium leading-relaxed">Track Antecedents, Behaviors, and Consequences to identify patterns.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
            showForm 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none' 
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'
          }`}
        >
          {showForm ? 'Cancel Entry' : <><Plus className="w-5 h-5" /> Log Incident</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] border border-purple-100 shadow-2xl space-y-6 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
               <input 
                 type="date"
                 required
                 className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-purple-500/10"
                 value={formData.date}
                 onChange={e => setFormData({ ...formData, date: e.target.value })}
               />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Time</label>
               <input 
                 type="time"
                 required
                 className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-purple-500/10"
                 value={formData.time}
                 onChange={e => setFormData({ ...formData, time: e.target.value })}
               />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
               <div className="flex justify-between">
                 <label className="text-xs font-black uppercase tracking-widest text-purple-600 ml-1 flex items-center gap-1">
                   Antecedent <Info className="w-3 h-3 text-slate-300" />
                 </label>
                 {errors.antecedent && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.antecedent}</span>}
               </div>
               <textarea
                 className={`w-full p-4 bg-purple-50/30 border rounded-2xl font-medium outline-none h-32 resize-none focus:ring-4 focus:ring-purple-500/10 placeholder:text-slate-400 placeholder:font-normal ${errors.antecedent ? 'border-rose-300' : 'border-purple-100'}`}
                 placeholder="What happened immediately before? (e.g. asked to stop playing)"
                 value={formData.antecedent}
                 onChange={e => setFormData({ ...formData, antecedent: e.target.value })}
               />
             </div>
             <div className="space-y-2">
               <div className="flex justify-between">
                 <label className="text-xs font-black uppercase tracking-widest text-purple-600 ml-1">Behavior</label>
                 {errors.behavior && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.behavior}</span>}
               </div>
               <textarea
                 className={`w-full p-4 bg-purple-50/50 border rounded-2xl font-medium outline-none h-32 resize-none focus:ring-4 focus:ring-purple-500/10 placeholder:text-slate-400 placeholder:font-normal ${errors.behavior ? 'border-rose-300' : 'border-purple-200'}`}
                 placeholder="What did the child do? Be specific. (e.g. threw pencil)"
                 value={formData.behavior}
                 onChange={e => setFormData({ ...formData, behavior: e.target.value })}
               />
             </div>
             <div className="space-y-2">
               <div className="flex justify-between">
                 <label className="text-xs font-black uppercase tracking-widest text-purple-600 ml-1">Consequence</label>
                 {errors.consequence && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.consequence}</span>}
               </div>
               <textarea
                 className={`w-full p-4 bg-purple-50/30 border rounded-2xl font-medium outline-none h-32 resize-none focus:ring-4 focus:ring-purple-500/10 placeholder:text-slate-400 placeholder:font-normal ${errors.consequence ? 'border-rose-300' : 'border-purple-100'}`}
                 placeholder="What happened immediately after? (e.g. sent to hallway)"
                 value={formData.consequence}
                 onChange={e => setFormData({ ...formData, consequence: e.target.value })}
               />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Intensity Level (1-5)</label>
               <div className="flex justify-between gap-2">
                 {[1, 2, 3, 4, 5].map(level => (
                   <button
                     type="button"
                     key={level}
                     onClick={() => setFormData({ ...formData, intensity: level as any })}
                     className={`flex-1 py-3 rounded-xl font-black transition-all ${
                       formData.intensity === level 
                         ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105' 
                         : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                     }`}
                   >
                     {level}
                   </button>
                 ))}
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Duration (Minutes)</label>
               <input
                 type="number"
                 className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-purple-500/10"
                 value={formData.duration_minutes}
                 onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
               />
            </div>
          </div>

          <button
             type="submit"
             disabled={isSubmitting}
             className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-purple-700 shadow-xl shadow-purple-100 active:scale-[0.98]"
          >
             {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Behavior Record'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-300" /></div>
      ) : logs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-[40px] text-center">
          <Activity className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-800 mb-2">No incidents recorded</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">Tracking behavior patterns helps the IEP team develop effective interventions (BIPs).</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md ${getIntensityColor(log.intensity)}`}>
                    {log.intensity}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{new Date(log.date).toLocaleDateString()}</h4>
                    <p className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {log.time} • {log.duration_minutes} mins
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                     Observer Note
                   </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Antecedent</p>
                  <p className="text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-2xl leading-relaxed">
                    {log.antecedent}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Behavior</p>
                   <p className="text-sm font-bold text-slate-900 bg-purple-50 p-4 rounded-2xl leading-relaxed border border-purple-100">
                    {log.behavior}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consequence</p>
                   <p className="text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-2xl leading-relaxed">
                    {log.consequence}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BehaviorTracker;
