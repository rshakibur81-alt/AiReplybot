import { Request, Response } from 'express';
import prisma from '../config/database';

export const getLogs = async (req: Request, res: Response) => {
  try {
   const logs = await prisma.messageLog.findMany({
  where: {
    userId: (req as any).userId,
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 100,
});

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Get Logs Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
    });
  }
};
