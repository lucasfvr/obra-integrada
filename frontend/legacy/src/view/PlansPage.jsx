import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

function PlansPage({ onNavigate }) {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">

            <Header onNavigate={onNavigate} />

            <main className="flex-grow container mx-auto p-6 text-center">
                <h1 className="text-4xl font-bold">Nossos Planos</h1>
                <p className="mt-4 text-lg">A página de planos está funcionando!</p>
            </main>
            <Footer />
        </div>
    );
}

export default PlansPage;