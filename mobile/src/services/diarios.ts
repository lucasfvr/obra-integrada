import { apiRequest } from './api';
import type { Diario, Paginado } from '../shared/types';

export type Photo = { uri: string; mimeType?: string | null; fileName?: string | null };

export async function listarDiarios(token: string, obraId: number, page = 1): Promise<Paginado<Diario>> {
  return apiRequest<Paginado<Diario>>('/obras/' + obraId + '/diario?page=' + page + '&limit=20', { token });
}

export async function criarDiario(
  token: string,
  obraId: number,
  args: { descricao: string; clima: string; efetivo: string; ocorrencias: string; foto: Photo | null }
): Promise<{ entrada: { id_diario: number }; mensagem: string }> {
  // Os campos estruturados requerem a migracao do backend da mesma branch.
  const form = new FormData();
  form.append('descricao', args.descricao.trim());
  if (args.clima.trim()) form.append('clima', args.clima.trim());
  if (args.efetivo.trim()) form.append('efetivo', args.efetivo.trim());
  if (args.ocorrencias.trim()) form.append('ocorrencias', args.ocorrencias.trim());
  if (args.foto) {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(args.foto.mimeType || '')) {
      throw new Error('Tipo de imagem não suportado pela API.');
    }
    form.append('foto', {
      uri: args.foto.uri,
      type: args.foto.mimeType || 'image/jpeg',
      name: args.foto.fileName || ('diario-' + Date.now() + '.jpg')
    } as unknown as Blob);
  }
  // NUNCA incluir status_auditoria no envio. Ele deve ser definido pela API/DB.
  return apiRequest('/obras/' + obraId + '/diario', { token, method: 'POST', form });
}
