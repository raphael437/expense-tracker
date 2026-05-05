import { getAuth } from '@clerk/express';
import { NextFunction, Request, Response, Router } from 'express';
import { getAlltransctions } from '../controllers/transction.controller';
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
const router = Router();
router.route('/getalltrasctions').get(requireAuthMiddleware, getAlltransctions);
export default router;
