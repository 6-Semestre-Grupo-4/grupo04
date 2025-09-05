'use client';

import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/assets/images/logos/sideLogo.png';
import { IoPeople } from 'react-icons/io5';
import { MdOutlineAccountTree } from 'react-icons/md';
import { FaCog, FaBars, FaUserShield } from 'react-icons/fa';

const menuItems = [
  { title: 'Pessoas', icon: <IoPeople />, href: '/routes/pessoas' },
  { title: 'Plano de Contas', icon: <MdOutlineAccountTree />, href: '/routes/planodecontas' },
  { title: 'Gestão de Acessos', icon: <FaUserShield />, href: '/routes/gestaodeacessos' },
  { title: 'Configurações', icon: <FaCog />, href: '/routes/configuracoes' }
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  return (
    <aside
      className={`transition-all duration-300 bg-primary border-r dark:border-gray-700 ${isOpen ? 'w-60' : 'w-15'}`}
    >
      <div className='flex items-center pl-3 h-16'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer'
        >
          <FaBars />
        </button>

        <Link
          href='/'
          className={`flex items-center ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}
        >
          <Image src={Logo} alt='Logo' width={150} height={150} className='mr-3' />
        </Link>
      </div>

      <ul className='space-y-3 font-medium p-3'>
        {menuItems.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href}
              className='flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
            >
              <span className='text-lg'>{item.icon}</span>
              <span className={`ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
