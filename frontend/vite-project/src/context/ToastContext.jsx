/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(undefined);

// ── Ícones inline ──────────────────────────────────────────────────────────────
const Icons = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

const typeStyles = {
  success: {
    container: 'border-emerald-500/30 bg-card',
    icon: 'text-emerald-500',
    bar: 'bg-emerald-500',
  },
  error: {
    container: 'border-destructive/30 bg-card',
    icon: 'text-destructive',
    bar: 'bg-destructive',
  },
  warning: {
    container: 'border-warning/30 bg-card',
    icon: 'text-warning',
    bar: 'bg-warning',
  },
  info: {
    container: 'border-primary/30 bg-card',
    icon: 'text-primary',
    bar: 'bg-primary',
  },
};

// ── Componente individual de Toast ────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const styles = typeStyles[toast.type] || typeStyles.info;

  return (
    <div
      className={`
        relative flex items-start gap-3 w-full max-w-sm
        rounded-xl border shadow-lg p-4 pr-10
        ${styles.container}
        animate-slide-up
        transition-all duration-300
      `}
      role="alert"
    >
      {/* Barra colorida lateral */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${styles.bar}`} />

      {/* Ícone */}
      <span className={`shrink-0 mt-0.5 ${styles.icon}`}>
        {Icons[toast.type]}
      </span>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-foreground leading-snug mb-0.5">
            {toast.title}
          </p>
        )}
        <p className="text-sm text-muted-foreground leading-snug break-words">
          {toast.message}
        </p>
      </div>

      {/* Botão fechar */}
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fechar notificação"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Modal de confirmação ───────────────────────────────────────────────────────
function ConfirmModal({ confirm, onResolve }) {
  if (!confirm) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        {/* Header com ícone */}
        <div className="flex flex-col items-center gap-3 p-6 pb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            confirm.type === 'danger'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary'
          }`}>
            {confirm.type === 'danger' ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-foreground mb-1">
              {confirm.title || 'Confirmar ação'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {confirm.message}
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 p-4 pt-2 border-t border-border bg-muted/20">
          <button
            onClick={() => onResolve(false)}
            className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg transition-colors hover:bg-muted"
          >
            {confirm.cancelLabel || 'Cancelar'}
          </button>
          <button
            onClick={() => onResolve(true)}
            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              confirm.type === 'danger'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {confirm.confirmLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const confirmResolveRef = useRef(null);
  const idRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, type, title, message }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  // Escuta eventos globais (para uso fora do contexto React, ex: AuthContext)
  React.useEffect(() => {
    const handler = (e) => addToast(e.detail);
    window.addEventListener('obra:toast', handler);
    return () => window.removeEventListener('obra:toast', handler);
  }, [addToast]);

  // Atalhos tipados
  const toast = {
    success: (message, title) => addToast({ type: 'success', message, title }),
    error: (message, title) => addToast({ type: 'error', message, title }),
    warning: (message, title) => addToast({ type: 'warning', message, title }),
    info: (message, title) => addToast({ type: 'info', message, title }),
  };

  // Substitui window.confirm
  const showConfirm = useCallback(({ title, message, confirmLabel, cancelLabel, type = 'default' }) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirm({ title, message, confirmLabel, cancelLabel, type });
    });
  }, []);

  const handleConfirmResolve = useCallback((result) => {
    setConfirm(null);
    if (confirmResolveRef.current) {
      confirmResolveRef.current(result);
      confirmResolveRef.current = null;
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showConfirm }}>
      {children}

      {/* Container de Toasts */}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[99998] flex flex-col gap-3 items-end pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onRemove={removeToast} />
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* Modal de Confirmação */}
      <ConfirmModal confirm={confirm} onResolve={handleConfirmResolve} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
