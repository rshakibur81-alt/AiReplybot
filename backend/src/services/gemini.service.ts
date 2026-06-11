import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import config from '../config';
import prisma from '../config/database';

let genAI: GoogleGenerativeAI | null = null;
let flashModel: GenerativeModel | null = null;
let proModel: GenerativeModel | null = null;

const getGeminiFlashModel = (): GenerativeModel => {
  if (!genAI) {
    if (!config.gemini.apiKey) {
      throw new Error('Gemini API key not configured');
    }
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  if (!flashModel) {
    flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
  }
  return flashModel;
};

const getGeminiProModel = (): GenerativeModel => {
  if (!genAI) {
    if (!config.gemini.apiKey) {
      throw new Error('Gemini API key not configured');
    }
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  if (!proModel) {
    proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
  }
  return proModel;
};

// ============================================
// PART B: AI Reply Pipeline
// ============================================

interface AIReplyInput {
  message: string;
  pageId: string;
  userId: string;
}

interface ReplyResult {
  reply: string;
  tokensUsed: number;
  duration: number;
}

/**
 * Full AI Reply Pipeline:
 * 1. Fetch page owner's AI Instructions
 * 2. Search product catalog via keyword matching (simple RAG)
 * 3. Build Gemini prompt with instructions + products
 * 4. Call Gemini API (gemini-1.5-flash)
 * 5. Return generated reply + metadata
 */
export const generateAIReply = async (input: AIReplyInput): Promise<ReplyResult> => {
  const startTime = Date.now();
  const { message, pageId, userId } = input;

  try {
    // Step 1: Fetch AI Instructions from database
    const aiInstruction = await prisma.aIInstruction.findUnique({
      where: { userId },
    });
    const instructions = aiInstruction?.content || 'Be friendly, helpful, and concise. Respond in the same language as the customer.';

    // Step 2: Simple RAG — search product catalog by keyword matching
    const products = await prisma.product.findMany({
      where: {
        userId,
        isActive: true,
OR: [
          { name: { contains: message } },
          { description: { contains: message } },
        ],
      },
      take: 5,
    });

    let productDetails = '';
    if (products.length > 0) {
      productDetails = products
        .map(
          (p) =>
            `- ${p.name}: ৳${p.price}. ${p.description}${p.sizes ? ` (Sizes: ${p.sizes})` : ''}${p.stockStatus === 'out_of_stock' ? ' [OUT OF STOCK]' : ''}`
        )
        .join('\n');
    }

    // Step 3: Build the full prompt
    const languageInstruction =
      'Reply naturally and helpfully in the same language the customer used. ' +
      'Do not mention you are an AI. Do not mention ReplyMind AI. ' +
      'Reply as if you are the business owner or a customer service representative. ' +
      'Keep responses concise and engaging (under 150 words).';

    const systemPrompt = `You are a customer service assistant for a Facebook page.

Instructions: ${instructions}

${productDetails ? `Relevant Products:\n${productDetails}\n` : ''}
${languageInstruction}

Customer Message: "${message}"

Generate a natural, helpful reply:`;

    // Step 4: Call Gemini API (gemini-1.5-flash for speed & cost)
    const geminiModel = getGeminiFlashModel();
    const result = await geminiModel.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Estimate tokens used (rough: ~4 chars per token)
    const estimatedTokens = Math.ceil(
      (systemPrompt.length + text.length) / 4
    );

    // Apply response delay if configured (handled externally in facebook.service)
    const duration = Date.now() - startTime;

    return {
      reply: text || 'Thank you for your message! We will get back to you shortly.',
      tokensUsed: estimatedTokens,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Gemini] AI Reply Pipeline error:', error);

    // Fallback reply
    return {
      reply: 'Thank you for your message! Our team will review it and get back to you shortly.',
      tokensUsed: 0,
      duration,
    };
  }
};

// ============================================
// Message Intent Analysis (existing)
// ============================================

export const analyzeMessageIntent = async (message: string): Promise<{
  intent: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
}> => {
  try {
    const geminiModel = getGeminiProModel();
    const prompt = `Analyze this customer message and extract:
1. Intent (what they want: support, inquiry, complaint, feedback, purchase, etc.)
2. Sentiment (positive, negative, or neutral)
3. Key topics/keywords (comma-separated list)

Message: "${message}"

Respond in JSON format only:
{
  "intent": "...",
  "sentiment": "...",
  "keywords": ["...", "..."]
}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { intent: 'general', sentiment: 'neutral', keywords: [] };
  } catch (error) {
    console.error('[Gemini] Analysis error:', error);
    return { intent: 'general', sentiment: 'neutral', keywords: [] };
  }
};

export default {
  generateAIReply,
  analyzeMessageIntent,
};
