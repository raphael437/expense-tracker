import Dashboard from "@/components/Dashboard";
import { withAuth } from "@/hoc/withAuth";

 const  DashboardPage=()=> {
  return <Dashboard/>
}
export default withAuth(DashboardPage)