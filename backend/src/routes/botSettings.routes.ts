import { Router } from 'express';
import { getBotSettings, updateBotSettings } from '../controllers/botSettings.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/v1/bot-settings — Fetch current user's bot settings
router.get('/', authenticate as any, getBotSettings as any);

// PUT /api/v1/bot-settings — Update bot settings
router.put('/', authenticate as any, updateBotSettings as any);

export default router;