'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react'; // Otimização de cálculo
import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  SidebarCollapse,
  createTheme,
  ThemeProvider,
} from 'flowbite-react';
import {
  Home,
  Building2,
  Settings,
  Network,
  Landmark,
  CircleDollarSign,
  Wallet,
  FilePlus,
  FileDown,
  BarChart3,
} from 'lucide-react';
import Image from 'next/image';
import Logo from '@/assets/images/logos/sideLogo.png';

const route = '/pages/';

// Tema definido fora do componente para evitar recriação a cada render
const customTheme = createTheme({
  sidebar: {
    root: {
      base: 'h-full backdrop-blur-sm',
      inner: 'h-full overflow-y-auto px-3 py-6 transition-all duration-300',
    },
    collapse: {
      button:
        'group flex w-full items-center justify-start text-left rounded-lg p-2 text-base font-medium text-text-muted transition duration-200 hover:bg-gray-100 dark:hover:bg-gray-700',
      icon: {
        base: 'h-5 w-5',
        open: { off: '', on: '' },
      },
      label: {
        base: 'ml-3 w-full items-center justify-start text-left flex-1 whitespace-nowrap',
        icon: {
          base: 'h-5 w-5 transition duration-200 group-hover:scale-110',
          open: { off: '', on: '' },
        },
      },
      list: 'space-y-1 py-2 pl-3',
    },
    item: {
      base: 'group flex w-full items-center justify-start text-left rounded-lg p-2 text-base font-medium text-text-muted transition duration-200 hover:bg-gray-100 dark:hover:bg-gray-700',
      active: 'bg-primary/10 text-primary', // Simplificado classe active
      icon: {
        base: 'h-5 w-5 flex-shrink-0 transition duration-200 group-hover:scale-110',
        active: 'text-primary scale-110',
      },
    },
  },
});

interface SidebarProps {
  isOpen: boolean;
}

export function SidebarComponent({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  // useMemo evita recálculo dessas variáveis booleanas se o pathname não mudar
  const { isOperationsActive, isAccountsPayableActive, isAccountsReceivableActive, isSettingsActive } = useMemo(() => {
    return {
      isOperationsActive: pathname.startsWith(`${route}operations`),
      isAccountsPayableActive: pathname.startsWith(`${route}operations/accounts-payable`),
      isAccountsReceivableActive: pathname.startsWith(`${route}operations/accounts-receivable`),
      isSettingsActive: pathname.startsWith(`${route}settings`),
    };
  }, [pathname]);

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } border-r border-border bg-surface shadow-card lg:translate-x-0`}
    >
      <ThemeProvider theme={customTheme}>
        <Sidebar aria-label="Sidebar navegação" className="bg-surface w-full">
          <div className="border-border flex w-full items-center justify-center border-b px-4 pb-6">
            <Image
              src={Logo}
              alt="Accountflow logo"
              width={150}
              height={30}
              priority // Carrega a imagem imediatamente (LCP optimization)
              className="mx-auto transition-transform duration-300 hover:scale-105"
            />
          </div>

          <SidebarItems>
            <SidebarItemGroup>
              {/* MUDANÇA PRINCIPAL: 
                Usar 'href' e 'as={Link}' ao invés de onClick + router.push 
              */}
              <SidebarItem 
                icon={Home} 
                as={Link} 
                href={`${route}home`} 
                active={pathname === `${route}home`}
              >
                Home
              </SidebarItem>

              <SidebarItem
                icon={Building2}
                as={Link} 
                href={`${route}company`}
                active={pathname === `${route}company`}
              >
                Empresa
              </SidebarItem>

              <SidebarCollapse
                icon={BarChart3}
                label="Operações"
                open={isOperationsActive}
              >
                <SidebarCollapse
                  icon={CircleDollarSign}
                  label="Contas a Pagar"
                  open={isAccountsPayableActive}
                >
                  <SidebarItem
                    icon={FilePlus}
                    as={Link}
                    href={`${route}operations/accounts-payable/create`}
                    active={pathname === `${route}operations/accounts-payable/create`}
                  >
                    Cadastrar Títulos
                  </SidebarItem>

                  <SidebarItem
                    icon={FileDown}
                    as={Link}
                    href={`${route}operations/accounts-payable/pay`}
                    active={pathname === `${route}operations/accounts-payable/pay`}
                  >
                    Baixar Títulos
                  </SidebarItem>
                </SidebarCollapse>

                <SidebarCollapse
                  icon={Wallet}
                  label="Contas a Receber"
                  open={isAccountsReceivableActive}
                >
                  <SidebarItem
                    icon={FilePlus}
                    as={Link}
                    href={`${route}operations/accounts-receivable/create`}
                    active={pathname === `${route}operations/accounts-receivable/create`}
                  >
                    Cadastrar Títulos
                  </SidebarItem>

                  <SidebarItem
                    icon={FileDown}
                    as={Link}
                    href={`${route}operations/accounts-receivable/receive`}
                    active={pathname === `${route}operations/accounts-receivable/receive`}
                  >
                    Baixar Títulos
                  </SidebarItem>
                </SidebarCollapse>
              </SidebarCollapse>

              <SidebarCollapse
                icon={Settings}
                label="Configurações"
                open={isSettingsActive}
              >
                <SidebarItem
                  icon={Network}
                  as={Link}
                  href={`${route}settings/billing-plans`}
                  active={pathname === `${route}settings/billing-plans`}
                >
                  Plano de Contas
                </SidebarItem>
                <SidebarItem
                  icon={Landmark}
                  as={Link}
                  href={`${route}settings/history-presets`}
                  active={pathname === `${route}settings/history-presets`}
                >
                  Históricos
                </SidebarItem>
              </SidebarCollapse>
            </SidebarItemGroup>
          </SidebarItems>
        </Sidebar>
      </ThemeProvider>
    </aside>
  );
}