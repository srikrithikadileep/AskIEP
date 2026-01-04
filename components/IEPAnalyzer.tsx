
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
  FileBox
} from 'lucide-react';
import { api } from '../services/apiService';
import { IepAnalysis, IepDocument } from '../types';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;

interface IEPAnalyzerProps {
  childId: string;
}

const IEPAnalyzer: React.FC<IEPAnalyzerProps> = ({ childId }) => {
  const [fileText, setFileText] = useState('');
  const [filename, setFilename] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [analysis, setAnalysis] = useState<IepAnalysis | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [repository, setRepository] = useState<IepDocument[]>([]);
  const [view, setView] = useState<'upload' | 'repository' | 'analysis'>('upload');
  
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
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const text = await extractTextFromPdf(arrayBuffer);
            setFileText(text);
            setIsParsing(false);
          } catch (err) {
            console.error("PDF Parsing error", err);
            alert("Could not parse PDF file. Please try another format.");
            setIsParsing(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'docx') {
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            setFileText(result.value);
            setIsParsing(false);
          } catch (err) {
            console.error("DOCX Parsing error", err);
            alert("Could not parse Word document. Please try another format.");
            setIsParsing(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Default to text parsing
        reader.onload = (event) => {
          setFileText(event.target?.result as string);
          setIsParsing(false);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error("File loading error", err);
      setIsParsing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!fileText.trim()) return;
    setIsAnalyzing(true);
    setStatusMessage('Consulting Gemini Advocacy Engine...');
    
    try {
      setTimeout(() => setStatusMessage('Identifying goals and accommodations...'), 2000);
      setTimeout(() => setStatusMessage('Scanning for IDEA compliance flags...'), 4500);
      
      const result = await api.analyzeIEP(fileText, childId, filename || 'Manual Paste');
      setAnalysis(result);
      setView('analysis');
      loadRepository(); // Refresh repo
    } catch (error: any) {
      console.error(error);
      alert(`Analysis failed: ${error.message || "Please check your network and try again."}`);
    } finally {
      setIsAnalyzing(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">IEP AI Analyzer</h2>
          <p className="text-slate-500 font-medium">Upload PDF, Word, or Text files to unlock advocacy insights.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setView('upload')}
            className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${
              view === 'upload' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileUp className="w-4 h-4" /> New Analysis
          </button>
          <button 
            onClick={() => setView('repository')}
            className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${
              view === 'repository' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> Document Repo
          </button>
        </div>
      </div>

      {view === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-8 md:p-12 text-center space-y-8 shadow-sm">
              <div className="bg-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-100 rotate-3 transition-transform hover:rotate-0">
                <Upload className="w-10 h-10 text-white" />
              </div>
              
              <div className="max-w-xl mx-auto space-y-6">
                <h3 className="text-2xl font-black text-slate-800">Ready your IEP</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Support for <span className="text-indigo-600 font-bold">PDF, Word (.docx)</span>, and <span className="text-indigo-600 font-bold">Text (.txt)</span>.
                  Your documents are processed locally before secure AI analysis.
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsing}
                    className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg"
                  >
                    {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
                    Choose Document
                  </button>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUpload}
                  />
                </div>

                {filename && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-100 animate-in zoom-in">
                    <CheckCircle className="w-4 h-4" /> Ready: {filename}
                  </div>
                )}
                
                <div className="relative group">
                  <textarea
                    className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-[32px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 resize-none shadow-inner"
                    placeholder="Alternatively, paste the IEP text content here..."
                    value={fileText}
                    onChange={(e) => {
                      setFileText(e.target.value);
                      if (!filename) setFilename('Manual Document Entry');
                    }}
                  />
                  <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Lock className="w-3 h-3" /> Secure Vault Encryption
                  </div>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isParsing || !fileText.trim()}
                  className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {statusMessage || 'Analyzing Content...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Perform AI Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 shadow-xl relative overflow-hidden">
               <BrainCircuit className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-500/20" />
               <h4 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-400">Multi-Format Engine</h4>
               <p className="text-lg font-medium leading-relaxed relative z-10">
                 Our system handles complex layout parsing for PDFs and Word docs to ensure data fidelity.
               </p>
               <div className="grid grid-cols-3 gap-3 relative z-10">
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-4 rounded-2xl">
                    <FileText className="w-6 h-6 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">PDF</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-4 rounded-2xl">
                    <FileCode className="w-6 h-6 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">DOCX</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-4 rounded-2xl">
                    <FileBox className="w-6 h-6 text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">TXT</span>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
               <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                 <History className="w-4 h-4 text-indigo-600" /> History Tracker
               </h4>
               <div className="space-y-3">
                  {repository.slice(0, 3).map(doc => (
                    <button 
                      key={doc.id}
                      onClick={() => setView('repository')}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-left hover:bg-indigo-50 transition-all group"
                    >
                      <div className="overflow-hidden pr-2">
                        <p className="text-xs font-black text-slate-800 truncate">{doc.filename}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
                    </button>
                  ))}
                  {repository.length === 0 && <p className="text-xs text-slate-400 italic py-4 text-center">Repository is empty.</p>}
               </div>
            </div>
          </div>
        </div>
      )}

      {view === 'repository' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4">
          <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
             <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Document Repository</h3>
               <p className="text-sm font-medium text-slate-500">Secure historical storage for all IEP versions.</p>
             </div>
             <div className="flex items-center gap-4">
                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                  {repository.length} Records Securely Stored
                </span>
             </div>
          </div>
          
          <div className="divide-y divide-slate-50">
             {repository.map((doc) => (
               <div key={doc.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-all group gap-4">
                 <div className="flex items-center gap-6">
                   <div className="p-4 bg-slate-100 rounded-2xl group-hover:bg-indigo-600 transition-all shrink-0">
                     <FileText className="w-6 h-6 text-slate-400 group-hover:text-white" />
                   </div>
                   <div className="min-w-0">
                     <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{doc.filename}</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <History className="w-3 h-3" /> Analyzed {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 shrink-0">
                   {doc.analysis_id && (
                     <button className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                       Review Analysis
                     </button>
                   )}
                   <button className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors">
                     <Trash2 className="w-5 h-5" />
                   </button>
                 </div>
               </div>
             ))}
             
             {repository.length === 0 && (
               <div className="p-24 text-center">
                 <Database className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">The repository is currently empty.</p>
                 <button onClick={() => setView('upload')} className="mt-4 text-indigo-600 font-black text-sm hover:underline">
                    Analyze your first IEP
                 </button>
               </div>
             )}
          </div>
        </div>
      )}

      {view === 'analysis' && analysis && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setView('upload')}
              className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Start New Analysis
            </button>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
               <CheckCircle className="w-3 h-3" /> Records Synced
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <BrainCircuit className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Plain-Language Summary</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg font-medium italic">
                  "{analysis.summary}"
                </p>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  Key Goals Extracted
                </h3>
                <div className="space-y-4">
                  {analysis.goals.map((goal, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100 hover:border-emerald-200 transition-colors">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-slate-700 font-bold leading-relaxed">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100 shadow-xl shadow-amber-100/20">
                <h3 className="text-xl font-black text-amber-900 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  Advocacy Red Flags
                </h3>
                <ul className="space-y-4">
                  {analysis.redFlags.map((flag, i) => (
                    <li key={i} className="flex gap-3 text-amber-800 text-sm font-bold leading-relaxed bg-white/50 p-4 rounded-2xl border border-amber-200/50">
                      <span className="text-amber-500 font-black">•</span> {flag}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <Scale className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5" />
                <h3 className="text-xl font-black mb-4 flex items-center gap-3 relative z-10">
                  <Scale className="w-6 h-6 text-indigo-400" />
                  Legal Perspective
                </h3>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-medium relative z-10">
                  {analysis.legalLens}
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
