import { FileText } from 'lucide-react';

export default function ProtectedReportsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Relatórios VIP</h1>
            <p className="text-sm text-muted-foreground">Somente usuários com permissões de página específicas podem acessar estes relatórios.</p>
          </div>
        </div>
        <div className="grid gap-4 text-sm text-foreground/80">
          <p>Esta página demonstra um controle de acesso por página, separando-o das permissões de role tradicionais.</p>
          <p>Ao criar um usuário no painel de acesso, selecione esta permissão para permitir o acesso.</p>
        </div>
      </div>
    </div>
  );
}
