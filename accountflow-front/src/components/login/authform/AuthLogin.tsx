'use client';
// === 1. IMPORTAR HOOKS E SERVIÇOS ===
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Checkbox, Label, FloatingLabel } from 'flowbite-react';
import Cookies from 'js-cookie';
import { login } from '@/services/authService';

const AuthLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login({ username, password });

      if (data.token) {
        const cookieOptions: { path: string; expires?: number } = {
          path: '/',
        };
        if (rememberMe) {
          cookieOptions.expires = 7;
        }

        Cookies.set('auth_token', data.token, cookieOptions);

        const redirectedFrom = searchParams.get('redirectedFrom');

        // Redireciona para a página de onde o usuário veio,
        // ou para a home ('/') se ele veio direto para o login.
        // Usar router.replace() é melhor que router.push() aqui,
        // pois impede o usuário de clicar em "voltar" e
        // retornar à página de login.
        router.replace(redirectedFrom || '/');
      } else {
        setError('Token não recebido do servidor.');
      }
    } catch (err) {
      setError('Usuário ou senha inválidos.');
      console.error('Erro de autenticação:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="text-black">
        {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}

        <div className="mb-4">
          <FloatingLabel
            variant="standard"
            label="Username"
            placeholder="Username"
            id="Username"
            type="text"
            sizing="md"
            required
            className="form-control form-rounded-xl"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <FloatingLabel
            variant="standard"
            label="Password"
            placeholder="Password"
            id="userpwd"
            type="password"
            sizing="md"
            required
            className="form-control form-rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="my-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="accept"
              className="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <Label htmlFor="accept" className="cursor-pointer font-normal opacity-90">
              Remember this Device
            </Label>
          </div>
        </div>
        <Button
          type="submit"
          color={'primary'}
          className="bg-secondary hover:bg-secondary-hover active:bg-secondary-hover w-full rounded-xl text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
