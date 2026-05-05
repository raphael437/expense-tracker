import Expense from '@/components/expense';
import { withAuth } from '@/hoc/withAuth';
 const ExpensePage=()=> {
  return <Expense />;
}
export default withAuth(ExpensePage)