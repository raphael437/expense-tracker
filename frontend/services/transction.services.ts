import { APP_API_URL } from '@/utils/constants';
import axios from 'axios';

const fetchTransctions = async (token: string) => {
  try {
    const response = await axios.get(`${APP_API_URL}/getalltrasctions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response);
    return response.data?.transctions;
  } catch (error) {
    throw error;
  }
};
export { fetchTransctions };
