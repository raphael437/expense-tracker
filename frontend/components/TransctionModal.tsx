'use client';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/Modal';
import EmojiPicker from 'emoji-picker-react';
import { IEmojiObject, ITransactionData } from '@/utils/types';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  EXPENSE_CATEGORY_CONSTANTS,
  INCOME_CATEGORY_CONSTANTS,
  TRANSACTION_CATEGORY_CONSTANTS,
} from '@/utils/constants';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { toast } from 'sonner';

export default function TransactionModal({
  onAddTransction,
  onUpdateTransction,
  showTransctionModal,
  setShowTransctionModal,
  transctionObj,
  isEditMode,
  setIsEditmode,
  type,
  showTransctionType = false,
}: {
  onAddTransction: (transctionData: ITransactionData) => void;
  onUpdateTransction: (transctionData: ITransactionData) => void;
  showTransctionModal: boolean;
  setShowTransctionModal: (value: boolean) => void;
  transctionObj: ITransactionData | null;
  isEditMode: boolean;
  setIsEditmode: (value: boolean) => void;
  type: string;
  showTransctionType?: boolean;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(
    transctionObj?.emoji || '🚀',
  );
  const [title, setTitle] = useState(transctionObj?.title || '');
  const [category, setCategory] = useState(transctionObj?.category || '');
  const [amount, setAmount] = useState(transctionObj?.amount || '');
  const [date, setDate] = useState<Date | null>(transctionObj?.date || null);
  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(
    transctionObj?.transactionType || '',
  );

  const handleEmojiSelect = (emojiObj: IEmojiObject) => {
    setSelectedEmoji(emojiObj.emoji);
    setShowEmojiPicker(false);
  };

  const handleAddTransction = () => {
    const transctionData: ITransactionData = {
      emoji: selectedEmoji,
      title,
      category,
      amount,
      date,
      _id: transctionObj?._id,
      transactionType,
    };
    if (!selectedEmoji || !title || !category || !amount || !date) {
      toast.error('all fields are required');
      return;
    }
    if (isEditMode) {
      onUpdateTransction(transctionData);
    } else {
      onAddTransction(transctionData);
    }
    setShowTransctionModal(false);
    console.log('income');
  };

  const handleResetForm = () => {
    setSelectedEmoji('🚀');
    setTitle('');
    setCategory('');
    setAmount('');
    setDate(null);
    setTransactionType('');
  };

  const handleOpenChange = () => {
    setShowTransctionModal(!showTransctionModal);
    if (!showTransctionModal) {
      handleResetForm();
    }
  };

  useEffect(() => {
    if (transctionObj) {
      setSelectedEmoji(transctionObj.emoji);
      setTitle(transctionObj.title);
      setCategory(transctionObj.category);
      setAmount(transctionObj.amount);
      setDate(transctionObj.date);
      setTransactionType(transctionObj.transactionType || '');
    }
  }, [transctionObj]);

  const modalTitle =
    type === 'income'
      ? 'Add income'
      : type === 'transction'
        ? 'Add transction'
        : 'Add expense';

  const TRANSACTIONS_CATEGORY =
    type === 'income' || transactionType === 'income'
      ? INCOME_CATEGORY_CONSTANTS
      : EXPENSE_CATEGORY_CONSTANTS;

  const footerBtnTitle =
    type === 'income'
      ? 'Income'
      : type === 'transction'
        ? 'transction'
        : 'Expense';

  return (
    <Dialog open={showTransctionModal} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer p-2 w-full sm:w-auto">
          {modalTitle}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{modalTitle}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {modalTitle} to the list in just a few simple steps
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-start justify-center gap-4 mt-2">
          {/* Emoji Picker */}
          <div className="relative w-full">
            <span
              className="text-4xl border border-gray-300 rounded-md cursor-pointer py-1 px-2 inline-block"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {selectedEmoji}
            </span>
            {showEmojiPicker && (
              <div className="absolute z-50 mt-2 left-0 sm:left-auto sm:right-0 md:left-0">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}
          </div>

          {/* Transaction Type (optional) */}
          {showTransctionType && (
            <div className="w-full">
              <span className="font-medium">Transactions</span>
              <Select
                onValueChange={value => setTransactionType(value)}
                value={transactionType}
                disabled={isEditMode}
              >
                <SelectTrigger className="mt-2 w-full cursor-pointer">
                  <SelectValue placeholder="Select Transctions Type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    {TRANSACTION_CATEGORY_CONSTANTS.map(item => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="cursor-pointer"
                      >
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="w-full">
            <span className="font-medium">Title</span>
            <Input
              className="mt-2"
              placeholder={
                type === 'income'
                  ? 'Enter income title'
                  : type === 'transction'
                    ? 'Enter transction title'
                    : 'Enter Expense title'
              }
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="w-full">
            <span className="font-medium">Category</span>
            <Select
              value={category}
              onValueChange={value => setCategory(value)}
            >
              <SelectTrigger className="mt-2 w-full cursor-pointer">
                <SelectValue placeholder="select a category" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  {TRANSACTIONS_CATEGORY.map(item => (
                    <SelectItem
                      key={item.title}
                      value={item.title}
                      className="cursor-pointer"
                    >
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="w-full">
            <span className="font-medium">Amount</span>
            <Input
              className="mt-2"
              placeholder="0.00"
              value={amount}
              type="number"
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="w-full">
            <span className="font-medium">Date</span>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild className="cursor-pointer">
                <Button variant="outline" className="flex justify-between w-full">
                  {date ? new Date(date).toLocaleDateString() : 'Select Date'}{' '}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 overflow-hidden">
                <Calendar
                  mode="single"
                  selected={date ?? undefined}
                  captionLayout="dropdown"
                  onSelect={date => {
                    setDate(date ?? null);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </DialogClose>
          <Button className="cursor-pointer w-full sm:w-auto" onClick={handleAddTransction}>
            {isEditMode ? `Update ${footerBtnTitle}` : `Add ${footerBtnTitle}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
