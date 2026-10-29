import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Copy, 
  Check, 
  Download, 
  Printer, 
  FileText, 
  Clock, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { calculateReadingStats, extractUrls } from '../utils/parser';

export default function ReportView({ topic = '', report = '', onShowToast }) {
  const [copied, setCopied] = useState(false);

  const { wordCount, readingTime } = calculateReadingStats(report);
  const detectedSources = extractUrls(report);

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    if (onShowToast) onShowToast('Research report copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);
    link.href = url;
    link.download = `nexus_research_${safeTopic || 'report'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('Markdown report downloaded!');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No Research Report Generated Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Enter a research topic above and click "Research" to execute the 4-agent autonomous pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
      
      {/* Report Header Bar */}
      <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Synthesis Report
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight mt-0.5">
            {topic}
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              {wordCount.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              ~{readingTime} min read
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Copy Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Download .md"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download .md</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Print / Save PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Rendered Markdown Body */}
      <div className="p-6 sm:p-10 prose prose-invert max-w-none prose-slate">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 pb-3 border-b border-slate-800 mb-6">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl sm:text-2xl font-bold text-indigo-200 mt-8 mb-4 pb-2 border-b border-indigo-900/30 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded bg-indigo-500 inline-block" />
                <span>{children}</span>
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-slate-100 mt-6 mb-3">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="space-y-2 my-4 list-disc list-inside text-slate-300 text-sm sm:text-base pl-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="space-y-2 my-4 list-decimal list-inside text-slate-300 text-sm sm:text-base pl-2">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-5 pl-4 border-l-4 border-indigo-500/70 bg-indigo-950/20 py-2 pr-4 rounded-r-lg italic text-slate-300">
                {children}
              </blockquote>
            ),
            code: ({ inline, children, ...props }) => {
              return inline ? (
                <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs border border-slate-700/60" {...props}>
                  {children}
                </code>
              ) : (
                <div className="my-4 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto">
                    <code {...props}>{children}</code>
                  </pre>
                </div>
              );
            },
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/50 hover:decoration-indigo-400 transition-colors"
              >
                <span>{children}</span>
                <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-80" />
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 bg-slate-900 font-semibold text-slate-200">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 border-t border-slate-800/60 text-slate-300">
                {children}
              </td>
            )
          }}
        >
          {report}
        </ReactMarkdown>
      </div>

      {/* Discovered External Sources Bar */}
      {detectedSources.length > 0 && (
        <div className="bg-slate-900/60 border-t border-slate-800/80 p-6 print:hidden">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Discovered Reference Links ({detectedSources.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {detectedSources.map((url, i) => {
              let domain = url;
              try {
                domain = new URL(url).hostname;
              } catch {
                /* invalid url fallback */
              }
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-indigo-300 hover:text-indigo-200 text-xs border border-slate-700/60 transition-colors"
                >
                  <span className="font-mono">{domain}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
