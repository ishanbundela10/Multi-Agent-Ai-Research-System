import { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Quote, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { parseCriticFeedback } from '../utils/parser';

export default function CriticScorecard({ feedback = '' }) {
  const [showRaw, setShowRaw] = useState(false);
  const parsed = parseCriticFeedback(feedback);

  if (!feedback) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
        <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">Awaiting Critic Evaluation</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Once the Writer Agent produces the draft report, the Quality Critic will rigorously review and score it.
        </p>
      </div>
    );
  }

  const scoreNum = parsed.scoreNum;
  const isHigh = scoreNum !== null && scoreNum >= 8;
  const isMid = scoreNum !== null && scoreNum >= 6 && scoreNum < 8;
  const isLow = scoreNum !== null && scoreNum < 6;

  const scoreBadgeBg = isHigh 
    ? 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300'
    : isMid 
    ? 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-300'
    : isLow
    ? 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-300'
    : 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-300';

  return (
    <div className="space-y-6">
      
      {/* Top Score Banner */}
      <div className={`rounded-2xl p-6 sm:p-8 bg-gradient-to-r ${scoreBadgeBg} border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Quality Assessment & Peer Review
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Independent Agent Review
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            The Critic Agent independently reviewed factual accuracy, structure, sources, and analytical depth.
          </p>
        </div>

        {/* Circular / Large Score Badge */}
        {parsed.score && (
          <div className="flex items-center gap-4 bg-slate-950/60 px-6 py-4 rounded-2xl border border-white/10 shrink-0 shadow-lg">
            <div className="text-right">
              <span className="text-xs uppercase font-mono text-slate-400 block font-semibold">
                Report Score
              </span>
              <span className="text-xs text-slate-400">
                {isHigh ? 'High Quality' : isMid ? 'Acceptable' : 'Needs Polish'}
              </span>
            </div>
            <div className="flex items-baseline font-black font-mono">
              <span className={`text-4xl sm:text-5xl ${
                isHigh ? 'text-emerald-400' : isMid ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {scoreNum !== null ? scoreNum : parsed.score.split('/')[0]}
              </span>
              <span className="text-lg text-slate-500 font-normal">/10</span>
            </div>
          </div>
        )}

      </div>

      {/* One-Line Verdict Highlight */}
      {parsed.verdict && (
        <div className="glass-card rounded-2xl p-5 border-l-4 border-indigo-500 flex items-start gap-3.5 shadow-md">
          <Quote className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-indigo-300 mb-1">
              Critic's Overall Verdict
            </h4>
            <p className="text-slate-100 font-medium text-sm sm:text-base italic">
              "{parsed.verdict}"
            </p>
          </div>
        </div>
      )}

      {/* Strengths & Areas to Improve Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Strengths Card */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 shadow-lg">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-500/10 text-emerald-400">
            <ThumbsUp className="w-4 h-4" />
            <h3 className="font-semibold text-sm tracking-wide uppercase">
              Identified Strengths
            </h3>
            {parsed.strengths.length > 0 && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {parsed.strengths.length}
              </span>
            )}
          </div>

          {parsed.strengths.length > 0 ? (
            <ul className="space-y-3">
              {parsed.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">No explicit strengths listed in critique.</p>
          )}
        </div>

        {/* Areas to Improve Card */}
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/20 shadow-lg">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-500/10 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-semibold text-sm tracking-wide uppercase">
              Areas to Improve
            </h3>
            {parsed.improvements.length > 0 && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {parsed.improvements.length}
              </span>
            )}
          </div>

          {parsed.improvements.length > 0 ? (
            <ul className="space-y-3">
              {parsed.improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{imp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">No critical deficiencies flagged.</p>
          )}
        </div>

      </div>

      {/* Collapsible Raw Feedback View */}
      <div className="glass-card rounded-xl border border-slate-800/80 overflow-hidden">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          <span className="font-mono flex items-center gap-2">
            <span>Raw Critic Chain Output</span>
          </span>
          {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRaw && (
          <div className="p-5 border-t border-slate-800/60 bg-slate-950/80">
            <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {feedback}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
}
