import { ShieldCheck } from 'lucide-react';

export default function ProtectedRHPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Painel RH Protegido</h1>
            <p className="text-sm text-muted-foreground">Esta página só é exibida para usuários com permissão de acesso específico à área RH.</p>
          </div>
        </div>
        <div className="grid gap-4 text-sm text-foreground/80">
          <p>Use esta área para mostrar conteúdos exclusivos, relatórios ou ações internas de RH que devem ser liberadas apenas por permissão de página.</p>
          <p>Você pode ajustar quem vê esta página através do painel de controle de acesso.</p>
        </div>
      </div>
    </div>
  );
}
