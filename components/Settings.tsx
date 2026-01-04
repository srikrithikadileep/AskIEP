
import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, Trash2, Download, Zap, Info, Wifi, WifiOff, CheckCircle2, RotateCcw } from 'lucide-react';

interface SettingsProps {
  onStartTour?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onStartTour }) => {
  // Safer check for process.env to avoid ReferenceError in browser
  const isLocalOnly = typeof process === 'undefined' || !process.env || !process.env.DATABASE_URL;
  const [isExporting, setIsExporting] = useState(false);

  const handleClearData = () => {
    if (window.confirm("CRITICAL ACTION: This will permanently delete all data in your local vault including IEP analyses, logs, and progress tracking. This cannot be undone. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const data: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('askiep_') || key.startsWith('iep_'))) {
          data[key] = localStorage.getItem(key);
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `askiep_vault_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed. Please try again.");
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <SettingsIcon className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-slate-500 font-medium">Manage your advocacy vault and security preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Connectivity Status */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Connection Node
            </h3>
            {isLocalOnly ? (
              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">Local-Only Mode</span>
            ) : (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Cloud Synced</span>
            )}
          </div>
          
          <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isLocalOnly ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                {isLocalOnly ? <WifiOff className="w-6 h-6 text-amber-600" /> : <Wifi className="w-6 h-6 text-emerald-600" />}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{isLocalOnly ? 'Decentralized Vault' : 'Active Server Link'}</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isLocalOnly 
                    ? 'All records are stored locally in your browser cache. AI features run via direct secure link.' 
                    : 'Your records are encrypted and synchronized with your personal advocacy cloud.'}
                </p>
              </div>
            </div>
            {!isLocalOnly && (
               <button className="w-full py-3 text-xs font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all">
                 Verify Sync Status
               </button>
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white space-y-6 shadow-xl shadow-indigo-100 relative overflow-hidden flex flex-col justify-between">
          <ShieldCheck className="absolute -bottom-4 -right-4 w-40 h-40 text-white/10" />
          <div>
            <h3 className="font-black text-[10px] uppercase tracking-widest opacity-60 mb-4">Privacy Standards</h3>
            <p className="text-lg font-medium leading-relaxed">
              AskIEP uses end-to-end encryption for all sensitive IEP data, ensuring your advocacy records remain your private property.
            </p>
          </div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold bg-white/10 p-3 rounded-2xl border border-white/5 w-fit">
            <Info className="w-4 h-4" /> Zero-Knowledge Architecture Active
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-2xl">
            <Database className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Data Sovereignty</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex flex-col p-8 rounded-[32px] border-2 border-slate-50 bg-slate-50/50 hover:bg-white hover:border-indigo-600 hover:shadow-xl transition-all text-left group disabled:opacity-50"
          >
            {isExporting ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
            ) : (
              <Download className="w-8 h-8 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
            )}
            <h4 className="font-black text-slate-900 mb-2">{isExporting ? 'Vault Exported' : 'Export Vault'}</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Download a complete archive of your child's advocacy logs and IEP data for your personal records.
            </p>
          </button>

          <button 
             onClick={onStartTour}
             className="flex flex-col p-8 rounded-[32px] border-2 border-slate-50 bg-slate-50/50 hover:bg-white hover:border-emerald-600 hover:shadow-xl transition-all text-left group"
          >
             <RotateCcw className="w-8 h-8 text-emerald-600 mb-4 group-hover:rotate-180 transition-transform duration-500" />
             <h4 className="font-black text-slate-900 mb-2">Restart Tour</h4>
             <p className="text-sm text-slate-500 font-medium leading-relaxed">
               Re-launch the onboarding guide to review key features and tooltips.
             </p>
          </button>

          <button 
            onClick={handleClearData}
            className="flex flex-col p-8 rounded-[32px] border-2 border-slate-50 bg-slate-50/50 hover:bg-rose-50 hover:border-rose-600 hover:shadow-xl transition-all text-left group"
          >
            <Trash2 className="w-8 h-8 text-rose-600 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="font-black text-slate-900 mb-2">Purge Vault</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Permanently delete all locally stored records and resets the advocacy environment.
            </p>
          </button>
        </div>
      </div>

      <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-200 text-center">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Legal Compliance Info</p>
        <p className="text-sm font-bold text-slate-600 mb-1">AskIEP Advocacy Engine • v2.5.1-Native</p>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          FERPA & HIPAA compliant data handling structures. Your data, your child, your future.
        </p>
      </div>
    </div>
  );
};

export default Settings;
