import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const TOKEN_KEY = 'forgeaudit:token';
export const USER_KEY = 'forgeaudit:user';

// sessionStorage: a sessão morre ao fechar a aba (mais adequado a sistemas regulados).
export const tokenStorage = {
  get: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string): void => sessionStorage.setItem(TOKEN_KEY, token),
  clear: (): void => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** O AuthContext registra aqui a ação de logout para o interceptor chamar em caso de 401. */
export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null): void => {
  unauthorizedHandler = handler;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginCall = error.config?.url?.includes('/auth/login');
    // 401 no login = credencial inválida (tratado na tela). Nos demais = sessão expirada.
    if (error.response?.status === 401 && !isLoginCall) {
      tokenStorage.clear();
      if (unauthorizedHandler) unauthorizedHandler();
      else window.location.assign('/login?reason=expired');
    }
    return Promise.reject(error);
  },
);

export interface ApiErrorBody {
  message?: string;
}

export const getErrorMessage = (error: unknown, fallback = 'Não foi possível concluir a operação.'): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return 'Sem conexão com o servidor. Verifique a rede e tente novamente.';
    return error.response.data?.message ?? fallback;
  }
  return fallback;
};
