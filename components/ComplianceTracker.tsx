
import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Plus, AlertCircle, CheckCircle2, XCircle, Loader2, Info, Activity, Calendar, ShieldCheck } from 'lucide-react';
import { api } from '../services/apiService';
import { ComplianceLog } from '../types';

interface ComplianceTrackerProps {
  childId: string;
}

const ComplianceTracker: React.FC<ComplianceTrackerProps> = ({ childId }) => {
  const [logs, setLogs] = useState<ComplianceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    serviceType: '',
    status: 'Received' as ComplianceLog['status'],
    notes: ''
  });

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLogs();
  }, [childId]);

  const fetchLogs = async () => {
    try {
      const data = await api.getComplianceLogs(childId);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const analytics = useMemo(() => {
    if (logs.length === 0) return { score: 0, services: [] };
    
    const received = logs.filter(l => l.status === 'Received').length;
    const partial = logs.filter(l => l.status === 'Partial').length;
    const score = Math.round(((received + (partial * 0.5)) / logs.length) * 100);

    // Group by service type
    const serviceMap: Record<string, { total: number, delivered: number }> = {};
    logs.forEach(l => {
      if (!serviceMap[l.serviceType]) serviceMap[l.serviceType] = { total: 0, delivered: 0 };
      serviceMap[l.serviceType].total += 1;
      if (l.status === 'Received') serviceMap[l.serviceType].delivered += 1;
      else if (l.status === 'Partial') serviceMap[l.serviceType].delivered += 0.5;
    });

    return { 
      score, 
      services: Object.entries(serviceMap).map(([name, data]) => ({
        name,
        rate: Math.round((data.delivered / data.total) * 100)
      }))
    };
  }, [logs]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (new Date(formData.date) > new Date()) newErrors.date = 'Date cannot be in the future';
    if (!formData.serviceType.trim()) newErrors.serviceType = 'Service type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.addComplianceLog({ ...formData, childId });
      await fetchLogs();
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        serviceType: '',
        status: 'Received',
        notes: ''
      });
    } catch (err) {
      alert("Failed to save log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusUI = (status: ComplianceLog['status']) => {
    switch (status) {
      case 'Received':
        return {
          icon: <CheckCircle2 className="w-5 h-5" />,
          iconBg: 'bg-emerald-100 text-emerald-600 ring-emerald-50',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100/50'
        };
      case 'Missed':
        return {
          icon: <XCircle className="w-5 h-5" />,
          iconBg: 'bg-rose-100 text-rose-600 ring-rose-50',
          badge: 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-100/50'
        };
      case 'Partial':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          iconBg: 'bg-amber-100 text-amber-600 ring-amber-50',
          badge: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100/50'
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Compliance Tracker</h2>
          <p className="text-slate-500 font-medium">Monitoring the delivery of mandated IEP services.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
            showForm 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
          }`}
        >
          {showForm ? 'Cancel Entry' : <><Plus className="w-5 h-5" /> Log Service Unit</>}
        </button>
      </div>

      {/* Analytics Summary */}
      {!isLoading && logs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="p-4 bg-emerald-50 rounded-[30px] mb-4">
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Compliance Score</p>
             <h4 className="text-5xl font-black text-slate-900 leading-tight">{analytics.score}%</h4>
             <p className="text-sm font-medium text-slate-500 mt-2 max-w-[180px]">Ratio of delivered units vs promised services.</p>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Service Type Distribution
            </h4>
            <div className="space-y-6">
              {analytics.services.map((service, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-slate-700">{service.name}</span>
                    <span className={`text-xs font-black ${service.rate > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{service.rate}% Delivery</span>
                  </div>
                  <div className="h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ${service.rate > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${service.rate}%` }} 
                    />
                  </div>
                </div>
              ))}
              {analytics.services.length === 0 && <p className="text-slate-400 italic text-sm py-8 text-center">No service categories mapped yet.</p>}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-indigo-100 shadow-2xl space-y-8 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Service Delivery Date</label>
              <input
                type="date"
                className={`w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold ${
                  errors.date ? 'border-red-500 bg-red-50' : ''
                }`}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mandated Service Type</label>
              <input
                type="text"
                placeholder="e.g. Speech Language Therapy"
                className={`w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold ${
                  errors.serviceType ? 'border-red-500 bg-red-50' : ''
                }`}
                value={formData.serviceType}
                onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Service Status</label>
            <div className="grid grid-cols-3 gap-4">
              {(['Received', 'Partial', 'Missed'] as const).map(s => {
                const ui = getStatusUI(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={`flex flex-col items-center gap-3 py-6 rounded-[32px] border-2 font-black uppercase tracking-widest transition-all ${
                      formData.status === s 
                        ? `bg-white ${ui.badge.split(' ').filter(c => c.startsWith('border-')).join(' ')} ring-4 ring-slate-100` 
                        : 'bg-slate-50 border-transparent text-slate-400 grayscale hover:grayscale-0'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl ${ui.iconBg}`}>
                      {ui.icon}
                    </div>
                    <span className="text-[10px]">{s}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Unit Observations (Optional)</label>
            <textarea
              className="w-full p-4 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none h-32 bg-slate-50 font-medium resize-none"
              placeholder="e.g. Therapist arrived 15 mins late. Child was focused but session ended early."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Seal Log Unit'}
          </button>
        </form>
      )}

      {/* History Ribbon */}
      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
             <h3 className="font-black text-slate-800 text-lg">Advocacy Record</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historical Evidence of Service Delivery</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-200 pr-4">
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Received</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> Missed</span>
            </div>
            <span className="bg-indigo-600 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
              {logs.length} Total Units
            </span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-24 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Decrypting Vault Records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-24 text-center space-y-6">
            <div className="bg-indigo-50 w-24 h-24 rounded-[30px] flex items-center justify-center mx-auto rotate-6">
              <ClipboardCheck className="w-12 h-12 text-indigo-300" />
            </div>
            <div className="max-w-xs mx-auto">
              <h4 className="text-slate-900 font-black text-xl mb-2">The Vault is Empty</h4>
              <p className="text-slate-500 font-medium leading-relaxed">Start tracking your child's service delivery to ensure their legal rights are protected.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map((log) => {
              const ui = getStatusUI(log.status);
              return (
                <div key={log.id} className="relative group p-8 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex gap-6 items-center">
                    <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${ui.iconBg}`}>
                      {ui.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xl tracking-tight leading-tight">{log.serviceType}</h4>
                      <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(log.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        {log.notes && (
                          <div className="flex items-center gap-1.5 text-indigo-500">
                             <Info className="w-3.5 h-3.5" /> Unit Observations Attached
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-transform group-hover:scale-105 shadow-sm ${ui.badge}`}>
                      {log.status}
                    </div>
                  </div>

                  {/* Enhanced Tooltip for Notes */}
                  {log.notes && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-72 p-6 bg-slate-900 text-white rounded-[32px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-50 transform translate-x-4 group-hover:translate-x-0 hidden md:block border border-white/10">
                      <div className="flex items-center gap-2 mb-4 text-indigo-400">
                        <Activity className="w-4 h-4" />
                        <span className="font-black uppercase tracking-widest text-[10px]">Therapeutic Data</span>
                      </div>
                      <p className="leading-relaxed text-indigo-100/80 text-sm font-medium italic">
                        "{log.notes}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceTracker;
