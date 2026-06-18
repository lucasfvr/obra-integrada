import React from 'react';
import { Cake } from 'lucide-react';

export default function AniversariantesPage() {
  const hoje = new Date();
  
  const aniversariantesList = [
    {
      id: 1,
      nome: 'Maria Souza',
      cargo: 'Gerente de RH',
      data: `${hoje.getDate()}/${String(hoje.getMonth() + 1).padStart(2, '0')}`,
      dias: 0,
      obra: 'Sede',
    },
    {
      id: 2,
      nome: 'Carlos Silva',
      cargo: 'Mestre de Obras',
      data: `${hoje.getDate()}/${String(hoje.getMonth() + 1).padStart(2, '0')}`,
      dias: 0,
      obra: 'Residencial Alpha',
    },
  ];

  const proximos7Dias = [
    {
      id: 3,
      nome: 'João Pereira',
      cargo: 'Eletricista',
      data: '19/06',
      dias: 2,
      obra: 'Condomínio Beta',
    },
    {
      id: 4,
      nome: 'Ana Costa',
      cargo: 'Engenheira',
      data: '21/06',
      dias: 4,
      obra: 'Hospital Gamma',
    },
    {
      id: 5,
      nome: 'Roberto Lima',
      cargo: 'Pedreiro',
      data: '23/06',
      dias: 6,
      obra: 'Shopping Delta',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Cake size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Aniversariantes</h1>
            <p className="text-muted-foreground">Acompanhe os aniversários da equipe</p>
          </div>
        </div>
      </div>

      {/* Hoje */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground font-bold text-sm">
            ★
          </div>
          <h2 className="text-2xl font-bold text-foreground">Hoje</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aniversariantesList.map((pessoa) => (
            <div key={pessoa.id} className="bg-linear-to-r from-primary/10 to-accent/10 border-2 border-primary rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{pessoa.nome}</h3>
                  <p className="text-sm text-muted-foreground">{pessoa.cargo}</p>
                  <p className="text-xs text-muted-foreground mt-2">{pessoa.obra}</p>
                </div>
                <Cake size={32} className="text-destructive" />
              </div>
              <div className="mt-4 pt-4 border-t border-primary/20">
                <p className="text-sm text-primary font-semibold">🎉 Parabéns!</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximos 7 dias */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
            📅
          </div>
          <h2 className="text-2xl font-bold text-foreground">Próximos 7 dias</h2>
        </div>

        <div className="space-y-4">
          {proximos7Dias.map((pessoa) => (
            <div key={pessoa.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{pessoa.nome}</h3>
                  <p className="text-sm text-muted-foreground">{pessoa.cargo}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pessoa.obra}</p>
                </div>
                <div className="text-right">
                  <div className="bg-primary/10 text-primary rounded-lg px-4 py-2">
                    <p className="text-sm font-bold">{pessoa.data}</p>
                    <p className="text-xs">em {pessoa.dias} dia{pessoa.dias !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-4xl font-bold text-destructive">{aniversariantesList.length}</p>
          <p className="text-sm text-muted-foreground mt-2">Aniversários Hoje</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-4xl font-bold text-warning">{proximos7Dias.length}</p>
          <p className="text-sm text-muted-foreground mt-2">Próximos 7 Dias</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-4xl font-bold text-primary">{aniversariantesList.length + proximos7Dias.length}</p>
          <p className="text-sm text-muted-foreground mt-2">Total</p>
        </div>
      </div>
    </div>
  );
}
