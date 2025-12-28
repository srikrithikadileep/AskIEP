import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Scale, 
  BrainCircuit,
  Loader2,
  Lock,
  ArrowLeft,
  ChevronRight,
  Database,
  History,
  Trash2,
  FileUp,
  FileCode,
  FileBox,
  Copy,
  Mail,
  FileDiff,
  CalendarDays,
  ListChecks,
  Edit2,
  Check,
  Type as TypeIcon,
  AlignLeft,
  Zap,
  RotateCcw,
  Info
} from 'lucide-react';
import { api } from '../services/apiService';
import { IepAnalysis, IepDocument } from '../types';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;

interface IEPAnalyzerProps {
  childId: string;
}

const IEPAnalyzer: React.FC<IEPAnalyzerProps> = ({ childId }) => {
  const [fileText, setFileText] = useState('');
  const [filename, setFilename] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [repository, setRepository] = useState<IepDocument[]>([]);
  const [view, setView] = useState<'upload' | 'repository' | 'analysis' | 'compare'>('upload');
  
  // Comparison State
  const [compareDocs, setCompareDocs] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Letter State
  const [actionLetter, setActionLetter] = useState<string | null>(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [isRevisingLetter, setIsRevisingLetter] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRepository();
  }, [childId]);

  const loadRepository = async () => {
    try {
      const docs = await api.getDocuments(childId);
      setRepository(docs);
    } catch (e) {
      console.error("Repo load failed", e);
    }
  };

  const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setIsParsing(true);
    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      const reader = new FileReader();
      if (fileType === 'pdf') {
        reader.onload = async (event) => {
          const text = await extractTextFromPdf(event.target?.result as ArrayBuffer);
          setFileText(text);
          setIsParsing(false);
        };
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'docx') {
        reader.onload = async (event) => {
          const result = await mammoth.extractRawText({ arrayBuffer: event.target?.result as ArrayBuffer });
          setFileText(result.value);
          setIsParsing(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (event) => {
          setFileText(event.target?.result as string);
          setIsParsing(false);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      setIsParsing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!fileText.trim()) return;
    setIsAnalyzing(true);
    setStatusMessage('Consulting Advocacy Engine...');
    try {
      const result = await api.analyzeIEP(fileText, childId, filename || 'Manual Paste');
      setAnalysis(result);
      setView('analysis');
      loadRepository();
    } catch (error: any) {
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompareTrigger = async () => {
    if (compareDocs.length !== 2) return;
    setIsComparing(true);
    try {
      const doc1 = repository.find(d => d.id === compareDocs[0]);
      const doc2 = repository.find(d => d.id === compareDocs[1]);
      if (doc1 && doc2) {
        const result = await api.compareIEPs(doc1.content, doc2.content);
        setComparisonResult(result);
      }
    } catch (err) {
      alert("Comparison failed.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!analysis) return;
    setIsGeneratingLetter(true);
    try {
      const letter = await api.generateActionLetter(analysis, "Your Child");
      setActionLetter(letter);
      setIsEditingLetter(false);
    } catch (err) {
      alert("Letter generation failed.");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleReviseLetter = async (instruction: string) => {
    if (!actionLetter) return;
    setIsRevisingLetter(true);
    try {
      const revised = await api.reviseActionLetter(actionLetter, instruction);
      if (revised) {
        setActionLetter(revised);
        setIsEditingLetter(false);
      }
    } catch (err) {
      alert("Revision failed.");
    } finally {
      setIsRevisingLetter(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">IEP AI Analyzer</h2>
          <p className="text-slate-500 font-medium">Identify service gaps and secure educational benefit.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setView('upload')} className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${view === 'upload' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}>
            Analyze
          </button>
          <button onClick={() => setView('repository')} className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${view === 'repository' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}>
            Documents
          </button>
          <button onClick={() => setView('compare')} className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${view === 'compare' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}>
            Compare
          </button>
        </div>
      </div>

      {view === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-8 text-center space-y-8 shadow-sm">
              <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg rotate-3">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div className="max-w-xl mx-auto space-y-6">
                <h3 className="text-xl font-black text-slate-800">Choose your document</h3>
                <div className="flex justify-center gap-4">
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all">
                    {isParsing ? <Loader2 className="animate-spin w-4 h-4" /> : 'Select File'}
                  </button>
                  <input type="file" className="hidden" ref={fileInputRef} accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                </div>
                {filename && <div className="p-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 italic">Attached: {filename}</div>}
                <textarea className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-sm text-slate-700 shadow-inner" placeholder="Or paste IEP content here..." value={fileText} onChange={e => setFileText(e.target.value)} />
                <button onClick={handleAnalyze} disabled={isAnalyzing || !fileText.trim()} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:bg-indigo-700 disabled:opacity-50">
                  {isAnalyzing ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : 'Unlock AI Analysis'}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 shadow-xl relative overflow-hidden">
             <BrainCircuit className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-500/20" />
             <h4 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-400">Security Note</h4>
             <p className="text-sm font-medium leading-relaxed opacity-80">Analysis is performed via encrypted tunnels. Your sensitive data never trains public models.</p>
          </div>
        </div>
      )}

      {view === 'compare' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-8 animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileDiff className="w-6 h-6 text-indigo-600" /> Comparison Engine
            </h3>
            <button onClick={handleCompareTrigger} disabled={isComparing || compareDocs.length !== 2} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl disabled:opacity-50">
              {isComparing ? 'Comparing...' : 'Run Gap Analysis'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repository.map(doc => {
              const selected = compareDocs.includes(doc.id);
              return (
                <button key={doc.id} onClick={() => setCompareDocs(prev => selected ? prev.filter(id => id !== doc.id) : [...prev, doc.id].slice(-2))} className={`p-6 rounded-2xl border-2 text-left transition-all ${selected ? 'bg-indigo-50 border-indigo-600 shadow-md' : 'bg-white border-slate-100'}`}>
                   <p className="text-sm font-black text-slate-900 truncate">{doc.filename}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(doc.created_at).toLocaleDateString()}</p>
                </button>
              );
            })}
          </div>
          {comparisonResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t animate-in zoom-in">
               <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                  <h4 className="text-rose-900 font-black text-xs uppercase tracking-widest mb-4">Service Reductions</h4>
                  <ul className="space-y-2">
                    {comparisonResult.reductions.map((r: string, i: number) => <li key={i} className="text-sm text-rose-800 font-medium">• {r}</li>)}
                  </ul>
               </div>
               <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <h4 className="text-emerald-900 font-black text-xs uppercase tracking-widest mb-4">New Supports</h4>
                  <ul className="space-y-2">
                    {comparisonResult.newSupports.map((s: string, i: number) => <li key={i} className="text-sm text-emerald-800 font-medium">• {s}</li>)}
                  </ul>
               </div>
            </div>
          )}
        </div>
      )}

      {view === 'analysis' && analysis && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-indigo-50 rounded-2xl"><ListChecks className="w-6 h-6 text-indigo-600" /></div>
                  <h3 className="text-xl font-black text-slate-900">Mandated Service Grid</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.serviceGrid?.map((s: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                       <div>
                         <p className="text-xs font-black text-slate-900 uppercase">{s.service}</p>
                         <p className="text-[10px] font-bold text-slate-400">{s.setting || 'Not Specified'}</p>
                       </div>
                       <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 border border-indigo-100">{s.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Center with enhanced letter editing/revision */}
              <div className="bg-indigo-600 p-8 rounded-[40px] text-white space-y-6 relative overflow-hidden shadow-2xl shadow-indigo-200">
                <Mail className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Parent Action Center</h3>
                    <p className="text-indigo-100/80 font-medium text-sm">Convert these findings into a formal school request.</p>
                  </div>
                  {!actionLetter ? (
                    <button onClick={handleGenerateLetter} disabled={isGeneratingLetter} className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2">
                      {isGeneratingLetter ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      Generate Concern Letter
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingLetter(!isEditingLetter)} className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all" title="Edit Letter">
                        {isEditingLetter ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                      </button>
                      <button onClick={() => navigator.clipboard.writeText(actionLetter)} className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all" title="Copy to Clipboard">
                        <Copy className="w-5 h-5" />
                      </button>
                      <button onClick={handleGenerateLetter} className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-rose-300" title="Regenerate Original">
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {actionLetter && (
                  <div className="space-y-4 animate-in slide-in-from-top-4">
                    {/* Revision Toolbar */}
                    <div className="flex flex-wrap gap-2 p-2 bg-black/20 rounded-2xl backdrop-blur-sm border border-white/10">
                      <button 
                        onClick={() => handleReviseLetter("Make this letter much shorter and more concise while keeping core legal points.")}
                        disabled={isRevisingLetter}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-indigo-500 transition-all disabled:opacity-50"
                      >
                        <AlignLeft className="w-3 h-3" /> Concise
                      </button>
                      <button 
                        onClick={() => handleReviseLetter("Make this letter more detailed, expand on the parent concerns and add more context.")}
                        disabled={isRevisingLetter}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-indigo-500 transition-all disabled:opacity-50"
                      >
                        <TypeIcon className="w-3 h-3" /> Detailed
                      </button>
                      <button 
                        onClick={() => handleReviseLetter("Make this letter sound more firm, direct, and emphasize legal compliance with IDEA.")}
                        disabled={isRevisingLetter}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-indigo-500 transition-all disabled:opacity-50"
                      >
                        <Zap className="w-3 h-3" /> Direct
                      </button>
                      <button 
                        onClick={() => handleReviseLetter("Rewrite to sound more collaborative and solution-oriented while keeping the same concerns.")}
                        disabled={isRevisingLetter}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-indigo-500 transition-all disabled:opacity-50"
                      >
                        <CheckCircle className="w-3 h-3" /> Collaborative
                      </button>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 relative group h-80 overflow-hidden">
                      {isRevisingLetter && (
                        <div className="absolute inset-0 z-20 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-white" />
                            <p className="text-xs font-black uppercase tracking-widest text-white">AI is redrafting...</p>
                          </div>
                        </div>
                      )}
                      
                      {isEditingLetter ? (
                        <textarea 
                          className="w-full h-full p-6 bg-transparent outline-none text-indigo-50 text-sm font-medium leading-relaxed resize-none font-inter"
                          value={actionLetter}
                          onChange={(e) => setActionLetter(e.target.value)}
                        />
                      ) : (
                        <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar">
                           <pre className="text-xs font-medium leading-relaxed whitespace-pre-wrap text-indigo-50 font-inter">{actionLetter}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                 <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                   <AlertCircle className="w-4 h-4 text-rose-500" /> Compliance Red Flags
                 </h4>
                 <div className="space-y-3">
                   {analysis.redFlags.map((flag: string, i: number) => (
                     <div key={i} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] font-bold text-rose-800 leading-relaxed">
                       {flag}
                     </div>
                   ))}
                 </div>
              </div>

              {/* Fix: Added missing Info icon import from lucide-react */}
              <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Advocacy Tip</h4>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-300 italic">
                  "Documentation is your best defense. If it's not in writing, the school district can claim it didn't happen. Always send a follow-up email after meetings."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IEPAnalyzer;