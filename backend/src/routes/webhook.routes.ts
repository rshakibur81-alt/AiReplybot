import { Router, Request, Response } from 'express';
import { verifyWebhook, processIncomingMessage } from '../services/facebook.service';

const router = Router();

// Facebook Webhook verification (GET)
router.get('/facebook', (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const result = verifyWebhook(mode, token, challenge);

  if (result) {
    res.status(200).send(result);
  } else {
    res.status(403).send('Verification failed');
  }
});

// Facebook Webhook events (POST)
router.post('/facebook', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry) {
        await processIncomingMessage(entry);
      }
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.status(404).send('Not a page webhook');
    }
  } catch (error) {
    console.error('[Webhook] Processing error:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;