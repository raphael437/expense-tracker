/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { SquarePen, Trash2, TrendingUp } from 'lucide-react';
import IncomeModal from './TransctionModal';
import { ITransactionData, IChartSeriesPoint } from '@/utils/types';
import { useAuth } from '@clerk/nextjs';
import {
  addIncome,
  deleteIncome,
  fetchIncome,
  updateIncome,
} from '@/services/income.services';
import { toast } from 'sonner';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Spinner } from './ui/spinner';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { fetchTranctionList, getChartOptions } from '@/utils/helpers';
import TransactionModal from './TransctionModal';

export default function Income() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [incomeList, setIncomeList] = useState<ITransactionData[]>([]);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [isEditMode, setIsEditmode] = useState(false);
  const [incomeObj, setIncomeObj] = useState<ITransactionData | null>(null);
  const [seriesData, setSeriesData] = useState<IChartSeriesPoint[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const handleAddincome = async (incomeObj: ITransactionData) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('no token');
        return;
      }

      await addIncome(incomeObj, token);
      await hanbdleFetchUserIncome();
      toast.success('income added successfuly');
    } catch (error) {
      toast.error('error while addnig');
      console.error(error);
    }
  };
  const hanbdleFetchUserIncome = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        return console.error('there is no token');
      }
      const incomeList = await fetchIncome(token);
      setIncomeList(incomeList);
      const { newSeriesData = [], newCategories = [] } =
        fetchTranctionList(incomeList);
      setSeriesData(newSeriesData);
      setCategories(newCategories);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  console.log(incomeList);
  const handleUpdateIncome = async (income: ITransactionData) => {
    try {
      const token = await getToken();
      if (!token || !income._id) {
        return console.error('no toket || no income._id');
      }
      await updateIncome(income, income._id, token);
      await hanbdleFetchUserIncome();
      toast.success('income updated successfuly');
    } catch (error) {
      toast.error('error while updating the income');
      console.error(error);
    }
  };
  const handleDeltedIncome = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return console.error('there is no token');
      await deleteIncome(id, token);
      await hanbdleFetchUserIncome();
      toast.success('incoome deleted successfuly');
    } catch (error) {
      toast.error('error while deltening the income');
      console.log(error);
    }
  };
  useEffect(() => {
    hanbdleFetchUserIncome();
  }, []);
  const options: Highcharts.Options = useMemo(() => {
    return getChartOptions(categories, seriesData);
  }, [categories, seriesData]);
  return (
    <div className="w-[75%] ml-8 mt-6 mb-8">
      <div className="flex w-full justify-between">
        <h1 className="text-xl font-medium">Incomes</h1>
        <TransactionModal
          onAddTransction={handleAddincome}
          onUpdateTransction={handleUpdateIncome}
          showTransctionModal={showIncomeModal}
          setShowTransctionModal={setShowIncomeModal}
          transctionObj={incomeObj}
          isEditMode={isEditMode}
          setIsEditmode={setIsEditmode}
          type="income"
        />
      </div>
      {incomeList.length ? (
        <div>
          <div className="border border-gray-300 mt-4 py-3 px-6 rounded-3xl flex-1">
            <div className="font-medium tex-lg">Income overview</div>
            <div className="text-sm text-gray-500">
              Monitor your income over time and gain insights into your earnings
            </div>
            <div className="mt-8">
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>
        </div>
      ) : null}
      {incomeList?.length ? (
        <div className="border border-gray-300 mt-6 py-6 px-6 rounded-3xl h-[332px] overflow-y-scroll no-scrollbar">
          <div className="grid grid-cols-2 gap-10">
            {incomeList.map((income: ITransactionData, index: number) => {
              return (
                <div
                  key={index}
                  className="flex gap-2 justify-between items-center"
                >
                  <div className="flex gap-2">
                    <span className="bg-gray-100 shadow-2xl test-2xl w-12 h-12 rounded-full flex items-center justify-center">
                      {income.emoji}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{income.title}</span>
                      <span className="text-gray-500 text-sm">
                        {income.category}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {income.date
                          ? new Date(income.date).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center justify-center gap-2 h-fit bg-green-100 rounded-md px-4 py-1">
                      <span className="text-green-800 font-medium">
                        + {income.amount}$
                      </span>
                      <TrendingUp className="w-4 h-4 text-green-800 font-bold" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <SquarePen
                        className="w-5 h-5 text-gray-500 cursor-pointer"
                        onClick={() => {
                          setIsEditmode(true);
                          setShowIncomeModal(true);
                          setIncomeObj(income);
                        }}
                      />
                      <Trash2
                        className="text-red-500 w-5 h-5 cursor-pointer"
                        onClick={() => {
                          handleDeltedIncome(income._id || '');
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
          click the &quot;Add income &quot; button to add income
        </div>
      )}
    </div>
  );
}
