export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  subscriptionExpiry?: string | null;
  emailVerified?: boolean;
  createdAt: string;
  subscription?: Subscription;
  _count?: {
    facebookPages: number;
    autoReplies: number;
    conversations: number;
  };
}

export interface FacebookPage {
  id: string;
  userId: string;
  pageId: string;
  pageName: string;
  pageCategory?: string | null;
  pageAccessToken: string;
  pageImageUrl?: string | null;
  isConnected: boolean;
  webhookToken?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    autoReplies: number;
    messages: number;
  };
}

export interface AutoReply {
  id: string;
  userId: string;
  pageId: string;
  name: string;
  triggerType: 'keyword' | 'regex' | 'ai_auto' | 'greeting' | 'farewell';
  triggerValue: string;
  replyType: 'text' | 'ai_generated' | 'image' | 'template';
  replyContent: string;
  aiPrompt?: string | null;
  aiModel?: string | null;
  isActive: boolean;
  matchType: 'exact' | 'partial' | 'regex';
  priority: number;
  createdAt: string;
  updatedAt: string;
  page?: {
    pageName: string;
    pageImageUrl?: string | null;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  pageId?: string | null;
  senderId: string;
  senderName?: string | null;
  senderAvatar?: string | null;
  lastMessage?: string | null;
  isArchived: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  userId: string;
  conversationId: string;
  pageId?: string | null;
  senderType: 'user' | 'page' | 'visitor';
  content: string;
  isAutoReply: boolean;
  autoReplyId?: string | null;
  metadata?: any;
  sentAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  planType: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  messagesUsed: number;
  messagesLimit: number;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: 'USER' | 'ADMIN';
      plan: 'FREE' | 'PRO' | 'PREMIUM';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN';
    plan: 'FREE' | 'PRO' | 'PREMIUM';
  }
}