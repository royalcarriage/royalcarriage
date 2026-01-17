/**
 * AI Chat Functions
 *
 * Cloud Functions for the AI Chat Assistant with Gemini integration
 * and conversation history management.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Types
interface ChatRequest {
  message: string;
  conversationId?: string;
  model?: string;
}

interface ChatResponse {
  response: string;
  tokens: number;
  conversationId: string;
  model: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: admin.firestore.Timestamp;
  model?: string;
  tokens?: number;
}

// Gemini model configuration
const MODEL_CONFIG: Record<string, { model: string; maxTokens: number }> = {
  'gemini-pro': { model: 'gemini-pro', maxTokens: 8192 },
  'gemini-flash': { model: 'gemini-1.5-flash', maxTokens: 4096 },
};

/**
 * Main chat function - handles messages and returns AI responses
 */
export const chatWithAI = functions.https.onCall(
  async (data: ChatRequest, context): Promise<ChatResponse> => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated to use chat'
      );
    }

    const { message, conversationId, model = 'gemini-pro' } = data;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Message is required'
      );
    }

    const userId = context.auth.uid;
    const userEmail = context.auth.token.email || 'unknown';
    const modelConfig = MODEL_CONFIG[model] || MODEL_CONFIG['gemini-pro'];

    let activeConversationId = conversationId;
    let conversationHistory: ConversationMessage[] = [];

    try {
      // Load or create conversation
      if (conversationId) {
        const convDoc = await db.collection('chat_conversations').doc(conversationId).get();
        if (convDoc.exists && convDoc.data()?.userId === userId) {
          // Load recent messages for context
          const messagesSnap = await db
            .collection('chat_conversations')
            .doc(conversationId)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

          conversationHistory = messagesSnap.docs
            .map((doc) => doc.data() as ConversationMessage)
            .reverse();
        }
      }

      // Create new conversation if needed
      if (!activeConversationId) {
        const newConv = await db.collection('chat_conversations').add({
          userId,
          userEmail,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          lastMessage: message.substring(0, 100),
          messageCount: 0,
          timestamp: admin.firestore.Timestamp.now(),
          createdAt: admin.firestore.Timestamp.now(),
        });
        activeConversationId = newConv.id;
      }

      // Generate AI response
      const { response, tokens } = await generateAIResponse(
        message,
        conversationHistory,
        modelConfig.model
      );

      // Save user message
      await db
        .collection('chat_conversations')
        .doc(activeConversationId)
        .collection('messages')
        .add({
          role: 'user',
          content: message,
          timestamp: admin.firestore.Timestamp.now(),
        });

      // Save AI response
      await db
        .collection('chat_conversations')
        .doc(activeConversationId)
        .collection('messages')
        .add({
          role: 'assistant',
          content: response,
          timestamp: admin.firestore.Timestamp.now(),
          model: model,
          tokens: tokens,
        });

      // Update conversation metadata
      await db
        .collection('chat_conversations')
        .doc(activeConversationId)
        .update({
          lastMessage: response.substring(0, 100),
          messageCount: admin.firestore.FieldValue.increment(2),
          timestamp: admin.firestore.Timestamp.now(),
        });

      // Log chat activity
      await db.collection('activity_log').add({
        type: 'ai',
        message: `AI Chat: "${message.substring(0, 40)}..."`,
        status: 'success',
        userId,
        userEmail,
        timestamp: admin.firestore.Timestamp.now(),
      });

      return {
        response,
        tokens,
        conversationId: activeConversationId,
        model,
      };
    } catch (error: any) {
      console.error('Chat error:', error);

      // Log error
      await db.collection('activity_log').add({
        type: 'ai',
        message: `AI Chat Error: ${error.message}`,
        status: 'error',
        userId,
        timestamp: admin.firestore.Timestamp.now(),
      });

      throw new functions.https.HttpsError('internal', `Chat failed: ${error.message}`);
    }
  }
);

/**
 * Generate AI response using Gemini
 */
async function generateAIResponse(
  message: string,
  history: ConversationMessage[],
  model: string
): Promise<{ response: string; tokens: number }> {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.api_key;
    if (!apiKey) {
      // Fallback to local response if no API key
      return generateLocalResponse(message);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    // Build conversation context
    const systemPrompt = `You are an AI assistant for Royal Carriage Limousine, a luxury transportation company in Chicago.
You help with:
- Content generation for websites (SEO-optimized)
- Data analysis and insights
- Code writing (TypeScript, React, Firebase)
- Translation and summarization
- Brainstorming and creative ideas

Be helpful, professional, and concise. Use markdown formatting when appropriate.
Current company context:
- Services: Airport transfers, corporate events, weddings, party bus rentals
- Locations: Chicago metropolitan area, O'Hare, Midway airports
- Fleet: Sedans, SUVs, limousines, party buses, Sprinter vans`;

    // Build message history for context
    const contextMessages = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat with history
    const chat = geminiModel.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I\'m ready to assist with Royal Carriage Limousine tasks.' }] },
        ...contextMessages,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();
    const tokens = Math.ceil(response.length / 4); // Approximate token count

    return { response, tokens };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return generateLocalResponse(message);
  }
}

/**
 * Local fallback response when Gemini is unavailable
 */
