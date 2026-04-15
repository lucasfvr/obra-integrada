import React from 'react';

export function UnderConstruction({ titulo = "Funcionalidade em Desenvolvimento" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-slide-up">
      <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-[2rem] flex items-center justify-center text-amber-600 mb-8 border border-amber-200 dark:border-amber-900/40">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{titulo}</h2>
      <p className="text-slate-500 dark:text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
        Estamos trabalhando para trazer a melhor experiência de gestão de canteiro. Esta aba estará disponível na <strong>Fase 2</strong> do projeto.
      </p>
      
      <div className="mt-10 flex gap-4">
        <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}
