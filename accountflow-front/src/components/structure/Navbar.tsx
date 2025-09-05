"use client";

import Image from "next/image";
import User from "@/assets/images/logos/userImg.jpg";
import Logo from "@/assets/images/logos/sideLogo.png";

interface NavbarProps {
  isSidebarOpen: boolean;
}

function UserDropdown() {
  const handleLogout = () => console.log("Logout realizado");

  const buttonClass = "w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm cursor-pointer";

  return (
    <div className="absolute top-full right-0 mt-2.5 w-30 bg-white dark:bg-gray-800 rounded-b-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
      <button onClick={handleLogout} className={buttonClass}>
        Meus dados
      </button>
      <button onClick={handleLogout} className={buttonClass}>
        Sair
      </button>
    </div>
  );
}

export default function Navbar({ isSidebarOpen }: NavbarProps) {
  return (
    <nav className="h-16 border-b border-gray-200 bg-primary flex items-center px-4 justify-between">

      {!isSidebarOpen && (
        <div className="flex items-center gap-2">
          <Image src={Logo} alt="Logo" width={150} height={150} className="rounded-md" />
          
        </div>
      )}

      <div className="ml-auto relative group flex items-center gap-2 cursor-pointer">
        <Image src={User} alt="Avatar" width={40} height={40} className="rounded-full" />
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          Nome do usuário
        </span>
        <UserDropdown />
      </div>
    </nav>
  );
}
