import React, { useState } from 'react';
import { Clock, User } from 'lucide-react';

export default function HistoricoMovimentacoesPage() {
  const [filtroColaborador, setFiltroColaborador] = useState('');

  const movimentacoes = [
    {
      id: 1,
      colaborador: 'João Silva',
      tipo: 'Admissão',
      descricao: 'Admitido como Eletricista',
      data: '15/03/2022',
      icon: 'UserPlus',
    },
    {
      id: 2,
      colaborador: 'João Silva',
      tipo: 'Transferência',
      descricao: 'Transferido para Obra Beta',
      data: '20/06/2023',
      icon: 'ArrowRight',
    },
    {
      id: 3,
      colaborador: 'João Silva',
      tipo: 'Promoção',
      descricao: 'Promovido para Líder de Equipe',
      data: '10/01/2024',
      icon: 'TrendingUp',
    },
    {
      id: 4,
      colaborador: 'João Silva',
      tipo: 'Transferência',
      descricao: 'Transferido para Obra Gamma',
      data: '15/06/2025',
      icon: 'ArrowRight',
    },
    {
      id: 5,
      colaborador: 'Maria Santos',
      tipo: 'Admissão',
      descricao: 'Admitida como Pedreiro',
      data: '22/05/2023',
      icon: 'UserPlus',
    },
    {
      id: 6,
      colaborador: 'Maria Santos',
      tipo: 'Férias',
      descricao: 'Férias de 15 dias',
      data: '01/06/2024',
      icon: 'Calendar',
    },
    {
      id: 7,
      colaborador: 'Maria Santos',
      tipo: 'Treinamento',
      descricao: 'Concluído NR10',
      data: '15/06/2024',
      icon: 'BookOpen',
    },
    {
      id: 8,
      colaborador: 'Pedro Oliveira',
      tipo: 'Admissão',
      descricao: 'Admitido como Servente',
      data: '10/01/2024',
      icon: 'UserPlus',
    },
  ];

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Admissão':
        return 'bg-success/20 text-success-foreground';
      case 'Transferência':
        return 'bg-primary/20 text-primary-foreground';
      case 'Promoção':
        return 'bg-warning/20 text-warning-foreground';
      case 'Férias':
        return 'bg-accent/20 text-accent-foreground';
      case 'Treinamento':
        return 'bg-secondary/20 text-secondary-foreground';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Clock size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Histórico de Movimentações</h1>
            <p className="text-muted-foreground">Timeline completa de eventos</p>
          </div>
        </div>

        {/* Filtro */}
        <input
          type="text"
          placeholder="Filtrar por colaborador..."
          value={filtroColaborador}
          onChange={(e) => setFiltroColaborador(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Linha Vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-border"></div>

        {/* Eventos */}
        <div className="space-y-6">
          {movimentacoes.map((mov, idx) => (
            <div key={mov.id} className="ml-24">
              <div className="flex items-start gap-4">
                {/* Ponto na Timeline */}
                <div className="absolute left-0 top-2 w-14 h-14 bg-card border-2 border-primary rounded-full flex items-center justify-center shrink-0">
                  <Clock size={24} className="text-primary" />
                </div>

                {/* Card do Evento */}
                <div className="bg-card border border-border rounded-lg p-6 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{mov.colaborador}</h3>
                      <p className="text-sm text-muted-foreground">{mov.data}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTipoColor(mov.tipo)}`}>
                      {mov.tipo}
                    </span>
                  </div>
                  <p className="text-foreground">{mov.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
