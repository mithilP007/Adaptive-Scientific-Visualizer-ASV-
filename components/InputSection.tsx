import React, { useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Send, Loader2, Gauge, AlertTriangle, ChevronRight } from "lucide-react";
import { ImageAttachment } from "../types";

interface InputSectionProps {
  prompt: string;
  setPrompt: (value: string) => void;
  images: ImageAttachment[];
  setImages: React.Dispatch<React.SetStateAction<ImageAttachment[]>>;
  onSubmit: () => void;
  isLoading: boolean;
  complexity: string;
  setComplexity: (val: string) => void;
  validationMode: boolean;
  setValidationMode: (val: boolean) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  prompt,
  setPrompt,
  images,
  setImages,
  onSubmit,
  isLoading,
  complexity,
  setComplexity,
  validationMode,
  setValidationMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Extract base64 part
          const base64 = result.split(",")[1];
          const mimeType = result.split(",")[0].split(":")[1].split(";")[0];

          setImages((prev) => [
            ...prev,
            {
              file,
              preview: result,
              base64,
              mimeType,
            },
          ]);
        };
        reader.readAsDataURL(file);
        // Reset input so same file can be selected again if needed
        e.target.value = "";
      }
    },
    [setImages]
  );

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-1">
        <div className="bg-slate-800 p-2 rounded-lg border border-slate-600/50 shadow-inner">
          <Send size={18} className="text-cyan-400" />
        </div>
        <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
            INPUT_PARAMETERS
            </h2>
            <div className="h-0.5 w-12 bg-cyan-500/50 mt-1"></div>
        </div>
      </div>
      
      {/* Advanced Controls Panel */}
      <div className="flex flex-col gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 shadow-inner">
        
        {/* Complexity Tuner */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <Gauge size={16} className="text-cyan-400"/>
                <span>Target Complexity</span>
            </div>
            <div className="relative">
                <select 
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value)}
                    className="appearance-none bg-slate-800 border border-slate-600 text-cyan-300 text-xs font-mono rounded-md px-3 py-1.5 pr-8 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all cursor-pointer hover:bg-slate-750"
                >
                    <option value="Elementary">LVL_1: Elementary (K-12)</option>
                    <option value="Intermediate">LVL_2: Intermediate (Undergrad)</option>
                    <option value="Advanced">LVL_3: Advanced (Research)</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronRight size={12} className="rotate-90" />
                </div>
            </div>
        </div>

        {/* Validation Mode Toggle (Neon Style) */}
        <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <AlertTriangle size={16} className={validationMode ? "text-orange-400 animate-pulse" : "text-slate-500"}/>
                <span className={validationMode ? "text-orange-100" : ""}>Err_Detection_Protocol</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={validationMode}
                    onChange={(e) => setValidationMode(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-sm border border-slate-600 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-sm after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-800 peer-checked:after:bg-orange-500 peer-checked:after:border-orange-300 peer-checked:border-orange-500/50 shadow-inner"></div>
                <div className={`absolute -right-2 -top-2 w-2 h-2 rounded-full ${validationMode ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-transparent'}`}></div>
            </label>
        </div>
      </div>

      <div className="relative group/input">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={validationMode 
             ? "// ENTER EXPERIMENT PROCEDURE...\n// UPLOAD SETUP IMAGE FOR VALIDATION..." 
             : "// ENTER SCIENTIFIC CONCEPT...\n> e.g. 'Visualize the double-slit experiment'\n> or 'Simulate a Solar Sail'"}
          className={`w-full h-40 bg-slate-900/80 text-white font-mono text-sm p-4 rounded-xl border-2 outline-none resize-none transition-all placeholder:text-slate-600
            ${validationMode 
                ? 'border-orange-900/30 focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.2)]' 
                : 'border-slate-700 focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
            }`}
        />
        {/* Glow effect on input container */}
        <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 opacity-0 group-focus-within/input:opacity-100 ${validationMode ? 'bg-orange-500/5' : 'bg-cyan-500/5'}`}></div>
        
        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex gap-3 mt-3 overflow-x-auto pb-2 px-1">
            {images.map((img, idx) => (
              <div key={idx} className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-cyan-400 blur opacity-20 group-hover:opacity-40 transition-opacity rounded-lg"></div>
                <img
                  src={img.preview}
                  alt="upload"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-600 relative z-10"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 z-20 bg-red-500 text-white rounded-md p-1 shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-cyan-500/30 group"
        >
          <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-mono font-bold tracking-wider">ADD_SOURCE</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <button
          onClick={onSubmit}
          disabled={isLoading || (!prompt.trim() && images.length === 0)}
          className={`relative overflow-hidden flex items-center gap-3 px-8 py-3 rounded-lg font-bold text-white transition-all transform active:scale-95 border
            ${isLoading || (!prompt.trim() && images.length === 0)
              ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
              : validationMode 
                ? "bg-orange-600/20 border-orange-500 text-orange-100 hover:bg-orange-600/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                : "bg-cyan-600/20 border-cyan-500 text-cyan-100 hover:bg-cyan-600/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            }
          `}
        >
          {/* Button content */}
          <span className="relative z-10 font-mono tracking-widest text-xs uppercase">
            {isLoading ? "PROCESSING" : validationMode ? "RUN_VALIDATION" : "INITIALIZE"}
          </span>
          {isLoading ? <Loader2 size={16} className="animate-spin relative z-10" /> : <Send size={16} className="relative z-10" />}

          {/* Animated Background for Button */}
          {!isLoading && (!(!prompt.trim() && images.length === 0)) && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1s_infinite] pointer-events-none"></div>
          )}
        </button>
      </div>
    </div>
  );
};
