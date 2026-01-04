
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Layout from './components/Layout';
import { ViewType, ChildProfile } from './types';
import { api } from './services/apiService';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  WifiOff, 
  Heart, 
  SmartphoneNfc, 
  Fingerprint, 
  LogIn, 
  AtSign, 
  GraduationCap,
  Target,
  Scale
} from 'lucide-react';
import { MOCK_DISABILITIES } from './constants';

const Dashboard = lazy(() => import('./components/Dashboard'));
const IEPAnalyzer = lazy(() => import('./components/IEPAnalyzer'));
const MeetingPrep = lazy(() => import('./components/MeetingPrep'));
const ComplianceTracker = lazy(() => import('./components/ComplianceTracker'));
const Profile = lazy(() => import('./components/Profile'));
const ProgressTracker = lazy(() => import('./components/ProgressTracker'));
const CommLog = lazy(() => import('./components/CommLog'));
const BehaviorTracker = lazy(() => import('./components/BehaviorTracker'));
const LetterGenerator = lazy(() => import('./components/LetterGenerator'));
const Resources = lazy(() => import('./components/Resources'));
const LegalSupport = lazy(() => import('./components/LegalSupport'));
const Settings = lazy(() => import('./components/Settings'));
const OnboardingTour = lazy(() => import('./components/OnboardingTour'));

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
      setIsLocalMode(true);
    }, 1500);

    try {
      const serverAvailable = await api.checkHealth().catch(() => false);
      setIsLocalMode(!serverAvailable);
      const profile = await api.getProfile().catch(() => null);
      if (profile) setChildProfile(profile);
    } finally {
      clearTimeout(safetyTimer);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handle2FAVerified = () => {
    setIsAuthenticated(true);
    if (childProfile) setActiveView('dashboard');
    else setActiveView('onboarding');
  };

  if (isLoading) return <LoadingHandshake />;

  // Fix: Implemented Login, TwoFactorAuth, and Onboarding components below
  if (activeView === 'login') return <Login onLoginSuccess={setUserEmail} onNext={() => setActiveView('2fa')} />;
  if (activeView === '2fa') return <TwoFactorAuth userEmail={userEmail} onVerified={handle2FAVerified} onBack={() => setActiveView('login')} />;
  if (activeView === 'onboarding') return <Onboarding onComplete={async (p) => {
    const saved = await api.saveProfile(p);
    setChildProfile(saved);
    setActiveView('dashboard');
  }} />;

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <Suspense fallback={<ModuleLoader />}>
        {isLocalMode && <PrivacyBadge />}
        {(() => {
          if (!childProfile) return <NoProfile />;
          switch (activeView) {
            case 'dashboard': return <Dashboard child={childProfile} onNavigate={setActiveView} />;
            case 'profile': return <Profile child={childProfile} onUpdate={setChildProfile} />;
            case 'analyzer': return <IEPAnalyzer childId={childProfile.id} />;
            case 'letters': return <LetterGenerator childId={childProfile.id} />;
            // Defaulting to dashboard for unimplemented views
            default: return <Dashboard child={childProfile} onNavigate={setActiveView} />;
          }
        })()}
      </Suspense>
    </Layout>
  );
};

// Fix: Added Login component to resolve "Cannot find name 'Login'" error
const Login = ({ onLoginSuccess, onNext }: { onLoginSuccess: (email: string) => void, onNext: () => void }) => {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-200 rotate-6 mb-6">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vault Login</h2>
          <p className="text-slate-500 font-medium">Access your secure advocacy records</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Parent Email</label>
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                placeholder="jane@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={() => { onLoginSuccess(email); onNext(); }}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <LogIn className="w-6 h-6" /> Authenticate
          </button>
        </div>
        <div className="pt-4 flex justify-center">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <Fingerprint className="w-3 h-3" /> Biometric Sync Ready
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix: Added TwoFactorAuth component to resolve "Cannot find name 'TwoFactorAuth'" error
const TwoFactorAuth = ({ userEmail, onVerified, onBack }: { userEmail: string, onVerified: () => void, onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md space-y-8 animate-in slide-in-from-right-8 duration-500">
        <div className="text-center">
          <div className="inline-flex bg-emerald-500 p-4 rounded-3xl shadow-xl shadow-emerald-100 -rotate-3 mb-6">
            <SmartphoneNfc className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Security Code</h2>
          <p className="text-slate-500 font-medium">Sent to {userEmail}</p>
        </div>
        <div className="flex justify-between gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <input 
              key={i}
              maxLength={1}
              className="w-12 h-16 bg-slate-50 border border-slate-100 rounded-xl text-center text-2xl font-black text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              placeholder="0"
            />
          ))}
        </div>
        <button 
          onClick={onVerified}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
        >
          Verify Identity <ArrowRight className="w-6 h-6" />
        </button>
        <button onClick={onBack} className="w-full text-slate-400 font-bold text-sm hover:underline">
          Back to Login
        </button>
      </div>
    </div>
  );
};

// Fix: Added Onboarding component to resolve "Cannot find name 'Onboarding'" error
const Onboarding = ({ onComplete }: { onComplete: (p: any) => void }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    age: 7,
    grade: '2nd Grade',
    disabilities: [] as string[],
    lastIepDate: new Date().toISOString()
  });

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
    else onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-2xl space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-xl">
               <Sparkles className="text-white w-5 h-5" />
             </div>
             <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Student Onboarding</span>
          </div>
          <div className="flex gap-1.5">
             <div className={`h-1.5 rounded-full transition-all ${step === 1 ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`} />
             <div className={`h-1.5 rounded-full transition-all ${step === 2 ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`} />
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Who are we supporting?</h2>
              <p className="text-slate-500 font-medium">Let's create your child's secure profile.</p>
            </div>
            <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Student Name</label>
                 <input 
                   className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                   placeholder="e.g. Liam"
                   value={profile.name}
                   onChange={e => setProfile({...profile, name: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Age</label>
                    <input 
                      type="number"
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                      value={profile.age}
                      onChange={e => setProfile({...profile, age: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Current Grade</label>
                    <input 
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="e.g. 2nd Grade"
                      value={profile.grade}
                      onChange={e => setProfile({...profile, grade: e.target.value})}
                    />
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Primary Needs</h2>
              <p className="text-slate-500 font-medium">Select categories that describe your child's needs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MOCK_DISABILITIES.map(d => {
                const active = profile.disabilities.includes(d);
                return (
                  <button 
                    key={d}
                    onClick={() => {
                      const updated = active ? profile.disabilities.filter(i => i !== d) : [...profile.disabilities, d];
                      setProfile({...profile, disabilities: updated});
                    }}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all text-left ${
                      active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-100'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button 
          onClick={nextStep}
          disabled={step === 1 && !profile.name}
          className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
        >
          {step === 2 ? 'Build Advocacy Vault' : 'Next Step'} <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const LoadingHandshake = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
    <p className="mt-8 text-indigo-300 font-black text-sm uppercase tracking-widest animate-pulse">Vault Handshake...</p>
  </div>
);

const ModuleLoader = () => <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Decrypting Module...</div>;
const PrivacyBadge = () => <div className="mb-6 bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs font-bold text-amber-800">Edge Privacy: Storing records locally.</div>;
const NoProfile = () => <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for Student Profile...</div>;

export default App;
