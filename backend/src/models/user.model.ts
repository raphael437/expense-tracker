import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    expenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
      },
    ],
    incomes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Income',
      },
    ],
  },
  { timestamps: true },
);
export const User = mongoose.model('User', userSchema);
