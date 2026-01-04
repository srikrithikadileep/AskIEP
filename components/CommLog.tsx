
import React, { useState, useEffect } from 'react';
import { Mail, Plus, Phone, Users, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/apiService';
import { CommLogEntry } from '../types';

interface CommLogProps {
  childId: string;
}

const CommLog: React.FC<CommLogProps> = ({ childId }) => {
  const [logs, setLogs] = useState<CommLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    contactName: '',
    method: 'Email' as CommLogEntry['method'],
    summary: '',
    followUpNeeded: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadComms();
  }, [childId]);

  const loadComms = async () => {
    try {
      const data = await api.getCommLogs(childId);
      setLogs(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.contactName.trim()) newErrors.contactName = "Contact name required";
    if (!formData.summary.trim()) newErrors.summary = "Summary required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await api.addCommLog({ ...formData, childId });
      loadComms();
      setShowForm(false);
      setFormData({ date: new Date().toISOString().split('T')[0], contactName: '', method: 'Email', summary: '', followUpNeeded: false });
      setErrors({});
    } catch (e) { alert("Failed to save."); }
  };

  const getMethodIcon = (method: CommLogEntry['method']) => {
    switch (method) {
      case 'Email': return <Mail className="w-4 h-4" />;
      case 'Phone': return <Phone className="w-4 h-4" />;
      case 'IEP Meeting': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contact Log</h2>
          <p className="text-slate-500">Maintain a thorough "paper trail" of all interactions with the school team.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg"
        >
          {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> Log Contact</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Date</label>
              <input 
                type="date"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Contact Name / Role</label>
              <input 
                className={`w-full p-3 border rounded-xl outline-none ${errors.contactName ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                placeholder="e.g. Mrs. Smith (Case Manager)"
                value={formData.contactName}
                onChange={e => setFormData({...formData, contactName: e.target.value})}
              />
              {errors.contactName && <p className="text-rose-500 text-xs font-bold">{errors.contactName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Method</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value as any})}
              >
                <option>Email</option>
                <option>Phone</option>
                <option>In-person</option>
                <option>IEP Meeting</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input 
                type="checkbox" 
                id="followup"
                className="w-5 h-5 accent-indigo-600"
                checked={formData.followUpNeeded}
                onChange={e => setFormData({...formData, followUpNeeded: e.target.checked})}
              />
              <label htmlFor="followup" className="text-sm font-bold text-slate-700">Follow-up Needed?</label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Summary of Interaction</label>
            <textarea 
              className={`w-full p-4 border rounded-xl outline-none h-24 ${errors.summary ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
              placeholder="What was discussed? What was agreed upon?"
              value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
            />
            {errors.summary && <p className="text-rose-500 text-xs font-bold">{errors.summary}</p>}
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
            Record Contact Entry
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-300" /></div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-slate-200 p-20 rounded-[40px] text-center">
          <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No communication logs yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Start logging every contact with the school. Documentation is your most powerful tool in advocacy.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:border-indigo-200 transition-all">
              <div className="md:w-48 shrink-0">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
                  {getMethodIcon(log.method)}
                  <span className="text-xs uppercase tracking-wider">{log.method}</span>
                </div>
                <p className="text-slate-400 text-xs font-bold">{new Date(log.date).toLocaleDateString()}</p>
                {log.follow_up_needed && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                    <AlertCircle className="w-3 h-3" /> Follow-up Required
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 mb-2">{log.contact_name}</h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{log.summary}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommLog;
