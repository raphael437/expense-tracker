/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useMemo, useState } from 'react';
import TransactionModal from './TransctionModal';
import { ChartTypes, IChartSeriesPoint, ITransactionData } from '@/utils/types';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import {
  addIncome,
  deleteIncome,
  updateIncome,
} from '@/services/income.services';
import {
  addExpense,
  deleteExpense,
  updateExpense,
} from '@/services/expense.services';
import { fetchTransctions } from '@/services/transction.services';
import { fetchTranctionList, getChartOptions } from '@/utils/helpers';
import { Button } from './ui/button';
import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { SquarePen, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Spinner } from './ui/spinner';

export default function Transctions() {
  const { getToken } = useAuth();
  const [showTransctionModal, setShowTransctionModal] = useState(false);
  const [transctionObj, setTransctionObj] = useState<ITransactionData | null>(
    null,
  );
  const [isEditMode, setIsEditmode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [seriesData, setSeriesData] = useState<IChartSeriesPoint[]>([]);
  const [transctionList, setTransctionList] = useState<ITransactionData[]>([]);
  const [chartType, setChartType] = useState<ChartTypes>('column');

  const handleAddTransction = async (transctionObj: ITransactionData) => {
    try {
      const token = await getToken();
      if (!token) return toast.error('unverfied request');
      const { transactionType } = transctionObj;
      if (transactionType === 'income') {
        await addIncome(transctionObj, token);
      } else if (transactionType === 'expense') {
        await addExpense(transctionObj, token);
      }
      await handleFetchUserTransactions();
      toast.success('transction added successfully');
    } catch (error) {
      toast.error('Error while adding transctions');
    }
  };

  const handleUpdateTransction = async (transctionObj: ITransactionData) => {
    try {
      const token = await getToken();
      if (!token) return toast.error('unverfied request');
      const { transactionType } = transctionObj;
      if (transactionType === 'income') {
        await updateIncome(transctionObj, transctionObj._id || '', token);
      } else if (transactionType === 'expense') {
        await updateExpense(transctionObj, transctionObj._id || '', token);
      }
      await handleFetchUserTransactions();
      toast.success('transaction updated successfully');
    } catch (error) {
      toast.error('error while updating the transctions');
      console.log(error);
    }
  };

  const handleFetchUserTransactions = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return toast.error('unverfied request');
      const transctions = await fetchTransctions(token);
      setTransctionList(transctions);
      const { newSeriesData = [], newCategories = [] } =
        fetchTranctionList(transctions);
      setCategories(newCategories);
      setSeriesData(newSeriesData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleDeleteTransaction = async (transction: ITransactionData) => {
    try {
      const token = await getToken();
      if (!token) return toast.error('unverfied request');
      const { _id = '', transactionType } = transction;
      if (transactionType == 'income') {
        await deleteIncome(_id, token);
      } else {
        await deleteExpense(_id, token);
      }
      await handleFetchUserTransactions();
      toast.success('transction deleted successfully');
    } catch (error) {
      toast.error('Error while deleting the transction');
    }
  };

  const handleChartType = async () => {
    if (chartType === 'line') {
      setChartType('column');
    } else {
      setChartType('line');
    }
  };

  useEffect(() => {
    handleFetchUserTransactions();
  }, []);

  const options: Highcharts.Options = useMemo(() => {
    return getChartOptions(categories, seriesData, chartType);
  }, [categories, seriesData, chartType]);

  return (
    <div className="w-full px-4 sm:px-6 lg:ml-8 lg:mt-6 lg:mb-8 lg:w-[75%]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl font-medium">Transactions</h1>
        <TransactionModal
          onAddTransction={handleAddTransction}
          onUpdateTransction={handleUpdateTransction}
          showTransctionModal={showTransctionModal}
          setShowTransctionModal={setShowTransctionModal}
          transctionObj={transctionObj}
          isEditMode={isEditMode}
          setIsEditmode={setIsEditmode}
          type="transction"
          showTransctionType={true}
        />
      </div>

      {/* Chart Section */}
      {transctionList?.length ? (
        <div className="border border-gray-300 mt-4 py-3 px-4 sm:px-6 rounded-3xl flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="font-medium text-lg">Transaction Overview</div>
              <div className="text-sm text-gray-500">
                Monitor your transaction over time and gain insights into your
                income and expense.
              </div>
            </div>
            <Button className="cursor-pointer w-full sm:w-auto" onClick={handleChartType}>
              {chartType === 'line' ? 'Line' : 'Column'}
            </Button>
          </div>
          <div className="mt-4 sm:mt-8">
            <HighchartsReact options={options} highcharts={Highcharts} />
          </div>
        </div>
      ) : null}

      {/* Transactions Table */}
      {transctionList?.length ? (
        <div className="mt-4 border border-gray-300 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto no-scrollbar px-3 py-4 sm:px-6 sm:py-6">
            <Table className="min-w-[700px] md:min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Icon</TableHead>
                  <TableHead className="text-xs sm:text-sm">Title</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                  <TableHead className="text-xs sm:text-sm">Edit</TableHead>
                  <TableHead className="text-xs sm:text-sm">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transctionList.map(
                  (transaction: ITransactionData, index: number) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-xl sm:text-2xl">
                          {transaction.emoji}
                        </TableCell>
                        <TableCell className="font-medium text-sm sm:text-base">
                          {transaction.title}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              transaction.transactionType === 'income'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {transaction.transactionType}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {transaction.category}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {transaction.date
                            ? new Date(transaction.date).toLocaleDateString()
                            : ''}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {transaction.transactionType === 'income' ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span
                              className={`ml-1 text-sm sm:text-base ${
                                transaction.transactionType === 'income'
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {transaction.amount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <SquarePen
                            className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                            onClick={() => {
                              setIsEditmode(true);
                              setShowTransctionModal(true);
                              setTransctionObj(transaction);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Trash2
                            className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                            onClick={() => handleDeleteTransaction(transaction)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : loading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner className="w-10 h-10" />
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center w-full text-gray-500 font-medium">
          Click the &quot;Add Transaction&quot; button to add transactions
        </div>
      )}
    </div>
  );
}
