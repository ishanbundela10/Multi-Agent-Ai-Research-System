import { useState } from 'react';
import { 
  Globe, 
  BookOpen, 
  PenTool, 
  Code2, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { extractUrls } from '../utils/parser';

export default function AgentInspector({ 
  topic = '', 
  searchResults = '', 
  scrapedContent = '', 
  report = '', 
  feedback = '', 
  activeSubTab = 'search',
  onShowToast 
}) {
  const [selectedTab, setSelectedTab] = useState(null);
  const [copied, setCopied] = useState(false);

  // Tab is either user's explicitly selected tab or parent's activeSubTab
  const tab = selectedTab || activeSubTab || 'search';

  const copyData = (dataStr, label = 'Content') => {
    if (!dataStr) return;
    navigator.clipboard.writeText(typeof dataStr === 'string' ? dataStr : JSON.stringify(dataStr, null, 2));
    setCopied(true);
    if (onShowToast) onShowToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullState = {
    topic,
    search_results: searchResults,
    scraped_content: scrapedContent,
    report,
    feedback
  };

  const searchUrls = extractUrls(searchResults);

  const tabs = [
    { id: 'search', label: '1. Tavily Search Results', icon: Globe, count: searchUrls.length ? `${searchUrls.length} URLs` : null },
    { id: 'reader', label: '2. Scraped Article Text', icon: BookOpen, count: scrapedContent ? `${scrapedContent.length} chars` : null },
    { id: 'writer', label: '3. Writer Raw Draft', icon: PenTool, count: report ? `${report.length} chars` : null },
    { id: 'telemetry', label: '4. Pipeline State JSON', icon: Code2, count: null },
  ];

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
      
      {/* Subtab Navigation Bar */}
      <div className="bg-slate-900/90 px-4 sm:px-6 border-b border-slate-800/80 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          {tabs.map((t) => {
            const IconComponent = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTab(t.id)}
                className={`flex items-center gap-2 py-4 px-3 sm:px-4 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{t.label}</span>
                {t.count && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Copy Active Tab Button */}
        <div className="shrink-0 py-2">
          <button
            onClick={() => {
              if (tab === 'search') copyData(searchResults, 'Search Results');
              else if (tab === 'reader') copyData(scrapedContent, 'Scraped Content');
              else if (tab === 'writer') copyData(report, 'Report Draft');
              else if (tab === 'telemetry') copyData(fullState, 'JSON Telemetry');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        
        {/* TAB 1: Search Results */}
        {tab === 'search' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Agent 1 output: Web search query results returned from Tavily
              </span>
            </div>

            {searchUrls.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2 uppercase tracking-wider">
                  Extracted Reference URLs:
                </span>
                <div className="space-y-1.5">
                  {searchUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 truncate"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {searchResults || 'No search results available yet.'}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: Scraped Reader Content */}
        {tab === 'reader' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Agent 2 output: Deep web scraper content parsed by BeautifulSoup
              </span>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
                {scrapedContent || 'No deep scraped content extracted yet.'}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: Writer Raw Draft */}
        {tab === 'writer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Agent 3 output: Raw synthesis draft directly from Mistral LCEL chain
              </span>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
                {report || 'No draft report generated yet.'}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: JSON Telemetry */}
        {tab === 'telemetry' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Full Agent System JSON Memory State
              </span>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <pre className="font-mono text-xs text-indigo-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
                {JSON.stringify(fullState, null, 2)}
              </pre>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
