/**
 * ImpersonacaoBanner.jsx
 *
 * Faixa vermelha no topo indicando que o usuario esta em modo de impersonacao.
 * Bloqueia acoes destrutivas e permite reverter ao usuario original.
 */

import { useAuth } from '../../hooks/useAuth.js';

export function ImpersonacaoBanner({ onReverter }) {
  const { isImpersonating, user, originalUser } = useAuth();

  if (!isImpersonating) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-[99999] w-full bg-red-600 text-white px-4 py-2.5 flex items-center justify-between gap-4 shadow-lg"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {/* Icone de olho */}
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
               -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>
          Modo somente leitura — Visualizando como{' '}
          <strong>{user?.nome || user?.username}</strong>
          {originalUser && (
            <span className="opacity-80 ml-1 text-xs">
              (voce e {originalUser.nome || originalUser.username})
            </span>
          )}
        </span>
      </div>

      <button
        onClick={onReverter}
        className="shrink-0 bg-white text-red-700 hover:bg-red-50 font-semibold text-xs px-3 py-1.5 rounded-md transition-colors"
      >
        Sair da visualizacao
      </button>
    </div>
  );
}
