import api from '@/services/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

export const login = async ({
  username,
  password,
}: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/signin', {
    username: username,
    password: password,
  });
  return response.data;
}