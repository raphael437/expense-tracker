import { getAuth } from '@clerk/express';
import { NextFunction, Request, Response, Router } from 'express';

import {
  addExpense,
  deleteExpense,
  getExpense,
  updateExpense,
} from '../controllers/expense.controller';

const router = Router();
export const requireAuthMiddleware = [
  (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    (req as any).userId = userId; // attach userId

    next();
  },
];
router.route('/addexpense').post(requireAuthMiddleware, addExpense);
router.route('/getexpense').get(requireAuthMiddleware, getExpense);
router.route('/updateexpense/:id').patch(requireAuthMiddleware, updateExpense);
router.route('/deleteexpense/:id').delete(requireAuthMiddleware, deleteExpense);
export default router;
