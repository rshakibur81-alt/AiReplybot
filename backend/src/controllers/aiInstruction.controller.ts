import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAIInstruction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const instruction = await prisma.aIInstruction.findUnique({
      where: { userId },
    });

    res.json({
      success: true,
      data: {
        content: instruction?.content || '',
        updatedAt: instruction?.updatedAt || null,
      },
    });
  } catch (error) {
    console.error('[AIInstruction-GET] error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI instructions',
    });
  }
};

export const saveAIInstruction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { content } = req.body;

    const instruction = await prisma.aIInstruction.upsert({
      where: { userId },
      update: {
        content,
      },
      create: {
        userId,
        content,
      },
    });

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

    res.status(500).json({
      success: false,
      message: 'Failed to save AI instructions',
    });
  }
};

export default {
  getAIInstruction,
  saveAIInstruction,
};
