
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileSearch, 
  MessageSquare, 
  ClipboardCheck, 
  Scale, 
  Settings, 
  BookOpen,
  Bell,
  ShieldCheck,
  TrendingUp,
  Mail,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Child Profile', icon: UserCircle },
    { id: 'analyzer', label: 'IEP Analyzer', icon: FileSearch },
    { id: 'progress', label: 'Goal Progress', icon: TrendingUp },
    { id: 'comms', label: 'Comm Log', icon: Mail },
    { id: 'prep', label: 'Advocacy Lab', icon: MessageSquare },
    { id: 'compliance', label: 'Compliance', icon: ClipboardCheck },
    { id: 'legal', label: 'Legal Support', icon: Scale },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavItemClick = (viewId: ViewType) => {
    onViewChange(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-[14px] shadow-lg shadow-indigo-100 rotate-3">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-slate-900 block leading-none">AskIEP</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Parent Ally</span>
            </div>
          </div>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-indigo-600 rounded-xl"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id as ViewType)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[32px] p-6 text-white relative overflow-hidden">
            <Sparkles className="absolute -top-2 -right-2 w-16 h-16 text-indigo-500 opacity-20" />
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Advocacy Quote</p>
            <p className="text-sm font-medium leading-relaxed">"Knowledge of the law is your child's shield."</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto bg-[#FBFBFE]">
        <header className="sticky top-0 z-20 bg-white/60 backdrop-blur-xl border-b border-slate-100 px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button 
                className="md:hidden bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
                onClick={() => setIsMobileMenuOpen(true)}
             >
                <Menu className="text-white w-5 h-5" />
             </button>
             <h1 className="text-xl font-black text-slate-900 capitalize tracking-tight hidden sm:block">
              {activeView === 'prep' ? 'Advocacy Lab' : activeView.replace('-', ' ')}
            </h1>
            {/* Minimal label for very small screens */}
            <span className="sm:hidden font-black text-slate-900 text-sm tracking-tight truncate max-w-[120px]">
              {activeView === 'prep' ? 'Advocacy Lab' : activeView.replace('-', ' ')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-5">
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-slate-100">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900">Jane Doe</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Advocate Parent</p>
               </div>
               <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center text-white font-black border-2 border-white shadow-lg shadow-indigo-100 uppercase text-xs md:text-sm">
                JD
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default Layout;
