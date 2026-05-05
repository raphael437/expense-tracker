import express from 'express';
import { configDotenv } from 'dotenv';
configDotenv({ path: './.env' });
import cors from 'cors';
import clerkRouter from './routes/clerk.routes';
import incomeRouter from './routes/income.route';
import { clerkMiddleware } from '@clerk/express';
import { verifyClerkWebhook } from './middlewares/clerk.middleware';
import { clerkWebhook } from './controllers/clerk.controller';
import expenseRouter from './routes/expense.route';
import transctionsRouter from './routes/transction.route';
const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.post(
  '/api/clerk/webhooks/register',
  express.raw({ type: 'application/json' }),
  verifyClerkWebhook,
  clerkWebhook,
);

app.use(express.json());

app.use(
  clerkMiddleware({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  }),
);
console.log(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  process.env.CLERK_SECRET_KEY,
);
//app.use(express.json());
app.use('/api/clerk', clerkRouter);
app.use('/api', incomeRouter);
app.use('/api', expenseRouter);
app.use('/api', transctionsRouter);
export default app;
