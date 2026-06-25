import { type FC, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/useAuth.js";


// ─── Ícones SVG inline (sem dependência externa) ─────────────────────────────
const Icon = ({ path, d2, children }: { path?: string; d2?: string; children?: ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {path && <path d={path} />}
    {d2 && <path d={d2} />}
    {children}
  </svg>
);

const icons = {
  dashboard:   <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  obras: (
    <Icon>
      <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
      <path d="M10 15V9c0-1.66 1.34-3 3-3h1" />
      <path d="M14 6a3 3 0 0 1 3 3v6" />
    </Icon>
  ),
  cronograma:  <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  orcamento:   <Icon path="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  funcionarios:<Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  materiais:   <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  documentos:  <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  configuracoes:<Icon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  ajuda:       <Icon path="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
};

type NavItem = { name: string; icon: ReactNode; path: string; permissao?: string; badge?: string };

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar";

const AppSidebar: FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const { hasPermissao, user } = useAuth() as any;
  const location = useLocation();

  const mainNav: NavItem[] = [
    { 
      icon: icons.dashboard,    
      name: "Painel",        
      path: user?.role === 'RH' ? "/rh-dashboard" : "/dashboard" 
    },
    { icon: icons.obras,        name: "Obras",         path: "/obras",      permissao: "ver_obras",      badge: "8" },
    { icon: icons.cronograma,   name: "Cronograma",    path: "/calendar",   permissao: "ver_tarefas" },
    { icon: icons.orcamento,    name: "Orçamento",     path: "/financeiro", permissao: "ver_financeiro" },
    { icon: icons.funcionarios, name: "Funcionários",  path: "/equipe",     permissao: "ver_equipe" },
    { icon: icons.funcionarios, name: "RH",            path: "/rh-dashboard",         permissao: "ver_rh" },
    { icon: icons.funcionarios, name: "Controle de Acesso", path: "/rh-avancado", permissao: "gerenciar_usuarios" },
    ...(user?.role === 'RH' || user?.email === 'rh@vanguarda.com.br' ? [
      { icon: icons.ajuda, name: "Teste 1", path: "/test-1" },
      { icon: icons.ajuda, name: "Teste 2", path: "/test-2" },
      { icon: icons.ajuda, name: "Teste 3", path: "/test-3" },
    ] : []),
    { icon: icons.materiais,    name: "Materiais",     path: "/materiais",  permissao: "ver_obras",      badge: "3" },
    { icon: icons.documentos,   name: "Documentos",    path: "/documentos", permissao: "ver_diario" },
  ].filter(item => !item.permissao || hasPermissao(item.permissao));

  const bottomNav: NavItem[] = [
    { icon: icons.configuracoes, name: "Configurações", path: "/profile" },
    { icon: icons.ajuda,         name: "Ajuda",         path: "/ajuda" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
        aria-current={active ? "page" : undefined}
        className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${focusRing} ${
          active
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            : "font-normal text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        }`}
      >
        <span className={`shrink-0 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"}`}>
          {item.icon}
        </span>
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent px-1.5 text-[11px] font-medium text-sidebar-foreground/70">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={toggleMobileSidebar}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navegação principal"
      >
        {/* ── Brand ──────────────────────────────────────────────────── */}
        <div className="flex h-16 items-center justify-between px-4 shrink-0">
          <Link
            to="/"
            onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
            className={`flex items-center gap-2.5 rounded-md ${focusRing}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm shrink-0">
                OI
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-sm font-semibold text-foreground">Obra Integrada</span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Gestão de obras</span>
              </div>
            </div>
          </Link>

          {/* Botão fechar (mobile) */}
          <button
            onClick={toggleMobileSidebar}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden ${focusRing}`}
            aria-label="Fechar menu"
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Navegação principal ─────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-0.5">
            {mainNav.map(item => (
              <li key={item.name}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Rodapé ─────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
          <ul className="flex flex-col gap-0.5">
            {bottomNav.map(item => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
                  className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground ${focusRing}`}
                >
                  <span className="shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
