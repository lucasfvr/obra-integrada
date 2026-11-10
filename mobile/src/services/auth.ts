import { apiRequest } from './api';
import type { User } from '../shared/types';

type LoginResponse = { token: string; user: User };

export async function login(username: string, password: string): Promise<LoginResponse> {
  // Contrato REAL do userController.js: username/password, nao email/senha.
  return apiRequest<LoginResponse>('/users/login', {
    method: 'POST',
    json: { username: username.trim(), password }
  });
}

export async function validateSession(token: string): Promise<User> {
  const response = await apiRequest<{ usuario: User }>('/users/profile', { token });
  if (!response?.usuario?.id) throw new Error('Sessão sem dados do usuário.');
  return response.usuario;
}
