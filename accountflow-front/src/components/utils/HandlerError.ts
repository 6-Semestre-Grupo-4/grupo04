import { AxiosError } from 'axios';

export function handleApiError(error: unknown, defaultMessage: string): never {
  if (error instanceof AxiosError) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }

    if (error.response) {
      const status = error.response.status;
      const text = error.response.statusText || 'Erro desconhecido';

      throw new Error(`${defaultMessage}: ${status} - ${text}`);
    }
  }

  console.error(defaultMessage, error);
  throw new Error(defaultMessage);
}
