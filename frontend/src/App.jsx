import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import TopicInput from './components/TopicInput';
import AgentWorkflowPipeline from './components/AgentWorkflowPipeline';
import ReportView from './components/ReportView';
import CriticScorecard from './components/CriticScorecard';
import AgentInspector from './components/AgentInspector';
import HistorySidebar from './components/HistorySidebar';
import ArchitectureModal from './components/ArchitectureModal';
import Toast from './components/Toast';
import { 
  FileText, 
  ShieldCheck, 
  Code2, 
  AlertCircle, 
  Sparkles 
} from 'lucide-react';
import { getSavedSessions, saveSession, deleteSession, clearAllSessions } from './utils/storage';

export default function App() {
  // Main Data States
  const [topic, setTopic] = useState('');
  const [searchResults, setSearchResults] = useState('');
  const [scrapedContent, setScrapedContent] = useState('');
  const [report, setReport] = useState('');
  const [feedback, setFeedback] = useState('');

  // Execution & Pipeline States
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamMode, setStreamMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1..4 = active
  const [stepStatuses, setStepStatuses] = useState({});
  const [activeMessage, setActiveMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState(null);

  // Tabs & Modals
  const [activeTab, setActiveTab] = useState('report'); // 'report', 'critic', 'inspector'
  const [inspectorSubTab, setInspectorSubTab] = useState('search');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [architectureOpen, setArchitectureOpen] = useState(false);
  const [sessions, setSessions] = useState(() => getSavedSessions());
  const [toast, setToast] = useState(null);

  // References for aborting requests
  const eventSourceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Reset pipeline before a new run
  const resetPipeline = (newTopic) => {
    setTopic(newTopic);
    setError(null);
    setSearchResults('');
    setScrapedContent('');
    setReport('');
    setFeedback('');
    setElapsedSeconds(0);
    setCurrentStep(1);
    setStepStatuses({
      1: { status: 'running', message: 'Initializing search query...' },
      2: { status: 'idle' },
      3: { status: 'idle' },
      4: { status: 'idle' }
    });
    setActiveMessage('Starting autonomous multi-agent pipeline...');
  };

  // SSE Real-time Streaming Run
  const startStreamingResearch = (targetTopic) => {
    resetPipeline(targetTopic);
    setIsProcessing(true);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `/api/research/stream?topic=${encodeURIComponent(targetTopic)}`;
    const evtSource = new EventSource(sseUrl);
    eventSourceRef.current = evtSource;

    // Step started event
    evtSource.addEventListener('step', (e) => {
      try {
        const data = JSON.parse(e.data);
        const stepNum = data.step;
        setCurrentStep(stepNum);
        setActiveMessage(data.message || `${data.title}...`);
        setStepStatuses((prev) => ({
          ...prev,
          [stepNum]: {
            status: 'running',
            title: data.title,
            message: data.message
          }
        }));
      } catch (err) {
        console.error('Failed to parse SSE step event:', err);
      }
    });

    // Step completed event
    evtSource.addEventListener('step_done', (e) => {
      try {
        const data = JSON.parse(e.data);
        const stepNum = data.step;
        setStepStatuses((prev) => ({
          ...prev,
          [stepNum]: {
            status: 'completed',
            title: data.title,
            data: data.data
          }
        }));

        if (stepNum === 1) setSearchResults(data.data || '');
        if (stepNum === 2) setScrapedContent(data.data || '');
        if (stepNum === 3) setReport(data.data || '');
        if (stepNum === 4) setFeedback(data.data || '');
      } catch (err) {
        console.error('Failed to parse SSE step_done event:', err);
      }
    });

    // Pipeline complete event
    evtSource.addEventListener('complete', (e) => {
      try {
        const data = JSON.parse(e.data);
        setSearchResults(data.search_results || '');
        setScrapedContent(data.scraped_content || '');
        setReport(data.report || '');
        setFeedback(data.feedback || '');
        setCurrentStep(5);
        setActiveMessage('Research pipeline execution completed successfully.');

        // Mark all 4 steps as completed
        setStepStatuses({
          1: { status: 'completed' },
          2: { status: 'completed' },
          3: { status: 'completed' },
          4: { status: 'completed' }
        });

        // Save session in localStorage
        saveSession({
          topic: targetTopic,
          search_results: data.search_results || '',
          scraped_content: data.scraped_content || '',
          report: data.report || '',
          feedback: data.feedback || ''
        });
        setSessions(getSavedSessions());

        setIsProcessing(false);
        setActiveTab('report');
        showToast('Research synthesis complete!', 'success');
      } catch (err) {
        console.error('Failed to parse SSE complete event:', err);
        setIsProcessing(false);
      } finally {
        evtSource.close();
      }
    });

    // Custom Error event from server
    evtSource.addEventListener('error', (e) => {
      try {
        if (e.data) {
          const data = JSON.parse(e.data);
          if (data.error) {
            setError(data.error);
            showToast(`Error: ${data.error}`, 'error');
          }
        } else {
          // Network level error or connection closed
          if (evtSource.readyState === EventSource.CLOSED) {
            // normal close
          } else {
            setError('Connection to backend stream was interrupted or failed. Is the backend running?');
            showToast('Connection to backend stream failed', 'error');
          }
        }
      } catch {
        setError('Stream connection encountered an error.');
      }
      setIsProcessing(false);
      evtSource.close();
    });

    evtSource.onerror = () => {
      if (evtSource.readyState === EventSource.CLOSED) return;
      setError('Connection to server lost. Make sure backend is running on http://localhost:8000.');
      setIsProcessing(false);
      evtSource.close();
    };
  };

  // Standard Batch POST Run
  const startBatchResearch = async (targetTopic) => {
    resetPipeline(targetTopic);
    setIsProcessing(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setActiveMessage('Executing search and reader agents...');
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: targetTopic }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.search_results || '');
      setScrapedContent(data.scraped_content || '');
      setReport(data.report || '');
      setFeedback(data.feedback || '');
      setCurrentStep(5);
      setActiveMessage('Research complete.');

      setStepStatuses({
        1: { status: 'completed' },
        2: { status: 'completed' },
        3: { status: 'completed' },
        4: { status: 'completed' }
      });

      // Save session
      saveSession({
        topic: targetTopic,
        search_results: data.search_results || '',
        scraped_content: data.scraped_content || '',
        report: data.report || '',
        feedback: data.feedback || ''
      });
      setSessions(getSavedSessions());

      setActiveTab('report');
      showToast('Research synthesis complete!', 'success');
    } catch (err) {
      if (err.name === 'AbortError') {
        showToast('Research execution stopped by user', 'info');
      } else {
        setError(err.message || 'An error occurred during research execution');
        showToast(err.message || 'Error occurred', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Unified Start handler
  const handleStartResearch = (targetTopic, isStream) => {
    if (isStream) {
      startStreamingResearch(targetTopic);
    } else {
      startBatchResearch(targetTopic);
    }
  };

  // Stop / Cancel handler
  const handleCancelResearch = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setActiveMessage('Research stopped by user.');
    showToast('Research cancelled', 'info');
  };

  // Select historical session
  const handleSelectSession = (session) => {
    setTopic(session.topic);
    setSearchResults(session.search_results || '');
    setScrapedContent(session.scraped_content || '');
    setReport(session.report || '');
    setFeedback(session.feedback || '');
    setCurrentStep(5);
    setStepStatuses({
      1: { status: 'completed' },
      2: { status: 'completed' },
      3: { status: 'completed' },
      4: { status: 'completed' }
    });
    setActiveTab('report');
    setError(null);
    showToast(`Loaded archived research on "${session.topic.slice(0, 30)}..."`, 'success');
  };

  // Delete session
  const handleDeleteSession = (id) => {
    const updated = deleteSession(id);
    setSessions(updated);
    showToast('Session deleted from archive', 'info');
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    clearAllSessions();
    setSessions([]);
    showToast('Research archive cleared', 'info');
  };

  // When user clicks an agent card in the pipeline stepper
  const handleSelectAgentTab = (agentId) => {
    if (agentId === 'critic') {
      setActiveTab('critic');
    } else if (agentId === 'writer') {
      setActiveTab('report');
    } else {
      setActiveTab('inspector');
      setInspectorSubTab(agentId);
    }
  };

  const hasOutput = report || searchResults || scrapedContent || feedback;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Top Navigation */}
      <Navbar
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenArchitecture={() => setArchitectureOpen(true)}
        historyCount={sessions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autonomous Multi-Agent Cognitive System</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-indigo-300">
            Deep Research On Any Topic
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Orchestrates Tavily Web Search, Web Scraping, Mistral Synthesis, and an Independent Critic Agent to produce verified, high-scoring intelligence reports.
          </p>
        </div>

        {/* Search Console */}
        <div className="max-w-4xl mx-auto">
          <TopicInput
            onStartResearch={handleStartResearch}
            onCancelResearch={handleCancelResearch}
            isProcessing={isProcessing}
            streamMode={streamMode}
            setStreamMode={setStreamMode}
          />
        </div>

        {/* Error Notification Card if any */}
        {error && (
          <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3 shadow-xl">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-rose-300">Execution Error</h4>
              <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
              <p className="text-[11px] text-rose-400/80 pt-1">
                Tip: Verify that the FastAPI backend is running (<code className="bg-rose-900/40 px-1 py-0.5 rounded">uvicorn main:app --reload</code>) and valid API keys are configured in <code className="bg-rose-900/40 px-1 py-0.5 rounded">backend/.env</code>.
              </p>
            </div>
          </div>
        )}

        {/* Live Multi-Agent Workflow Pipeline */}
        {(isProcessing || currentStep > 0) && (
          <div className="max-w-5xl mx-auto">
            <AgentWorkflowPipeline
              currentStep={currentStep}
              stepStatuses={stepStatuses}
              activeMessage={activeMessage}
              elapsedSeconds={elapsedSeconds}
              onSelectAgentTab={handleSelectAgentTab}
            />
          </div>
        )}

        {/* Workspace Display with Tabs */}
        {hasOutput && (
          <div className="max-w-5xl mx-auto space-y-6 pt-2">
            
            {/* Primary Tab Navigation */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* Tab: Final Report */}
                <button
                  onClick={() => setActiveTab('report')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'report'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Research Report</span>
                  {report && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                {/* Tab: Critic Evaluation */}
                <button
                  onClick={() => setActiveTab('critic')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'critic'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Critic Scorecard</span>
                  {feedback && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                {/* Tab: Agent Inspector */}
                <button
                  onClick={() => setActiveTab('inspector')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'inspector'
                      ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Agent Telemetry</span>
                </button>

              </div>

              {/* Status pill on the right */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Ready</span>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'report' && (
              <ReportView
                topic={topic}
                report={report}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'critic' && (
              <CriticScorecard
                feedback={feedback}
                topic={topic}
              />
            )}

            {activeTab === 'inspector' && (
              <AgentInspector
                topic={topic}
                searchResults={searchResults}
                scrapedContent={scrapedContent}
                report={report}
                feedback={feedback}
                activeSubTab={inspectorSubTab}
                onShowToast={showToast}
              />
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            NexusAgent • Multi-Agent Cognitive Intelligence Framework
          </p>
          <p className="font-mono text-slate-600">
            Mistral AI + Tavily Web + BeautifulSoup4 + React 19
          </p>
        </div>
      </footer>

      {/* History Slide-over Drawer */}
      <HistorySidebar
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAllSessions}
      />

      {/* Architecture Modal */}
      <ArchitectureModal
        isOpen={architectureOpen}
        onClose={() => setArchitectureOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
