import { useCallback, type FC, type ReactNode, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/useAuth.js";
import logoObraIntegrada from "../assets/logo-obra-integrada.png";

// ─── Ícones inline (SVG) para evitar dependências extras ────────────────────

const Icon = ({ path, d2 }: { path?: string; d2?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {path && <path d={path} />}
    {d2 && <path d={d2} />}
  </svg>
);

const icons = {
  dashboard:  <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  obras:      <Icon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
  etapas:     <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  materiais:  <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  equipe:     <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  clientes:   <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  financeiro: <Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  documentos: <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  agenda:     <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  perfil:     <Icon path="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  usuarios:   <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
};

type NavItem = { name: string; icon: ReactNode; path: string; permissao?: string; badge?: string };
type NavGroup = { label: string; items: NavItem[] };

const AppSidebar: FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { hasPermissao } = useAuth();
  const location = useLocation();
  const [tooltip, setTooltip] = useState<{ name: string; y: number } | null>(null);

  const isOpen = isExpanded || isMobileOpen;

  const navGroups = useMemo<NavGroup[]>(() => {
    const allGroups: NavGroup[] = [
      {
        label: "Canteiro",
        items: [
          { icon: icons.dashboard, name: "Painel",       path: "/dashboard" },
          { icon: icons.obras,     name: "Obras",        path: "/obras",     permissao: "ver_obras", badge: "8" },
          { icon: icons.agenda,    name: "Cronograma",   path: "/calendar",  permissao: "ver_tarefas" },
          { icon: icons.documentos, name: "Documentos",  path: "/documentos", permissao: "ver_diario" },
        ],
      },
      {
        label: "Gestão",
        items: [
          { icon: icons.materiais,  name: "Materiais",  path: "/materiais",  permissao: "ver_obras", badge: "3" },
          { icon: icons.financeiro, name: "Orçamento",  path: "/financeiro", permissao: "ver_financeiro" },
          { icon: icons.equipe,     name: "Funcionários", path: "/equipe",     permissao: "ver_equipe" },
          { icon: icons.usuarios,   name: "Gestão RH",  path: "/rh",         permissao: "ver_rh" },
        ],
      },
      {
        label: "Plataforma",
        items: [
          { icon: icons.clientes, name: "Clientes", path: "/clientes", permissao: "gerenciar_clientes" },
        ],
      },
      {
        label: "Conta",
        items: [
          { icon: icons.perfil, name: "Minha Conta", path: "/profile", permissao: "ver_perfil" },
        ],
      },
    ];

    return allGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => !item.permissao || hasPermissao(item.permissao)),
      }))
      .filter(group => group.items.length > 0);
  }, [hasPermissao]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  return (
    <>
      {/* Backdrop mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col
          bg-sidebar border-r border-sidebar-border text-sidebar-foreground
          transition-all duration-200 ease-in-out
          ${isOpen ? "w-[260px]" : "w-[70px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── Brand ──────────────────────────────────────────────────────── */}
        <div className="flex h-16 items-center justify-between px-4 shrink-0">
          {isOpen ? (
            <Link to="/" className="flex items-center gap-2.5 rounded-md focus:outline-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
                <img src={logoObraIntegrada} alt="Logo" className="h-[22px] w-[22px] object-contain" />
              </div>
              <div className="leading-tight text-left">
                <p className="text-sm font-semibold text-foreground">
                  Obra Integrada
                </p>
                <p className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-tighter">
                  Gestão de obras
                </p>
              </div>
            </Link>
          ) : (
            <Link to="/" className="mx-auto focus:outline-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <img src={logoObraIntegrada} alt="Logo" className="h-[22px] w-[22px] object-contain" />
              </div>
            </Link>
          )}

          {isMobileOpen && (
            <button
              onClick={toggleMobileSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden focus:outline-none"
              aria-label="Fechar menu"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Itens de navegação ──────────────────────────────────────── */}
        <nav className={`flex-1 ${isOpen ? 'overflow-y-auto' : 'overflow-y-hidden'} no-scrollbar py-4 px-1`}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {/* Rótulo da categoria */}
              {isOpen ? (
                <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/60 text-left">
                  {group.label}
                </p>
              ) : (
                <div className="mx-3 mb-1 border-t border-sidebar-border" />
              )}

              <ul>
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        onMouseEnter={(e) => {
                          if (!isOpen) {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setTooltip({ name: item.name, y: rect.top + rect.height / 2 });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        className={`
                          relative flex items-center gap-2.5 mx-2 my-0.5 px-2.5 py-2 rounded-md
                          text-sm font-medium transition-colors group
                          ${active
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "font-normal text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                          }
                          ${!isOpen ? "justify-center px-0 py-2.5" : ""}
                        `}
                      >
                        <span className={`shrink-0 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"}`}>
                          {item.icon}
                        </span>

                        {isOpen && (
                          <span className="truncate flex-1 text-left">{item.name}</span>
                        )}

                        {isOpen && item.badge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent px-1.5 text-[10px] font-bold text-sidebar-foreground/70">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Rodapé da sidebar ───────────────────────────────────────── */}
        {isOpen && (
          <div className="shrink-0 px-4 py-3 border-t border-sidebar-border text-center bg-sidebar">
             <div className="mb-2">
                <p className="text-[10px] font-black text-sidebar-foreground/40 uppercase tracking-widest leading-none">Status</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <p className="text-[8px] font-bold text-sidebar-foreground/60 uppercase">Sistema Online</p>
                </div>
             </div>
            <p className="text-[9px] text-sidebar-foreground/50 font-medium">
              © {new Date().getFullYear()} Obra Integrada
            </p>
          </div>
        )}
      </aside>

      {/* Tooltip para modo recolhido */}
      {tooltip && !isOpen && (
        <div
          className="fixed z-[9999] left-[78px] px-2 py-1 rounded bg-slate-900 dark:bg-slate-800 text-white text-xs whitespace-nowrap shadow-lg pointer-events-none border border-slate-200 dark:border-gray-800"
          style={{ top: tooltip.y, transform: "translateY(-50%)" }}
        >
          {tooltip.name}
        </div>
      )}
    </>
  );
};

export default AppSidebar;
