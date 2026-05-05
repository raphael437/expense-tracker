import { APP_API_URL } from '@/utils/constants';
import { ITransactionData } from '@/utils/types';
import axios from 'axios';
const addIncome = async (payload: ITransactionData, token: string) => {
  try {
    await axios.post(`${APP_API_URL}/addincome`, payload, {
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
const fetchIncome = async (token: string) => {
  try {
    const response = await axios.get(`${APP_API_URL}/getincome`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response?.data?.incomes;
  } catch (error) {
    throw error;
  }
};
const updateIncome = async (
  payload: ITransactionData,
  id: string,
  token: string,
) => {
  try {
    await axios.patch(`${APP_API_URL}/updateincome/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    throw error;
  }
};
const deleteIncome = async (id: string, token: string) => {
  try {
    await axios.delete(`${APP_API_URL}/deleteincome/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    throw error;
  }
};
export { addIncome, updateIncome, fetchIncome, deleteIncome };
