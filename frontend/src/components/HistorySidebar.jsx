import { 
  X, 
  Trash2, 
  Clock, 
  ChevronRight, 
  History 
} from 'lucide-react';
import { parseCriticFeedback } from '../utils/parser';

export default function HistorySidebar({ 
  isOpen, 
  onClose, 
  sessions = [], 
  onSelectSession, 
  onDeleteSession, 
  onClearAll 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              <h2 className="font-bold text-base text-slate-100">
                Research Archive
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                {sessions.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-400">No saved research sessions</p>
                <p className="text-xs text-slate-600 mt-1">
                  Completed research runs will automatically be cached here for instant recall.
                </p>
              </div>
            ) : (
              sessions.map((item) => {
                const critic = parseCriticFeedback(item.feedback);
                const dateStr = item.timestamp 
                  ? new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Recent';

                return (
                  <div
                    key={item.id}
                    className="group relative rounded-xl p-4 bg-slate-800/40 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                    onClick={() => {
                      onSelectSession(item);
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {dateStr}
                      </span>

                      {critic.score && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ★ {critic.score}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                      {item.topic}
                    </h3>

                    {critic.verdict && (
                      <p className="text-xs text-slate-400 italic line-clamp-1 mt-1">
                        "{critic.verdict}"
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <span className="text-xs text-indigo-400 flex items-center gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
                        <span>Load Report</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(item.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Clear All */}
          {sessions.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Stored locally in browser
              </span>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Archive</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
