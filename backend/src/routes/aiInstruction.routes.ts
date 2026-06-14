import { Router } from 'express';
<<<<<<< HEAD
import { getAIInstruction, saveAIInstruction } from '../controllers/aiInstruction.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Both routes require authentication
router.get('/', authenticate as any, getAIInstruction as any);
router.post('/', authenticate as any, saveAIInstruction as any);

export default router;
=======
import { authenticate } from '../middleware/auth';

import {
  getAIInstruction,
  saveAIInstruction,
} from '../controllers/aiInstruction.controller';

const router = Router();

router.get('/', authenticate as any, getAIInstruction as any);
router.post('/', authenticate as any, saveAIInstruction as any);

export default router;
>>>>>>> 329a54a701cb1ee14f2fb55a558fc1385f4310c8
