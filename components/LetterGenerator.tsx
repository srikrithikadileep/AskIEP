
import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  Sparkles, 
  Copy, 
  Save, 
  ChevronRight, 
  Loader2, 
  ArrowLeft, 
  Mail, 
  Wand2, 
  Scissors, 
  AlignLeft, 
  Scale, 
  HeartHandshake,
  Lightbulb,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import { api } from '../services/apiService';
import { LETTER_TEMPLATES } from '../constants';
import { LetterDraft, IepAnalysis } from '../types';

interface LetterGeneratorProps {
  childId: string;
}

const LetterGenerator: React.FC<LetterGeneratorProps> = ({ childId }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [drafts, setDrafts] = useState<LetterDraft[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(LETTER_TEMPLATES[0]);
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [recentAnalysis, setRecentAnalysis] = useState<IepAnalysis | null>(null);
  
  useEffect(() => {
    loadDrafts();
    loadRecentAnalysis();
  }, [childId]);

  const loadDrafts = async () => {
    try {
      const data = await api.getLetters(childId);
      setDrafts(data);
    } catch (e) { console.error(e); }
  };

  const loadRecentAnalysis = async () => {
    try {
      const data = await api.getLatestAnalysis(childId);
      setRecentAnalysis(data);
    } catch (e) { console.error(e); }
  };

  const handleGenerate = async () => {
    if (!context) return;
    setIsGenerating(true);
    try {
      const content = await api.generateLetter(context, selectedTemplate.label);
      setGeneratedContent(content);
    } catch (e) {
      alert("Failed to generate letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!generatedContent) return;
    setIsRefining(true);
    try {
      const refined = await api.refineLetter(generatedContent, instruction);
      setGeneratedContent(refined);
    } catch (e) {
      alert("Failed to refine text.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.saveLetter({
        childId,
        title: `${selectedTemplate.label} - ${new Date().toLocaleDateString()}`,
        content: generatedContent,
        type: selectedTemplate.label
      });
      loadDrafts();
      setView('list');
      setGeneratedContent('');
      setContext('');
    } catch (e) { alert("Failed to save draft."); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert("Letter copied to clipboard!");
  };

  const refinementOptions = [
    { label: 'Shorter', icon: Scissors, prompt: 'significantly shorter, more direct, and concise' },
    { label: 'Longer', icon: AlignLeft, prompt: 'longer, more detailed, adding supporting context and explanation' },
    { label: 'Formal', icon: Scale, prompt: 'more formal and legally assertive using educational terminology' },
    { label: 'Softer', icon: HeartHandshake, prompt: 'softer, collaborative, and focused on shared outcomes' }
  ];

  const getAnalysisSmartPrompts = () => {
    if (!recentAnalysis) return [];
    const prompts = [];
    
    if (selectedTemplate.id === 'concern_letter') {
      if (recentAnalysis.redFlags && recentAnalysis.redFlags.length > 0) {
        prompts.push({
          label: "Incorporate Red Flags",
          prompt: `rewrite to specifically address these identified red flags from the IEP analysis: ${recentAnalysis.redFlags.slice(0, 3).join(', ')}`
        });
      }
      prompts.push({
        label: "Cite FAPE/LRE Rights",
        prompt: "refine this to emphasize the requirement for FAPE and progress toward IEP goals as established by the analysis"
      });
    }

    if (recentAnalysis.goals && recentAnalysis.goals.length > 0) {
      prompts.push({
        label: "Refine Goal Progress",
        prompt: "rewrite the progress sections to focus on measurable data and the specific targets found in the analyzed IEP"
      });
    }
    
    return prompts;
  };

  const smartPrompts = getAnalysisSmartPrompts();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Letter Writer</h2>
          <p className="text-slate-500 font-medium leading-relaxed">Legally-grounded correspondence generated in seconds.</p>
        </div>
        {view === 'list' && (
          <button
            onClick={() => setView('create')}
            className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-amber-600 transition-all shadow-xl shadow-amber-200 active:scale-95"
          >
            <Sparkles className="w-5 h-5" /> Draft New Letter
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="grid grid-cols-1 gap-4">
          {drafts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-[40px] text-center">
              <Mail className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-800 mb-2">The Archive is Empty</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">Use AI templates to formally request evaluations, dispute services, or express parent concerns.</p>
            </div>
          ) : (
            drafts.map(draft => (
               <div key={draft.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-amber-200 transition-all group">
                 <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                     <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                       <FileText className="w-6 h-6 text-slate-300 group-hover:text-amber-600" />
                     </div>
                     <div>
                       <h4 className="font-black text-slate-900 text-lg mb-1">{draft.title}</h4>
                       <div className="flex items-center gap-2">
                         <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-black uppercase tracking-widest">{draft.type}</span>
                         <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><History className="w-3 h-3" /> {new Date(draft.last_edited).toLocaleDateString()}</span>
                       </div>
                     </div>
                   </div>
                   <button 
                    onClick={() => {
                      setGeneratedContent(draft.content);
                      setSelectedTemplate(LETTER_TEMPLATES.find(t => t.label === draft.type) || LETTER_TEMPLATES[0]);
                      setView('create');
                    }}
                    className="px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-xl font-black text-xs transition-colors"
                   >
                     View / Edit
                   </button>
                 </div>
               </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4">
          <div className="lg:col-span-1 space-y-6">
            <button 
              onClick={() => { setView('list'); setGeneratedContent(''); setContext(''); }}
              className="text-slate-400 hover:text-slate-600 font-bold text-sm flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Exit Editor
            </button>
            
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] opacity-60">1. Select Template</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {LETTER_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedTemplate.id === t.id 
                        ? 'bg-amber-50 border-amber-500 text-amber-900' 
                        : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="font-bold text-sm">{t.label}</div>
                    <div className="text-xs opacity-70 mt-1 leading-relaxed">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] opacity-60">2. Specific Details</h3>
              <textarea
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-40 text-sm outline-none focus:ring-4 focus:ring-amber-500/10 resize-none font-medium text-slate-700"
                placeholder="Paste teacher emails, specific incidents, dates, and what you're asking for. AI will structure this formally."
                value={context}
                onChange={e => setContext(e.target.value)}
              />
              <button
                onClick={handleGenerate}
                disabled={!context || isGenerating}
                className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-sm hover:bg-amber-600 disabled:opacity-50 transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate AI Draft
              </button>
            </div>
            
            {recentAnalysis && (
              <div className="bg-slate-900 p-6 rounded-[32px] text-white space-y-4 relative overflow-hidden shadow-xl">
                <AlertTriangle className="absolute -bottom-4 -right-4 w-24 h-24 text-indigo-500/20" />
                <h3 className="font-black text-[10px] uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" /> Smart Analysis Tuning
                </h3>
                <p className="text-[10px] font-medium text-indigo-100/70 leading-relaxed mb-4">
                  Leverage your analyzed IEP data to strengthen your legal position.
                </p>
                <div className="space-y-2 relative z-10">
                  {smartPrompts.length > 0 ? smartPrompts.map((sp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRefine(sp.prompt)}
                      disabled={isRefining || !generatedContent}
                      className="w-full text-left p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold hover:bg-white/10 transition-all flex justify-between items-center group disabled:opacity-50"
                    >
                      {sp.label}
                      <ChevronRight className="w-3 h-3 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )) : (
                    <p className="text-[10px] text-indigo-300 italic opacity-50">Select 'Draft Concern Letter' for advanced analysis prompts.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-2xl h-full min-h-[700px] flex flex-col relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                   <h3 className="font-black text-slate-900 text-xl tracking-tight leading-none mb-2">Document Editor</h3>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{selectedTemplate.label}</span>
                     {isRefining && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse"><Loader2 className="w-2.5 h-2.5 animate-spin" /> Refinement in progress...</span>}
                   </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} disabled={!generatedContent} className="p-3 text-slate-400 hover:text-amber-600 bg-slate-50 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30" title="Copy Content">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={!generatedContent || isRefining}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.1em] hover:bg-amber-600 transition-all shadow-xl shadow-slate-100 disabled:opacity-50 active:scale-95"
                  >
                    <Save className="w-4 h-4" /> Save to Archive
                  </button>
                </div>
              </div>

              {generatedContent && (
                <div className="mb-6 flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-[24px] border border-slate-100 animate-in slide-in-from-top-2">
                  <div className="px-3 border-r border-slate-200 mr-1">
                    <Wand2 className="w-4 h-4 text-amber-500" />
                  </div>
                  {refinementOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleRefine(opt.prompt)}
                      disabled={isRefining}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                    >
                      <opt.icon className="w-3 h-3" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex-1 relative flex flex-col">
                <textarea
                  className="flex-1 w-full p-10 bg-slate-50 border border-slate-100 rounded-[32px] resize-none outline-none focus:ring-8 focus:ring-amber-500/5 font-serif text-slate-800 leading-relaxed text-lg shadow-inner custom-scrollbar"
                  placeholder="The generated letter will appear here. Start by selecting a template and adding details on the left."
                  value={generatedContent}
                  onChange={e => setGeneratedContent(e.target.value)}
                />
                
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center rounded-[32px] z-20">
                    <div className="relative">
                       <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                       <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-indigo-500 animate-pulse" />
                    </div>
                    <p className="font-black text-sm uppercase tracking-widest text-slate-600">Drafting Your Legal Position...</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                   <PenTool className="w-3 h-3" /> Secure Editor Node
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {generatedContent.split(/\s+/).filter(Boolean).length} Words • {generatedContent.length} Chars
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetterGenerator;
