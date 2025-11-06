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

import { BsCashCoin } from 'react-icons/bs';
import { HiDocumentText } from 'react-icons/hi';

const menuItems = [
  { label: 'Início', icon: AiFillHome, href: `${route}home` },
  { label: 'Pessoas', icon: IoPeople, href: `${route}people` },
  { label: 'Empresas', icon: RiBuilding2Fill, href: `${route}company` },
  { label: 'Plano de Contas', icon: MdOutlineAccountTree, href: `${route}billing-plans` },
  { label: 'Títulos', icon: BsCashCoin, href: `${route}titles` },
  { label: 'Lançamentos', icon: HiDocumentText, href: `${route}entries` },
  { label: 'Usuários', icon: FaUserShield, href: `${route}access-management` },
  { label: 'Configurações', icon: FaCog, href: `${route}system-settings` },
];

interface SidebarProps {
  isOpen: boolean;
}

const customTheme = createTheme({
  sidebar: {
    root: {
      base: 'h-full shadow-2xl backdrop-blur-sm',
      inner: 'h-full overflow-y-auto px-4 py-6 transition-all duration-300',
    },
    item: {
      base: 'text-sm mb-2 flex items-center transition-all duration-300 rounded-xl hover:scale-105 relative cursor-pointer group px-3 py-3',
      active: `
        font-semibold shadow-lg transform scale-105
        before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 
        before:rounded-l-xl 
        before:bg-gradient-to-b before:from-[var(--color-primary)] before:to-[var(--color-secondary)]
      `,
      icon: {
        base: 'ml-2 h-5 w-5 transition-all duration-300 group-hover:scale-110',
        active: 'scale-110',
      },
    },
  },
});

export function SidebarComponent({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      card-enhanced border-r border-[var(--color-border)]`}
      style={{ background: 'var(--color-surface)' }}
    >
      <ThemeProvider theme={customTheme}>
        <Sidebar
          aria-label="Sidebar items"
          className="h-full w-[12rem] md:w-50"
          style={{ background: 'var(--color-surface)' }}
        >
          <div className="mb-8 flex justify-center p-4">
            <Image
              src={Logo}
              alt="Accountflow logo"
              width={150}
              height={30}
              className="transition-transform duration-300 hover:scale-105"
            />
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
                    onClick={() => router.push(item.href)}
                    className={`
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 text-[var(--color-primary)] border-l-4 border-[var(--color-primary)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/50'
                      }
                    `}
                  >
                    <span className="ml-3 font-medium">{item.label}</span>
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
