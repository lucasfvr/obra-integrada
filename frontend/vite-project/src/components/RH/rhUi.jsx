import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    ATIVO: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    AFASTADO: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    FERIAS: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    DESLIGADO: 'bg-red-500/15 text-red-700 dark:text-red-400',
    INATIVO: 'bg-muted text-muted-foreground',
    ARQUIVADO: 'bg-muted text-muted-foreground',
    Válido: 'bg-emerald-500/15 text-emerald-700',
    Vencido: 'bg-red-500/15 text-red-700',
    'A Expirar': 'bg-amber-500/15 text-amber-700',
    Completa: 'bg-emerald-500/15 text-emerald-700',
    Parcial: 'bg-amber-500/15 text-amber-700',
    Pendente: 'bg-amber-500/15 text-amber-700',
    Ativa: 'bg-emerald-500/15 text-emerald-700',
    PENDENTE: 'bg-amber-500/15 text-amber-700',
<<<<<<< HEAD
    APROVADO: 'bg-emerald-500/15 text-emerald-700',
    Pago: 'bg-emerald-500/15 text-emerald-700',
=======
    APROVADO: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    Pago: 'bg-emerald-500/15 text-emerald-700',
    ABERTA: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    PAUSADA: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    FECHADA: 'bg-red-500/15 text-red-700 dark:text-red-400',
    NOVO: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    EM_ANALISE: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    ENTREVISTA: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
    REPROVADO: 'bg-red-500/15 text-red-700 dark:text-red-400',
    DESISTIU: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400',
    AGENDADA: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    REALIZADA: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    CANCELADA: 'bg-red-500/15 text-red-700 dark:text-red-400',
    NO_SHOW: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
>>>>>>> de3e7b597ac8942d033682c7a44bce614241ef4f
  };
  const cls = map[status] || 'bg-muted text-muted-foreground';
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export function Field({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value ?? '—'}</p>
    </div>
  );
}

export function SectionCard({ title, children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 shadow-sm ${className}`}>
      {title && (
        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">{title}</h4>
      )}
      {children}
    </div>
  );
}

export function InfoGrid({ fields, cols = 2 }) {
  const gridClass = cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';
  return (
    <div className={`grid ${gridClass} gap-4`}>
      {fields.map((f) => (
        <Field key={f.label} label={f.label} value={f.value} className={f.span ? 'sm:col-span-2' : ''} />
      ))}
    </div>
  );
}

export function DataTable({ columns, rows, emptyMessage = 'Nenhum registro encontrado' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 border-b border-border">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-accent/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-foreground">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function SideIndicatorCard({ icon: Icon, label, value, variant = 'default' }) {
  const variants = {
    default: 'border-border',
    success: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
  };
  return (
    <div className={`rounded-xl border p-4 ${variants[variant]}`}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={16} className="text-primary" />}
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

export function TimelineItem({ date, title, description }) {
  return (
    <div className="flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
        <div className="w-px flex-1 bg-border mt-2" />
      </div>
      <div className="flex-1 pb-2">
        <p className="text-xs font-mono text-muted-foreground mb-0.5">{date}</p>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

export function PageHeader({ icon: Icon, title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
