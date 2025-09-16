'use client';

import Image from 'next/image';
import User from '@/assets/images/logos/userImg.jpg';
import { FaBars } from 'react-icons/fa';
import Logo from '@/assets/images/logos/sideLogo.png';
import Link from 'next/link';

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
}

function UserDropdown() {
  const handleLogout = () => console.log('Logout realizado');

  const buttonClass =
    'w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm cursor-pointer transition-colors duration-200';

  return (
    <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-b-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
      <button onClick={handleLogout} className={buttonClass}>
        Meus dados
      </button>
      <button onClick={handleLogout} className={buttonClass}>
        Sair
      </button>
    </div>
  );
}

export default function Navbar({ isSidebarOpen, setIsSidebarOpen }: NavbarProps) {
  return (
    <nav className="h-16 bg-primary flex items-center px-4 justify-between sticky top-0 z-50">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer mr-5"
      >
        <FaBars />
      </button>

      <div className="left-2 lg:hidden">
        <Link href="/">
          <Image src={Logo} alt="Logo" width={120} height={120} />
        </Link>
      </div>

      <div className="ml-auto relative group flex items-center gap-2 cursor-pointer">
        <Image src={User} alt="Avatar" width={40} height={40} className="rounded-full" />
        <span className="text-gray-800 dark:text-gray-200 font-medium hidden md:block truncate max-w-[150px]">
          Nome do usuário
        </span>
        <UserDropdown />
      </div>
    </nav>
  );
}
