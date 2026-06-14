import React from "react";
import obra1 from "../assets/obra1.jpg";
import obra2 from "../assets/obra2.jpg";
import obra3 from "../assets/obra3.jpg";
import { SiteFooter, SiteHeader } from "./Home";

export default function Portfolio({ onLoginClick, onRegisterClick }) {
  const obras = [obra1, obra2, obra3];

  return (
    <div>
      <SiteHeader onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />

      <section className="pt-40 px-6 max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-blue-900">
          Nosso Portfólio
        </h1>

        <div className="grid md:grid-cols-3 gap-10 mt-16">
          {obras.map((obra, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <img src={obra} className="w-full h-72 object-cover" />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-blue-800">
                  Projeto {index + 1}
                </h2>
                <p className="mt-4 text-slate-600">
                  Projeto moderno desenvolvido com alta qualidade e eficiência.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
