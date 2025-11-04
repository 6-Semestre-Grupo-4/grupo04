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
import api from '@/services/api';
import Cookies from 'js-cookie';
// ClientOnly wrapper para componentes que causam hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  return isMounted ? <>{children}</> : null;
}

const handleLogout = async () => {
    try {
      // 1. (Opcional, mas recomendado)
      // Avisa o backend para invalidar o token no banco de dados.
      // A instância 'api' do Axios já envia o token de autorização.
      await api.post('auth/logout');

    } catch (error) {
      // Mesmo se a chamada ao backend falhar (ex: sem internet),
      // o logout no frontend (limpar cookie) ainda deve acontecer.
      console.error('Falha ao invalidar token no servidor:', error);
    }

    // 2. Remove o cookie de autenticação do navegador.
    // O 'path: /' é crucial para garantir que o cookie correto seja removido.
    Cookies.remove('auth_token', { path: '/' });

    // 3. Redireciona o usuário para a página de login.
    // Usar window.location.href força um refresh completo da aplicação,
    // o que é bom para limpar qualquer estado em memória (React Context, etc.)
    window.location.href = '/auth/login';
    
    // Alternativa (sem refresh completo):
    // router.push('/auth/login');
  };

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
              <DropdownItem className="cursor-pointer" onClick={handleLogout}>Sair</DropdownItem>
            </Dropdown>
          </ClientOnly>
        </div>
      </Navbar>
    </ThemeProvider>
  );
}
