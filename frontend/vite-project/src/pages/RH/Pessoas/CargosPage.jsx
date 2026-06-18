import React, { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';

export default function CargosPage() {
  const cargos = [
    {
      id: 1,
      nome: 'Pedreiro',
      salarioBase: 'R$ 3.500',
      requisitos: 'Experiência mínima 2 anos',
      treinamentos: ['NR10', 'NR35', 'Segurança'],
      demanda: 24,
    },
    {
      id: 2,
      nome: 'Servente',
      salarioBase: 'R$ 2.200',
      requisitos: 'Sem experiência obrigatória',
      treinamentos: ['Segurança Básica', 'Integração'],
      demanda: 12,
    },
    {
      id: 3,
      nome: 'Carpinteiro',
      salarioBase: 'R$ 3.800',
      requisitos: 'Experiência mínima 3 anos',
      treinamentos: ['NR10', 'Segurança'],
      demanda: 8,
    },
    {
      id: 4,
      nome: 'Eletricista',
      salarioBase: 'R$ 4.500',
      requisitos: 'Experiência mínima 4 anos',
      treinamentos: ['NR10', 'NR35', 'Segurança'],
      demanda: 6,
    },
    {
      id: 5,
      nome: 'Encanador',
      salarioBase: 'R$ 4.000',
      requisitos: 'Experiência mínima 3 anos',
      treinamentos: ['Segurança', 'Integração'],
      demanda: 5,
    },
    {
      id: 6,
      nome: 'Mestre de Obras',
      salarioBase: 'R$ 6.500',
      requisitos: 'Experiência mínima 10 anos',
      treinamentos: ['Liderança', 'Segurança Avançada'],
      demanda: 2,
    },
    {
      id: 7,
      nome: 'Engenheiro',
      salarioBase: 'R$ 8.500',
      requisitos: 'Diploma de Engenharia',
      treinamentos: ['Gestão de Projetos', 'BIM'],
      demanda: 3,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Briefcase size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cargos e Funções</h1>
              <p className="text-muted-foreground">Cadastro de cargos disponíveis</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition">
            <Plus size={20} />
            Novo Cargo
          </button>
        </div>
      </div>

      {/* Grid de Cargos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cargos.map((cargo) => (
          <div key={cargo.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{cargo.nome}</h3>
                <p className="text-sm text-primary font-semibold mt-1">{cargo.salarioBase}/mês</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-accent rounded transition text-muted-foreground hover:text-foreground">
                  <Edit2 size={18} />
                </button>
                <button className="p-2 hover:bg-accent rounded transition text-destructive">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3 pb-4 border-b border-border mb-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Requisitos</p>
                <p className="text-sm text-foreground">{cargo.requisitos}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Treinamentos Obrigatórios</p>
                <div className="flex flex-wrap gap-2">
                  {cargo.treinamentos.map((trein, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded"
                    >
                      {trein}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Demanda Atual</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary">{cargo.demanda}</p>
                  <p className="text-xs text-muted-foreground">vagas abertas</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
