import React, { useState } from "react";
import { Atom, Sparkles, History, Trash2, MonitorPlay } from "lucide-react";
import { InputSection } from "./components/InputSection";
import { VisualizationViewer } from "./components/VisualizationViewer";
import { generateVisualization } from "./services/gemini";
import { ImageAttachment, VisualizationResult } from "./types";

const App: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VisualizationResult | null>(null);
  
  // New Features State
  const [complexity, setComplexity] = useState("Intermediate");
  const [validationMode, setValidationMode] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() && images.length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const imagesPayload = images.map((img) => ({
        base64: img.base64,
        mimeType: img.mimeType,
      }));

      // Pass new params to service
      const response = await generateVisualization(prompt, imagesPayload, complexity, validationMode);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while generating the visualization.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
      setPrompt("");
      setImages([]);
      setResult(null);
      setError(null);
      setValidationMode(false);
      setComplexity("Intermediate");
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b0f19] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Cyberpunk Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-40"></div>
      
      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-2xl">
                    <Atom size={28} className="text-cyan-400 animate-spin-slow" />
                </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                ASV <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded border border-cyan-800">SYS.v2.1</span>
              </h1>
              <p className="text-xs font-mono text-cyan-600/80 tracking-[0.2em] uppercase">Adaptive Scientific Visualizer</p>
            </div>
          </div>
          
           <button 
            onClick={handleClear}
            className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-red-400 transition-colors px-4 py-2 rounded-lg border border-transparent hover:border-red-900/50 hover:bg-red-900/10"
           >
               <Trash2 size={14} />
               RESET_WORKSPACE
           </button>
        </header>

        {/* Main Content Grid */}
        <main className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden pb-2">
          
          {/* Left Column: Input */}
          <div className="lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <InputSection
              prompt={prompt}
              setPrompt={setPrompt}
              images={images}
              setImages={setImages}
              onSubmit={handleSubmit}
              isLoading={loading}
              complexity={complexity}
              setComplexity={setComplexity}
              validationMode={validationMode}
              setValidationMode={setValidationMode}
            />

            {/* Guide / Tips */}
            <div className={`glass-panel rounded-xl p-5 border-l-4 transition-all duration-300 ${validationMode ? 'border-l-orange-500 bg-orange-900/5' : 'border-l-cyan-500 bg-cyan-900/5'}`}>
               <div className={`flex items-center gap-2 mb-2 font-mono text-xs tracking-wider uppercase ${validationMode ? 'text-orange-400' : 'text-cyan-400'}`}>
                   <Sparkles size={14} />
                   <h3>{validationMode ? 'System: Validation_Mode_Active' : 'System: Capabilities_Online'}</h3>
               </div>
               {validationMode ? (
                   <p className="text-sm text-slate-400 leading-relaxed">
                       Upload experimental setup photo. ASV will execute <span className="text-orange-300">cross-reference protocol</span> against procedure text to identify anomalies.
                   </p>
               ) : (
                   <ul className="text-sm text-slate-400 space-y-1.5 list-none">
                       <li className="flex items-center gap-2"><span className="w-1 h-1 bg-cyan-500 rounded-full"></span>Physics Simulation (Mechanics, Optics)</li>
                       <li className="flex items-center gap-2"><span className="w-1 h-1 bg-cyan-500 rounded-full"></span>Mathematical Function Visualization</li>
                       <li className="flex items-center gap-2"><span className="w-1 h-1 bg-cyan-500 rounded-full"></span>Interactive Chemistry Models</li>
                   </ul>
               )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:w-2/3 h-[600px] lg:h-auto flex flex-col relative">
            {error && (
              <div className="absolute top-4 left-4 right-4 z-50 glass-panel border border-red-500/30 text-red-200 p-4 rounded-xl flex items-start gap-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
                    <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold font-mono text-red-400">ERROR_GENERATION_FAILED</h4>
                  <p className="text-sm opacity-80 mt-1 font-mono">{error}</p>
                </div>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel rounded-2xl p-12 border border-slate-700/50">
                <div className="relative group">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-500/30 transition-all duration-500"></div>
                    <div className="relative bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl mb-8 group-hover:scale-105 transition-transform duration-300">
                        <MonitorPlay size={48} className="text-cyan-400" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">System Ready</h3>
                <p className="text-slate-400 max-w-md font-mono text-sm">
                  Waiting for input parameters... <br/>
                  <span className="text-slate-600">Enter concept or upload diagram to initialize visualization.</span>
                </p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center glass-panel rounded-2xl p-12 border border-cyan-500/20 relative overflow-hidden">
                 {/* Scanning line effect */}
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan pointer-events-none"></div>
                 
                 <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-slate-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-b-cyan-300 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-reverse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Atom size={32} className="text-white animate-pulse" />
                    </div>
                 </div>
                 
                 <h3 className="text-xl font-bold text-white tracking-widest uppercase">
                     {validationMode ? "ANALYZING_SETUP" : "SYNTHESIZING_MODEL"}
                 </h3>
                 <div className="mt-4 flex flex-col items-center gap-1 font-mono text-xs text-cyan-400/80">
                     <p>[ Reading Inputs ] ... OK</p>
                     <p>[ Constructing Geometry ] ... PROCESSING</p>
                     <p>[ Compiling Physics Engine ] ... PENDING</p>
                 </div>
              </div>
            )}

            {result && (
              <VisualizationViewer
                summary={result.summary}
                code={result.code}
                hardwareBOM={result.hardwareBOM}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Add AlertTriangle to imports as it was missing in the provided code
import { AlertTriangle } from "lucide-react";

export default App;
