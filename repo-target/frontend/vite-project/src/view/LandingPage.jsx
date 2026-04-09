import React from 'react';
import Header from '../view/components/Header.jsx';
import Footer from '../view/components/Footer.jsx';
import Button from '../view/components/Button.jsx';
import Card from '../view/components/Card.jsx';

const HeroSection = () => (
    <section className="bg-gray-800 text-white py-20 px-4 text-center">
        <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">High-Converting Landing Page</h1>
            <p className="text-lg mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <Button variant="primary">Conheça</Button>
        </div>
    </section>
);

const AdvantagesSection = () => (
    <section className="bg-gray-100 py-16 px-4">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Vantagens</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                    <div className="h-40 bg-gray-300 mb-4 rounded-md"></div>
                    <p>Descrição da Vantagem</p>
                </Card>
                <Card>
                    <div className="h-40 bg-gray-300 mb-4 rounded-md"></div>
                    <p>Descrição da Vantagem</p>
                </Card>
                <Card>
                    <div className="h-40 bg-gray-300 mb-4 rounded-md"></div>
                    <p>Descrição da Vantagem</p>
                </Card>
            </div>
        </div>
    </section>
);

const ValuePropositionSection = () => (
    <section className="bg-gray-800 text-white py-20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                <h2 className="text-3xl font-bold mb-4">Proposta de Valor</h2>
                <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
            </div>
            <div className="md:w-1/2">
                <div className="h-80 w-full bg-gray-600 rounded-md"></div>
            </div>
        </div>
    </section>
);

const FeaturesSection = () => (
    <section className="py-20 px-4">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Recursos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-200 rounded-md">Recurso 1</div>
                <div className="p-4 bg-gray-200 rounded-md">Recurso 2</div>
                <div className="p-4 bg-gray-200 rounded-md">Recurso 3</div>
                <div className="p-4 bg-gray-200 rounded-md">Recurso 4</div>
                <div className="p-4 bg-gray-200 rounded-md">Recurso 5</div>
                <div className="p-4 bg-gray-200 rounded-md">Recurso 6</div>
            </div>
        </div>
    </section>
);

function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <HeroSection />
                <AdvantagesSection />
                <ValuePropositionSection />
                <FeaturesSection />
            </main>
            <Footer />
        </div>
    );
}

export default LandingPage;