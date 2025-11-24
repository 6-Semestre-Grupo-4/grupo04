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
import { ThemeToggle } from '@/components/utils/ThemeToogle';
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
      base: 'px-4 py-3 transition-all duration-300',
    },
  },
  button: {
    color: {
      primary: 'bg-transparent hover:bg-background transition-all duration-200',
    },
  },
  dropdown: {
    floating: {
      target: 'w-fit',
      item: {
        base: 'flex items-center justify-start py-2 px-4 text-sm cursor-pointer w-full hover:!bg-muted-foreground/20 rounded-md transition-colors duration-200',
      },
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
        <Navbar fluid className="bg-background shadow-card px-2 lg:px-4">
          <div className="grid flex-1 grid-cols-[auto_1fr_auto] items-center gap-2 lg:flex lg:w-auto lg:gap-2">
            <Button
              onClick={onMenuClick}
              color="primary"
              className="rounded-lg p-2 transition-transform duration-200 hover:scale-105 lg:hidden"
            >
              <HiMenu className="text-text" size={20} />
            </Button>

            <NavbarBrand href="#" className="flex justify-center lg:hidden">
              <Image
                src={Logo}
                alt="Accountflow logo"
                width={130}
                height={30}
                className="transition-transform duration-200 hover:scale-105"
              />
            </NavbarBrand>
          </div>

          <div className="flex md:order-2">
            <Dropdown
              arrowIcon={true}
              inline
              label={
                <div className="group cursor-pointer">
                  <Avatar
                    alt="User settings"
                    rounded
                    className="group-hover:ring-offset-muted-foreground ring-2 ring-transparent transition-all duration-200"
                    size="sm"
                  />
                </div>
              }
            >
              <div className="bg-surface rounded-lg px-1 pb-2">
                <DropdownHeader className="bg-surface">
                  <span className="text-text block text-sm font-medium">Matheus Bruckmann</span>
                  <span className="text-text-muted block truncate text-xs">matheusmorilha04@gmail.com</span>
                </DropdownHeader>
                <DropdownDivider className="border-border mx-auto w-[90%] opacity-30" />
                <DropdownItem className="text-foreground cursor-pointer px-6 transition-colors duration-200">
                  <span className="text-foreground font-medium">Meu Perfil</span>
                </DropdownItem>
                <DropdownDivider className="border-border mx-auto w-[90%] opacity-30" />
                <ThemeToggle />
                <DropdownDivider className="border-border mx-auto w-[90%] opacity-30" />
                <DropdownItem
                  onClick={handleLogout}
                  className="text-foreground cursor-pointer px-6 transition-colors duration-200"
                >
                  <span className="text-foreground font-medium">Sair</span>
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
        </Navbar>
      </ThemeProvider>
    </ClientOnly>
  );
}
