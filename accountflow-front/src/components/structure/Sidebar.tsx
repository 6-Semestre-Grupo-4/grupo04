'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems, createTheme, ThemeProvider } from 'flowbite-react';
import { AiFillHome } from 'react-icons/ai';
import { IoPeople } from 'react-icons/io5';
import { MdOutlineAccountTree } from 'react-icons/md';
import { FaCog, FaUserShield } from 'react-icons/fa';
import { RiBuilding2Fill } from 'react-icons/ri';
import Image from 'next/image';
import Logo from '@/assets/images/logos/sideLogo.png';

const route = '/pages/';

const menuItems = [
  { label: 'Início', icon: AiFillHome, href: `${route}home` },
  { label: 'Pessoas', icon: IoPeople, href: `${route}people` },
  { label: 'Empresas', icon: RiBuilding2Fill, href: `${route}company` },
  { label: 'Plano de Contas', icon: MdOutlineAccountTree, href: `${route}account-plan` },
  { label: 'Usuários', icon: FaUserShield, href: `${route}access-management` },
  { label: 'Configurações', icon: FaCog, href: `${route}system-settings` },
];

interface SidebarProps {
  isOpen: boolean;
}

const customTheme = createTheme({
  sidebar: {
    root: {
      base: 'h-full shadow-lg',
      inner: 'h-full overflow-y-auto bg-white dark:bg-background px-3 py-4 rounded',
    },
    item: {
      base: 'text-sm mb-3 flex items-center transition-colors duration-200 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-700 relative cursor-pointer',
      active: `
        bg-gray-800 text-white hover:bg-gray-700 font-semibold 
        before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 
        before:rounded-l-md 
        before:bg-gradient-to-b before:from-secondary before:via-primary-800 before:to-secondary-500
      `,
      icon: {
        base: 'ml-3 h-6 w-5 text-gray-700 dark:text-gray-400',
        active: 'text-white',
      },
    },
  },
});

export function SidebarComponent({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transform transition-transform duration-100 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      shadow-lg bg-white dark:bg-gray-800`}
    >
      <ThemeProvider theme={customTheme}>
        <Sidebar aria-label="Sidebar items" className="h-full w-[12rem] md:w-50">
          <div className="mb-5 flex justify-center">
            <Image src={Logo} alt="Accountflow logo" width={150} height={30} />
          </div>

          <SidebarItems>
            <SidebarItemGroup>
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarItem
                    key={item.label}
                    icon={item.icon}
                    active={isActive}
                    onClick={() => router.push(item.href)} // navegação client-side
                  >
                    {item.label}
                  </SidebarItem>
                );
              })}
            </SidebarItemGroup>
          </SidebarItems>
        </Sidebar>
      </ThemeProvider>
    </aside>
  );
}
