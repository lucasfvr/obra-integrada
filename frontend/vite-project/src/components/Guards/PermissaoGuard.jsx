/**
 * PermissaoGuard.jsx
 *
 * Componente que renderiza filhos somente se o usuario tiver a permissao.
 * Substitui verificacoes inline espalhadas pelo codigo.
 *
 * Uso:
 *   <PermissaoGuard permissao="criar_diario">
 *     <BotaoCriarEntrada />
 *   </PermissaoGuard>
 *
 *   <PermissaoGuard roles={['MASTER', 'ADMIN']}>
 *     <PainelAdmin />
 *   </PermissaoGuard>
 *
 *   <PermissaoGuard permissao="ver_financeiro" fallback={<p>Sem acesso</p>}>
 *     <Financeiro />
 *   </PermissaoGuard>
 */

import { useAuth } from '../../hooks/useAuth.js';
import { Navigate } from 'react-router';
import toast from 'react-hot-toast';

/**
 * @param {object} props
 * @param {string}   [props.permissao]  - Permissao especifica (ex: 'criar_diario')
 * @param {string[]} [props.roles]      - Lista de roles permitidos (alternativa)
 * @param {React.ReactNode} [props.fallback] - O que renderizar se nao tiver acesso
 * @param {boolean} [props.redirectToRestricted] - Se true, navega para /restricted em caso de erro
 * @param {React.ReactNode} props.children
 */
export function PermissaoGuard({ 
  permissao, 
  roles, 
  fallback = null, 
  redirectToRestricted = false,
  children 
}) {
  const { hasPermissao, hasRole } = useAuth();

  let temAcesso = false;

  if (permissao) {
    temAcesso = hasPermissao(permissao);
  } else if (roles && roles.length > 0) {
    temAcesso = hasRole(...roles);
  } else {
    temAcesso = true; // sem restricao
  }

  if (!temAcesso) {
    if (redirectToRestricted) return <Navigate to="/restricted" replace />;
    return fallback;
  }
  
  return children;
}

/**
 * Componente que desabilita (nao esconde) botoes/acoes em modo somente leitura.
 * Util para impersonacao e visibilidade do Cliente.
 */
export function ReadOnlyGuard({ children }) {
  const { isImpersonating, user } = useAuth();
  
  // Cliente e Admin em Impersonate sao sempre ReadOnly
  const isReadOnly = isImpersonating || user?.role === 'CLIENTE' || user?.role === 'CONVIDADO_CLIENTE';

  if (!isReadOnly) return children;

  const handleBlockedClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.error('Modo Visualização: Ação desabilitada por segurança', {
      icon: '🔒',
      style: {
        borderRadius: '12px',
        background: '#1e293b',
        color: '#fff',
        fontWeight: '600',
        fontSize: '14px'
      },
    });
  };

  return (
    <div
      className="relative cursor-not-allowed group"
      title="Acao bloqueada no modo de visualizacao"
      onClickCapture={handleBlockedClick}
    >
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      {/* Overlay invisivel para capturar cliques sem disparar o children */}
      <div className="absolute inset-0 z-10" />
    </div>
  );
}

