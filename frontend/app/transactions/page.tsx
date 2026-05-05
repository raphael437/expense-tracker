import Transctions from '@/components/Transctions';
import { withAuth } from '@/hoc/withAuth';

 const Transactions=()=> {
  return <Transctions />;
}
export default withAuth(Transactions)