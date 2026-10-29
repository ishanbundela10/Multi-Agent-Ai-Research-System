const STORAGE_KEY = 'nexus_agent_research_history';

/**
 * Get all saved research reports from localStorage
 */
export function getSavedSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load sessions from localStorage:', e);
    return [];
  }
}

/**
 * Save a completed research session to localStorage
 */
export function saveSession(session) {
  try {
    const sessions = getSavedSessions();
    const newSession = {
      id: session.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: session.timestamp || new Date().toISOString(),
      topic: session.topic,
      search_results: session.search_results || '',
      scraped_content: session.scraped_content || '',
      report: session.report || '',
      feedback: session.feedback || '',
      status: session.status || 'success'
    };

    // Filter out existing session if it has the same id or topic
    const updated = [newSession, ...sessions.filter(s => s.id !== newSession.id)].slice(0, 30); // keep up to 30
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newSession;
  } catch (e) {
    console.error('Failed to save session to localStorage:', e);
    return session;
  }
}

/**
 * Delete a specific session
 */
export function deleteSession(id) {
  try {
    const sessions = getSavedSessions();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Failed to delete session:', e);
    return [];
  }
}

/**
 * Clear all research history
 */
export function clearAllSessions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (e) {
    console.error('Failed to clear sessions:', e);
    return [];
  }
}

