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
  };
  const handleOpenChange = () => {
    setShowTransctionModal(!showTransctionModal);
    if (!showTransctionModal) {
      handleResetForm();
    }
  };
  useEffect(() => {
    if (transctionObj) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <Button className=" cursor-pointer p-2">{modalTitle}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {modalTitle} to the list in just a few simple steps
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-start justify-center gap-4">
          <div className="relative">
            <span
              className="text-4xl border border-gray-300 rounded-md cursor-pointer py-1 px-2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {selectedEmoji}
            </span>
            {showEmojiPicker ? (
              <div className="absolute top-0 left-15">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            ) : null}
          </div>
          {showTransctionType ? (
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
          ) : (
            ''
          )}
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

          <div className="w-full">
            <span className="font-medium">Date</span>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild className="cursor-pointer">
                <Button variant="outline" className="flex justify-between">
                  {date ? new Date(date).toLocaleDateString() : 'Select Date'}{' '}
                  <ChevronDownIcon />
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">close</Button>
          </DialogClose>
          <Button className="cursor-pointer" onClick={handleAddTransction}>
            {isEditMode ? `Update ${footerBtnTitle}` : `Add ${footerBtnTitle}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
