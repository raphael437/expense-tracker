'use client';
import {
  EXPENSE_IMAGE,
  INCOME_IMAGE,
  TOTAL_BALANCE_IMAGE,
  TOTAL_TRANSACTION_IMAGE,
  USER_IMAGE,
} from '@/utils/constants';
import { useAuth, useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import Card from './Card';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  getCategoryWiseValue,
  getDahsboardValues,
  getMoneyFlowOptions,
  getMonthlyIncomeExpense,
  getPieChartOptions,
} from '@/utils/helpers';
import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts';
import { fetchIncome } from '@/services/income.services';
import { fetchExpense } from '@/services/expense.services';
import { IPieData, ITransactionData } from '@/utils/types';
import { fetchTransctions } from '@/services/transction.services';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import Progress from './Progress';

export default function Dashboard() {
  const { user } = useClerk();
  const { getToken } = useAuth();
  const router = useRouter();
  const [dashboardValues, setDashboardValues] = useState({
    totalBalance: 0,
    incomeValue: 0,
    expenseValue: 0,
    totalTransaction: 0,
  });
  const [incomeSeries, setIncomeSeries] = useState<number[]>([]);
  const [expenseSeries, setExpenseSeries] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorySeries, setCategorySeries] = useState<IPieData[]>([]);
  const [transactions, setTransactions] = useState<ITransactionData[]>([]);
  const handleMoneyFlowOptions = async () => {
    const token = await getToken();

    if (!token) return console.log('un vervifed request');

    const incomeList = await fetchIncome(token);
    const expenseList = await fetchExpense(token);
    const { incomeSeries, expenseSeries, categories } =
      await getMonthlyIncomeExpense(incomeList, expenseList);
    console.log(
      'income',
      incomeSeries,
      'expense',
      expenseSeries,
      'category',
      categories,
    );
    setIncomeSeries(incomeSeries);
    setExpenseSeries(expenseSeries);
    setCategories(categories);
  };
  const handleDashboardValues = async () => {
    const token = await getToken();
    if (!token) return console.log('un vervifed request');
    const { incomeValue, expenseValue, totalBalance, totalTransaction } =
      await getDahsboardValues(token);

    setDashboardValues(() => ({
      totalBalance,
      incomeValue,
      expenseValue,
      totalTransaction,
    }));
  };
  const handleCategorySeries = async () => {
    const token = await getToken();
    if (!token) return;
    const transactions = await fetchTransctions(token);
    const series = getCategoryWiseValue(transactions);
    setCategorySeries(series);
  };
  const handleTransactions = async () => {
    const token = await getToken();
    if (!token) return;
    const transactions = await fetchTransctions(token);
    setTransactions(transactions);
  };
  const handleSeeAllClick = () => {
    router.push('/transactions');
  };
  const handleMostSpending = () => {
    const map: Record<string, number> = {};
    let categoryExpense = 0;
    let topCategory = '';
    transactions.forEach(item => {
      if (item.transactionType === 'expense') {
        if (!map[item.category]) {
          map[item.category] = 0;
        }
        map[item.category] += Number(item.amount);
      }
    });
    for (const category in map) {
      if (map[category] > categoryExpense) {
        categoryExpense = map[category];
        topCategory = category;
      }
    }
    categoryExpense = dashboardValues.expenseValue
      ? (categoryExpense / dashboardValues.expenseValue) * 100
      : 0;
    return { topCategory, categoryExpense };
  };
  const handleSavingRate = () => {
    const { incomeValue, expenseValue } = dashboardValues;
    if (!incomeValue) return 0;
    const rate = ((incomeValue - expenseValue) / incomeValue) * 100;
    return rate;
  };
  const handleIncomeSpent = () => {
    const { incomeValue, expenseValue } = dashboardValues;
    if (!incomeValue) return 0;
    const spent = (expenseValue / incomeValue) * 100;
    return spent;
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleDashboardValues();
    handleMoneyFlowOptions();
    handleCategorySeries();
    handleTransactions();
  }, []);
  const moneyFlowOptions = useMemo(() => {
    return getMoneyFlowOptions(categories, incomeSeries, expenseSeries);
  }, [categories, incomeSeries, expenseSeries]);
  const categoryOptions = useMemo(() => {
    return getPieChartOptions(categorySeries);
  }, [categorySeries]);
  return (
    <div className="ml-8 mt-6 mr-8 mb-4 w-[75%] overflow-y-scroll no-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-medium">
            Welcome back, {user?.firstName}
          </span>
          <span className="text-gray-500 text-sm mt-0.5">
            It is the best time to manage your finances
          </span>
        </div>
        <div className="flex items-center justify-center shadow gap-2 border border-gray-300 rounded-full py-1.5 pr-4 pl-1.5">
          <Image
            src={user?.imageUrl || USER_IMAGE}
            alt="user-image"
            className="rounded-full"
            width={32}
            height={32}
          />
          <div className="flex flex-col">
            <span className="text-base font-medium">{user?.firstName}</span>
            <span className="text-xs text-gray-500">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <Card
          title="Total Balance"
          imgSrc={TOTAL_BALANCE_IMAGE}
          value={dashboardValues.totalBalance}
        />
        <Card
          title="Income"
          imgSrc={INCOME_IMAGE}
          value={dashboardValues.incomeValue}
        />
        <Card
          title="Expense"
          imgSrc={EXPENSE_IMAGE}
          value={dashboardValues.expenseValue}
        />
        <Card
          title="Total Transaction"
          imgSrc={TOTAL_TRANSACTION_IMAGE}
          value={dashboardValues.totalTransaction}
        />
      </div>
      <div className="flex items-start justify-between gap-4 mt-8 ">
        <div className="border border-gray-300 rounded-3xl flex-2 pb-2 pt-6 px-4 flex flex-col relative">
          <span className="font-medium text-xl absolute top-[26px]">
            monyflow
          </span>
          <div className="mt-4">
            <HighchartsReact
              highcharts={Highcharts}
              options={moneyFlowOptions}
            />
          </div>
        </div>
        <div className="border border-gray-300 rounded-3xl flex-1 pb-2 pt-6 px-4 flex flex-col relative ">
          <span className="font-medium text-xl absolute top-[26px]">
            Category breakdown
          </span>
          <div className="pb-4">
            <HighchartsReact
              highcharts={Highcharts}
              options={categoryOptions}
            />
          </div>
        </div>
      </div>
      <div className="flex items-start gap-4 justify-between mt-8">
        <div className="border border-gray-300 rounded-3xl flex-2 pb-5 pt-6 px-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-xl">Recent transactions</span>
            <span
              className="font-medium flex items-center text-sm gap-1 border border-gray-300 rounded-full py-1.5 px-3 cursor-pointer"
              onClick={handleSeeAllClick}
            >
              See all
              <ChevronRight />
            </span>
          </div>
          <Table className="mt-4 h-[10.6rem]">
            <TableHeader className="bg-[#ecebfe] text-white rounded-full">
              <TableRow>
                <TableHead className="rounded-l-full text-indigo-600 uppercase pl-4 ">
                  Icon
                </TableHead>
                <TableHead className=" text-indigo-600 uppercase ">
                  Date
                </TableHead>
                <TableHead className=" text-indigo-600 uppercase ">
                  Amount
                </TableHead>
                <TableHead className=" text-indigo-600 uppercase ">
                  Title
                </TableHead>
                <TableHead className=" text-indigo-600 uppercase ">
                  Type
                </TableHead>
                <TableHead className="rounded-r-full text-indigo-600 uppercase ">
                  Category
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions
                .slice(0, 3)
                .reverse()
                .map((item: ITransactionData) => {
                  return (
                    <TableRow key={item._id}>
                      <TableCell className="text-xl">{item.emoji}</TableCell>
                      <TableCell className="font-medium">
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : ''}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.amount}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.title}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.transactionType}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.category}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
        <div className="border border-gray-300 rounded-3xl flex-1 pb-2 pt-6 px-4">
          <span className="font-medium text-xl">Financial summary</span>
          <div>
            <Progress
              title={handleMostSpending().topCategory}
              percentage={handleMostSpending().categoryExpense}
            />
            <Progress title="Saving Rate" percentage={handleSavingRate()} />
            <Progress title="Income spent" percentage={handleIncomeSpent()} />
          </div>
        </div>
      </div>
    </div>
  );
}
