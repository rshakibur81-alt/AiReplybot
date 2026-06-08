import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createAutoReply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      pageId, name, triggerType, triggerValue,
      replyType, replyContent, aiPrompt,
      matchType, isActive, priority,
    } = req.body;

    if (!pageId || !name || !triggerValue || !replyContent) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    // Verify page belongs to user
    const page = await prisma.facebookPage.findFirst({
      where: { id: pageId, userId: req.userId },
    });

    if (!page) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }

    const autoReply = await prisma.autoReply.create({
      data: {
        userId: req.userId!,
        pageId,
        name,
        triggerType: triggerType || 'keyword',
        triggerValue,
        replyType: replyType || 'text',
        replyContent,
        aiPrompt: aiPrompt || null,
        matchType: matchType || 'exact',
        isActive: isActive !== undefined ? isActive : true,
        priority: priority || 0,
      },
    });

    res.status(201).json({ success: true, data: autoReply });
  } catch (error) {
    console.error('[AutoReply] Create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create auto-reply rule' });
  }
};

export const getAutoReplies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pageId } = req.query;

    const where: any = { userId: req.userId };
    if (pageId) where.pageId = pageId as string;

    const rules = await prisma.autoReply.findMany({
      where,
      include: {
        page: {
          select: { pageName: true, pageImageUrl: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: rules });
  } catch (error) {
    console.error('[AutoReply] Get rules error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch auto-reply rules' });
  }
};

export const updateAutoReply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify ownership
    const existing = await prisma.autoReply.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Auto-reply rule not found' });
      return;
    }

    const updated = await prisma.autoReply.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[AutoReply] Update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update auto-reply rule' });
  }
};

export const deleteAutoReply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.autoReply.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Auto-reply rule not found' });
      return;
    }

    await prisma.autoReply.delete({ where: { id } });

    res.json({ success: true, message: 'Auto-reply rule deleted successfully' });
  } catch (error) {
    console.error('[AutoReply] Delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete auto-reply rule' });
  }
};

export const toggleAutoReply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.autoReply.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Auto-reply rule not found' });
      return;
    }

    const updated = await prisma.autoReply.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    res.json({
      success: true,
      data: updated,
      message: `Auto-reply rule ${updated.isActive ? 'activated' : 'deactivated'}`,
    });
  } catch (error) {
    console.error('[AutoReply] Toggle error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle auto-reply rule' });
  }
};

export default {
  createAutoReply,
  getAutoReplies,
  updateAutoReply,
  deleteAutoReply,
  toggleAutoReply,
};