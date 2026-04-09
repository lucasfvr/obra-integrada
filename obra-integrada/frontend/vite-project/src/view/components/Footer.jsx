import React from "react";
import logoObraIntegrada from "../../assets/logo-obra-integrada.png";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiX } from "react-icons/si";

function Footer() {
  return (
    <footer className="bg-[#0b0f19] text-gray-300 px-8 py-12 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Coluna 1 - Logo e texto */}
        <div>
          <div className="flex items-center mb-4">
            <img
              src={logoObraIntegrada}
              alt="Logo Obra Integrada"
              className="w-12 h-12 mr-3 object-contain"
            />
            <h2 className="text-white text-lg font-semibold">
              Obra Integrada
            </h2>
          </div>

          <p className="text-sm leading-relaxed mb-4">
            Junte-se a centenas de profissionais que já transformaram seus
            projetos com a Obra Integrada. Comece hoje mesmo e veja a diferença.
          </p>

          <ul className="text-sm space-y-2">
            <li>✉️ contato@obraintegrada.com.br</li>
            <li>📞 (21) 3123-4567</li>
            <li>📍 Volta Redonda, RJ - Brasil</li>
          </ul>

          <div className="flex items-center space-x-4 mt-6">
            <span className="text-sm">Siga-nos:</span>
            <SiX className="w-5 h-5 hover:text-white cursor-pointer" />
            <FaFacebook className="w-5 h-5 hover:text-white cursor-pointer" />
            <FaInstagram className="w-5 h-5 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Coluna 2 */}
        <div>
          <h3 className="text-white font-semibold mb-4">Produto</h3>
          <ul className="space-y-2 text-sm">
            <li>Recursos</li>
            <li>Preços</li>
            <li>Demonstração</li>
            <li>API</li>
            <li>Integrações</li>
            <li>Realizações</li>
          </ul>
        </div>

        {/* Coluna 3 */}
        <div>
          <h3 className="text-white font-semibold mb-4">Empresa</h3>
          <ul className="space-y-2 text-sm">
            <li>Sobre Nós</li>
            <li>Blog</li>
            <li>Carreira</li>
            <li>Imprensa</li>
            <li>Parceiros</li>
            <li>Investidores</li>
          </ul>
        </div>

        {/* Coluna 4 */}
        <div>
          <h3 className="text-white font-semibold mb-4">Suporte</h3>
          <ul className="space-y-2 text-sm">
            <li>Central de Ajuda</li>
            <li>Documentação</li>
            <li>Tutoriais</li>
            <li>Status do Sistema</li>
            <li>Comunidade</li>
            <li>Fórum</li>
          </ul>
        </div>
      </div>

      {/* Linha inferior */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-400 space-x-4">
        <span>Política de Privacidade</span>
        <span>Termos de Uso</span>
        <span>Cookies</span>
        <span>LGPD</span>
      </div>
    </footer>
  );
}

export default Footer;