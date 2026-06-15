import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/button/Button.tsx';

/**
 * COMPONENTE DE CURRÍCULO OPERACIONAL (Fase 1)
 * Focado em Dados Pessoais, Experiência e Certificações Técnicas.
 */

export function MeuPerfilCV() {
  const { user, apiFetch, isImpersonating } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states (Simulados - No futuro viriam de um PATCH /users/me/profile)
  const [dadosPessoais, setDadosPessoais] = useState({
    email: user?.email || '',
    celular: user?.celular || '(11) 98888-7777',
    cpf: user?.cpf || '***.***.***-**'
  });
  const [experiencia, setExperiencia] = useState(user?.experiencias || 'Pedreiro com 10 anos de experiência em grandes estruturas e acabamento fino.');
  const [certs, setCerts] = useState(user?.certificacoes || [
    { nome: 'NR35 - Trabalho em Altura', validade: '2025-12-01' },
    { nome: 'NR10 - Segurança Elétrica', validade: '2024-08-15' }
  ]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (isImpersonating) return;
    
    setLoading(true);
    try {
      // Simulação de transação de rede
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }, 800);
    } catch (e) {
      setLoading(false);
    }
  };

  const addCert = () => {
    if (isImpersonating) return;
    setCerts([...certs, { nome: '', validade: '' }]);
  };

  const updateCert = (idx, field, val) => {
    const newCerts = [...certs];
    newCerts[idx][field] = val;
    setCerts(newCerts);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-slide-up">
      {/* CV Header: Identidade Profissional */}
      <div className="relative bg-card rounded-xl p-5 border border-border shadow-sm mb-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-sm">
            {user?.nome?.[0] || 'U'}
          </div>
          <div className="text-center md:text-left flex-1 min-w-0">
             <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
               <span className="bg-muted border border-border text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md">Matrícula #{user?.id_usuario || '???'}</span>
               <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-transparent">Perfil Verificado</span>
             </div>
             <h2 className="text-2xl font-semibold tracking-tight text-foreground">{user?.nome || 'Usuário'}</h2>
             <p className="text-sm font-semibold text-muted-foreground mt-0.5 uppercase">{user?.funcao || 'Operacional'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Dados Pessoais Section */}
        <section className="bg-card rounded-xl p-5 border border-border shadow-sm">
           <div className="mb-4">
             <h3 className="text-sm font-semibold text-foreground">Informações de Contato</h3>
             <p className="text-xs text-muted-foreground mt-1">Como a empresa entra em contato com você</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">E-mail Profissional</label>
                <input 
                  type="email"
                  className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={dadosPessoais.email}
                  disabled={isImpersonating}
                  onChange={e => setDadosPessoais({...dadosPessoais, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Celular / WhatsApp</label>
                <input 
                  type="text"
                  className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={dadosPessoais.celular}
                  disabled={isImpersonating}
                  onChange={e => setDadosPessoais({...dadosPessoais, celular: e.target.value})}
                />
              </div>
           </div>
        </section>

        {/* Experiência Section */}
        <section className="bg-card rounded-xl p-5 border border-border shadow-sm">
           <div className="mb-4">
             <h3 className="text-sm font-semibold text-foreground">Carreira e Atribuições</h3>
             <p className="text-xs text-muted-foreground mt-1">Resumo das suas experiências profissionais anteriores</p>
           </div>
           
           <textarea 
             className="w-full bg-card border border-border rounded-lg p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32 resize-none"
             placeholder="Escreva um pouco sobre suas experiências profissionais..."
             value={experiencia}
             onChange={(e) => setExperiencia(e.target.value)}
             disabled={isImpersonating}
           />
        </section>

        {/* Certificações Section */}
        <section className="bg-card rounded-xl p-5 border border-border shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Normas e Certificações</h3>
                <p className="text-xs text-muted-foreground mt-1">Cursos de segurança e conformidade (NR10, NR35, etc.)</p>
              </div>
              <button 
                 type="button" 
                 onClick={addCert}
                 className="bg-muted hover:bg-muted/70 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                 disabled={isImpersonating}
               >
                 + Adicionar
               </button>
           </div>

           <div className="space-y-3">
              {certs.length === 0 ? (
                <div className="p-6 border border-dashed border-border rounded-lg text-center text-muted-foreground text-xs">
                  Nenhuma certificação adicionada.
                </div>
              ) : (
                certs.map((c, i) => {
                  const diffDays = Math.ceil((new Date(c.validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isExpiring = !isNaN(diffDays) && diffDays < 30;

                  return (
                   <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border relative">
                     <div>
                       <label className="block text-xs font-medium text-muted-foreground mb-1">Nome do Curso / NR</label>
                       <input 
                         className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                         placeholder="Ex: NR35 - Trabalho em Altura"
                         value={c.nome}
                         onChange={(e) => updateCert(i, 'nome', e.target.value)}
                         disabled={isImpersonating}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-muted-foreground mb-1">Vencimento</label>
                       <div className="flex flex-col gap-1">
                         <input 
                           type="date"
                           className={`w-full bg-card border rounded-lg p-2 text-sm focus:ring-2 outline-none transition-all ${isExpiring ? 'text-destructive border-destructive focus:ring-destructive/20' : 'text-foreground border-border focus:ring-primary/20'}`}
                           value={c.validade}
                           onChange={(e) => updateCert(i, 'validade', e.target.value)}
                           disabled={isImpersonating}
                         />
                         {isExpiring && <span className="text-[10px] font-semibold text-destructive uppercase animate-pulse mt-0.5">Expirando em breve!</span>}
                       </div>
                     </div>
                   </div>
                  );
                })
              )}
           </div>
        </section>

        {/* Action Footer */}
        <div className="flex justify-end pt-4">
           {!isImpersonating ? (
             <button 
                type="submit" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? 'Sincronizando...' : success ? 'Currículo Atualizado!' : 'Atualizar Perfil'}
             </button>
           ) : (
             <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold px-4 py-2 rounded-lg">
                Visualização Protegida (Admin)
             </div>
           )}
        </div>
      </form>
    </div>
  );
}
