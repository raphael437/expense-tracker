'use client';
import { SIDEBAR_CONSTANTS } from '@/utils/constants';
import { SignOutButton } from '@clerk/nextjs';
import { CircleDollarSign, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleSidebarClick = (id: string) => {
    router.push(id);
  };

  // Hide sidebar on auth pages
  if (pathname === '/login' || pathname === '/sign-up') {
    return null;
  }

  return (
    <div className="bg-woodsmoke w-1/5 h-full flex justify-between flex-col p-4">
      <div className="flex flex-col">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <CircleDollarSign className="text-white h-9 w-9" />
          <span className="text-white font-semibold text-base">
            Expense Tracker
          </span>
        </div>

        <span className="text-gray-400 text-sm font-medium mt-8">MENU</span>

        <div className="ml-2 mt-4 flex flex-col gap-3">
          {SIDEBAR_CONSTANTS.map(item => {
            const { icon: Icon, title, id } = item;
            const itemSelectedClass =
              pathname === id ? 'bg-woodsmoke2 border border-shark' : '';

            return (
              <div
                key={item.id}
                className={`flex gap-2 cursor-pointer py-2 px-3 rounded-md w-[95%] border border-transparent
                  ${itemSelectedClass}`}
                onClick={() => handleSidebarClick(id)}
              >
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">{title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Button */}
      <SignOutButton redirectUrl="/login">
        <button className="flex gap-2 cursor-pointer py-2 px-3 rounded-md w-[95%] border-shar bg-woodsmoke2">
          <LogOut className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-400">Log out</span>
        </button>
      </SignOutButton>
    </div>
  );
};

export default Sidebar;
