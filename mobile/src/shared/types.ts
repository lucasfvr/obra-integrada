export type User = {
  id: number;
  nome: string;
  username?: string | null;
  email?: string | null;
  role: string;
  id_cliente?: number | null;
};

export type Session = { token: string; user: User };

export type Obra = {
  id_obra: number;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
  tb_status?: { nome: string } | null;
};

export type Diario = {
  id_diario: number;
  descricao: string;
  data_registro: string;
  foto_url?: string | null;
  status_auditoria: string;
  justificativa_gps?: string | null;
  motivo_reprovacao?: string | null;
  autor?: { id: number; nome: string; funcao?: string | null };
};

export type Paginado<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

// LEGADO: AUTOMATICO indica classificacao geografica, nao aceite humano.
export function statusVisivel(value: string): { titulo: string; cor: string } {
  switch (value) {
    case 'AUTORIZADO':
    case 'APROVADO': return { titulo: 'Autorizado', cor: '#24774E' };
    case 'REPROVADO':
    case 'REJEITADO': return { titulo: 'Reprovado', cor: '#A1222B' };
    case 'AUTOMATICO': return { titulo: 'Classificação automática (revisar)', cor: '#976319' };
    default: return { titulo: 'Aguardando análise', cor: '#976319' };
  }
}

export function dataLegivel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR');
}
