
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import IEPAnalyzer from './components/IEPAnalyzer';
import MeetingPrep from './components/MeetingPrep';
import ComplianceTracker from './components/ComplianceTracker';
import Profile from './components/Profile';
import ProgressTracker from './components/ProgressTracker';
import CommLog from './components/CommLog';
import Resources from './components/Resources';
import LegalSupport from './components/LegalSupport';
import Settings from './components/Settings';
import { ViewType, ChildProfile } from './types';
import { api } from './services/apiService';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Loader2,
  Settings as SettingsIcon,
  Zap,
  WifiOff,
  User,
  GraduationCap,
  Target,
  Scale,
  Heart,
  BookOpen,
  MessageCircle,
  LogIn,
  Fingerprint,
  Smartphone,
  Lock,
  Mail,
  SmartphoneNfc,
  AtSign
} from 'lucide-react';
import { MOCK_DISABILITIES } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);

  const loadProfile = useCallback(async (forceLocal = false) => {
    setIsLoading(true);
    try {
      const serverAvailable = forceLocal ? false : await api.checkHealth();
      setIsLocalMode(!serverAvailable);

      const profile = await api.getProfile();
      if (profile) {
        setChildProfile(profile);
      }
    } catch (err) {
      setIsLocalMode(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLoginStart = (email: string) => {
    setUserEmail(email);
    setActiveView('2fa');
  };

  const handle2FAVerified = () => {
    setIsAuthenticated(true);
    if (childProfile) {
      setActiveView('dashboard');
    } else {
      setActiveView('onboarding');
    }
  };

  const handleFinishOnboarding = async (profileData: Partial<ChildProfile>) => {
    setIsLoading(true);
    try {
      const savedProfile = await api.saveProfile(profileData);
      setChildProfile(savedProfile);
      setActiveView('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (activeView === 'login') {
    return <Login onLoginSuccess={handleLoginStart} />;
  }

  if (activeView === '2fa') {
    return <TwoFactorAuth userEmail={userEmail} onVerified={handle2FAVerified} onBack={() => setActiveView('login')} />;
  }

  if (activeView === 'onboarding' && isAuthenticated) {
    return <Onboarding onComplete={handleFinishOnboarding} />;
  }

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {isLocalMode && (
        <div className="mb-6 bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2">
          <WifiOff className="w-5 h-5 text-indigo-400" />
          <div className="flex-1">
            <p className="font-black text-[10px] uppercase tracking-widest text-indigo-400">Edge Privacy Enabled</p>
            <p className="font-medium text-slate-400 text-xs">Local vault active.</p>
          </div>
        </div>
      )}
      
      {(() => {
        if (!childProfile && activeView !== 'onboarding') return null;
        const child = childProfile!;
        switch (activeView) {
          case 'dashboard': return <Dashboard child={child} onNavigate={setActiveView} />;
          case 'profile': return <Profile child={child} onUpdate={setChildProfile} />;
          case 'analyzer': return <IEPAnalyzer childId={child.id} />;
          case 'prep': return <MeetingPrep childContext={`${child.name}, age ${child.age}, grade ${child.grade}. Disabilities: ${child.disabilities?.join(', ')}`} />;
          case 'compliance': return <ComplianceTracker childId={child.id} />;
          case 'progress': return <ProgressTracker childId={child.id} />;
          case 'comms': return <CommLog childId={child.id} />;
          case 'legal': return <LegalSupport />;
          case 'resources': return <Resources />;
          case 'settings': return <Settings />;
          default: return <Dashboard child={child} onNavigate={setActiveView} />;
        }
      })()}
    </Layout>
  );
};

const Login: React.FC<{ onLoginSuccess: (email: string) => void }> = ({ onLoginSuccess }) => {
  const [emailInput, setEmailInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const handleProviderLogin = (provider: string) => {
    if (!emailInput.trim()) {
      alert("Please enter your email or identity ID first.");
      return;
    }
    setActiveProvider(provider);
    setIsLoggingIn(true);
    setTimeout(() => {
      onLoginSuccess(emailInput);
      setIsLoggingIn(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="bg-indigo-600 w-20 h-20 rounded-[30px] flex items-center justify-center shadow-2xl mx-auto rotate-3">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Identity Vault</h2>
          <p className="text-slate-500 font-medium">Enter your ID to access your advocacy records.</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <AtSign className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Google Email or Apple ID"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleProviderLogin('Apple')}
                disabled={isLoggingIn}
                className="bg-black text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg disabled:opacity-50"
              >
                {isLoggingIn && activeProvider === 'Apple' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-83.6-20.8-42.3 0-81.8 24.4-103.5 62.4-44.4 77.1-11.4 191.2 31.6 253.5 21 30.5 45.9 64.6 78.5 63.4 31.3-1.2 43.1-20.2 81-20.2 37.9 0 48.6 20.2 81.3 19.6 33.3-.6 54.4-30.7 75.3-61.2 24.2-35.2 34.1-69.4 34.6-71.2-.7-.3-66.5-25.5-66.7-102.3zM280.3 72.5c15.4-18.6 25.8-44.5 22.9-70.4-22.3 1-49.3 15-65.3 33.7-14.4 16.7-27 43.3-23.7 68.4 24.8 2 49.8-13.2 66.1-31.7z"/></svg>
                )}
                Apple ID
              </button>
              <button 
                onClick={() => handleProviderLogin('Google')}
                disabled={isLoggingIn}
                className="bg-white text-slate-700 border-2 border-slate-100 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-md disabled:opacity-50"
              >
                {isLoggingIn && activeProvider === 'Google' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                )}
                Google ID
              </button>
            </div>
          </div>

          <div className="relative py-2 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 whitespace-nowrap">Legacy Access</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <button 
            disabled={isLoggingIn || !emailInput.trim()}
            onClick={() => handleProviderLogin('Email')}
            className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
          >
            {isLoggingIn && activeProvider === 'Email' ? <Loader2 className="w-6 h-6 animate-spin" /> : <><LogIn className="w-6 h-6" /> Authenticate Vault</>}
          </button>
        </div>

        <div className="pt-4 flex items-center justify-center gap-4 text-slate-400">
           <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-white" /></div>
              <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center"><Lock className="w-4 h-4 text-white" /></div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
             GDPR & FERPA Compliant<br/>Identity Bridge
           </p>
        </div>
      </div>
    </div>
  );
};

const TwoFactorAuth: React.FC<{ userEmail: string, onVerified: () => void, onBack: () => void }> = ({ userEmail, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6 && /^\d$/.test(char)) {
        newOtp[i] = char;
      }
    });
    setOtp(newOtp);
    // Focus last filled or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    if (otp.some(digit => digit === '')) return;
    setIsVerifying(true);
    setTimeout(() => {
      onVerified();
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full space-y-8 animate-in slide-in-from-right-8 duration-500">
        <div className="text-center space-y-4">
          <div className="bg-emerald-500 w-20 h-20 rounded-[30px] flex items-center justify-center shadow-2xl mx-auto -rotate-3">
            <SmartphoneNfc className="text-white w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Security Layer</h2>
          <div className="bg-slate-100 py-2 px-4 rounded-full inline-block">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Sending Code to: <span className="text-indigo-600">{userEmail}</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 space-y-10">
          <div className="flex justify-between gap-2 sm:gap-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onPaste={handlePaste}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-3xl font-black text-indigo-600 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
            ))}
          </div>

          <div className="space-y-4">
            <button 
              disabled={otp.some(digit => digit === '') || isVerifying}
              onClick={handleVerify}
              className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-[0.98] shadow-xl"
            >
              {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Fingerprint className="w-6 h-6" /> Unlock Access</>}
            </button>
            <div className="flex items-center justify-between px-2">
               <button 
                onClick={onBack}
                className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-1"
               >
                 <ArrowLeft className="w-3 h-3" /> Change ID
               </button>
               <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline decoration-2">
                 Resend Code
               </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-emerald-500 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100">
               <Smartphone className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Secure Device</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
              Your 2FA ensures that even if someone knows your ID, they cannot access {userEmail}'s sensitive IEP vault without physical device access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Onboarding: React.FC<{ onComplete: (p: Partial<ChildProfile>) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState<Partial<ChildProfile>>({ 
    name: '', 
    age: 8, 
    grade: '', 
    disabilities: [],
    advocacyLevel: 'Beginner',
    primaryGoal: 'Document Analysis',
    stateContext: ''
  });

  const steps = [
    { title: "Welcome", icon: Heart },
    { title: "Persona", icon: User },
    { title: "Student", icon: GraduationCap },
    { title: "Needs", icon: Target },
    { title: "Goals", icon: Scale }
  ];

  const toggleDisability = (d: string) => {
    const current = formData.disabilities || [];
    setFormData({
      ...formData,
      disabilities: current.includes(d) ? current.filter(i => i !== d) : [...current, d]
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <div className="bg-indigo-600 w-24 h-24 rounded-[40px] flex items-center justify-center shadow-2xl mb-12 rotate-3 mx-auto">
              <ShieldCheck className="text-white w-12 h-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight text-balance">Protect Their Future.</h1>
            <p className="text-xl text-slate-500 max-w-xl mb-12 font-medium mx-auto">The world's first AI-powered advocacy suite for parents of children with specialized needs.</p>
            <button 
              onClick={() => setStep(1)} 
              className="bg-indigo-600 text-white px-12 py-6 rounded-[32px] font-black text-xl flex items-center gap-4 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 mx-auto"
            >
              Initialize Vault <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-2">Advocacy Persona</h2>
              <p className="text-slate-500 font-medium">How familiar are you with the IEP process?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'Beginner', label: 'Newbie', desc: 'Starting my child\'s IEP journey.' },
                { id: 'Intermediate', label: 'Advocate', desc: 'I\'ve been to many meetings.' },
                { id: 'Advanced', label: 'Veteran', desc: 'I know IDEA inside and out.' }
              ].map(level => (
                <button
                  key={level.id}
                  onClick={() => setFormData({ ...formData, advocacyLevel: level.id as any })}
                  className={`p-8 rounded-[40px] border-2 text-left transition-all hover:shadow-xl ${
                    formData.advocacyLevel === level.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                  }`}
                >
                  <h4 className="font-black text-xl mb-2">{level.label}</h4>
                  <p className={`text-sm font-medium ${formData.advocacyLevel === level.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {level.desc}
                  </p>
                </button>
              ))}
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-center">Your State (e.g., California)</label>
              <input 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                placeholder="Localized Legal Context"
                value={formData.stateContext}
                onChange={e => setFormData({ ...formData, stateContext: e.target.value })}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 max-w-lg mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-2">Student Profile</h2>
              <p className="text-slate-500 font-medium">Tell us about your child.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Full Name</label>
                <input 
                  autoFocus
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="Enter student name..." 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Age</label>
                  <input type="number" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Grade</label>
                  <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500" placeholder="e.g. 3rd Grade" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-2">Disability Context</h2>
              <p className="text-slate-500 font-medium">Select any that apply to help the AI focus its analysis.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {MOCK_DISABILITIES.map(d => {
                const active = formData.disabilities?.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDisability(d)}
                    className={`px-6 py-4 rounded-[28px] border-2 font-bold transition-all ${
                      active 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-2">Your Focus</h2>
              <p className="text-slate-500 font-medium">What is your primary goal today?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 'Document Analysis', icon: BookOpen, label: 'Audit IEP' },
                { id: 'Meeting Preparation', icon: MessageCircle, label: 'Practice Meeting' },
                { id: 'Goal Tracking', icon: Target, label: 'Track Data' },
                { id: 'Compliance Check', icon: ShieldCheck, label: 'Verify Services' }
              ].map(goal => (
                <button
                  key={goal.id}
                  onClick={() => setFormData({ ...formData, primaryGoal: goal.id })}
                  className={`p-8 rounded-[40px] border-2 flex flex-col items-center text-center gap-4 transition-all hover:shadow-xl ${
                    formData.primaryGoal === goal.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                  }`}
                >
                  <goal.icon className={`w-10 h-10 ${formData.primaryGoal === goal.id ? 'text-white' : 'text-indigo-500'}`} />
                  <span className="font-black uppercase tracking-widest text-xs">{goal.label}</span>
                </button>
              ))}
            </div>
            <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 max-w-lg mx-auto text-center">
              <p className="text-indigo-800 text-sm font-medium italic">
                "We will personalize your experience based on {formData.primaryGoal?.toLowerCase()}."
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center justify-center">
      {step > 0 && (
        <div className="w-full max-w-4xl mb-12 animate-in fade-in duration-1000">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setStep(prev => prev - 1)}
              className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-3">
              {steps.map((s, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    step >= i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-300'
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                </div>
              ))}
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-700 ease-out" 
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }} 
            />
          </div>
        </div>
      )}

      <div className={`w-full ${step === 0 ? 'max-w-4xl' : 'max-w-5xl'}`}>
        {renderStep()}
        
        {step > 0 && (
          <div className="mt-12 flex justify-center">
            {step === steps.length - 1 ? (
              <button 
                onClick={() => onComplete(formData)}
                disabled={!formData.name}
                className="bg-indigo-600 text-white px-12 py-5 rounded-[32px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3"
              >
                <Sparkles className="w-6 h-6" /> Open Advocacy Vault
              </button>
            ) : (
              <button 
                onClick={() => setStep(prev => prev + 1)}
                disabled={step === 2 && !formData.name}
                className="bg-slate-900 text-white px-12 py-5 rounded-[32px] font-black text-lg shadow-xl hover:bg-indigo-600 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3"
              >
                Continue <ArrowRight className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
