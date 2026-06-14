import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

let apiInstance: AxiosInstance | null = null;

export const getApiClient = (): AxiosInstance => {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add auth token
    apiInstance.interceptors.request.use(
      async (config: any) => {
        const session = await getSession();
        if (session?.user && (session.user as any).accessToken) {
          config.headers.Authorization = `Bearer ${(session.user as any).accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login on unauthorized
          if (typeof window !== 'undefined' && 
         !window.location.pathname.startsWith('/admin') &&
!window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  return apiInstance;
};

// API helper methods
export const api = {
  // Auth
  register: (data: { email: string; password: string; name: string }) =>
    getApiClient().post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    getApiClient().post('/auth/login', data),
  getProfile: () => getApiClient().get('/auth/profile'),
  updateProfile: (data: { name?: string; image?: string }) =>
    getApiClient().put('/auth/profile', data),

  // Facebook Pages
  getPages: () => getApiClient().get('/pages'),
  connectPage: (data: {
    pageId: string;
    pageName: string;
    pageCategory?: string;
    pageAccessToken: string;
    pageImageUrl?: string;
  }) => getApiClient().post('/pages/connect', data),
  removePage: (pageId: string) => getApiClient().delete(`/pages/${pageId}`),

  // Auto Replies
  getAutoReplies: (pageId?: string) =>
    getApiClient().get('/auto-replies', { params: { pageId } }),
  createAutoReply: (data: any) => getApiClient().post('/auto-replies', data),
  updateAutoReply: (id: string, data: any) => getApiClient().put(`/auto-replies/${id}`, data),
  deleteAutoReply: (id: string) => getApiClient().delete(`/auto-replies/${id}`),
  toggleAutoReply: (id: string) => getApiClient().patch(`/auto-replies/${id}/toggle`),

  // Billing
  createCheckoutSession: (data: { planId: string; successUrl: string; cancelUrl: string }) =>
    getApiClient().post('/billing/create-checkout-session', data),
  getSubscription: () => getApiClient().get('/billing/subscription'),
  cancelSubscription: () => getApiClient().post('/billing/cancel'),

  // Payment Methods
  getPaymentMethods: () => getApiClient().get('/payment/methods'),
  getActivePaymentMethods: () => getApiClient().get('/payment/methods/active'),
  savePaymentMethod: (data: any) => getApiClient().post('/payment/methods', data),
  deletePaymentMethod: (id: string) => getApiClient().delete(`/payment/methods/${id}`),

  // AI Instructions
  getAIInstruction: () => getApiClient().get('/ai-instructions'),
  saveAIInstruction: (data: { content: string }) => getApiClient().post('/ai-instructions', data),

  // Bot Settings
  getBotSettings: () => getApiClient().get('/bot-settings'),
  updateBotSettings: (data: { isActive?: boolean; responseDelay?: string; fallbackMessage?: string }) =>
    getApiClient().put('/bot-settings', data),

  // Manual Payments
  submitManualPayment: (data: { planId: string; amount: number; method: string; transactionId: string; screenshot?: string }) =>
    getApiClient().post('/payment/manual', data),
  getUserPayments: () => getApiClient().get('/payment/manual'),
  getAllManualPayments: () => getApiClient().get('/payment/manual/all'),
  reviewManualPayment: (id: string, data: { status: string; adminNote?: string }) =>
    getApiClient().patch(`/payment/manual/${id}`, data),
};

export default api;
