import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import {
  Users, Briefcase, UserPlus, Clock, BookOpen, Shield, Umbrella,
  DollarSign, Layers, BarChart3, Home, ChevronDown, ChevronRight, Settings, Menu, X, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRHSidebar } from '../context/RHSidebarContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const iconMap = {
  Home, Users, Briefcase, UserPlus, Clock, BookOpen, Shield, Umbrella,
  DollarSign, Layers, BarChart3
};

export default function RHSidebar() {
  const { user, logout } = useAuth();
  const { collapsed, toggleCollapse } = useRHSidebar();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState('pessoas');

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard RH',
      path: '/rh-dashboard',
      icon: 'Home'
    },
    {
      id: 'pessoas',
      label: 'Pessoas',
      icon: 'Users',
      submenu: [
        { label: 'Colaboradores', path: '/rh/colaboradores' },
        { label: 'Terceirizados', path: '/rh/terceirizados' },
        { label: 'Equipes', path: '/rh/equipes' },
        { label: 'Organograma', path: '/rh/organograma' },
      ]
    },
    {
      id: 'recrutamento',
      label: 'Recrutamento',
      icon: 'Briefcase',
      submenu: [
        { label: 'Vagas', path: '/rh/vagas' },
        { label: 'Candidatos', path: '/rh/candidatos' },
        { label: 'Banco de Talentos', path: '/rh/banco-talentos' },
        { label: 'Entrevistas', path: '/rh/entrevistas' }
      ]
    },
    {
      id: 'admissoes',
      label: 'Admissões',
      icon: 'UserPlus',
      submenu: [
        { label: 'Novas Contratações', path: '/rh/contratacoes' },
        { label: 'Documentação', path: '/rh/documentacao' },
        { label: 'Assinaturas', path: '/rh/assinaturas' },
        { label: 'Integração', path: '/rh/integracao' }
      ]
    },
    {
      id: 'jornada',
      label: 'Jornada',
      icon: 'Clock',
      submenu: [
        { label: 'Ponto', path: '/rh/ponto' },
        { label: 'Escalas', path: '/rh/escalas' },
        { label: 'Banco de Horas', path: '/rh/banco-horas' },
        { label: 'Ocorrências', path: '/rh/ocorrencias' }
      ]
    },
    {
      id: 'desenvolvimento',
      label: 'Desenvolvimento',
      icon: 'BookOpen',
      submenu: [
        { label: 'Treinamentos', path: '/rh/treinamentos' },
        { label: 'Certificações', path: '/rh/certificacoes' },
        { label: 'Avaliações', path: '/rh/avaliacoes' },
        { label: 'Plano de Carreira', path: '/rh/carreira' }
      ]
    },
    {
      id: 'sst',
      label: 'SST',
      icon: 'Shield',
      submenu: [
        { label: 'ASO', path: '/rh/aso' },
        { label: 'Exames', path: '/rh/exames' },
        { label: 'EPIs', path: '/rh/epis' },
        { label: 'NR10', path: '/rh/nr10' },
        { label: 'NR35', path: '/rh/nr35' },
        { label: 'Alertas', path: '/rh/alertas' }
      ]
    },
    {
      id: 'beneficios',
      label: 'Benefícios e Férias',
      icon: 'Umbrella',
      submenu: [
        { label: 'Benefícios', path: '/rh/beneficios' },
        { label: 'Férias', path: '/rh/ferias' },
        { label: 'Licenças', path: '/rh/licencas' },
        { label: 'Afastamentos', path: '/rh/afastamentos' }
      ]
    },
    {
      id: 'folha',
      label: 'Folha',
      icon: 'DollarSign',
      submenu: [
        { label: 'Folha de Pagamento', path: '/rh/folha-pagamento' },
        { label: 'Holerites', path: '/rh/holerites' },
        { label: 'Encargos', path: '/rh/encargos' },
        { label: 'Resumos', path: '/rh/resumos' }
      ]
    },
    {
      id: 'alocacao',
      label: 'Alocação em Obras',
      icon: 'Layers',
      submenu: [
        { label: 'Equipes por Obra', path: '/rh/equipes-obra' },
        { label: 'Movimentações', path: '/rh/movimentacoes' },
        { label: 'Custos de Mão de Obra', path: '/rh/custos' },
        { label: 'Histórico', path: '/rh/historico' }
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: 'BarChart3',
      path: '/rh/relatorios'
    },
    ...(user?.username === 'wh' || user?.username === 'rh_manager' ? [{
      id: 'controle-acesso',
      label: 'Controle de Acesso',
      icon: 'Shield',
      path: '/rh/controle-acesso'
    }] : [])
  ];

  const toggleMenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  return (
    <aside className={`bg-card border-r border-border h-screen flex flex-col overflow-y-auto scrollbar-elegant transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Header */}
      <div className={`border-b border-border ${collapsed ? 'p-3' : 'p-6'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className={`flex items-center gap-3 ${collapsed ? 'hidden' : ''}`}>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              OI
            </div>
            <div>
              <h1 className="font-bold text-foreground">Obra Integrada</h1>
              <p className="text-xs text-muted-foreground">RH</p>
            </div>
          </div>
          <button
            onClick={toggleCollapse}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-foreground flex-shrink-0"
            title={collapsed ? 'Expandir' : 'Recolher'}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3">
        {menuItems.map((item) => {
          const IconComponent = iconMap[item.icon];
          return (
            <div key={item.id}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors group ${
                      collapsed ? 'justify-center' : ''
                    }`}
                    title={collapsed ? item.label : ''}
                  >
                    <span className="flex items-center gap-2 flex-1 min-w-0">
                      {IconComponent && <IconComponent size={18} className="flex-shrink-0" />}
                      {!collapsed && item.label}
                    </span>
                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform flex-shrink-0 ${
                          expandedMenu === item.id ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {expandedMenu === item.id && !collapsed && (
                    <div className="mt-1 ml-2 space-y-1 border-l border-border pl-3">
                      {item.submenu.map((subitem, idx) => (
                        <NavLink
                          key={idx}
                          to={subitem.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                            isActive(subitem.path)
                              ? 'text-primary bg-primary/10 font-semibold'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                          }`}
                        >
                          <ChevronRight size={14} className="flex-shrink-0" />
                          {subitem.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive: active }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? item.label : ''}
                >
                  {IconComponent && <IconComponent size={18} className="flex-shrink-0" />}
                  {!collapsed && item.label}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-border my-4"></div>

      {/* Bottom Menu */}
      <div className={`space-y-2 ${collapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? (theme === 'dark' ? 'Modo claro' : 'Modo escuro') : ''}
        >
          {theme === 'dark'
            ? <Sun size={18} className="flex-shrink-0" />
            : <Moon size={18} className="flex-shrink-0" />}
          {!collapsed && (theme === 'dark' ? 'Modo claro' : 'Modo escuro')}
        </button>
        <button
          onClick={() => toast('Favoritos — em breve')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Favoritos' : ''}
        >
          <BarChart3 size={18} className="flex-shrink-0" />
          {!collapsed && 'Favoritos'}
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Configurações' : ''}
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && 'Configurações'}
        </button>
      </div>

      {/* User Profile */}
      <div className={`border-t border-border ${collapsed ? 'p-2' : 'p-4'}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                {user?.nome?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.nome}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
            >
              Sair
            </button>
          </>
        ) : (
          <div className="flex justify-center">
            <div 
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity"
              title={user?.nome || 'User'}
            >
              {user?.nome?.charAt(0) || 'U'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
