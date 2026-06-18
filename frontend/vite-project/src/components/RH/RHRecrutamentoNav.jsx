import React from 'react';
import { NavLink } from 'react-router';
import {
  Briefcase, UserCheck, Award, MessageSquare
} from 'lucide-react';

const ITEMS = [
  { label: 'Vagas',            path: '/rh/vagas',          icon: Briefcase },
  { label: 'Candidatos',       path: '/rh/candidatos',     icon: UserCheck },
  { label: 'Banco de Talentos', path: '/rh/banco-talentos', icon: Award },
  { label: 'Entrevistas',      path: '/rh/entrevistas',    icon: MessageSquare },
];

/**
 * Sub-navegação horizontal do módulo RH > Recrutamento.
 * Segue o padrão visual do Obra Integrada:
 * superfície `bg-card`, borda sutil `border-border`, raio `rounded-xl`,
 * estado ativo em `primary`, hover discreto, scrollable em mobile.
 */
export default function RHRecrutamentoNav() {
  return (
    <nav
      aria-label="Navegação Recrutamento"
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
