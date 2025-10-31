'use client';

import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  Button,
  createTheme,
  ThemeProvider,
} from 'flowbite-react';

import { HiMenu } from 'react-icons/hi';
import Image from 'next/image';
import Logo from '@/assets/images/logos/sideLogo.png';
import { useState, useEffect } from 'react';

// ClientOnly wrapper para componentes que causam hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  return isMounted ? <>{children}</> : null;
}

const customTheme = createTheme({
  navbar: {
    root: {
      base: 'bg-gray-100 text-white px-2 py-2.5 sm:px-4 dark:bg-background',
    },
  },
  button: {
    color: {
      primary: 'bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600',
    },
  },
});

interface NavbarComponentProps {
  onMenuClick: () => void;
}

export function NavbarComponent({ onMenuClick }: NavbarComponentProps) {
  return (
    <ThemeProvider theme={customTheme}>
      <Navbar fluid rounded>
        <div className="flex items-center gap-2">
          <Button onClick={onMenuClick} color="primary" className="p-2 rounded-lg md:hidden">
            <HiMenu size={24} className="dark:text-white bg-text-black" />
          </Button>

          <NavbarBrand href="#">
            <div className="self-center whitespace-nowrap text-xl font-semibold md:hidden">
              <Image src={Logo} alt="Accountflow logo" width={130} height={30} />
            </div>
          </NavbarBrand>
        </div>

        <div className="flex md:order-2">
          {/* Renderizar dropdown apenas no client */}
          <ClientOnly>
            <Dropdown
              arrowIcon={true}
              inline
              label={
                <div className="cursor-pointer">
                  <Avatar alt="User settings" rounded />
                </div>
              }
            >
              <DropdownHeader>
                <span className="block text-xs">Matheus Bruckmann Morilha Teles</span>
                <span className="block truncate text-xs font-medium">matheusmorilha04@gmail.com</span>
              </DropdownHeader>
              <DropdownItem className="cursor-pointer">Meu Perfil</DropdownItem>
              <DropdownDivider />
              <DropdownItem className="cursor-pointer">Sair</DropdownItem>
            </Dropdown>
          </ClientOnly>
        </div>
      </Navbar>
    </ThemeProvider>
  );
}
