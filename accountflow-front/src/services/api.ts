import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1/';

// Cria uma instância do Axios
const api = axios.create({
  baseURL: API_URL,
});

// Adiciona um "interceptor" que roda antes de CADA requisição
api.interceptors.request.use(
  (config) => {
    // Pega o token do cookie
    const token = Cookies.get('auth_token');

    // Se o token existir, adiciona ao cabeçalho Authorization
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
