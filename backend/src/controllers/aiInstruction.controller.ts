import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

<<<<<<< HEAD
export const getAIInstruction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    console.log('[AIInstruction-GET] userId:', userId);
    console.log('[AIInstruction-GET] headers:', req.headers.authorization?.substring(0, 30) + '...');

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
=======
export const getAIInstruction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
>>>>>>> 329a54a701cb1ee14f2fb55a558fc1385f4310c8

    const instruction = await prisma.aIInstruction.findUnique({
      where: { userId },
    });

<<<<<<< HEAD
    console.log('[AIInstruction-GET] found:', instruction?.content?.substring(0, 50) || 'none');

=======
>>>>>>> 329a54a701cb1ee14f2fb55a558fc1385f4310c8
    res.json({
      success: true,
      data: {
        content: instruction?.content || '',
<<<<<<< HEAD
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
=======
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
    const userId = req.userId!;
    const { content } = req.body;

    const instruction = await prisma.aIInstruction.upsert({
      where: { userId },
      update: {
        content,
      },
>>>>>>> 329a54a701cb1ee14f2fb55a558fc1385f4310c8
      create: {
        userId,
        content,
      },
    });

<<<<<<< HEAD
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
=======
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
>>>>>>> 329a54a701cb1ee14f2fb55a558fc1385f4310c8
