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
export const getPerformance = async (req: Request, res: Response) => {
  try {
    const total = await prisma.messageLog.count({
      where: {
        userId: (req as any).userId,
      },
    });

    const success = await prisma.messageLog.count({
      where: {
        userId: (req as any).userId,
        status: 'success',
      },
    });

    const failed = await prisma.messageLog.count({
      where: {
        userId: (req as any).userId,
        status: 'error',
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        success,
        failed,
        successRate:
          total > 0
            ? ((success / total) * 100).toFixed(1)
            : 0,
      },
    });
  } catch (error) {
    console.error('Performance Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch performance',
    });
  }
};
