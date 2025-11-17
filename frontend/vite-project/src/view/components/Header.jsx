import React, { useState } from 'react';
import logoObraIntegrada from '../../assets/logo-obra-integrada.png';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

function Header({ onNavigate, onLoginClick, onRegisterClick, currentUser, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">

                {/* Logo e Nome */}
                <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
                    <img src={logoObraIntegrada} alt="Obra Integrada Logo" className="h-14 mr-3" />
                </div>

                {/* Links de Navegação */}
                <nav className="hidden md:flex items-center space-x-8">
                    <button onClick={() => onNavigate('integracoes')} className="text-slate-600 hover:text-indigo-600 transition">Integrações</button>
                    <button onClick={() => onNavigate('recursos')} className="text-slate-600 hover:text-indigo-600 transition">Recursos</button>
                    <button onClick={() => onNavigate('sobre-nos')} className="text-slate-600 hover:text-indigo-600 transition">Sobre nós</button>
                    <button onClick={() => onNavigate('contato')} className="text-slate-600 hover:text-indigo-600 transition">Contato</button>
                </nav>

                {/* Lado Direito Dinâmico */}
                <div className="flex items-center space-x-4">
                    {currentUser ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="bg-indigo-600 rounded-full h-12 w-12 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <UserIcon />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Meu Perfil
                                    </a>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button onClick={onLoginClick} className="text-slate-600 font-semibold hover:text-indigo-600 transition">
                                Login
                            </button>
                            <button onClick={onRegisterClick} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow">
                                Criar Conta
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
