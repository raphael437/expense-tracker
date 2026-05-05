import Income from '@/components/Income';
import { withAuth } from '@/hoc/withAuth';

const Incomepage=()=> {
  return <Income />;
}
export default withAuth(Incomepage)