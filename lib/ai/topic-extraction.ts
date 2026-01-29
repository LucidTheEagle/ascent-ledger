// ============================================
// lib/ai/topic-extraction.ts
// THE PATTERN SPOTTER: Extract Strategic Topics from Logs
// Role: Uses Groq to identify 3-5 key themes for graph relationships
// Phase: Sprint 3, Checkpoint 3
// ============================================

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Topic Extraction Prompt
 * Designed to identify strategic themes, not just keywords
 */
const TOPIC_EXTRACTION_PROMPT = `
You are a strategic analyst extracting key themes from a professional's weekly log.

TASK:
Extract 3-5 strategic topics that represent the CORE THEMES of this week's work.

RULES:
1. Topics should be strategic concepts (e.g., "leadership", "delegation", "visibility")
2. NOT tasks or tools (e.g., NOT "email", "meeting", "Slack")
3. Focus on skills, competencies, and career themes
4. Normalize to lowercase single words or 2-word phrases
5. Return topics in order of prominence (most important first)

EXAMPLES:
Good Topics: "leadership", "public speaking", "strategic planning", "mentorship", "visibility"
Bad Topics: "email", "PowerPoint", "Monday meeting", "lunch break"

USER'S WEEKLY LOG:
Leverage Built: {leverageBuilt}
Learned Insight: {learnedInsight}
Opportunities Created: {opportunitiesCreated}

OUTPUT FORMAT (JSON):
{
  "topics": [
    {"name": "leadership", "confidence": 0.95},
    {"name": "delegation", "confidence": 0.88},
    {"name": "visibility", "confidence": 0.82}
  ]
}

Extract the topics now:
`;

/**
 * Extracted topic with confidence score
 */
export interface ExtractedTopic {
  name: string;
  confidence: number; // 0.0 - 1.0
}

/**
 * Extract strategic topics from a Strategic Log
 * 
 * @param logData - The 3 log fields
 * @param options - Extraction configuration
 * @returns Array of topics with confidence scores
 * @throws Error if extraction fails (caller handles gracefully)
 */
export async function extractTopicsFromLog(
  logData: {
    leverageBuilt: string;
    learnedInsight: string;
    opportunitiesCreated: string;
  },
  options: {
    minTopics?: number;
    maxTopics?: number;
    minConfidence?: number;
  } = {}
): Promise<ExtractedTopic[]> {
  const {
    minTopics = 3,
    maxTopics = 5,
    minConfidence = 0.7,
  } = options;

  try {
    // Prepare prompt with user's log data
    const prompt = TOPIC_EXTRACTION_PROMPT
      .replace('{leverageBuilt}', logData.leverageBuilt || 'N/A')
      .replace('{learnedInsight}', logData.learnedInsight || 'N/A')
      .replace('{opportunitiesCreated}', logData.opportunitiesCreated || 'N/A');

    // Call Groq API
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for consistent extraction
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Groq response');
    }

    // Parse JSON response
    const parsed = JSON.parse(content);

    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      throw new Error('Invalid topic extraction format: missing topics array');
    }

    // Validate and filter topics
    const topics: ExtractedTopic[] = parsed.topics
      .filter((topic: unknown) => {
        if (typeof topic !== 'object' || topic === null) return false;
        const t = topic as Record<string, unknown>;
        return (
          typeof t.name === 'string' &&
          typeof t.confidence === 'number' &&
          t.confidence >= minConfidence
        );
      })
      .map((topic: unknown) => {
        const t = topic as Record<string, unknown>;
        return {
          name: (t.name as string).toLowerCase().trim(),
          confidence: t.confidence as number,
        };
      })
      .slice(0, maxTopics); // Limit to maxTopics

    // Ensure minimum number of topics
    if (topics.length < minTopics) {
      console.warn(
        `[TopicExtraction] Only ${topics.length} topics extracted (min: ${minTopics}). ` +
        `This might indicate unclear log content.`
      );
    }

    return topics;

  } catch (error) {
    console.error('[TopicExtraction] Failed to extract topics:', error);

    // Handle specific Groq errors
    if (error instanceof Groq.APIError) {
      if (error.status === 429) {
        throw new Error('Topic extraction rate limit reached. Please try again in a moment.');
      }
      if (error.status === 401) {
        throw new Error('Topic extraction authentication failed.');
      }
      if (error.status && error.status >= 500) {
        throw new Error('Topic extraction service temporarily unavailable.');
      }
    }

    // Re-throw for caller to handle
    throw error;
  }
}

/**
 * Fallback: Extract simple keywords if Groq fails
 * Uses basic text analysis as a backup
 * 
 * @param text - Combined log text
 * @returns Array of basic keywords
 */
export function extractFallbackTopics(text: string): ExtractedTopic[] {
  // Common strategic keywords
  const strategicKeywords = [
    'leadership', 'delegation', 'mentorship', 'visibility', 'influence',
    'communication', 'strategy', 'planning', 'execution', 'collaboration',
    'presentation', 'writing', 'networking', 'negotiation', 'decision',
  ];

  const normalizedText = text.toLowerCase();
  const foundTopics: ExtractedTopic[] = [];

  for (const keyword of strategicKeywords) {
    if (normalizedText.includes(keyword)) {
      foundTopics.push({
        name: keyword,
        confidence: 0.6, // Lower confidence for fallback
      });
    }
  }

  // Return top 3 topics
  return foundTopics.slice(0, 3);
}

/**
 * Batch extract topics from multiple logs
 * Useful for backfilling graph data
 * 
 * @param logs - Array of log data
 * @returns Map of logId → topics
 */
export async function batchExtractTopics(
  logs: Array<{
    id: string;
    leverageBuilt: string;
    learnedInsight: string;
    opportunitiesCreated: string;
  }>
): Promise<Map<string, ExtractedTopic[]>> {
  const results = new Map<string, ExtractedTopic[]>();

  for (const log of logs) {
    try {
      const topics = await extractTopicsFromLog({
        leverageBuilt: log.leverageBuilt,
        learnedInsight: log.learnedInsight,
        opportunitiesCreated: log.opportunitiesCreated,
      });

      results.set(log.id, topics);

      // Rate limiting: Wait 100ms between requests (Groq free tier: 30 RPM)
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`[TopicExtraction] Failed for log ${log.id}:`, error);
      
      // Use fallback for this log
      const combinedText = `${log.leverageBuilt} ${log.learnedInsight} ${log.opportunitiesCreated}`;
      const fallbackTopics = extractFallbackTopics(combinedText);
      results.set(log.id, fallbackTopics);
    }
  }

  return results;
}

/**
 * Validate topic name format
 * Ensures topics are normalized and valid
 * 
 * @param topic - Topic name
 * @returns true if valid
 */
export function isValidTopicName(topic: string): boolean {
  if (!topic || typeof topic !== 'string') return false;
  
  const normalized = topic.trim().toLowerCase();
  
  // Must be 2-30 characters
  if (normalized.length < 2 || normalized.length > 30) return false;
  
  // Only letters, spaces, hyphens
  if (!/^[a-z\s-]+$/.test(normalized)) return false;
  
  // No excessive whitespace
  if (/\s{2,}/.test(normalized)) return false;
  
  return true;
}

/**
 * Normalize topic name
 * Ensures consistent formatting for graph storage
 * 
 * @param topic - Raw topic name
 * @returns Normalized topic name
 */
export function normalizeTopicName(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[^a-z\s-]/g, ''); // Remove invalid characters
}