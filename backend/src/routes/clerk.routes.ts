import express from 'express';

import { Router } from 'express';
import { verifyClerkWebhook } from '../middlewares/clerk.middleware';
import { clerkWebhook } from '../controllers/clerk.controller';

const router = Router();
router.route('/webhooks/register').post(verifyClerkWebhook, clerkWebhook);
export default router;
