import React, { useState } from "react";
import { useNavigate } from "react-router";
import Header from "../view/components/Header.jsx";
import Footer from "../view/components/Footer.jsx";

// Importe também os seus modais caso queira que eles abram a partir desta página
import LoginModal from "../view/Login.jsx";
import RegisterModal from "../view/RegisterModal.jsx";
import ForgotPasswordModal from "../view/ForgotPasswordModal.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function SobreNosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Estados locais para controlar os modais se o usuário clicar em Login/Cadastro na página Sobre Nós
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Função inteligente de navegação adaptada para rotas reais e seções na Home
  const handleNavigation = (destination) => {
    if (destination === "home" || destination === "/") {
      navigate("/");
    } else if (destination === "sobre-nos") {
      navigate("/sobre-nos");
    } else {
      // Se for uma seção interna (como 'recursos', 'contato', 'integracoes'), 
      // redireciona para a Home e deixa o comportamento padrão tratar
      navigate(`/#${destination}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. Header agora recebe todas as funções necessárias para funcionar */}
      <Header 
        onNavigate={handleNavigation}
        onLoginClick={() => setLoginModalOpen(true)}
        onRegisterClick={() => setRegisterModalOpen(true)}
        currentUser={user}
        onLogout={logout}
      />

      {/* 2. Conteúdo Principal da Página Sobre Nós */}
      <main className="flex-grow container mx-auto px-6 py-12 max-w-5xl">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
            Sobre o Obra Integrada
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transformando a gestão da construção civil através de tecnologia, transparência e controle em tempo real.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Nossa Missão</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Nascemos para conectar todas as pontas de um empreendimento. Desde o proprietário até o trabalhador no canteiro de obras, passando pelo engenheiro responsável e pelo setor de RH. 
            </p>
            <p className="text-slate-600 leading-relaxed">
              Acreditamos que a integração de dados e o controle rigoroso de diários de obras, equipes e custos são a chave para evitar desperdícios e garantir entregas no prazo com a máxima rentabilidade.
            </p>
          </div>
          <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Por que nos escolher?</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 shrink-0 mt-0.5">✔</span>
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 font-bold">RBAC Avançado:</strong> Controle de acessos robusto para que cada profissional veja apenas o necessário.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 shrink-0 mt-0.5">✔</span>
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Diários de Obra Transparentes:</strong> Relatórios diários auditáveis com upload facilitado de mídia.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 shrink-0 mt-0.5">✔</span>
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Visão Financeira Macro:</strong> Monitoramento preciso de rentabilidade em relação ao orçado.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* Modais de suporte se o usuário tentar logar de dentro da página Sobre Nós */}
      {isLoginModalOpen && (
        <LoginModal
          onLogin={() => setLoginModalOpen(false)}
          onClose={() => setLoginModalOpen(false)}
          onForgotPassword={() => {
            setLoginModalOpen(false);
            setForgotPasswordOpen(true);
          }}
          openRegister={() => {
            setLoginModalOpen(false);
            setRegisterModalOpen(true);
          }}
        />
      )}

      {isForgotPasswordOpen && (
        <ForgotPasswordModal
          onBack={() => {
            setForgotPasswordOpen(false);
            setLoginModalOpen(true);
          }}
          onClose={() => setForgotPasswordOpen(false)}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          onClose={() => setRegisterModalOpen(false)}
          onRegisterSuccess={() => setRegisterModalOpen(false)}
          onOpenLogin={() => {
            setRegisterModalOpen(false);
            setLoginModalOpen(true);
          }}
        />
      )}
    </div>
  );
}