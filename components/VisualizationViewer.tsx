import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Code, MonitorPlay, Maximize2, Minimize2, Share2, Download, Copy, X, Loader2, Cpu, Terminal, Activity } from "lucide-react";
import { transformCode } from "../services/gemini";

interface VisualizationViewerProps {
  summary: string;
  code: string;
  hardwareBOM?: string;
}

export const VisualizationViewer: React.FC<VisualizationViewerProps> = ({
  summary,
  code,
  hardwareBOM,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "bom">("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("Python (Matplotlib)");
  const [exportedCode, setExportedCode] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Simple Markdown renderer
  const renderMarkdown = (text: string) => {
    if (!text) return { __html: "" };
    
    // Markdown Parsing
    let html = text
      .replace(/## (.*)/g, '<h3 class="text-lg font-bold font-mono text-cyan-400 mt-6 mb-3 uppercase tracking-wider flex items-center gap-2"><span class="text-cyan-800">#</span> $1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-100">$1</strong>')
      .replace(/\| (.*?) \|/g, (match) => {
          return match.replace(/\|/g, '').split('  ').length > 1 ? `<span class="inline-block p-1 border border-slate-600 bg-slate-800 rounded font-mono text-xs">${match}</span>` : match;
      });
      
    // Table handling logic
    if (html.includes('|')) {
        const lines = html.split('\n');
        let inTable = false;
        let tableHtml = '<div class="overflow-x-auto my-4 rounded-lg border border-slate-700"><table class="min-w-full divide-y divide-slate-700 text-sm font-mono">';
        
        let processedHtml = "";
        
        lines.forEach(line => {
            if (line.trim().startsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    const headers = line.split('|').filter(c => c.trim() !== '');
                    tableHtml += '<thead class="bg-slate-800/80 text-cyan-400"><tr>';
                    headers.forEach(h => tableHtml += `<th class="px-4 py-3 text-left text-xs uppercase tracking-wider">${h.trim()}</th>`);
                    tableHtml += '</tr></thead><tbody class="divide-y divide-slate-700 bg-slate-900/50">';
                } else if (!line.includes('---')) {
                    const cells = line.split('|').filter(c => c.trim() !== '');
                    tableHtml += '<tr class="hover:bg-cyan-900/10 transition-colors">';
                    cells.forEach(c => tableHtml += `<td class="px-4 py-3 whitespace-nowrap text-slate-300">${c.trim()}</td>`);
                    tableHtml += '</tr>';
                }
            } else {
                 if (inTable) {
                     inTable = false;
                     tableHtml += '</tbody></table></div>';
                     processedHtml += tableHtml;
                     tableHtml = '<div class="overflow-x-auto my-4 rounded-lg border border-slate-700"><table class="min-w-full divide-y divide-slate-700 text-sm font-mono">';
                 }
                 processedHtml += line.replace(/\n/g, "<br />") + "<br />";
            }
        });
        
        if(inTable) {
            tableHtml += '</tbody></table></div>';
            processedHtml += tableHtml;
        }
        html = processedHtml;
    } else {
        html = html.replace(/\n/g, "<br />");
    }

    // Highlight Validation Alerts
    html = html.replace(/VALIDATION ALERT/g, '<div class="border-l-4 border-red-500 bg-red-900/10 p-4 my-4"><span class="text-red-400 font-bold font-mono block mb-1">⚠️ SYSTEM_ALERT: VALIDATION_FAILURE</span></div>');
    
    return { __html: html };
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleExport = async () => {
      setIsExporting(true);
      setExportedCode("");
      try {
          const result = await transformCode(code, exportFormat);
          setExportedCode(result);
      } catch (error) {
          setExportedCode("Failed to export code. Please try again.");
      } finally {
          setIsExporting(false);
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    if (iframeRef.current && activeTab === 'preview') {
       iframeRef.current.srcdoc = code;
    }
  }, [code, activeTab]);

  return (
    <div className={`glass-panel rounded-2xl flex flex-col h-full overflow-hidden transition-all duration-300 relative ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'border border-slate-700/50'}`}>
      
      {/* HUD Decorative Elements */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/60 border-b border-slate-700 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${code ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'}`}></div>
                <h2 className="font-mono text-xs font-bold text-cyan-400 tracking-widest uppercase">OUTPUT_VISUALIZATION</h2>
           </div>
           
           {/* Fake Data Readout */}
           <div className="hidden lg:flex gap-4 ml-6 border-l border-slate-700 pl-6 text-[10px] font-mono text-slate-500">
               <span className="flex items-center gap-1"><Activity size={10} /> FPS: 60</span>
               <span>MEM: 128MB</span>
               <span>LATENCY: 12ms</span>
           </div>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              activeTab === "preview"
                ? "bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <MonitorPlay size={14} />
            PREVIEW
          </button>
          
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              activeTab === "code"
                ? "bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <Code size={14} />
            SOURCE
          </button>

          {hardwareBOM && (
              <button
                onClick={() => setActiveTab("bom")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  activeTab === "bom"
                    ? "bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Cpu size={14} />
                HARDWARE
              </button>
          )}
          
           <div className="h-4 w-px bg-slate-700 mx-2"></div>

          <button
            onClick={() => setShowExportModal(true)}
             className="text-slate-400 hover:text-cyan-300 p-1.5 hover:bg-slate-700/50 rounded transition-colors"
             title="Export Code"
          >
              <Share2 size={16} />
          </button>

           <button
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-cyan-300 p-1.5 hover:bg-slate-700/50 rounded transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-slate-900/40">
        {/* Left Side: Summary / Analysis */}
        {!isFullscreen && (
            <div className="w-full md:w-1/3 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-700 custom-scrollbar">
                <div className="flex items-center gap-2 mb-4 opacity-50">
                    <Terminal size={14} className="text-cyan-400" />
                    <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                        ANALYSIS_LOG
                    </h3>
                </div>
                <div
                    className="prose prose-invert prose-sm text-slate-300 font-sans leading-relaxed"
                    dangerouslySetInnerHTML={renderMarkdown(summary)}
                />
            </div>
        )}

        {/* Right Side: Viewer */}
        <div className={`${isFullscreen ? 'w-full' : 'w-full md:w-2/3'} relative bg-black/50 backdrop-blur-sm flex flex-col`}>
          {activeTab === "preview" ? (
            <div className="w-full h-full relative">
                <iframe
                ref={iframeRef}
                title="ASV Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                srcDoc={code}
                />
                
                {/* Overlay Grid on top of visualization (optional aesthetic) */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,18,18,0)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,18,0)_2px,transparent_2px)] bg-[size:40px_40px] opacity-20"></div>
            </div>
          ) : activeTab === "code" ? (
            <div className="w-full h-full bg-[#0d1117] overflow-auto p-4 custom-scrollbar">
              <pre className="text-xs font-mono text-cyan-300/90 whitespace-pre-wrap leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          ) : (
             <div className="w-full h-full bg-slate-900/80 overflow-auto p-8 custom-scrollbar">
                 <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-700">
                        <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-xl">
                            <Cpu size={32} className="text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-mono text-white tracking-wide uppercase">Hardware_BOM</h2>
                            <p className="text-slate-400 text-xs font-mono mt-1">PROTOTYPING_MANIFEST // GENERATED BY ASV_CORE</p>
                        </div>
                    </div>
                    <div 
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={renderMarkdown(hardwareBOM || "")}
                    />
                 </div>
             </div>
          )}
          
          {/* Reload Button for Preview */}
          {activeTab === "preview" && (
             <button 
                onClick={() => { if(iframeRef.current) iframeRef.current.srcdoc = code; }}
                className="absolute bottom-6 right-6 bg-slate-900/80 hover:bg-cyan-900 text-cyan-400 hover:text-white p-3 rounded-xl border border-cyan-500/30 shadow-lg backdrop-blur-sm transition-all group"
                title="RELOAD_VISUALIZATION"
             >
                 <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
             </button>
          )}
        </div>

        {/* Export Modal */}
        {showExportModal && (
            <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="glass-panel border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] w-full max-w-2xl flex flex-col max-h-[85%]">
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h3 className="text-md font-bold font-mono text-white flex items-center gap-2">
                            <Download size={18} className="text-cyan-400"/>
                            EXPORT_CODE_MODULE
                        </h3>
                        <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <select 
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 text-slate-200 font-mono text-sm rounded-lg px-4 py-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none appearance-none"
                                >
                                    <option>Python (Matplotlib)</option>
                                    <option>Jupyter Notebook (.ipynb JSON)</option>
                                    <option>LaTeX (TikZ)</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleExport}
                                disabled={isExporting}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                            >
                                {isExporting ? <Loader2 size={14} className="animate-spin" /> : "TRANSFORM"}
                            </button>
                        </div>
                        
                        <div className="flex-1 bg-[#0d1117] rounded-lg border border-slate-700 p-4 overflow-auto relative group custom-scrollbar">
                            {exportedCode ? (
                                <pre className="text-xs font-mono text-cyan-200/90 whitespace-pre-wrap">
                                    {exportedCode}
                                </pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono text-xs">
                                    <Terminal size={32} className="mb-2 opacity-20" />
                                    <span>SELECT TARGET FORMAT TO INITIATE CONVERSION...</span>
                                </div>
                            )}
                            
                            {exportedCode && (
                                <button 
                                    onClick={() => copyToClipboard(exportedCode)}
                                    className="absolute top-3 right-3 bg-slate-800 text-cyan-400 border border-slate-600 p-2 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-700 hover:text-white"
                                    title="COPY_TO_CLIPBOARD"
                                >
                                    <Copy size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
