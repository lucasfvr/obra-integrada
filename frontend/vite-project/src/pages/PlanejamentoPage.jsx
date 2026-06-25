import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export default function PlanejamentoPage() {
  const { user } = useAuth();

  const saudacao = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const hoje = useMemo(() => new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho estilo RH */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xl font-bold text-foreground">{saudacao}, {user?.nome?.split(' ')[0] || 'Usuário'}.</p>
            <p className="text-muted-foreground text-sm capitalize">Hoje é {hoje}.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-muted-foreground" />
              </div>
              <input placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground mb-2">Planejamento</h1>
          <p className="text-sm text-muted-foreground mb-4">Área dedicada aos usuários de Planejamento. Aqui você poderá acessar cronogramas, relatórios e ferramentas de planejamento.</p>

          <div className="rounded-lg bg-sky-50 border border-sky-100 p-5 text-sky-700">
            <p className="font-semibold mb-2">Recursos de demonstração</p>
            <ul className="list-disc list-inside text-sm leading-relaxed">
              <li>Visualização de cronogramas</li>
              <li>Planejamento de entregas</li>
              <li>Relatórios de capacidade e entregas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
