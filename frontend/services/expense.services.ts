import { APP_API_URL } from '@/utils/constants';
import { ITransactionData } from '@/utils/types';
import axios from 'axios';
const addExpense = async (payload: ITransactionData, token: string) => {
  try {
    await axios.post(`${APP_API_URL}/addexpense`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(payload, token);
  } catch (error) {
    throw error;
  }
};
const fetchExpense = async (token: string) => {
  try {
    const response = await axios.get(`${APP_API_URL}/getexpense`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response?.data?.expenses;
  } catch (error) {
    throw error;
  }
};
const updateExpense = async (
  payload: ITransactionData,
  id: string,
  token: string,
) => {
  try {
    await axios.patch(`${APP_API_URL}/updateexpense/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    throw error;
  }
};
const deleteExpense = async (id: string, token: string) => {
  try {
    await axios.delete(`${APP_API_URL}/deleteexpense/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    throw error;
  }
};
export { addExpense, updateExpense, fetchExpense, deleteExpense };
