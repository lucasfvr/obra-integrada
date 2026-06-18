import React, { useState } from 'react';
import { GitBranch, ChevronDown, ChevronRight, Mail, Phone, Users } from 'lucide-react';
import { PageHeader, SectionCard } from '../../../components/RH/rhUi.jsx';

const ORGANOGRAMA = {
  id: 'dir',
  nome: 'Roberto Silva',
  cargo: 'Diretor Geral',
  gestor: null,
  equipe: 'Diretoria',
  contato: { email: 'roberto@empresa.com.br', telefone: '(11) 3000-0000' },
  children: [
    {
      id: 'eng',
      nome: 'Carlos Mendes',
      cargo: 'Gerente de Engenharia',
      gestor: 'Roberto Silva',
      equipe: 'Engenharia',
      contato: { email: 'carlos@empresa.com.br', telefone: '(11) 3000-0001' },
      children: [
        { id: 'eng1', nome: 'Fabio Rocha', cargo: 'Engenheiro Civil', gestor: 'Carlos Mendes', equipe: 'Projetos', contato: { email: 'fabio@empresa.com.br', telefone: '—' }, children: [] },
        { id: 'eng2', nome: 'Luciana Dias', cargo: 'Mestre de Obras', gestor: 'Carlos Mendes', equipe: 'Execução', contato: { email: 'luciana@empresa.com.br', telefone: '—' }, children: [] },
      ],
    },
    {
      id: 'rh',
      nome: 'Ana Paula',
      cargo: 'Gerente de RH',
      gestor: 'Roberto Silva',
      equipe: 'RH',
      contato: { email: 'ana@empresa.com.br', telefone: '(11) 3000-0002' },
      children: [
        { id: 'rh1', nome: 'Juliana Costa', cargo: 'Analista de RH', gestor: 'Ana Paula', equipe: 'Recrutamento', contato: { email: 'juliana@empresa.com.br', telefone: '—' }, children: [] },
      ],
    },
    {
      id: 'fin',
      nome: 'Maria Costa',
      cargo: 'Gerente Financeiro',
      gestor: 'Roberto Silva',
      equipe: 'Financeiro',
      contato: { email: 'maria@empresa.com.br', telefone: '(11) 3000-0003' },
      children: [],
    },
    {
      id: 'sup',
      nome: 'Pedro Silva',
      cargo: 'Gerente de Suprimentos',
      gestor: 'Roberto Silva',
      equipe: 'Suprimentos',
      contato: { email: 'pedro@empresa.com.br', telefone: '(11) 3000-0004' },
      children: [],
    },
    {
      id: 'obras',
      nome: 'Fabio Costa',
      cargo: 'Coordenador de Obras',
      gestor: 'Roberto Silva',
      equipe: 'Obras',
      contato: { email: 'fabio.c@empresa.com.br', telefone: '(11) 3000-0005' },
      children: [
        { id: 'ob1', nome: 'Ricardo Nunes', cargo: 'Encarregado', gestor: 'Fabio Costa', equipe: 'Obra Alpha', contato: { email: 'ricardo@empresa.com.br', telefone: '—' }, children: [] },
        { id: 'ob2', nome: 'Sandra Lima', cargo: 'Encarregada', gestor: 'Fabio Costa', equipe: 'Obra Beta', contato: { email: 'sandra@empresa.com.br', telefone: '—' }, children: [] },
      ],
    },
  ],
};

function OrganogramaNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l border-border pl-4' : ''}`}>
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/20 transition mb-2 ${
          depth === 0 ? 'border-primary/30 bg-primary/5' : ''
        }`}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="mt-1 text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
          {node.nome[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-foreground">{node.nome}</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">{node.cargo}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
            <span className="text-muted-foreground">Equipe: <strong className="text-foreground">{node.equipe}</strong></span>
            {node.gestor && (
              <span className="text-muted-foreground">Gestor Superior: <strong className="text-foreground">{node.gestor}</strong></span>
            )}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Mail size={11} /> {node.contato.email}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Phone size={11} /> {node.contato.telefone}
            </span>
          </div>
        </div>

        {hasChildren && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Users size={12} /> {node.children.length}
          </div>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <OrganogramaNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganogramaPage() {
  const departamentos = ['Diretoria', 'Gerências', 'Coordenações', 'Engenharia', 'RH', 'Financeiro', 'Suprimentos', 'Obras'];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <PageHeader
        icon={GitBranch}
        title="Organograma"
        subtitle="Estrutura hierárquica da empresa — cada cargo exibe nome, gestor, equipe e contato"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {departamentos.map((d) => (
          <span key={d} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {d}
          </span>
        ))}
      </div>

      <SectionCard title="Estrutura Hierárquica" className="mb-8">
        <OrganogramaNode node={ORGANOGRAMA} />
      </SectionCard>

      {/* Visualização em árvore simplificada */}
      <SectionCard title="Hierarquia Visual">
        <div className="overflow-x-auto py-6">
          <div className="flex flex-col items-center min-w-[600px]">
            <div className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg">
              {ORGANOGRAMA.nome}<br />
              <span className="text-xs font-normal opacity-90">{ORGANOGRAMA.cargo}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex justify-center gap-4 flex-wrap">
              {ORGANOGRAMA.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <div className="px-4 py-2 rounded-lg bg-accent border border-border text-sm font-medium text-center min-w-[120px]">
                    {child.equipe}<br />
                    <span className="text-[10px] text-muted-foreground">{child.nome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
