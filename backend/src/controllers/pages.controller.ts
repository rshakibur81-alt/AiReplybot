import { Response } from 'express';
import axios from 'axios';
import prisma from '../config/database';
import config from '../config';
import { AuthRequest } from '../middleware/auth';

export const connectFacebookPage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pageId, pageName, pageCategory, pageAccessToken, pageImageUrl } = req.body;

    if (!pageId || !pageName || !pageAccessToken) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    // Check if page already exists
    const existing = await prisma.facebookPage.findUnique({
      where: { pageId: pageId.toString() },
    });

    if (existing) {
      // Update existing page
      const updated = await prisma.facebookPage.update({
        where: { id: existing.id },
        data: {
          pageAccessToken,
          pageName,
          pageCategory,
          pageImageUrl,
          isConnected: true,
        },
      });
      res.json({ success: true, data: updated, message: 'Page reconnected successfully' });
      return;
    }

    // Subscribe to page webhooks
    await axios.post(
      `https://graph.facebook.com/${config.facebook.graphApiVersion}/${pageId}/subscribed_apps`,
      {
        access_token: pageAccessToken,
        subscribed_fields: ['messages', 'messaging_postbacks', 'message_deliveries'],
      }
    );

    // Create new page connection
    const page = await prisma.facebookPage.create({
      data: {
        userId: req.userId!,
        pageId: pageId.toString(),
        pageName,
        pageCategory: pageCategory || null,
        pageAccessToken,
        pageImageUrl: pageImageUrl || null,
        webhookToken: config.facebook.webhookVerifyToken,
      },
    });

    res.status(201).json({ success: true, data: page, message: 'Page connected successfully' });
  } catch (error: any) {
    console.error('[Pages] Connect error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to connect Facebook page' });
  }
};

export const getConnectedPages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pages = await prisma.facebookPage.findMany({
      where: { userId: req.userId, isConnected: true },
      include: {
        _count: {
          select: { autoReplies: true, messages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: pages });
  } catch (error) {
    console.error('[Pages] Get pages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pages' });
  }
};

export const removePage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pageId } = req.params;

    const page = await prisma.facebookPage.findFirst({
      where: { id: pageId, userId: req.userId },
    });

    if (!page) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }

    // Unsubscribe from webhooks
    try {
      await axios.delete(
        `https://graph.facebook.com/${config.facebook.graphApiVersion}/${page.pageId}/subscribed_apps`,
        {
          params: { access_token: page.pageAccessToken },
        }
      );
    } catch {
      // Ignore webhook unsubscribe errors
    }

    await prisma.facebookPage.update({
      where: { id: pageId },
      data: { isConnected: false },
    });

    res.json({ success: true, message: 'Page disconnected successfully' });
  } catch (error) {
    console.error('[Pages] Remove error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove page' });
  }
};

export default {
  connectFacebookPage,
  getConnectedPages,
  removePage,
};