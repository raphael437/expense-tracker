import { clerkClient, getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Income } from '../models/income.model';

const addIncome = async (req: Request, res: Response) => {
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
    const isIncomeDataEmpty = [title, emoji, category, amount, date].some(
      field => !field || field.toString().trim() === '',
    );
    if (isIncomeDataEmpty) {
      return res
        .status(400)
        .json({ message: 'all income fields are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }
    const income = await Income.create({
      transactionType: 'income',
      title,
      emoji,
      category,
      amount,
      date,
      userId: user._id,
    });
    if (!income) {
      return res.status(500).json({ message: 'failed to add income' });
    }
    console.log(income);
    user.incomes.push(income._id);
    await user.save();
    return res.status(200).json({ message: 'income added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'internal server issue' });
    console.log(error);
  }
};
const getIncome = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const user = await User.findOne({ email })
      .lean()
      .populate({ path: 'incomes', select: '-__v -userId' });
    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }
    const userIncome = user.incomes;
    return res.status(200).json({
      incomes: userIncome,
      message: 'successfuly fetched the user incomes',
    });
  } catch (error) {
    res.status(500).json({ message: 'internal server issue' });
  }
};
const updateIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, emoji, category, amount, date } = req.body;
    const isIncomeDataEmpty = [title, emoji, category, amount, date].some(
      field => !field || field.toString().trim() === '',
    );
    if (isIncomeDataEmpty) {
      return res
        .status(400)
        .json({ message: 'all income fields are required' });
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
    const updatedIncome = await Income.findOneAndUpdate(
      {
        _id: id,
        userId: user._id,
      },
      {
        $set: { title, emoji, category, amount, date },
      },
    );
    if (!updatedIncome) {
      return res.status(400).json({ message: 'income not found' });
    }
    return res.status(200).json({ message: 'income updated successfuly' });
  } catch (error) {
    res.status(500).json({ message: 'internal server issue' });
  }
};
const deleteIncome = async (req: Request, res: Response) => {
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
    const deletedIncome = await Income.findOneAndDelete({
      _id: id,
      userId: user._id,
    });
    if (!deletedIncome) {
      return res.status(400).json({ message: 'income not found' });
    }
    await User.updateOne({ _id: user._id }, { $pull: { incomes: id } });
    return res.status(200).json({ message: 'income deleted successfuly' });
  } catch (error) {
    res.status(500).json({ message: 'internal server issue' });
  }
};
export { addIncome, getIncome, updateIncome, deleteIncome };
