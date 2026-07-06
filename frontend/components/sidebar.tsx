'use client';
import { SIDEBAR_CONSTANTS } from '@/utils/constants';
import { SignOutButton } from '@clerk/nextjs';
import { CircleDollarSign, LogOut, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleSidebarClick = (id: string) => {
    router.push(id);
    setIsOpen(false); // close on navigation (mobile)
  };

  // Hide sidebar on auth pages
  if (pathname === '/login' || pathname === '/sign-up') {
    return null;
  }

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <>
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
          {SIDEBAR_CONSTANTS.map((item) => {
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
    </>
  );

  return (
    <>
      {/* Desktop Sidebar – always visible on large screens */}
      <div className="hidden lg:flex bg-woodsmoke w-1/5 h-full flex-col justify-between p-4">
        <SidebarContent />
      </div>

      {/* Mobile Hamburger Button – visible only on small/medium screens */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-woodsmoke text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar – slides in from left */}
      <div
        className={`
          lg:hidden fixed top-0 left-0 h-full w-3/4 max-w-xs bg-woodsmoke z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          p-4 flex flex-col justify-between
        `}
      >
        <SidebarContent />
      </div>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
