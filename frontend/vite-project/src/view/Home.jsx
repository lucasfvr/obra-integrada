import React from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Slider from "react-slick";

import construcao1 from "../assets/construcao1.jpg";
import construcao2 from "../assets/construcao2.jpg";
import construcao3 from "../assets/construcao3.jpg";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function HomePage({ onNavigate, onLoginClick, onRegisterClick }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: false,
    fade: true,
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col">
      {/* Header */}
      <Header
        onNavigate={onNavigate}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />

      {/* Carrossel */}
      <section className="relative w-full max-h-[550px] overflow-hidden">
        <Slider {...settings}>
          {[construcao1, construcao2, construcao3].map((img, i) => (
            <div key={i} className="w-full relative">
              <img
                src={img}
                alt={`Imagem de construção ${i + 1}`}
                className="w-full h-[550px] object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Gestão moderna para sua obra
                </h2>
                <p className="text-lg max-w-xl">
                  Acompanhe cada etapa do projeto com eficiência e clareza.
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Conteúdo principal */}
      <main className="flex-grow container mx-auto px-6 py-24 text-center flex flex-col items-center justify-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight max-w-3xl">
          Gerencie suas obras de forma{" "}
          <span className="text-indigo-600">integrada e eficiente</span>.
        </h2>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Nossa plataforma centraliza o controle de projetos, finanças e equipes,
          trazendo mais produtividade e clareza para a sua construtora.
        </p>
        <div className="mt-10">
          <a
            href="#"
            className="bg-indigo-600 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
          >
            Comece Agora Gratuitamente
          </a>
        </div>
      </main>

      {/* Footer com respiro extra */}
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}

export default HomePage;
