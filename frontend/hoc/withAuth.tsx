import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export function withAuth<T extends object>(WrappedComponent:React.ComponentType<T>){
    const withAuthWrapper=async(props:T)=>{
        const user=await currentUser()
        if(!user){
            redirect('/login')
        }
        return <WrappedComponent {...props} user={user}/>
    }
    return withAuthWrapper
}