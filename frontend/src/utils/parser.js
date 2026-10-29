/**
 * Helper to parse the Critic agent's structured response into discrete fields.
 * Expected format from backend:
 * Score: X/10
 * Strengths:
 * - ...
 * Areas to Improve:
 * - ...
 * One line verdict:
 * ...
 */
export function parseCriticFeedback(rawFeedback = "") {
  if (!rawFeedback) {
    return {
      score: null,
      scoreNum: null,
      strengths: [],
      improvements: [],
      verdict: "",
      raw: ""
    };
  }

  const result = {
    score: null,
    scoreNum: null,
    strengths: [],
    improvements: [],
    verdict: "",
    raw: rawFeedback
  };

  // 1. Extract Score
  const scoreMatch = rawFeedback.match(/Score:\s*([0-9]+(?:\.[0-9]+)?)\s*(?:\/|\s*out of\s*)10/i) ||
                     rawFeedback.match(/([0-9]+(?:\.[0-9]+)?)\s*\/\s*10/i);
  if (scoreMatch) {
    result.score = `${scoreMatch[1]}/10`;
    result.scoreNum = parseFloat(scoreMatch[1]);
  }

  // 2. Extract Strengths
  const strengthsMatch = rawFeedback.match(/Strengths:\s*([\s\S]*?)(?=Areas to Improve:|Weaknesses:|One line verdict:|Verdict:|$)/i);
  if (strengthsMatch) {
    result.strengths = strengthsMatch[1]
      .split('\n')
      .map(line => line.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  // 3. Extract Areas to Improve
  const improveMatch = rawFeedback.match(/(?:Areas to Improve:|Weaknesses:|Improvements:)\s*([\s\S]*?)(?=One line verdict:|Verdict:|$)/i);
  if (improveMatch) {
    result.improvements = improveMatch[1]
      .split('\n')
      .map(line => line.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  // 4. Extract One line verdict
  const verdictMatch = rawFeedback.match(/(?:One line verdict:|Verdict:)\s*([\s\S]*)$/i);
  if (verdictMatch) {
    result.verdict = verdictMatch[1].trim().replace(/^["']|["']$/g, '');
  }

  return result;
}

/**
 * Helper to extract URLs from search results or text
 */
export function extractUrls(text = "") {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s)\],]+)/g;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches)];
}

/**
 * Calculate reading time in minutes and word count
 */
export function calculateReadingStats(text = "") {
  if (!text) return { wordCount: 0, readingTime: 1 };
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { wordCount: words, readingTime };
}
