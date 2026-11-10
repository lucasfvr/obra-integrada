import type { User } from './types';

const ROLES_CRIAR_DIARIO = new Set([
  'ADMIN_MASTER', 'PROPRIETARIO', 'RESPONSAVEL', 'ESTAGIARIO', 'EMPREITEIRA'
]);

// Apenas visibilidade no app; o servidor continua sendo a autoridade.
export function podeRegistrarDiario(user: User | null | undefined): boolean {
  return !!user && ROLES_CRIAR_DIARIO.has(user.role);
}
