import React from 'react';

export function TestPage({ num }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm border max-w-md w-full">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">Página Teste {num}</h1>
        <p className="text-gray-600 mb-6">
          Se você está vendo esta tela, é porque o seu usuário tem permissão para acessar a <strong>Página de Teste {num}</strong>.
        </p>
        <div className="p-4 bg-green-50 text-green-700 rounded border border-green-200">
          Acesso Liberado!
        </div>
      </div>
    </div>
  );
}
