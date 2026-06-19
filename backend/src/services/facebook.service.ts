import axios from 'axios';
import config from '../config';
import prisma from '../config/database';
import { generateAIReply } from './gemini.service';

const GRAPH_API_BASE = `https://graph.facebook.com/${config.facebook.graphApiVersion}`;

// ============================================
// Type Definitions
// ============================================

interface FacebookMessage {
  mid: string;
  text?: string;
  attachments?: Array<{ type: string; payload: { url: string } }>;
}

interface FacebookSender {
  id: string;
  name?: string;
}

interface FacebookMessagingEntry {
  sender: FacebookSender;
  recipient: { id: string };
  timestamp: number;
  message?: FacebookMessage;
}

export interface FacebookWebhookEntry {
  id: string;     // Page ID
  time: number;
  messaging: FacebookMessagingEntry[];
}

// ============================================
// PART A: Facebook Webhook Verification
// ============================================

/**
 * GET /webhook — Facebook verification endpoint
 * Verifies hub.verify_token against env variable FACEBOOK_VERIFY_TOKEN
 * Returns hub.challenge on success
 */
export const verifyWebhook = (
  mode: string,
  token: string,
  challenge: string
): string | null => {
  if (mode === 'subscribe' && token === config.facebook.webhookVerifyToken) {
    return challenge;
  }
  return null;
};

// ============================================
// PART A: Process Incoming Messages (POST /webhook)
// ============================================

/**
 * POST /webhook — Receive incoming messages from Facebook
 * Parses messaging events, looks up page owner, triggers AI Reply Pipeline
 */
