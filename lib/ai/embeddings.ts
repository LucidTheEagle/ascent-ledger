// ============================================
// lib/ai/embeddings.ts
// THE MEMORY: Converts text into semantic vectors
// Uses OpenAI's text-embedding-3-small model
// ============================================

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embedding vector from text
 * Returns 1536-dimension vector for semantic similarity search
 * 
 * @param text - The text to embed (log content)
 * @returns Array of 1536 numbers (the embedding vector)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Call OpenAI Embeddings API
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.trim(),
      encoding_format: 'float', // We want floating-point numbers
    });

    // Extract the embedding vector
    const embedding = response.data[0].embedding;

    if (!embedding || embedding.length !== 1536) {
      throw new Error('Invalid embedding response from OpenAI');
    }

    return embedding;

  } catch (error) {
    console.error('Embedding generation error:', error);
    
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }

    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embedding from a Strategic Log
 * Combines all 3 answers into one text block for embedding
 * 
 * @param log - The strategic log data
 * @returns Embedding vector
 */
export async function generateLogEmbedding(log: {
  leverageBuilt: string;
  learnedInsight: string;
  opportunitiesCreated: string;
}): Promise<number[]> {
  // Combine all 3 answers with clear separation
  const combinedText = `
Leverage: ${log.leverageBuilt}
Insight: ${log.learnedInsight}
Opportunities: ${log.opportunitiesCreated}
  `.trim();

  return generateEmbedding(combinedText);
}

/**
 * Convert embedding array to PostgreSQL vector format
 * Prisma stores vectors as text, so we need to format as JSON string
 * 
 * @param embedding - The embedding array
 * @returns JSON string representation
 */
export function embeddingToString(embedding: number[]): string {
  return JSON.stringify(embedding);
}

/**
 * Convert PostgreSQL vector string back to array
 * 
 * @param embeddingString - The stored JSON string
 * @returns Embedding array
 */
export function stringToEmbedding(embeddingString: string): number[] {
  try {
    return JSON.parse(embeddingString);
  } catch (error) {
    console.error('Failed to parse embedding string:', error);
    return [];
  }
}

/**
 * Calculate cosine similarity between two embeddings
 * Returns value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite)
 * 
 * @param embedding1 - First embedding vector
 * @param embedding2 - Second embedding vector
 * @returns Similarity score (0-1, higher = more similar)
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  
  if (magnitude === 0) return 0;
  
  return dotProduct / magnitude;
}