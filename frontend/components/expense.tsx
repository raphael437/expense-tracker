/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { SquarePen, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { ITransactionData, IChartSeriesPoint } from '@/utils/types';
import { useAuth } from '@clerk/nextjs';
import {
  addExpense,
  deleteExpense,
  fetchExpense,
  updateExpense,
} from '@/services/expense.services';
import { toast } from 'sonner';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Spinner } from './ui/spinner';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { fetchTranctionList, getChartOptions } from '@/utils/helpers';
import TransactionModal from './TransctionModal';

export default function Expense() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expenseList, setExpenseList] = useState<ITransactionData[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [isEditMode, setIsEditmode] = useState(false);
  const [expenseObj, setExpenseObj] = useState<ITransactionData | null>(null);
  const [seriesData, setSeriesData] = useState<IChartSeriesPoint[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const handleAddexpense = async (expenseObj: ITransactionData) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('no token');
        return;
      }

      await addExpense(expenseObj, token);
      await hanbdleFetchUserExpense();
      toast.success('expense added successfuly');
    } catch (error) {
      toast.error('error while addnig');
      console.error(error);
    }
  };
  const hanbdleFetchUserExpense = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        return console.error('there is no token');
      }
      
      const expenseList = await fetchExpense(token);
      setExpenseList(expenseList);
      const { newSeriesData = [], newCategories = [] } =
        fetchTranctionList(expenseList);
      setSeriesData(newSeriesData);
      setCategories(newCategories);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  console.log(expenseList);
  const handleUpdateExpense = async (expense: ITransactionData) => {
    try {
      const token = await getToken();
      if (!token || !expense._id) {
        return console.error('no toket || no expense._id');
      }
      await updateExpense(expense, expense._id, token);
      await hanbdleFetchUserExpense();
      toast.success('expense updated successfuly');
    } catch (error) {
      toast.error('error while updating the expense');
      console.error(error);
    }
  };
  const handleDeltedExpense = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return console.error('there is no token');
      await deleteExpense(id, token);
      await hanbdleFetchUserExpense();
      toast.success('expense deleted successfuly');
    } catch (error) {
      toast.error('error while deltening the expense');
      console.log(error);
    }
  };
  useEffect(() => {
    hanbdleFetchUserExpense();
  }, []);
  const options: Highcharts.Options = useMemo(() => {
    return getChartOptions(categories, seriesData);
  }, [categories, seriesData]);
  return (
    <div className="w-[75%] ml-8 mt-6 mb-8">
      <div className="flex w-full justify-between">
        <h1 className="text-xl font-medium">Expense</h1>
        <TransactionModal
          onAddTransction={handleAddexpense}
          onUpdateTransction={handleUpdateExpense}
          showTransctionModal={showExpenseModal}
          setShowTransctionModal={setShowExpenseModal}
          transctionObj={expenseObj}
          isEditMode={isEditMode}
          setIsEditmode={setIsEditmode}
          type="expense"
        />
      </div>
      {expenseList?.length ? (
        <div>
          <div className="border border-gray-300 mt-4 py-3 px-6 rounded-3xl flex-1">
            <div className="font-medium tex-lg">expense overview</div>
            <div className="text-sm text-gray-500">
              Monitor your expense over time and gain insights into your
              earnings
            </div>
            <div className="mt-8">
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>
        </div>
      ) : null}
      {expenseList?.length ? (
        <div className="border border-gray-300 mt-6 py-6 px-6 rounded-3xl h-[332px] overflow-y-scroll no-scrollbar">
          <div className="grid grid-cols-2 gap-10">
            {expenseList.map((expense: ITransactionData, index: number) => {
              return (
                <div
                  key={index}
                  className="flex gap-2 justify-between items-center"
                >
                  <div className="flex gap-2">
                    <span className="bg-gray-100 shadow-2xl test-2xl w-12 h-12 rounded-full flex items-center justify-center">
                      {expense.emoji}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{expense.title}</span>
                      <span className="text-gray-500 text-sm">
                        {expense.category}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {expense.date
                          ? new Date(expense.date).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center justify-center gap-2 h-fit bg-red-100 rounded-md px-4 py-1">
                      <span className="text-red-800 font-medium">
                        + {expense.amount}$
                      </span>
                      <TrendingDown className="w-4 h-4 text-red-800 font-bold" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <SquarePen
                        className="w-5 h-5 text-gray-500 cursor-pointer"
                        onClick={() => {
                          setIsEditmode(true);
                          setShowExpenseModal(true);
                          setExpenseObj(expense);
                        }}
                      />
                      <Trash2
                        className="text-red-500 w-5 h-5 cursor-pointer"
                        onClick={() => {
                          handleDeltedExpense(expense._id || '');
                        }}
                      ></Trash2>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-full w-full">
          <Spinner className="w-10 h-10" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center font-medium">
          click the &quot;Add expense &quot; button to add expense
        </div>
      )}
    </div>
  );
}
