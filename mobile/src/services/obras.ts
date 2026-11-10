import { apiRequest } from './api';
import type { Obra, Paginado } from '../shared/types';

export async function listarObras(token: string): Promise<Obra[]> {
  const all: Obra[] = [];
  for (let page = 1; page <= 20; page++) {
    const result = await apiRequest<Paginado<Obra>>('/obras?page=' + page + '&limit=30', { token });
    if (!Array.isArray(result.data)) throw new Error('Formato inesperado da lista de obras.');
    all.push(...result.data);
    if (page >= (result.meta?.totalPages || 1)) break;
  }
  return all;
}
