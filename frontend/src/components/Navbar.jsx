import { useState, useEffect, useCallback } from 'react';
import { 
  Bot, 
  History, 
  Info, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Navbar({ 
  onOpenHistory, 
  onOpenArchitecture, 
  historyCount = 0 
}) {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [latency, setLatency] = useState(null);

  const checkHealth = useCallback(async () => {
    setBackendStatus('checking');
    const start = performance.now();
    try {
      const res = await fetch('/health', { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const duration = Math.round(performance.now() - start);
        if (data.status === 'ok') {
          setBackendStatus('online');
          setLatency(duration);
          return;
        }
      }
      setBackendStatus('offline');
      setLatency(null);
    } catch {
      setBackendStatus('offline');
      setLatency(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const execute = async () => {
      const start = performance.now();
      try {
        const res = await fetch('/health', { method: 'GET', cache: 'no-store' });
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          const duration = Math.round(performance.now() - start);
          if (data.status === 'ok') {
            setBackendStatus('online');
            setLatency(duration);
            return;
          }
        }
        setBackendStatus('offline');
        setLatency(null);
      } catch {
        if (isMounted) {
          setBackendStatus('offline');
          setLatency(null);
        }
      }
    };

    execute();
    const interval = setInterval(execute, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/25">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                backendStatus === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                backendStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                NexusAgent
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Research Lab
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Autonomous Multi-Agent Intelligence • Mistral + Tavily
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Backend Status Badge */}
          <button
            onClick={checkHealth}
            title={backendStatus === 'online' ? `Backend online (${latency}ms). Click to re-check` : 'Backend unreachable. Click to re-check'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              backendStatus === 'online'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : backendStatus === 'checking'
                ? 'bg-slate-800/60 text-slate-400 border-slate-700/50'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
            }`}
          >
            {backendStatus === 'online' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">API Online</span>
                {latency && <span className="text-[10px] text-emerald-400/70">{latency}ms</span>}
              </>
            ) : backendStatus === 'checking' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span className="hidden md:inline">Checking...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">API Offline</span>
              </>
            )}
          </button>

          {/* Architecture / How it works */}
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all hover:border-slate-600 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Pipeline Architecture</span>
          </button>

          {/* History Drawer Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all hover:border-slate-600 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {historyCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
