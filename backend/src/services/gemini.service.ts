import OpenAI from 'openai';
import config from '../config';
import prisma from '../config/database';

let groqClient: OpenAI | null = null;

const getGroqClient = (): OpenAI => {
  if (!groqClient) {
    if (!config.groq.apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }
    groqClient = new OpenAI({
      apiKey: config.groq.apiKey,
      baseURL: config.groq.baseUrl,
    });
  }
  return groqClient;
};

// ============================================
// AI Reply Pipeline
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
 * 3. Build Groq prompt with instructions + products
 * 4. Call Groq API (llama-3.3-70b-versatile via OpenAI SDK)
 * 5. Return generated reply + metadata
 */
export const generateAIReply = async (input: AIReplyInput): Promise<ReplyResult> => {
  const startTime = Date.now();
  const { message, pageId, userId } = input;

  try {
    // Step 1: Fetch AI Instructions from database

    await prisma.aIInstruction.upsert({
  where: { userId },
  update: {},
  create: {
    userId,
    content: 'Test AI Instruction',
  },
});
    
    const aiInstruction = await prisma.aIInstruction.findUnique({
      where: { userId },
    });

    const allInstructions = await prisma.aIInstruction.findMany();

console.log('========== DATABASE CHECK ==========');
console.log('AI INSTRUCTION FOUND:', aiInstruction);
console.log('ALL INSTRUCTIONS:', allInstructions);
console.log('====================================');

    console.log('========== DEBUG ==========');
console.log('USER ID:', userId);
console.log('PAGE ID:', pageId);
console.log('AI INSTRUCTION:', aiInstruction);
console.log('===========================');
    
    const instructions = aiInstruction?.content || 'Be friendly, helpful, and concise. Respond in the same language as the customer.';

    console.log('FINAL INSTRUCTIONS:', instructions);
    
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

    // Step 4: Call Groq API via OpenAI SDK (llama-3.3-70b-versatile)
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: config.groq.model,
      messages: [
        { role: 'user', content: systemPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';

    // Estimate tokens used from usage data or rough estimate
    const estimatedTokens = completion.usage?.total_tokens ||
      Math.ceil((systemPrompt.length + text.length) / 4);

    const duration = Date.now() - startTime;

    return {
      reply: text || 'Thank you for your message! We will get back to you shortly.',
      tokensUsed: estimatedTokens,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Groq] AI Reply Pipeline error:', error);

    // Fallback reply
    return {
      reply: 'Thank you for your message! Our team will review it and get back to you shortly.',
      tokensUsed: 0,
      duration,
    };
  }
};

// ============================================
// Message Intent Analysis
// ============================================

export const analyzeMessageIntent = async (message: string): Promise<{
  intent: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
}> => {
  try {
    const client = getGroqClient();
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

    const completion = await client.chat.completions.create({
      model: config.groq.model,
      messages: [
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { intent: 'general', sentiment: 'neutral', keywords: [] };
  } catch (error) {
    console.error('[Groq] Analysis error:', error);
    return { intent: 'general', sentiment: 'neutral', keywords: [] };
  }
};

export default {
  generateAIReply,
  analyzeMessageIntent,
};
