import { 
  X, 
  Globe, 
  BookOpen, 
  PenTool, 
  ShieldCheck, 
  Cpu, 
  Workflow 
} from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const agents = [
    {
      num: 1,
      title: 'Web Explorer Agent',
      tech: 'Tavily Search API + Mistral AI',
      desc: 'Formulates targeted search queries and queries Tavily to retrieve up-to-date web results, snippets, and verified source links.',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Step 1 • Discovery'
    },
    {
      num: 2,
      title: 'Deep Reader Agent',
      tech: 'BeautifulSoup4 + Web Reader Tool',
      desc: 'Inspects top discovered URLs, selects the most informative resource, and scrapes deep raw text content removing scripts/styles/noise.',
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-500',
      badge: 'Step 2 • Extraction'
    },
    {
      num: 3,
      title: 'Synthesis Writer Agent',
      tech: 'Mistral 7B + LCEL Prompt Pipeline',
      desc: 'Combines search snippets and deep scraped content. Generates an executive research brief with structured findings and citations.',
      icon: PenTool,
      color: 'from-purple-500 to-pink-500',
      badge: 'Step 3 • Synthesis'
    },
    {
      num: 4,
      title: 'Quality Critic Agent',
      tech: 'Mistral 7B + Evaluation Chain',
      desc: 'Peer-reviews the written report objectively. Computes an accuracy & depth score (X/10), breaks down strengths, and flags gaps.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Step 4 • Peer Review'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  Autonomous Multi-Agent Architecture
                </h3>
                <p className="text-xs text-slate-400">
                  How 4 specialized agents coordinate to produce verified research
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workflow Sequence */}
          <div className="mt-6 space-y-4">
            {agents.map((agent) => {
              const IconComp = agent.icon;
              return (
                <div 
                  key={agent.num}
                  className="rounded-xl p-4 bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-indigo-900/40">
                        {agent.badge}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-100">
                        {agent.title}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                        ({agent.tech})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {agent.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Streaming Protocol info */}
          <div className="mt-6 p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold font-mono uppercase text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time SSE Streaming Protocol</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The React frontend establishes a persistent Server-Sent Events (SSE) connection to <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">/api/research/stream?topic=...</code>.
              Each agent broadcasts progress events (`event: step`, `event: step_done`, `event: complete`), providing instantaneous visual feedback as the intelligence pipeline executes.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
