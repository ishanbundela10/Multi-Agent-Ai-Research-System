import { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Radio, 
  Square, 
  X, 
  Flame,
  ArrowRight
} from 'lucide-react';

const PRESET_TOPICS = [
  'Agentic AI Workflows & Multi-Agent Collaboration in 2026',
  'Breakthroughs in Commercial Solid-State Battery Tech',
  'Post-Quantum Cryptography: Lattice-Based Security Readiness',
  'CRISPR 2.0 & Epigenetic Editing in Clinical Therapeutics',
  'Nuclear Fusion Energy: High-Temperature Superconductors Progress'
];

export default function TopicInput({ 
  onStartResearch, 
  onCancelResearch, 
  isProcessing = false,
  streamMode = true,
  setStreamMode
}) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!topic.trim() || isProcessing) return;
    onStartResearch(topic.trim(), streamMode);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPreset = (preset) => {
    setTopic(preset);
    if (!isProcessing) {
      onStartResearch(preset, streamMode);
    }
  };

  return (
    <div className="w-full">
      {/* Search Input Box */}
      <form 
        onSubmit={handleSubmit}
        className="relative group rounded-2xl p-1 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-pink-500/30 shadow-2xl shadow-indigo-950/50 transition-all focus-within:from-indigo-500 focus-within:via-purple-500 focus-within:to-pink-500"
      >
        <div className="relative flex flex-col sm:flex-row items-center bg-slate-900/90 rounded-xl p-2 sm:p-2.5 backdrop-blur-xl border border-slate-700/50">
          
          {/* Search Icon & Prefix */}
          <div className="hidden sm:flex items-center pl-3 pr-2 text-indigo-400">
            <Search className="w-5 h-5 animate-pulse" />
          </div>

          {/* Main Input Field */}
          <div className="relative w-full flex-1">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              placeholder="Enter any research topic (e.g. 'Future of humanoid robotics in industrial automation')..."
              className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none disabled:opacity-50"
            />
            {topic && !isProcessing && (
              <button
                type="button"
                onClick={() => setTopic('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls & Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end px-2 sm:px-0">
            
            {/* Streaming Mode Switch */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/50 text-xs">
              <button
                type="button"
                onClick={() => setStreamMode(true)}
                disabled={isProcessing}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  streamMode 
                    ? 'bg-indigo-600 text-white font-medium shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Live SSE streaming with stage-by-stage real-time progress"
              >
                <Radio className={`w-3 h-3 ${streamMode ? 'text-indigo-200 animate-pulse' : ''}`} />
                <span>Live Stream</span>
              </button>

              <button
                type="button"
                onClick={() => setStreamMode(false)}
                disabled={isProcessing}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  !streamMode 
                    ? 'bg-slate-700 text-white font-medium shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Synchronous REST request"
              >
                <span>Batch</span>
              </button>
            </div>

            {/* Launch or Stop Button */}
            {isProcessing ? (
              <button
                type="button"
                onClick={onCancelResearch}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-rose-900/30"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!topic.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-900/30 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Research</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </button>
            )}

          </div>

        </div>
      </form>

      {/* Suggested Topics Carousel / Badges */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="flex items-center gap-1 text-slate-400 font-medium whitespace-nowrap pl-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Suggestions:</span>
        </span>
        <div className="flex items-center gap-2 flex-nowrap">
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              disabled={isProcessing}
              className="px-3 py-1 rounded-full whitespace-nowrap bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-xs disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
