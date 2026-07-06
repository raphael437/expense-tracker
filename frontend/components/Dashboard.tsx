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
        <div className="w-full px-4 sm:px-6 md:px-8 lg:ml-8 lg:mt-6 lg:mr-8 lg:mb-4 lg:w-[75%] overflow-y-scroll no-scrollbar pb-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-medium">
                        Welcome back, {user?.firstName}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm mt-0.5">
                        It is the best time to manage your finances
                    </span>
                </div>
                <div className="flex items-center justify-center shadow gap-2 border border-gray-300 rounded-full py-1.5 pr-4 pl-1.5 w-fit">
                    <Image
                        src={user?.imageUrl || USER_IMAGE}
                        alt="user-image"
                        className="rounded-full"
                        width={32}
                        height={32}
                    />
                    <div className="flex flex-col">
                        <span className="text-sm sm:text-base font-medium">{user?.firstName}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[200px]">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

            {/* Charts Section */}
            <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 mt-6 sm:mt-8">
                <div className="border border-gray-300 rounded-3xl pb-2 pt-6 px-3 sm:px-4 flex flex-col relative w-full lg:flex-2">
                    <span className="font-medium text-lg sm:text-xl absolute top-[22px] sm:top-[26px] left-4">
                        Moneyflow
                    </span>
                    <div className="mt-4 min-h-[220px] sm:min-h-[280px]">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={moneyFlowOptions}
                        />
                    </div>
                </div>
                <div className="border border-gray-300 rounded-3xl pb-2 pt-6 px-3 sm:px-4 flex flex-col relative w-full lg:flex-1">
                    <span className="font-medium text-lg sm:text-xl absolute top-[22px] sm:top-[26px] left-4">
                        Category breakdown
                    </span>
                    <div className="pb-4 min-h-[200px] sm:min-h-[240px]">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={categoryOptions}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col xl:flex-row items-stretch gap-4 mt-6 sm:mt-8">
                {/* Recent Transactions */}
                <div className="border border-gray-300 rounded-3xl pb-5 pt-6 px-3 sm:px-4 w-full xl:flex-2 overflow-hidden">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="font-medium text-lg sm:text-xl">Recent transactions</span>
                        <span
                            className="font-medium flex items-center text-sm gap-1 border border-gray-300 rounded-full py-1.5 px-3 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={handleSeeAllClick}
                        >
                            See all
                            <ChevronRight className="h-4 w-4" />
                        </span>
                    </div>
                    <div className="mt-4 overflow-x-auto -mx-3 sm:-mx-4">
                        <div className="min-w-[600px] sm:min-w-full">
                            <Table className="h-[10.6rem]">
                                <TableHeader className="bg-[#ecebfe] text-white rounded-full">
                                    <TableRow>
                                        <TableHead className="rounded-l-full text-indigo-600 uppercase pl-4 text-xs sm:text-sm">
                                            Icon
                                        </TableHead>
                                        <TableHead className="text-indigo-600 uppercase text-xs sm:text-sm">
                                            Date
                                        </TableHead>
                                        <TableHead className="text-indigo-600 uppercase text-xs sm:text-sm">
                                            Amount
                                        </TableHead>
                                        <TableHead className="text-indigo-600 uppercase text-xs sm:text-sm hidden sm:table-cell">
                                            Title
                                        </TableHead>
                                        <TableHead className="text-indigo-600 uppercase text-xs sm:text-sm">
                                            Type
                                        </TableHead>
                                        <TableHead className="rounded-r-full text-indigo-600 uppercase text-xs sm:text-sm hidden md:table-cell">
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
                                                    <TableCell className="text-base sm:text-xl">
                                                        {item.emoji}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-xs sm:text-sm">
                                                        {item.date
                                                            ? new Date(item.date).toLocaleDateString()
                                                            : ''}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-xs sm:text-sm">
                                                        {item.amount}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-xs sm:text-sm hidden sm:table-cell">
                                                        {item.title}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-xs sm:text-sm">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.transactionType === 'expense'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {item.transactionType}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-xs sm:text-sm hidden md:table-cell">
                                                        {item.category}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="border border-gray-300 rounded-3xl pb-2 pt-6 px-3 sm:px-4 w-full xl:flex-1">
                    <span className="font-medium text-lg sm:text-xl">Financial summary</span>
                    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                        <Progress
                            title={handleMostSpending().topCategory || 'No expenses'}
                            percentage={handleMostSpending().categoryExpense}
                        />
                        <Progress
                            title="Saving Rate"
                            percentage={handleSavingRate()}
                        />
                        <Progress
                            title="Income spent"
                            percentage={handleIncomeSpent()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
