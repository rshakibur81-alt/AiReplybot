import { Router } from 'express';

import { getAIInstruction, saveAIInstruction } from '../controllers/aiInstruction.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Both routes require authentication
router.get('/', authenticate as any, getAIInstruction as any);
router.post('/', authenticate as any, saveAIInstruction as any);

export default router;

import { authenticate } from '../middleware/auth';

import {
  getAIInstruction,
  saveAIInstruction,
} from '../controllers/aiInstruction.controller';

const router = Router();

router.get('/', authenticate as any, getAIInstruction as any);
router.post('/', authenticate as any, saveAIInstruction as any);

export default router;

