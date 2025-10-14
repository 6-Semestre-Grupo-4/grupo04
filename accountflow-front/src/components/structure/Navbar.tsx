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
import Logo from '@/assets/images/logos/sideLogo.png';
import Image from 'next/image';

const customTheme = createTheme({
  navbar: {
    root: {
      base: 'bg-gray-100 text-white px-2 py-2.5 sm:px-4 dark:bg-background',
    },
  },
  dropdown: {
    floating: {
      base: 'z-10 w-40 sm:w-55 divide-y divide-gray-100 rounded-lg shadow dark:divide-gray-600 dark:bg-gray-700',
    },
  },
  button: {
    color: {
      primary: 'bg-gray-800 hover:bg-gray-500 dark:hover:bg-gray-600',
    },
  },
});

export function NavbarComponent({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <ThemeProvider theme={customTheme}>
      <Navbar fluid rounded>
        <div className="flex items-center gap-2">
          <Button onClick={onMenuClick} color="primary" className="p-2 rounded-lg md:hidden">
            <HiMenu size={24} className="dark:text-white bg-text-black" />
          </Button>

          <NavbarBrand href="#">
            <span className="self-center whitespace-nowrap text-xl font-semibold md:hidden">
              <div>
                <Image src={Logo} alt="Accountflow logo" width={130} height={30} />
              </div>
            </span>
          </NavbarBrand>
        </div>

        <div className="flex md:order-2">
          <Dropdown arrowIcon={true} inline label={<Avatar alt="User settings" rounded />}>
            <DropdownHeader>
              <span className="block text-xs">Matheus Bruckmann Morilha Teles</span>
              <span className="block truncate text-xs font-medium">matheusmorilha04@gmail.com</span>
            </DropdownHeader>
            <DropdownItem className="block text-xs">Meu Perfil</DropdownItem>
            <DropdownDivider />
            <DropdownItem className="block text-xs">Sair</DropdownItem>
          </Dropdown>
        </div>
      </Navbar>
    </ThemeProvider>
  );
}
