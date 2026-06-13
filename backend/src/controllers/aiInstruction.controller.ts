import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAIInstruction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    const instruction = await prisma.aIInstruction.findUnique({
      where: { userId },
    });

    res.json({
      success: true,
      data: {
        content: instruction?.content || '',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructions',
    });
  }
};

export const saveAIInstruction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
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
      data: instruction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to save instructions',
    });
  }
};
