import mongoose from 'mongoose';

const IncomeSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);
export const Income = mongoose.model('Income', IncomeSchema);
