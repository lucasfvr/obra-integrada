import { useEffect } from 'react';

/**
 * Trava o scroll do body enquanto o modal estiver aberto.
 * Restaura automaticamente ao fechar ou desmontar o componente.
 */
export function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLocked]);
}
