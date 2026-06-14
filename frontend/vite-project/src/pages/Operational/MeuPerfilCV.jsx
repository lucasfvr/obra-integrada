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
    <div className="max-w-4xl mx-auto pb-24 animate-slide-up">
      {/* CV Header: Identidade Profissional */}
      <div className="relative bg-white dark:bg-gray-950 rounded-[3rem] p-10 border border-slate-200 dark:border-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-[2.5rem] bg-amber-500 flex items-center justify-center text-4xl font-black text-gray-900 shadow-2xl shadow-amber-500/30">
            {user?.nome?.[0] || 'U'}
          </div>
          <div className="text-center md:text-left flex-1 min-w-0">
             <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
               <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-black uppercase px-3 py-1 rounded-full">Matrícula #{user?.id_usuario || '???'}</span>
               <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase px-3 py-1 rounded-full">Perfil Verificado</span>
             </div>
             <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 truncate">{user?.nome || 'Usuário'}</h2>
             <p className="text-lg font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{user?.funcao || 'Operacional'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        
        {/* Dados Pessoais Section */}
        <section className="bg-white dark:bg-gray-900/40 rounded-[2.5rem] p-10 border border-slate-100 dark:border-gray-800 transition-all hover:border-slate-300 dark:hover:border-gray-600">
           <div className="mb-8">
             <h3 className="text-xl font-black text-slate-900 dark:text-white">Informações de Contato</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Como a empresa entra em contato com você</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">E-mail Profissional</label>
                <input 
                  type="email"
                  className="w-full bg-slate-50 dark:bg-gray-950 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10"
                  value={dadosPessoais.email}
                  disabled={isImpersonating}
                  onChange={e => setDadosPessoais({...dadosPessoais, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Celular / WhatsApp</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 dark:bg-gray-950 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10"
                  value={dadosPessoais.celular}
                  disabled={isImpersonating}
                  onChange={e => setDadosPessoais({...dadosPessoais, celular: e.target.value})}
                />
              </div>
           </div>
        </section>

        {/* Experiência Section */}
        <section className="bg-white dark:bg-gray-900/40 rounded-[2.5rem] p-10 border border-slate-100 dark:border-gray-800">
           <div className="mb-8">
             <h3 className="text-xl font-black text-slate-900 dark:text-white">Carreira e Atribuições</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Resumo das suas experiências profissionais anteriores</p>
           </div>
           
           <textarea 
             className="w-full bg-slate-50 dark:bg-gray-950 border dark:border-gray-800 rounded-3xl p-6 text-sm font-medium text-slate-600 dark:text-gray-300 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all h-32 resize-none"
             placeholder="Escreva um pouco sobre suas experiências profissionais..."
             value={experiencia}
             onChange={(e) => setExperiencia(e.target.value)}
             disabled={isImpersonating}
           />
        </section>

        {/* Certificações Section */}
        <section className="bg-white dark:bg-gray-900/40 rounded-[2.5rem] p-10 border border-slate-100 dark:border-gray-800">
           <div className="flex justify-between items-center mb-8">
             <div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white">Normas e Certificações</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cursos de segurança e conformidade (NR10, NR35, etc.)</p>
             </div>
             <button 
                type="button" 
                onClick={addCert}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                disabled={isImpersonating}
              >
               + Adicionar
             </button>
           </div>

           <div className="space-y-4">
             {certs.length === 0 ? (
               <div className="p-8 border-2 border-dashed dark:border-gray-800 rounded-3xl text-center text-slate-400 italic text-sm">
                 Nenhuma certificação adicionada.
               </div>
             ) : (
               certs.map((c, i) => {
                 const diffDays = Math.ceil((new Date(c.validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                 const isExpiring = !isNaN(diffDays) && diffDays < 30;

                 return (
                  <div key={i} className="flex flex-col md:flex-row gap-4 bg-slate-50/50 dark:bg-gray-950 p-6 rounded-3xl border dark:border-gray-800 transition-all hover:ring-2 hover:ring-indigo-500/20">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Nome do Curso / NR</label>
                      <input 
                        className="w-full bg-transparent border-b border-slate-200 dark:border-gray-700 py-2 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-amber-500"
                        placeholder="Ex: NR35 - Trabalho em Altura"
                        value={c.nome}
                        onChange={(e) => updateCert(i, 'nome', e.target.value)}
                        disabled={isImpersonating}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Vencimento</label>
                      <input 
                        type="date"
                        className={`w-full bg-transparent border-b py-2 text-sm font-black outline-none focus:border-amber-500 ${isExpiring ? 'text-rose-500 border-rose-500' : 'text-slate-900 dark:text-white border-slate-200 dark:border-gray-700'}`}
                        value={c.validade}
                        onChange={(e) => updateCert(i, 'validade', e.target.value)}
                        disabled={isImpersonating}
                      />
                      {isExpiring && <span className="text-[8px] font-black text-rose-500 uppercase mt-1 animate-pulse">Expirando em breve!</span>}
                    </div>
                  </div>
                 );
               })
             )}
           </div>
        </section>

        {/* Action Footer */}
        <div className="sticky bottom-6 flex justify-center pt-10">
           {!isImpersonating ? (
             <Button 
                type="submit" 
                className="shadow-2xl shadow-indigo-600/30 px-12 py-6 rounded-[2.5rem] text-sm transform transition-transform active:scale-95"
                variant={success ? 'success' : 'primary'}
                disabled={loading}
              >
                {loading ? 'SINCRONIZANDO...' : success ? 'CURRÍCULO ATUALIZADO!' : 'ATUALIZAR MEU PERFIL'}
             </Button>
           ) : (
             <div className="bg-rose-50 dark:bg-rose-950/20 px-8 py-4 rounded-[2rem] border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest shadow-xl">
                Visualização Protegida (Admin)
             </div>
           )}
        </div>
      </form>
    </div>
  );
}
