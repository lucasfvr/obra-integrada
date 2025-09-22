import React from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

function HomePage({ onNavigate, onLoginClick, onRegisterClick }) {
    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col">

            <Header
                onNavigate={onNavigate}
                onLoginClick={onLoginClick}
                onRegisterClick={onRegisterClick}
            />

            <main className="flex-grow container mx-auto px-6 py-24 text-center flex flex-col items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight max-w-3xl">
                    Gerencie suas obras de forma <span className="text-indigo-600">integrada e eficiente</span>.
                </h2>
                <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
                    Nossa plataforma centraliza o controle de projetos, finanças e equipes,
                    trazendo mais produtividade e clareza para a sua construtora.
                </p>
                <div className="mt-8">
                    <a href="#" className="bg-indigo-600 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-indigo-700 transition shadow-lg">
                        Comece Agora Gratuitamente
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default HomePage;