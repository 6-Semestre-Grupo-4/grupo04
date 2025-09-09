'use client';

import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/assets/images/logos/sideLogo.png';
import LogoTransparente from '@/assets/images/logos/logoTransparente3.png';
import { AiFillHome } from 'react-icons/ai';
import { IoPeople } from 'react-icons/io5';
import { MdOutlineAccountTree } from 'react-icons/md';
import { FaCog, FaUserShield } from 'react-icons/fa';

const menuItems = [
  { title: 'Início', icon: <AiFillHome />, href: '/routes/home' },
  { title: 'Pessoas', icon: <IoPeople />, href: '/routes/people' },
  { title: 'Plano de Contas', icon: <MdOutlineAccountTree />, href: '/routes/accounts-plan' },
  { title: 'Gestão de Acessos', icon: <FaUserShield />, href: '/routes/access-management' },
  { title: 'Configurações', icon: <FaCog />, href: '/routes/system-settings' },
];

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside
      className={`
    fixed lg:relative top-0 left-0 h-screen z-50 bg-primary border-r dark:border-gray-700
    transition-all duration-300
    ${isOpen ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0 lg:w-16'}
  `}
    >
      <div className="flex items-center justify-center h-16 border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center">
          {isOpen ? (
            <Image src={Logo} alt="Logo" width={140} height={140} className="transition-all duration-300" />
          ) : (
            <Image src={LogoTransparente} alt="Logo" width={40} height={40} className="transition-all duration-300" />
          )}
        </Link>
      </div>

      <ul className="mt-2 space-y-2 font-medium p-2">
        {menuItems.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href}
              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                !isOpen && 'justify-center'
              }`}
            >
              <span className="text-lg flex-shrink-0 pl-1">{item.icon}</span>
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isOpen ? 'opacity-100 w-auto ml-2' : 'opacity-0 w-0'
                }`}
              >
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
