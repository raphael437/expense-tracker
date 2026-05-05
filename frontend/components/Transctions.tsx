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
    <div className="ml-8 mr-8 mt-6 w-[75%]">
      <div className="w-full flex justify-between">
        <h1 className="text-xl font-medium">Transactions</h1>;
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
      {transctionList?.length ? (
        <div className="border border-gray-300 mt-4 py-3 px-6 rounded-3xl flex-1">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-lg">Transaction Overview</div>
              <div>
                Monitor your transaction over time and gain insights into your
                income and expense.
              </div>
            </div>
            <Button className="cursor-pointer" onClick={handleChartType}>
              {chartType === 'line' ? 'Line' : 'Column'}
            </Button>
          </div>
          <div className="mt-8">
            <HighchartsReact options={options} highcharts={Highcharts} />
          </div>
        </div>
      ) : null}
      {transctionList?.length ? (
        <div className="mt-4 px-3 x-6 border-gray-300 rounded-3xl h-[332px] overflow-y-scroll no-scrollbar">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transctionList.map(
                (transaction: ITransactionData, index: number) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-2xl">
                        {transaction.emoji}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.title}
                      </TableCell>
                      <TableCell>{transaction.transactionType}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        {transaction.date
                          ? new Date(transaction?.date).toLocaleDateString()
                          : ''}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {transaction.transactionType === 'income' ? (
                            <TrendingUp className="w-4 h-4 text-green-500 font-bold" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 font-bold" />
                          )}
                          <span
                            className={`ml-2 ${transaction.transactionType === 'income' ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {transaction.amount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SquarePen
                          className="w-5 h-5 text-gray-500 cursor-pointer"
                          onClick={() => {
                            setIsEditmode(true);
                            setShowTransctionModal(true);
                            setTransctionObj(transaction);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Trash2
                          className="w-5 h-5 text-red-500 cursor-pointer"
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
      ) : loading ? (
        <div className='h-full flex items-center justify-center'>
          <Spinner className='w-10 h-10 '/>
        </div>
      ) : (
        <div className='flex items-center justify-center w-full h-full text-gray-500 font-medium'>click the &quot;Add Transction&quot; buttun to add transctions</div>
      )}
    </div>
  );
}
