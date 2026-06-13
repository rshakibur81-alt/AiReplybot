import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getLogs = async (
req: AuthRequest,
res: Response
): Promise<void> => {
try {
const userId = req.userId;

```
const logs = await prisma.messageLog.findMany({
  where: { userId },
  orderBy: {
    createdAt: 'desc',
  },
  take: 100,
});

res.json({
  success: true,
  data: logs,
});
```

} catch (error) {
console.error(error);

```
res.status(500).json({
  success: false,
  message: 'Failed to load logs',
});
```

}
};
