import { useCallback, type FC, type ReactNode, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/useAuth.js";
import { isPlataforma, getProfile } from "../utils/permissions.js";

// ─── Ícones inline (SVG) para evitar dependências extras ────────────────────

const Icon = ({ path, d2 }: { path?: string; d2?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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

type NavItem = { name: string; icon: ReactNode; path: string; };
type NavGroup = { label: string; items: NavItem[] };

const AppSidebar: FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, role } = useAuth();
  const location = useLocation();
  const [tooltip, setTooltip] = useState<{ name: string; y: number } | null>(null);

  const isOpen = isExpanded || isMobileOpen;
  
  const userRole = user?.role || role;
  const userFuncao = user?.funcao;
  const profile = useMemo(() => getProfile(userRole, userFuncao), [userRole, userFuncao]);

  const navGroups = useMemo<NavGroup[]>(() => {
    // ── Nível 1: Plataforma/Administrador ─────────────────────────────────────
    if (profile === 'ADMIN_MASTER') {
      return [
        {
          label: "Governança",
          items: [
            { icon: icons.dashboard,  name: "Dashboard Master", path: "/dashboard" },
            { icon: icons.clientes,   name: "Gestão Clientes",  path: "/clientes" },
            { icon: icons.usuarios,   name: "Gestão Usuários",  path: "/dashboard" }, // Impersonação via Dash
          ],
        }
      ];
    }

    // ── Nível 2: Proprietário (Dono da Empresa) ───────────────────────────────
    if (profile === 'PROPRIETARIO') {
      return [
        {
          label: "Empresa",
          items: [
            { icon: icons.dashboard,  name: "Visão Geral",    path: "/dashboard" },
            { icon: icons.obras,      name: "Minhas Obras",   path: "/obras"     },
          ],
        },
        {
          label: "Gestão",
          items: [
            { icon: icons.financeiro, name: "Financeiro",     path: "/financeiro" },
            { icon: icons.documentos, name: "Documentos",     path: "/documentos" },
          ],
        },
        {
          label: "Conta",
          items: [
            { icon: icons.perfil,     name: "Minha Conta",   path: "/profile"   },
          ],
        },
      ];
    }

    // ── Nível 2: Operacional (Canteiro de Obras) ──────────────────────────────
    const groups: NavGroup[] = [];

    // Grupo Canteiro (Geral para todos da obra)
    const canteiroItems = [
      { icon: icons.dashboard,  name: "Visão Geral",  path: "/dashboard" },
    ];
    
    if (['RESPONSAVEL', 'MESTRE', 'CLIENTE', 'CONVIDADO_CLIENTE'].includes(profile)) {
      canteiroItems.push({ icon: icons.agenda, name: "Agenda", path: "/calendar" });
    }
    
    canteiroItems.push({ icon: icons.obras, name: "Minhas Obras", path: "/obras" });
    
    groups.push({ label: "Canteiro", items: canteiroItems });

    // Grupo Gestão (Administrativo da Obra)
    if (['RESPONSAVEL', 'MESTRE', 'CLIENTE', 'CONVIDADO_CLIENTE'].includes(profile)) {
      const gestaoItems = [
        { icon: icons.documentos, name: "Documentos", path: "/documentos" },
      ];
      
      if (profile !== 'MESTRE') {
        gestaoItems.push({ icon: icons.materiais, name: "Materiais", path: "/materiais" });
        gestaoItems.push({ icon: icons.financeiro, name: "Financeiro", path: "/financeiro" });
      }

      groups.push({ label: "Gestão", items: gestaoItems });
    }

    // Grupo Equipe / Conta
    const equipeItems = [];
    if (['RESPONSAVEL', 'MESTRE', 'CLIENTE', 'CONVIDADO_CLIENTE'].includes(profile)) {
       equipeItems.push({ icon: icons.equipe, name: "Equipe", path: "/equipe" });
    }
    equipeItems.push({ icon: icons.perfil, name: "Minha Conta", path: "/profile" });

    groups.push({ label: "Usuário", items: equipeItems });

    return groups;
  }, [profile]);


  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  return (
    <>
      {/* Backdrop mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col
          bg-gray-950
          transition-all duration-200 ease-in-out
          ${isOpen ? "w-[260px]" : "w-[70px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-16 px-3 shrink-0">
          {isOpen && (
            <Link to="/" className="flex items-center gap-2 overflow-hidden">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 font-bold text-gray-950 text-sm shrink-0">OI</div>
              <span className="text-sm font-semibold text-white whitespace-nowrap">Obra Integrada</span>
            </Link>
          )}
          {!isOpen && (
            <Link to="/" className="mx-auto">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 font-bold text-gray-950 text-sm">OI</div>
            </Link>
          )}
        </div>

        {/* ── Itens de navegação ──────────────────────────────────────── */}
        <nav className={`flex-1 ${isOpen ? 'overflow-y-auto' : 'overflow-y-hidden'} no-scrollbar py-4 px-1`}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {/* Rótulo da categoria */}
              {isOpen ? (
                <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {group.label}
                </p>
              ) : (
                <div className="mx-3 mb-1 border-t border-gray-800" />
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
                          relative flex items-center gap-3 mx-2 my-0.5 px-3 py-2 rounded-lg
                          text-sm font-medium transition-all duration-150 group
                          ${active
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "text-gray-400 hover:bg-gray-800 hover:text-gray-100 border border-transparent"
                          }
                          ${!isOpen ? "justify-center px-0 py-2.5" : ""}
                        `}
                      >
                        {/* Active bar */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r-full" />
                        )}

                        <span className={`shrink-0 ${active ? "text-amber-400" : "text-gray-500 group-hover:text-gray-300"}`}>
                          {item.icon}
                        </span>

                        {isOpen && (
                          <span className="truncate">{item.name}</span>
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
          <div className="shrink-0 px-4 py-3 border-t border-gray-800 text-center">
             <div className="mb-2">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Status</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <p className="text-[8px] font-bold text-gray-500 uppercase">Sistema Online</p>
                </div>
             </div>
            <p className="text-[9px] text-gray-700 font-medium">
              © {new Date().getFullYear()} Obra Integrada
            </p>
          </div>
        )}
      </aside>

      {/* Tooltip para modo recolhido */}
      {tooltip && !isOpen && (
        <div
          className="fixed z-[9999] left-[78px] px-2 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap shadow-lg pointer-events-none border border-gray-700"
          style={{ top: tooltip.y, transform: "translateY(-50%)" }}
        >
          {tooltip.name}
        </div>
      )}
    </>
  );
};

export default AppSidebar;
