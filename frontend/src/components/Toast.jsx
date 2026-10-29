import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl glass-panel border border-slate-700 text-slate-100 text-xs sm:text-sm animate-bounce duration-300">
      {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
      {isError && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}

      <span className="font-medium">{message}</span>

      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-200 transition-colors ml-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