function generateLocalResponse(message: string): { response: string; tokens: number } {
  const lowerMessage = message.toLowerCase();

  let response = '';

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    response = "Hello! I'm your AI assistant for Royal Carriage. I can help you with content generation, data analysis, code writing, and more. How can I assist you today?";
  } else if (lowerMessage.includes('content') || lowerMessage.includes('seo') || lowerMessage.includes('page')) {
    response = `I can help you generate SEO-optimized content for Royal Carriage. Here's a sample:

**Luxury Airport Transportation in Chicago**

Experience the finest in luxury ground transportation with Royal Carriage Limousine. Our professional chauffeurs and immaculate fleet ensure you arrive at O'Hare or Midway in style and comfort.

**Why Choose Royal Carriage:**
- 24/7 availability
- Professional, licensed chauffeurs
- Real-time flight tracking
- Meet-and-greet service
- Premium vehicles

Would you like me to generate content for a specific service or location?`;
  } else if (lowerMessage.includes('analyze') || lowerMessage.includes('data') || lowerMessage.includes('metrics')) {
    response = `I can analyze your data. Please share the specific data or metrics you'd like me to look at, and I'll provide insights on:

- **Trends**: Identify patterns over time
- **Comparisons**: Compare different segments
- **Anomalies**: Spot unusual values
- **Recommendations**: Suggest improvements

What data would you like me to analyze?`;
  } else if (lowerMessage.includes('code') || lowerMessage.includes('function') || lowerMessage.includes('typescript')) {
    response = `I can help you write code. Here's an example TypeScript function:

\`\`\`typescript
async function fetchBookings(customerId: string) {
  const bookingsRef = collection(db, 'bookings');
  const q = query(
    bookingsRef,
    where('customerId', '==', customerId),
    orderBy('pickupDate', 'desc'),
    limit(10)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
\`\`\`

What specific code would you like me to write?`;
  } else if (lowerMessage.includes('translate')) {
    response = `I can translate text to multiple languages. Please provide:

1. The text you want translated
2. The target language

Example: "Translate 'Welcome to Royal Carriage Limousine' to Spanish"

I support: Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and more.`;
  } else if (lowerMessage.includes('summarize')) {
    response = `I can summarize content for you. Please share the text you'd like summarized, and I'll provide:

- **Key Points**: Main ideas extracted
- **Brief Summary**: 2-3 sentence overview
- **Action Items**: If applicable

Just paste the content you'd like me to summarize!`;
  } else {
    response = `I received your message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"

I'm your AI assistant for Royal Carriage. I can help with:
- **Content Generation**: SEO pages, blog posts, descriptions
- **Data Analysis**: Metrics, trends, insights
- **Code Writing**: TypeScript, React, Firebase
- **Translation**: Multiple languages
- **Summarization**: Condense long texts

What would you like help with?`;
  }

  return { response, tokens: Math.ceil(response.length / 4) };
}

/**
 * Get chat history for a user
 */
export const getChatHistory = functions.https.onCall(
  async (data: { limit?: number }, context): Promise<any[]> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const userId = context.auth.uid;
    const queryLimit = Math.min(data.limit || 20, 50);

    const conversationsSnap = await db
      .collection('chat_conversations')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(queryLimit)
      .get();

    return conversationsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
);

/**
 * Delete a conversation
 */
export const deleteChatConversation = functions.https.onCall(
  async (data: { conversationId: string }, context): Promise<{ success: boolean }> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { conversationId } = data;
    const userId = context.auth.uid;

    // Verify ownership
    const convDoc = await db.collection('chat_conversations').doc(conversationId).get();
    if (!convDoc.exists || convDoc.data()?.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Cannot delete this conversation');
    }

    // Delete messages subcollection
    const messagesSnap = await db
      .collection('chat_conversations')
      .doc(conversationId)
      .collection('messages')
      .get();

    const batch = db.batch();
    messagesSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.delete(db.collection('chat_conversations').doc(conversationId));

    await batch.commit();

    return { success: true };
  }
);

/**
 * Quick AI action - for one-off AI tasks without conversation
 */
export const quickAIAction = functions.https.onCall(
  async (
    data: { action: string; content: string; options?: Record<string, string> },
    context
  ): Promise<{ result: string; tokens: number }> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { action, content, options = {} } = data;

    let prompt = '';

    switch (action) {
      case 'summarize':
        prompt = `Summarize the following content concisely:\n\n${content}`;
        break;
      case 'translate':
        const targetLang = options.language || 'Spanish';
        prompt = `Translate the following text to ${targetLang}. Provide only the translation:\n\n${content}`;
        break;
      case 'analyze':
        prompt = `Analyze the following and provide key insights:\n\n${content}`;
        break;
      case 'generate':
        prompt = `Generate SEO-optimized content about: ${content}`;
        break;
      case 'code':
        prompt = `Write TypeScript code for: ${content}`;
        break;
      default:
        prompt = content;
    }

    const { response, tokens } = await generateAIResponse(prompt, [], 'gemini-pro');

    // Log activity
    await db.collection('activity_log').add({
      type: 'ai',
      message: `Quick AI: ${action} (${tokens} tokens)`,
      status: 'success',
      userId: context.auth.uid,
      timestamp: admin.firestore.Timestamp.now(),
    });

    return { result: response, tokens };
  }
);
