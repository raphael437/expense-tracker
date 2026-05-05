import { ICardProps } from "@/utils/types"
import Image from "next/image"

export default function Card({title,imgSrc,value}:ICardProps){
    return <div key={title} className="flex flex-col gap-2 border border-gray-300 rounded-3xl p-4 w-[16.2rem] shadow">
        <Image src={imgSrc} alt='card-img' width={40} height={40}></Image>
        <span className="text-xl font-medium mt-1">{title}</span>
        <span className="font-semibold text-2xl">{value}</span>
    </div>
}