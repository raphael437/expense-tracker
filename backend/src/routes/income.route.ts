import { clerkMiddleware, getAuth } from '@clerk/express';
import { NextFunction, Request, Response, Router } from 'express';
import {
  addIncome,
  deleteIncome,
  getIncome,
  updateIncome,
} from '../controllers/income.controller';

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
router.route('/addincome').post(requireAuthMiddleware, addIncome);
router.route('/getincome').get(requireAuthMiddleware, getIncome);
router.route('/updateincome/:id').patch(requireAuthMiddleware, updateIncome);
router.route('/deleteincome/:id').delete(requireAuthMiddleware, deleteIncome);
export default router;
