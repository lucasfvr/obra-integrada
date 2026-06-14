import React from 'react';
import { Link, useNavigate } from 'react-router';
import { FiShield, FiArrowLeft, FiHome } from 'react-icons/fi';

const RestrictedAccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-6 select-none">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-10 text-center animate-slide-up">
        {/* Icon Container */}
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8 border border-rose-100 dark:border-rose-500/20 shadow-inner">
          <FiShield size={48} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
          Acesso Restrito
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
          Opa! Parece que você tentou acessar um módulo que não pertence ao seu nível de permissão atual. 
          <br /><span className="text-slate-400 dark:text-slate-600 text-sm mt-2 block italic">ID de Erro: RBAC-403-PROTECTED</span>
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-gray-700 transition-all active:scale-95 border border-slate-200 dark:border-gray-700 group"
          >
            <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>
          
          <Link 
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-amber-500 text-gray-950 font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 group"
          >
            <FiHome size={18} />
            Início
          </Link>
        </div>

        {/* Support Link */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-gray-800/50">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase">
            Acha que isso é um erro?
          </p>
          <a href="#" className="text-amber-600 dark:text-amber-500 text-sm font-bold mt-2 inline-block hover:underline">
            Fale com o Administrador
          </a>
        </div>
      </div>
    </div>
  );
};

export default RestrictedAccess;
