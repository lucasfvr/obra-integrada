import React from 'react';
import { ArrowRightLeft, Plus } from 'lucide-react';

export default function TransferenciasPage() {
  const transferencias = [
    {
      id: 1,
      colaborador: 'João Silva',
      cargo: 'Eletricista',
      origem: 'Residencial Alpha',
      destino: 'Hospital Gamma',
      motivo: 'Reforço de equipe',
      data: '15/06/2026',
      status: 'Aprovada',
    },
    {
      id: 2,
      colaborador: 'Maria Santos',
      cargo: 'Pedreiro',
      origem: 'Condomínio Beta',
      destino: 'Shopping Delta',
      motivo: 'Demanda da obra',
      data: '12/06/2026',
      status: 'Aprovada',
    },
    {
      id: 3,
      colaborador: 'Pedro Oliveira',
      cargo: 'Servente',
      origem: 'Residencial Alpha',
      destino: 'Condomínio Beta',
      motivo: 'Redistribuição',
      data: '10/06/2026',
      status: 'Pendente',
    },
    {
      id: 4,
      colaborador: 'Ana Costa',
      cargo: 'Carpinteiro',
      origem: 'Hospital Gamma',
      destino: 'Residencial Alpha',
      motivo: 'Fim de projeto',
      data: '08/06/2026',
      status: 'Aprovada',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovada':
        return 'bg-success/20 text-success-foreground';
      case 'Pendente':
        return 'bg-warning/20 text-warning-foreground';
      case 'Rejeitada':
        return 'bg-destructive/20 text-destructive-foreground';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ArrowRightLeft size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Transferências</h1>
              <p className="text-muted-foreground">Movimentações entre obras</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition">
            <Plus size={20} />
            Nova Transferência
          </button>
        </div>
      </div>

      {/* Transferências */}
      <div className="space-y-4">
        {transferencias.map((trans) => (
          <div key={trans.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{trans.colaborador}</h3>
                <p className="text-sm text-muted-foreground">{trans.cargo}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trans.status)}`}>
                {trans.status}
              </span>
            </div>

            <div className="bg-accent/30 rounded p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">DE</p>
                  <p className="font-semibold text-foreground">{trans.origem}</p>
                </div>
                <ArrowRightLeft size={24} className="text-primary" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">PARA</p>
                  <p className="font-semibold text-foreground">{trans.destino}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">MOTIVO</p>
                <p className="text-sm font-medium text-foreground">{trans.motivo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">DATA</p>
                <p className="text-sm font-medium text-foreground">{trans.data}</p>
              </div>
              <div className="text-right">
                <button className="text-primary hover:opacity-75 transition font-medium">
                  Ver Detalhes →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
