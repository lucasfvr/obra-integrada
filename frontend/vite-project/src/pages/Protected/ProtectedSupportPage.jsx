import { Headphones } from 'lucide-react';

export default function ProtectedSupportPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-2xl bg-accent/10 p-3 text-accent">
            <Headphones size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Suporte VIP</h1>
            <p className="text-sm text-muted-foreground">Acesso restrito a páginas de suporte ou ajuda avançada.</p>
          </div>
        </div>
        <div className="grid gap-4 text-sm text-foreground/80">
          <p>Esta página é um exemplo de como aplicar permissões por página independentemente das roles de usuário.</p>
          <p>Cada usuário pode receber acesso apenas aos caminhos que a administração decidir.</p>
        </div>
      </div>
    </div>
  );
}
