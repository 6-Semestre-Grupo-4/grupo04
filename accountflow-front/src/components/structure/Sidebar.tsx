'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
  UserCheck,
  BarChart3,
} from 'lucide-react';
import Image from 'next/image';
import Logo from '@/assets/images/logos/sideLogo.png';

const route = '/pages/';

import { BsCashCoin } from 'react-icons/bs';
import { HiDocumentText } from 'react-icons/hi';

const menuItems = [
  { label: 'Início', icon: AiFillHome, href: `${route}home` },
  { label: 'Pessoas', icon: IoPeople, href: `${route}people` },
  { label: 'Empresas', icon: RiBuilding2Fill, href: `${route}companies` },
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
      base: 'h-full backdrop-blur-sm',
      inner: 'h-full overflow-y-auto px-3 py-6 transition-all duration-300',
    },
    collapse: {
      button:
        'group flex w-full items-center justify-start text-left rounded-lg p-2 text-base font-medium text-text-muted transition duration-200',
      icon: {
        base: 'h-5 w-5',
        open: {
          off: '',
          on: '',
        },
      },
      label: {
        base: 'ml-3 w-full items-center justify-start text-left flex-1 whitespace-nowrap text-left',
        icon: {
          base: 'h-5 w-5 transition duration-200 group-hover:scale-110',
          open: {
            off: '',
            on: '',
          },
        },
      },
      list: 'space-y-1 py-2 pl-3',
    },
    item: {
      base: 'group flex w-full items-center justify-start text-left rounded-lg p-2 text-base font-medium text-text-muted transition duration-200',
      active: 'sidebar-item-active',
      icon: {
        base: 'h-5 w-5 flex-shrink-0 transition duration-200 group-hover:scale-110',
        active: 'text-primary scale-110',
      },
    },
  },
});

export function SidebarComponent({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isOperationsActive =
    pathname.startsWith(`${route}operations/accounts-payable`) ||
    pathname.startsWith(`${route}operations/accounts-receivable`);

  const isAccountsPayableActive = pathname.startsWith(`${route}operations/accounts-payable`);
  const isAccountsReceivableActive = pathname.startsWith(`${route}operations/accounts-receivable`);
  const isSettingsActive = pathname.startsWith(`${route}settings`);

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } border-border bg-surface shadow-card border-r lg:translate-x-0`}
    >
      <ThemeProvider theme={customTheme}>
        <Sidebar aria-label="Sidebar navegação" className="bg-surface h-full w-64">
          <div className="border-border flex w-full items-center justify-center border-b px-4 pb-6">
            <Image
              src={Logo}
              alt="Accountflow logo"
              width={150}
              height={30}
              className="mx-auto transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Menu Items */}
          <SidebarItems>
            <SidebarItemGroup>
              {/* Home */}
              <SidebarItem icon={Home} active={pathname === `${route}home`} onClick={() => router.push(`${route}home`)}>
                Home
              </SidebarItem>

              <SidebarItem
                icon={Building2}
                active={pathname === `${route}company`}
                onClick={() => router.push(`${route}company`)}
              >
                Empresa
              </SidebarItem>

              {/* Operações */}
              <SidebarCollapse
                icon={BarChart3}
                label="Operações"
                open={isOperationsActive}
                className={isOperationsActive ? 'sidebar-collapse-active' : ''}
              >
                {/* Contas a Pagar */}
                <SidebarCollapse
                  icon={CircleDollarSign}
                  label="Contas a Pagar"
                  open={isAccountsPayableActive}
                  className={isAccountsPayableActive ? 'sidebar-collapse-active' : ''}
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

                {/* Contas a Receber */}
                <SidebarCollapse
                  icon={Wallet}
                  label="Contas a Receber"
                  open={isAccountsReceivableActive}
                  className={isAccountsReceivableActive ? 'sidebar-collapse-active' : ''}
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

              {/* Configurações */}
              <SidebarCollapse
                icon={Settings}
                label="Configurações"
                open={isSettingsActive}
                className={isSettingsActive ? 'sidebar-collapse-active' : ''}
              >
                <SidebarItem
                  icon={Network}
                  active={pathname === `${route}settings/billing-plans`}
                  as={Link}
                  href={`${route}settings/billing-plans`}
                >
                  Plano de Contas
                </SidebarItem>
                <SidebarItem
                  icon={Landmark}
                  active={pathname === `${route}settings/history-presets`}
                  as={Link}
                  href={`${route}settings/history-presets`}
                >
                  Históricos
                </SidebarItem>

                <SidebarItem
                  icon={UserCheck}
                  active={pathname === `${route}settings/users`}
                  onClick={() => router.push(`${route}settings/users`)}
                >
                  Usuário
                </SidebarItem>
              </SidebarCollapse>
            </SidebarItemGroup>
          </SidebarItems>
        </Sidebar>
      </ThemeProvider>
    </aside>
  );
}
