import { ICardProps } from "@/utils/types";
import Image from "next/image";

export default function Card({ title, imgSrc, value }: ICardProps) {
  return (
    <div className="w-full rounded-3xl border border-gray-300 p-5 shadow bg-white">
      <Image
        src={imgSrc}
        alt={title}
        width={42}
        height={42}
        className="mb-3"
      />

      <h2 className="text-lg font-medium">{title}</h2>

      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
