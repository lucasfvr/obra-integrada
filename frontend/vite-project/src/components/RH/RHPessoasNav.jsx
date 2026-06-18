import React from 'react';
import { NavLink } from 'react-router';
import {
  Users, Building2, Layers, Network, Briefcase, ArrowRightLeft,
  Cake, History,
} from 'lucide-react';

const ITEMS = [
  { label: 'Colaboradores', path: '/rh/colaboradores', icon: Users },
  { label: 'Terceirizados', path: '/rh/terceirizados', icon: Building2 },
  { label: 'Equipes',       path: '/rh/equipes',       icon: Layers },
  { label: 'Organograma',   path: '/rh/organograma',   icon: Network },
  { label: 'Cargos',        path: '/rh/cargos',        icon: Briefcase },
  { label: 'Transferências',path: '/rh/transferencias',icon: ArrowRightLeft },
  { label: 'Aniversariantes',path:'/rh/aniversariantes',icon: Cake },
  { label: 'Histórico',     path: '/rh/historico-movimentacoes', icon: History },
];

/**
 * Sub-navegação horizontal do módulo RH > Pessoas.
 * Segue o padrão visual oficial (Padrao de Design - Dashboard Dinamico v1.2):
 * superficie `bg-card`, borda sutil `border-border`, raio `rounded-xl`,
 * estado ativo em `primary`, hover discreto, scrollable em mobile.
 */
export default function RHPessoasNav() {
  return (
    <nav
      aria-label="Navegação Pessoas"
      className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-elegant px-2 py-1.5">
        {ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
          >
            <Icon size={14} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
