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
      base: 'px-4 py-3 backdrop-blur-sm border-b transition-all duration-300',
    },
  },
  button: {
    color: {
      primary: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200',
    },
  },
});

interface NavbarComponentProps {
  onMenuClick: () => void;
}

export function NavbarComponent({ onMenuClick }: NavbarComponentProps) {
  return (
    <ClientOnly>
      <ThemeProvider theme={customTheme}>
        <Navbar 
          fluid 
          className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Button 
              onClick={onMenuClick} 
              color="primary" 
              className="p-3 rounded-lg md:hidden hover:scale-105 transition-transform duration-200"
            >
              <HiMenu size={20} style={{ color: 'var(--color-text)' }} />
            </Button>

            <NavbarBrand href="#">
              <div className="self-center whitespace-nowrap text-xl font-semibold md:hidden">
                <Image 
                  src={Logo} 
                  alt="Accountflow logo" 
                  width={130} 
                  height={30} 
                  className="transition-transform duration-200 hover:scale-105"
                />
              </div>
            </NavbarBrand>
          </div>

          <div className="flex md:order-2">
            <Dropdown
              arrowIcon={true}
              inline
              label={
                <div className="cursor-pointer group">
                  <Avatar 
                    alt="User settings" 
                    rounded 
                    className="ring-2 ring-transparent group-hover:ring-[var(--color-primary)] transition-all duration-200"
                  />
                </div>
              }
            >
              <DropdownHeader className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                <span className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Matheus Bruckmann
                </span>
                <span className="block truncate text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  matheusmorilha04@gmail.com
                </span>
              </DropdownHeader>
              <DropdownItem 
                className="cursor-pointer hover:bg-[var(--color-border)] transition-colors duration-200"
                style={{ color: 'var(--color-text)' }}
              >
                Meu Perfil
              </DropdownItem>
              <DropdownDivider className="border-[var(--color-border)]" />
              <DropdownItem 
                className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                style={{ color: 'var(--color-text)' }}
              >
                Sair
              </DropdownItem>
            </Dropdown>
          </div>
        </Navbar>
      </ThemeProvider>
    </ClientOnly>
  );
}
