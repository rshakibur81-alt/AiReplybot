import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAIInstruction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    console.log('[AIInstruction-GET] userId:', userId);
    console.log('[AIInstruction-GET] headers:', req.headers.authorization?.substring(0, 30) + '...');

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const instruction = await prisma.aIInstruction.findUnique({
      where: { userId },
    });

    console.log('[AIInstruction-GET] found:', instruction?.content?.substring(0, 50) || 'none');

    res.json({
      success: true,
      data: {
        content: instruction?.content || '',
        updatedAt: instruction?.updatedAt || null,
      },
    });
  } catch (error) {
    console.error('[AIInstruction-GET] error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch AI instructions' });
  }
};

export const saveAIInstruction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    console.log('[AIInstruction-SAVE] userId:', userId);
    console.log('[AIInstruction-SAVE] headers:', req.headers.authorization?.substring(0, 30) + '...');
    console.log('[AIInstruction-SAVE] body:', JSON.stringify(req.body));

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { content } = req.body;

    if (typeof content !== 'string') {
      console.log('[AIInstruction-SAVE] invalid content type:', typeof content);
      res.status(400).json({ success: false, message: 'Content must be a string' });
      return;
    }

    console.log('[AIInstruction-SAVE] content to save:', content.substring(0, 80) + '...');

    const instruction = await prisma.aIInstruction.upsert({
      where: { userId },
      update: { content },
      create: {
        userId,
        content,
      },
    });

    console.log('[AIInstruction-SAVE] upsert success:', instruction.content.substring(0, 50) + '...');

    res.json({
      success: true,
      message: 'AI instructions saved successfully',
      data: {
        content: instruction.content,
        updatedAt: instruction.updatedAt,
      },
    });
  } catch (error) {
    console.error('[AIInstruction-SAVE] error:', error);
    res.status(500).json({ success: false, message: 'Failed to save AI instructions' });
  }
};

export default {
  getAIInstruction,
  saveAIInstruction,
};