import { clerkClient, getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Expense } from '../models/expense.model';

const addExpense = async (req: Request, res: Response) => {
  try {
    const { title, emoji, category, amount, date } = req.body;
    console.log(req.body);
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const parsedAmount = Number(amount);

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const isExpenseDataEmpty = [title, emoji, category, amount, date].some(
      field => !field || field.toString().trim() === '',
    );
    if (isExpenseDataEmpty) {
      return res
        .status(400)
        .json({ message: 'all exoense fields are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }
    const expense = await Expense.create({
      transactionType: 'expense',
      title,
      emoji,
      category,
      amount,
      date,
      userId: user._id,
    });
    if (!expense) {
      return res.status(500).json({ message: 'failed to add expense' });
    }
    console.log(expense);
    user.expenses.push(expense._id);
    await user.save();
    return res.status(200).json({ message: 'expense added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'internal server issue' });
    console.log(error);
  }
};
const getExpense = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const user = await User.findOne({ email })
      .lean()
      .populate({ path: 'expenses', select: '-__v -userId' });
    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }
    const userExpenses = user.expenses;
    return res.status(200).json({
      expenses: userExpenses,
      message: 'successfuly fetched the user expenses',
    });
  } catch (error) {
    res.status(500).json({ message: 'internal server issue' });
  }
};
const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, emoji, category, amount, date } = req.body;
    const isExpenseDataEmpty = [title, emoji, category, amount, date].some(
      field => !field || field.toString().trim() === '',
    );
    if (isExpenseDataEmpty) {
      return res
        .status(400)
        .json({ message: 'all expense fields are required' });
    }
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }
    const updatedExpense = await Expense.findOneAndUpdate(
      {
        _id: id,
        userId: user._id,
      },
      {
        $set: { title, emoji, category, amount, date },
      },
    );
    if (!updatedExpense) {
      return res.status(400).json({ message: 'expense not found' });
    }
    return res.status(200).json({ message: 'expense updated successfuly' });
  } catch (error) {
    res.status(500).json({ message: 'internal server issue' });
  }
};
const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }
    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      userId: user._id,
    });
    if (!deletedExpense) {
      return res.status(400).json({ message: 'expense not found' });
    }
    await User.updateOne({ _id: user._id }, { $pull: { expenses: id } });
    return res.status(200).json({ message: 'expense deleted successfuly' });
  } catch (error) {
    res.status(500).json({ message: 'internal server issue' });
  }
};
export { addExpense, getExpense, updateExpense, deleteExpense };
