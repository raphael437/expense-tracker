import { NextFunction, Request, Response } from 'express';
import { Webhook } from 'svix';

const verifyClerkWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const webhook_secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhook_secret) {
    return res
      .status(500)
      .json({ message: 'please provide webhook secret in env' });
  }
  const svix_id = (req.headers['svix-id'] || '').toString();
  const svix_timestamp = (req.headers['svix-timestamp'] || '').toString();
  const svix_signature = (req.headers['svix-signature'] || '').toString();
  if (!svix_id || !svix_signature || !svix_timestamp) {
    return res
      .status(400)
      .json({ message: 'Error occuring - no svix headers' });
  }
  const headers = {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  };
  const payload = req.body;
  const wh = new Webhook(webhook_secret);
  console.log(payload);
  console.log(headers);
  console.log('IS BUFFER:', Buffer.isBuffer(req.body));
  console.log('RAW BODY:', req.body);
  try {
    await wh.verify(payload, headers);
    req.body = JSON.parse(payload.toString('utf8'));

    next();
  } catch (error) {
    console.log(payload);
    console.log(headers);
    return res.status(400).json({ message: 'invalid signature' });
  }
};
export { verifyClerkWebhook };
