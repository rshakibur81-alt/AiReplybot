import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getBotSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let settings = await prisma.botSettings.findUnique({
      where: { userId },
    });

    // Auto-create defaults if none exist
    if (!settings) {
      settings = await prisma.botSettings.create({
        data: {
          userId,
          isActive: true,
          fallbackMessage: 'Thank you for your message! We\'ll get back to you shortly.',
          responseDelay: 'instant',
        },
      });
    }

    res.json({
      success: true,
      data: {
        isActive: settings.isActive,
        responseDelay: settings.responseDelay,
        fallbackMessage: settings.fallbackMessage,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error('[BotSettings-GET] error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bot settings' });
  }
};

export const updateBotSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { isActive, responseDelay, fallbackMessage } = req.body;

    // Validate responseDelay
    const validDelays = ['instant', 'short', 'medium'];
    if (responseDelay !== undefined && !validDelays.includes(responseDelay)) {
      res.status(400).json({
        success: false,
        message: 'responseDelay must be one of: instant, short, medium',
      });
      return;
    }

    // Build update payload (only include provided fields)
    const updateData: Record<string, any> = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (responseDelay !== undefined) updateData.responseDelay = responseDelay;
    if (fallbackMessage !== undefined) updateData.fallbackMessage = fallbackMessage;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: 'No fields to update' });
      return;
    }

    const settings = await prisma.botSettings.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        isActive: isActive ?? true,
        responseDelay: responseDelay ?? 'instant',
        fallbackMessage: fallbackMessage ?? 'Thank you for your message! We\'ll get back to you shortly.',
      },
    });

    res.json({
      success: true,
      message: 'Bot settings saved successfully',
      data: {
        isActive: settings.isActive,
        responseDelay: settings.responseDelay,
        fallbackMessage: settings.fallbackMessage,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error('[BotSettings-UPDATE] error:', error);
    res.status(500).json({ success: false, message: 'Failed to update bot settings' });
  }
};

export default {
  getBotSettings,
  updateBotSettings,
};