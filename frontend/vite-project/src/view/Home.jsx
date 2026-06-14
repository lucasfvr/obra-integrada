import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

import logo from "../assets/logo-obra-integrada.png";
import obra1 from "../assets/construcao1.jpg";
import obra2 from "../assets/construcao2.jpg";
import obra3 from "../assets/construcao3.jpg";

const imagens = [obra1, obra2, obra3];

const EMPRESAS = ["ALPHA", "BETA", "GAMMA", "DELTA", "EPSILON"];

export function SiteHeader({ onLoginClick, onRegisterClick }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="w-full px-4 py-4 flex items-center">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} className="h-12" alt="logo" />
        </Link>

        <nav className="hidden md:flex gap-6 text-blue-900 font-semibold ml-10">
          <a href="#sobre">Sobre</a>
          <a href="#servicos">Serviços</a>
          <Link to="/portfolio">Portfólio</Link>
          <a href="#contato">Contato</a>
          <a href="#clientes">Clientes</a>
        </nav>

        <div className="ml-auto flex gap-3">
          <button onClick={onLoginClick} className="border border-blue-700 text-blue-700 px-5 py-2 rounded-xl">
            Login
          </button>
          <button onClick={onRegisterClick} className="bg-blue-700 text-white px-5 py-2 rounded-xl">
            Criar Conta
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="contato" className="bg-blue-950 text-white py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-center">
        <div>
          <img src={logo} className="h-14" alt="logo" />
          <p className="text-blue-200 mt-3">
            Plataforma moderna para gestão inteligente de obras.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-xl mb-3">Links Rápidos</h3>
          <div className="flex flex-col gap-2 text-blue-200">
            <Link to="/">Home</Link>
            <Link to="/portfolio">Portfólio</Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-xl mb-3">Contato</h3>
          <p className="text-blue-200">contato@obraintegrada.com</p>
          <p className="text-blue-200">(24) 99999-9999</p>
        </div>
      </div>
    </footer>
  );
}

function HomePage({ onLoginClick, onRegisterClick }) {
  // --- Carrossel Hero ---
  const [index, setIndex] = useState(0);
  const heroTimerRef = useRef(null);

  const startHeroTimer = () => {
    if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    heroTimerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % imagens.length);
    }, 6000);
  };

  useEffect(() => {
    startHeroTimer();
    return () => clearInterval(heroTimerRef.current);
  }, []);

  const goHeroPrev = () => {
    setIndex((prev) => (prev - 1 + imagens.length) % imagens.length);
    startHeroTimer();
  };

  const goHeroNext = () => {
    setIndex((prev) => (prev + 1) % imagens.length);
    startHeroTimer();
  };

  // --- Carrossel de Clientes (manual, sem animação) ---
  const VISIBLE = 3; // quantos cards aparecem por vez
  const [clienteIndex, setClienteIndex] = useState(0);

  const goClientePrev = () =>
    setClienteIndex((prev) => Math.max(prev - 1, 0));

  const goClienteNext = () =>
    setClienteIndex((prev) => Math.min(prev + 1, EMPRESAS.length - VISIBLE));

  return (
    <div className="bg-white text-slate-800">
      <SiteHeader onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />

      {/* ── Carrossel Hero ── */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={imagens[index]}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          alt="carousel"
        />
        <div className="absolute inset-0 bg-black/60" />

        {/* Seta esquerda */}
        <button
          onClick={goHeroPrev}
          className="absolute left-4 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all backdrop-blur-sm"
          aria-label="Imagem anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Seta direita */}
        <button
          onClick={goHeroNext}
          className="absolute right-4 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all backdrop-blur-sm"
          aria-label="Próxima imagem"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mt-24">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Gestão Inteligente para Construção Civil
          </h1>
          <p className="mt-6 text-lg text-blue-100">
            Controle obras, equipes e projetos em uma única plataforma.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <button onClick={onRegisterClick} className="bg-blue-700 px-8 py-4 rounded-xl font-semibold">
              Começar Agora
            </button>
            <a href="#sobre" className="border border-white px-8 py-4 rounded-xl">
              Ler Mais
            </a>
          </div>
        </div>
      </section>

      <section id="sobre" className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-blue-900">
          Sobre a Plataforma
        </h2>
        <p className="mt-6 text-lg text-slate-600 max-w-4xl mx-auto leading-8">
          O Obra Integrada foi desenvolvido para facilitar a gestão de obras,
          equipes e processos com organização, produtividade e acompanhamento em tempo real.
        </p>
      </section>

      <section id="servicos" className="bg-blue-50 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-900">Serviços</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {["Gestão de Projetos", "Controle Financeiro", "Gerenciamento de Equipes"].map((item, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-blue-800">{item}</h3>
                <p className="mt-4 text-slate-600">Plataforma completa para melhorar sua produtividade.</p>
                <button className="mt-6 bg-blue-700 text-white px-5 py-3 rounded-xl">Ler Mais</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Carrossel de Clientes (manual, sem animação) ── */}
      <section id="clientes" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-900">
            Empresas que Confiam em Nossa Plataforma
          </h2>
          <p className="mt-4 text-slate-600">Clientes fictícios para demonstração.</p>

          <div className="mt-16 flex items-center gap-4">
            {/* Seta esquerda */}
            <button
              onClick={goClientePrev}
              disabled={clienteIndex === 0}
              className="flex-shrink-0 bg-blue-100 hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed text-blue-700 rounded-full w-12 h-12 flex items-center justify-center transition-all shadow"
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Cards visíveis */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex gap-8 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(calc(-${clienteIndex} * (100% / ${VISIBLE} + 10.67px)))` }}
              >
                {EMPRESAS.map((empresa, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 bg-slate-100 rounded-3xl p-8 shadow-md"
                    style={{ width: `calc(100% / ${VISIBLE} - ${(8 * (VISIBLE - 1)) / VISIBLE}px)` }}
                  >
                    <div className="text-4xl font-bold text-blue-700">{empresa.substring(0, 2)}</div>
                    <h3 className="font-bold mt-4">{empresa} Corp</h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Seta direita */}
            <button
              onClick={goClienteNext}
              disabled={clienteIndex >= EMPRESAS.length - VISIBLE}
              className="flex-shrink-0 bg-blue-100 hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed text-blue-700 rounded-full w-12 h-12 flex items-center justify-center transition-all shadow"
              aria-label="Próximo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export default HomePage;