export const processIncomingMessage = async (entry: FacebookWebhookEntry): Promise<void> => {
  const pagePsid = entry.id; // Facebook's page-scoped ID

  for (const messaging of entry.messaging) {
    const senderPsid = messaging.sender.id;
    console.log('PSID:', senderPsid);
    const message = messaging.message;
    let customerName = messaging.sender.name || null;
    console.log('Sender Data:', messaging.sender);

    // Ignore messages from the page itself or empty messages
    if (!message || !message.text) continue;
    if (senderPsid === pagePsid) continue;

    console.log(`[Facebook Webhook] Message from ${customerName || senderPsid}: "${message.text}"`);

    try {
      // Step 1: Find the Facebook page in our database by page PSID
      const facebookPage = await prisma.facebookPage.findUnique({
        where: { pageId: pagePsid },
        include: {
          user: {
            include: {
              botSettings: true,
            },
          },
        },
      });

      if (!facebookPage) {
        console.warn(`[Facebook Webhook] No page found for ID: ${pagePsid}. Skipping.`);
        continue;
      }

      const { user: pageOwner } = facebookPage;

try {
  const userInfo = await axios.get(
    `https://graph.facebook.com/${senderPsid}`,
    {
      params: {
        fields: 'first_name,last_name',
        access_token: facebookPage.pageAccessToken,
      },
    }
  );

  customerName =
    `${userInfo.data.first_name || ''} ${userInfo.data.last_name || ''}`.trim();

} catch (error) {
  console.log('Could not fetch customer name');
}
      
   
      // Step 2: Check if bot is active for this page
      if (!facebookPage.isActive || !facebookPage.isConnected) {
        console.log(`[Facebook Webhook] Bot inactive for page ${facebookPage.pageName}. Skipping.`);
        continue;
      }

      // Step 3: Check bot settings
      const botSettings = pageOwner.botSettings;
      if (botSettings && !botSettings.isActive) {
        console.log(`[Facebook Webhook] Auto-reply disabled for user ${pageOwner.id}. Skipping.`);
        continue;
      }

      // Step 4: Get the response delay setting
      let delayMs = 0;
      if (botSettings) {
        switch (botSettings.responseDelay) {
          case 'short':
            delayMs = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
            break;
          case 'medium':
            delayMs = Math.floor(Math.random() * 2000) + 3000; // 3-5 seconds
            break;
          default:
            delayMs = 0; // instant
        }
      }

      // Step 5: Trigger the AI Reply Pipeline

      const orderInfo = extractOrderInfo(message.text);

if (orderInfo.isOrder) {
  ...
}
      
      const aiResult = await generateAIReply({
        message: message.text,
        pageId: facebookPage.id,
        userId: pageOwner.id,
      });

      const replyText = aiResult.reply;

      // Step 6: Apply response delay (simulate human timing)
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // Step 7: Send reply to Facebook
      await sendFacebookMessage(senderPsid, replyText, facebookPage.pageAccessToken);

      // Step 8: Log the conversation to database

    function extractOrderInfo(text: string) {
  const phoneMatch = text.match(/01[3-9]\d{8}/);

  const isOrder =
    phoneMatch &&
    (
      text.includes('ঠিকানা') ||
      text.toLowerCase().includes('address') ||
      text.length > 20
    );

  return {
    isOrder,
    phone: phoneMatch?.[0] || '',
  };
}
     const orderInfo = extractOrderInfo(message.text);

if (orderInfo.isOrder) {
  const nameMatch = message.text.match(/নাম[:：]?\s*(.+?)(?=ফোন|ঠিকানা|$)/);

const addressMatch = message.text.match(/ঠিকানা[:：]?\s*(.+)/);

const customerRealName =
  nameMatch?.[1]?.trim() || customerName || 'Unknown';

const customerAddress =
  addressMatch?.[1]?.trim() || 'No Address';
  
  await prisma.order.create({
  data: {
    userId: pageOwner.id,
    customerName: customerRealName,
    phone: orderInfo.phone,
    email: null,
    address: customerAddress,
    facebookPsid: senderPsid,
    productName: null,
    status: 'NEW',
  },
});

  await sendFacebookMessage(
  senderPsid,
  '✅ আপনার অর্ডার রিকোয়েস্ট গ্রহণ করা হয়েছে। আপনাকে শীঘ্রই কল করে জানানো হবে।',
  facebookPage.pageAccessToken
);

continue;
} 
      await prisma.messageLog.create({
        data: {
          pageId: facebookPage.id,
          userId: pageOwner.id,
          customerPsid: senderPsid,
          customerName: customerName || null,
          customerMessage: message.text,
          aiReply: replyText,
          status: 'success',
          tokensUsed: aiResult.tokensUsed,
          duration: aiResult.duration,
        },
      });

      console.log(`[Facebook Webhook] Reply sent to ${customerName || senderPsid}: "${replyText.substring(0, 60)}..."`);
    } catch (error) {
      console.error('[Facebook Webhook] Error processing message:', error);

      // Log the error
      try {
        const facebookPage = await prisma.facebookPage.findUnique({
          where: { pageId: pagePsid },
        });
        if (facebookPage) {
          // Try fallback message
          const fallbackMessage = 'Thank you for your message! Our team will review it and get back to you shortly.';
          try {
            await sendFacebookMessage(senderPsid, fallbackMessage, facebookPage.pageAccessToken);
          } catch {
            // Ignore send failure in error handler
          }

          await prisma.messageLog.create({
            data: {
              pageId: facebookPage.id,
              userId: facebookPage.userId,
              customerPsid: senderPsid,
              customerName: customerName || null,
              customerMessage: message.text || '',
              aiReply: fallbackMessage,
              status: 'error',
              tokensUsed: 0,
              duration: 0,
            },
          });
        }
      } catch {
        // Silently fail if we can't even log
      }
    }
  }
};

// ============================================
// PART C: Send Reply to Facebook
// ============================================

/**
 * Sends a message back to a Facebook Messenger user
 * POST to https://graph.facebook.com/v19.0/me/messages
 */
export const sendFacebookMessage = async (
  recipientPsid: string,
  messageText: string,
  pageAccessToken: string
): Promise<void> => {
  try {
    await axios.post(
      `${GRAPH_API_BASE}/me/messages`,
      {
        recipient: { id: recipientPsid },
        message: { text: messageText },
        messaging_type: 'RESPONSE',
      },
      {
        params: { access_token: pageAccessToken },
      }
    );
  } catch (error: any) {
    console.error(
      '[Facebook] Error sending message:',
      error.response?.data?.error?.message || error.message
    );
    throw new Error(
      `Failed to send Facebook message: ${error.response?.data?.error?.message || error.message}`
    );
  }
};

// ============================================
// Utility: Fetch page conversations from Graph API
// ============================================

export const getPageConversations = async (pageId: string, accessToken: string) => {
  try {
    const response = await axios.get(`${GRAPH_API_BASE}/${pageId}/conversations`, {
      params: {
        access_token: accessToken,
        fields: 'id,participants,messages.limit(1){message,from,created_time}',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      '[Facebook] Error fetching conversations:',
      error.response?.data?.error?.message || error.message
    );
    throw new Error('Failed to fetch conversations');
  }
};

export default {
  verifyWebhook,
  processIncomingMessage,
  sendFacebookMessage,
  getPageConversations,
};
