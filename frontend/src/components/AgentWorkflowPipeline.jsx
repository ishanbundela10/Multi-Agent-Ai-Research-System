import { 
  Globe, 
  BookOpen, 
  PenTool, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertCircle,
  Terminal
} from 'lucide-react';

const AGENT_STEPS = [
  {
    step: 1,
    id: 'search',
    name: 'Web Explorer',
    role: 'Tavily Search Agent',
    description: 'Searches reliable sources & pulls real-time snippets',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-cyan-500/50',
    glowColor: 'shadow-cyan-500/20'
  },
  {
    step: 2,
    id: 'reader',
    name: 'Deep Reader',
    role: 'Web Scraper Agent',
    description: 'Inspects top URL and extracts deep page content',
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/20'
  },
  {
    step: 3,
    id: 'writer',
    name: 'Synthesis Writer',
    role: 'Mistral LCEL Chain',
    description: 'Synthesizes findings into a structured report',
    icon: PenTool,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-pink-500/50',
    glowColor: 'shadow-pink-500/20'
  },
  {
    step: 4,
    id: 'critic',
    name: 'Quality Critic',
    role: 'Reviewer Agent',
    description: 'Grades accuracy, scores X/10, highlights improvements',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/20'
  }
];

export default function AgentWorkflowPipeline({ 
  currentStep = 0, 
  stepStatuses = {}, 
  activeMessage = '', 
  elapsedSeconds = 0,
  onSelectAgentTab
}) {
  const getProgressPercent = () => {
    let completedCount = 0;
    for (let i = 1; i <= 4; i++) {
      if (stepStatuses[i]?.status === 'completed') completedCount++;
    }
    if (completedCount === 4) return 100;
    if (currentStep > 0 && stepStatuses[currentStep]?.status === 'running') {
      return (completedCount * 25) + 12;
    }
    return completedCount * 25;
  };

  const progress = getProgressPercent();

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800/80 shadow-xl">
      
      {/* Pipeline Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/60 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <h2 className="font-semibold text-sm tracking-wide text-slate-200 uppercase">
            Multi-Agent Pipeline Progression
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          {elapsedSeconds > 0 && (
            <span className="flex items-center gap-1 font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
              <Clock className="w-3 h-3" />
              <span>{elapsedSeconds}s elapsed</span>
            </span>
          )}
          <span className="font-medium text-slate-300">
            {progress}% Completed
          </span>
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 mb-6 overflow-hidden border border-slate-800/60">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 4 Agent Grid Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {AGENT_STEPS.map((agent) => {
          const statusInfo = stepStatuses[agent.step] || {};
          const isRunning = statusInfo.status === 'running';
          const isCompleted = statusInfo.status === 'completed';
          const isError = statusInfo.status === 'error';
          const isPending = !isRunning && !isCompleted && !isError;

          const IconComponent = agent.icon;

          return (
            <div
              key={agent.step}
              onClick={() => isCompleted && onSelectAgentTab && onSelectAgentTab(agent.id)}
              className={`relative rounded-xl p-4 transition-all duration-300 border ${
                isRunning 
                  ? `bg-slate-900/90 ${agent.borderColor} shadow-lg ${agent.glowColor} scale-[1.02] ring-1 ring-indigo-500/30` 
                  : isCompleted 
                  ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer hover:bg-slate-900/80' 
                  : isError 
                  ? 'bg-rose-950/30 border-rose-500/50' 
                  : 'bg-slate-900/30 border-slate-800/60 opacity-60'
              }`}
            >
              {/* Header inside node */}
              <div className="flex items-center justify-between mb-2.5">
                
                {/* Agent Icon badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${agent.color} text-white shadow-md`}>
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Status Indicator */}
                <div>
                  {isRunning && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded-full animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin text-cyan-300" />
                      <span>Active</span>
                    </span>
                  )}
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Ready</span>
                    </span>
                  )}
                  {isError && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/50 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span>Failed</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5">
                      Step {agent.step}
                    </span>
                  )}
                </div>
              </div>

              {/* Agent Details */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                    {agent.name}
                  </h3>
                  {isCompleted && (
                    <span className="text-[10px] text-slate-400 hover:text-slate-200">
                      View →
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-indigo-300/80 font-mono">
                  {agent.role}
                </p>
                <p className="text-xs text-slate-400 leading-snug pt-1">
                  {agent.description}
                </p>
              </div>

              {/* Active step message snippet */}
              {isRunning && statusInfo.message && (
                <div className="mt-3 p-2 rounded bg-slate-950/80 border border-cyan-900/40 text-[11px] font-mono text-cyan-200 flex items-start gap-1.5">
                  <Terminal className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="truncate">{statusInfo.message}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Running Status Terminal Banner */}
      {currentStep > 0 && activeMessage && (
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-indigo-900/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="font-mono text-indigo-400 font-semibold uppercase text-[11px] tracking-wider shrink-0">
              Agent Activity:
            </span>
            <span className="text-slate-300 font-mono truncate">
              {activeMessage}
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span>Executing Stage {currentStep} of 4</span>
          </div>
        </div>
      )}

    </div>
  );
}
