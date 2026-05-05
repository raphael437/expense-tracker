import { clerkClient, getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Income } from '../models/income.model';
import { Expense } from '../models/expense.model';

const getAlltransctions = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const clerkUser = await clerkClient.users.getUser(userId || '');
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'user not found' });
    }
    const allIncomes = await Income.find({
      _id: { $in: user?.incomes },
    }).sort({ createdAt: -1 });
    const allExpenses = await Expense.find({
      _id: { $in: user?.expenses },
    }).sort({ createdAt: -1 });
    const allTransactions = [...allIncomes, ...allExpenses]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .reverse();
    res.status(200).json({
      transctions: allTransactions,
      message: 'All user transctions fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};
export { getAlltransctions };
