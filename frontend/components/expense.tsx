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

  const handleUpdateExpense = async (expense: ITransactionData) => {
    try {
      const token = await getToken();
      if (!token || !expense._id) {
        return console.error('no token || no expense._id');
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
      toast.error('error while deleting the expense');
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
    <div className="w-full px-4 sm:px-6 lg:ml-8 lg:mt-6 lg:mb-8 lg:w-[75%]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-3 sm:gap-0">
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

      {/* Chart Section */}
      {expenseList?.length ? (
        <div>
          <div className="border border-gray-300 mt-4 py-3 px-4 sm:px-6 rounded-3xl flex-1">
            <div className="font-medium text-lg">Expense overview</div>
            <div className="text-sm text-gray-500">
              Monitor your expense over time and gain insights into your earnings
            </div>
            <div className="mt-4 sm:mt-8">
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Expense List */}
      {expenseList?.length ? (
        <div className="border border-gray-300 mt-6 py-4 sm:py-6 px-3 sm:px-6 rounded-3xl h-auto max-h-[332px] overflow-y-scroll no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
            {expenseList.map((expense: ITransactionData, index: number) => {
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center border-b border-gray-100 pb-3 sm:pb-0 sm:border-0"
                >
                  <div className="flex gap-2 items-start sm:items-center">
                    <span className="bg-gray-100 shadow-2xl text-2xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                      {expense.emoji}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{expense.title}</span>
                      <span className="text-gray-500 text-sm">{expense.category}</span>
                      <span className="text-xs text-gray-400 font-medium">
                        {expense.date
                          ? new Date(expense.date).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                    <div className="flex items-center justify-center gap-2 h-fit bg-red-100 rounded-md px-3 py-1">
                      <span className="text-red-800 font-medium text-sm sm:text-base">
                        - {expense.amount}$
                      </span>
                      <TrendingDown className="w-4 h-4 text-red-800 font-bold" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <SquarePen
                        className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => {
                          setIsEditmode(true);
                          setShowExpenseModal(true);
                          setExpenseObj(expense);
                        }}
                      />
                      <Trash2
                        className="text-red-500 w-5 h-5 cursor-pointer hover:text-red-700 transition-colors"
                        onClick={() => {
                          handleDeltedExpense(expense._id || '');
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64 w-full">
          <Spinner className="w-10 h-10" />
        </div>
      ) : (
        <div className="w-full h-64 flex items-center justify-center font-medium text-gray-500">
          Click the &quot;Add expense&quot; button to add expense
        </div>
      )}
    </div>
  );
}
