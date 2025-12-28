
import React, { useState, useRef, useEffect } from 'react';
import { Scale, Send, Loader2, ShieldAlert, BookOpen, MessageCircle, ArrowRight, Gavel, Trash2, Info } from 'lucide-react';
import { chatWithLegalDirect } from '../services/geminiService';
import { Message } from '../types';
import { Content } from '@google/genai';

const LegalSupport: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const QUICK_QUERIES = [
    "What is FAPE?",
    "Requesting an IEE",
    "Stay Put rights",
    "10-Day Notice help"
  ];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const query = (text || input).trim();
    if (!query || isLoading) return;

    if (!text) setInput('');
    
    const newUserMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Map existing messages to Gemini Content history format
      const history: Content[] = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await chatWithLegalDirect(query, history);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Legal AI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I encountered an error accessing the legal database. Please check your connection and try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
        <div className="p-4 bg-indigo-50 rounded-3xl shrink-0">
          <Scale className="w-10 h-10 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Legal Support Center</h2>
          <p className="text-slate-500 font-medium">Navigate IDEA regulations and Special Education law with AI guidance.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-[32px] flex gap-4 items-start">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-black text-amber-900 uppercase tracking-widest text-[10px] mb-1 text-center md:text-left">Legal Disclaimer</p>
          <p className="text-amber-800 font-medium leading-relaxed">
            AskIEP Legal Support provides information about the Individuals with Disabilities Education Act (IDEA). 
            <strong> It does not provide legal advice.</strong> Laws vary by state; consult a specialized attorney for specific legal issues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[650px]">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest px-2">Common Hurdles</h4>
            {QUICK_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="w-full text-left p-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-between group shadow-sm disabled:opacity-50"
              >
                {q} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
          
          <div className="bg-slate-900 rounded-[32px] p-6 text-white shrink-0">
            <h5 className="font-black text-indigo-400 text-[10px] uppercase tracking-[0.2em] mb-4">Advocacy Tip</h5>
            <p className="text-sm font-medium leading-relaxed italic text-indigo-100/80">
              "The goal is not to win an argument, but to secure the services your child needs for a FAPE."
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden relative">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 relative z-10">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal AI Consultant</span>
            </div>
            <button 
              onClick={() => setMessages([])}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <Gavel className="w-16 h-16 text-slate-300" />
                <p className="text-sm font-bold text-slate-400 max-w-xs uppercase tracking-widest leading-relaxed">
                  Start a conversation about timelines, evaluations, or placement disputes.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] p-5 rounded-[28px] text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white shadow-indigo-100' 
                      : 'bg-white border border-slate-100 text-slate-800'
                  }`}>
                    <div className="font-medium whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-4"
            >
              <input
                type="text"
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
                placeholder="Ask about IDEA rights, IEEs, or FAPE..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 text-white px-8 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:grayscale flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalSupport;
