import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router";

// Layouts & Context
import AppLayout from "../layout/AppLayout.tsx";
import { AppWrapper } from "../components/common/PageMeta.tsx";
import { ImpersonacaoBanner } from "../components/Guards/ImpersonacaoBanner.jsx";
import { ProtectedRoute } from "../components/Guards/ProtectedRoute.jsx";
import { useAuth } from "../hooks/useAuth.js";

import { Toaster } from "react-hot-toast";

// Pages
import HomePage from "./Home.jsx";
import LoginModal from "./Login.jsx";
import ForgotPasswordModal from "./ForgotPasswordModal.jsx";
import RegisterModal from "./RegisterModal.jsx";
import FormularioCompletoPage from "./FormularioCompletoPage.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import RestrictedAccess from "../pages/RestrictedAccess.jsx";

// Novas telas de acesso
import { TestPage } from "../pages/Protected/TestPages.jsx";
import { PageAuthGuard } from "../components/Guards/PageAuthGuard.jsx";

// Modern Dashboard & Project Pages
import { DashboardDinamico } from "../components/Dashboard/DashboardDinamico.jsx";
import ObraPage from "../pages/Obra/ObraPage.jsx";
import CalendarPage from "../pages/Calendar.tsx";
import { ObraDocuments } from "../pages/Obra/sections/ObraDocuments.jsx";
import { EquipeOrganograma } from "../pages/Operational/EquipeOrganograma.jsx";
import { MeuPerfilCV } from "../pages/Operational/MeuPerfilCV.jsx";
import { UnderConstruction } from "../components/common/UnderConstruction.jsx";
import { PermissaoGuard } from "../components/Guards/PermissaoGuard.jsx";
import MinhasObrasPage from "../pages/Obras/MinhasObrasPage.jsx";
import GestaoRH from "../pages/Operational/GestaoRH.jsx";
import GestaoRHAvancado from "../pages/Operational/GestaoRHAvancado.jsx";
import { GestaoEquipe } from "../pages/Operational/GestaoEquipe.jsx";
import RHLayout from "../layout/RHLayout.jsx";
import RHDashboard from "../pages/RH/RHDashboard.jsx";
import PlanejamentoPage from "../pages/PlanejamentoPage.jsx";
import EngenheiroPage from "../pages/EngenheiroPage.jsx";

// Pessoas
import ColaboradoresPage from "../pages/RH/Pessoas/ColaboradoresPage.jsx";
import ColaboradorPerfilPage from "../pages/RH/Pessoas/ColaboradorPerfilPage.jsx";
import TerceirizadosPage from "../pages/RH/Pessoas/TerceirizadosPage.jsx";
import EquipesPage from "../pages/RH/Pessoas/EquipesPage.jsx";
import OrganogramaPage from "../pages/RH/Pessoas/OrganogramaPage.jsx";
import CargosPage from "../pages/RH/Pessoas/CargosPage.jsx";
import TransferenciasPage from "../pages/RH/Pessoas/TransferenciasPage.jsx";
import HistoricoPage from "../pages/RH/Pessoas/HistoricoPage.jsx";
import AniversariantesPage from "../pages/RH/Pessoas/AniversariantesPage.jsx";
import VagasPage from "../pages/RH/Recrutamento/VagasPage.jsx";
import CandidatosPage from "../pages/RH/Recrutamento/CandidatosPage.jsx";
import BancoTalentosPage from "../pages/RH/Recrutamento/BancoTalentosPage.jsx";
import EntrevistasPage from "../pages/RH/Recrutamento/EntrevistasPage.jsx";
import ControleAcessoPage from "../pages/RH/ControleAcessoPage.jsx";

// Pagina /finalizar-cadastro — extraida pra poder usar useNavigate
// e fornecer callbacks que o Header e o form precisam pra navegar.
function FinalizarCadastroPage({ formTempData, setFormTempData, setLoginModalOpen, setRegisterModalOpen }) {
  const navigate = useNavigate();

  const sairDoFluxo = () => {
    setFormTempData(null);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header
        onNavigate={sairDoFluxo}
        onLoginClick={() => { sairDoFluxo(); setLoginModalOpen(true); }}
        onRegisterClick={() => { sairDoFluxo(); setRegisterModalOpen(true); }}
      />
      <div className="py-10 flex justify-center">
        <FormularioCompletoPage
          tempId={formTempData?.id}
          preRegisterData={formTempData?.data}
          onSubmitSuccess={() => {
            setFormTempData(null);
            window.location.href = "/dashboard";
          }}
          onCancel={sairDoFluxo}
        />
      </div>
      <Footer />
    </div>
  );
}

function App() {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    revertImpersonation,
    isLoading
  } = useAuth();

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [formTempData, setFormTempData] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // CADASTRO SUCESSO — Abre o formulário completo
  const handleRegisterSuccess = (id, data) => {
    setRegisterModalOpen(false);
    setFormTempData({ id, data });
  };

  // Helper function to wrap RH routes with common protection
  const RHRoute = ({ permissao = 'ver_rh', children }) => (
    <ProtectedRoute>
      <PermissaoGuard permissao={permissao} redirectToRestricted>
        {children}
      </PermissaoGuard>
    </ProtectedRoute>
  );

  return (
    <AppWrapper>
      <Toaster position="top-right" reverseOrder={false} />
      <ImpersonacaoBanner onReverter={revertImpersonation} />

      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                user?.role === 'RH' ? (
                  <Navigate to="/rh-dashboard" replace />
                ) : user?.role === 'PLANEJADOR' ? (
                  <Navigate to="/planejamento" replace />
                ) : user?.role === 'ENGENHEIRO' ? (
                  <Navigate to="/engenheiro" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : formTempData ? (
                <Navigate to="/finalizar-cadastro" replace />
              ) : (
                <HomePage
                  onLoginClick={() => setLoginModalOpen(true)}
                  onRegisterClick={() => setRegisterModalOpen(true)}
                />
              )
            }
          />

          <Route path="/restricted" element={<RestrictedAccess />} />

          <Route
            path="/finalizar-cadastro"
            element={
              <FinalizarCadastroPage
                formTempData={formTempData}
                setFormTempData={setFormTempData}
                setLoginModalOpen={setLoginModalOpen}
                setRegisterModalOpen={setRegisterModalOpen}
              />
            }
          />

          {/* Shell Moderno (Autenticado) */}
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {user?.role === 'RH' ? (
                    <Navigate to="/rh-dashboard" replace />
                  ) : user?.role === 'PLANEJADOR' ? (
                    <Navigate to="/planejamento" replace />
                  ) : user?.role === 'ENGENHEIRO' ? (
                    <Navigate to="/engenheiro" replace />
                  ) : (
                    <DashboardDinamico
                      currentUser={user}
                      onLogout={logout}
                    />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/obra/:id"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_obras" redirectToRestricted>
                    <ObraPage />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_tarefas" redirectToRestricted>
                    <CalendarPage />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/obras"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_obras" redirectToRestricted>
                    <MinhasObrasPage />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documentos"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_diario" redirectToRestricted>
                    <ObraDocuments />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/materiais"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_obras" redirectToRestricted>
                    <UnderConstruction titulo="Materiais e Estoque" />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/financeiro"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_financeiro" redirectToRestricted>
                    <UnderConstruction titulo="Financeiro da Obra" />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipe"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_equipe" redirectToRestricted>
                    <GestaoEquipe />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rh"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_rh" redirectToRestricted>
                    <GestaoRH />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="gerenciar_clientes" redirectToRestricted>
                    <UnderConstruction titulo="Clientes / Tenants" />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/planejamento"
              element={
                <ProtectedRoute>
                  <PageAuthGuard rota="/planejamento">
                    <PlanejamentoPage />
                  </PageAuthGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/engenheiro"
              element={
                <ProtectedRoute>
                  <PageAuthGuard rota="/engenheiro">
                    <EngenheiroPage />
                  </PageAuthGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_perfil" redirectToRestricted>
                    <MeuPerfilCV />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />

            {/* Rotas de Teste Protegidas por id_pagina (assumindo IDs 1, 2, 3) */}
            <Route path="/test-1" element={
              <ProtectedRoute><PageAuthGuard idPagina={1}><TestPage num={1} /></PageAuthGuard></ProtectedRoute>
            } />
            <Route path="/test-2" element={
              <ProtectedRoute><PageAuthGuard idPagina={2}><TestPage num={2} /></PageAuthGuard></ProtectedRoute>
            } />
            <Route path="/test-3" element={
              <ProtectedRoute><PageAuthGuard idPagina={3}><TestPage num={3} /></PageAuthGuard></ProtectedRoute>
            } />
            {/* Redirecionar outras rotas para o dashboard se logado */}
            <Route
              path="/home"
              element={
                user?.role === 'RH' ? (
                  <Navigate to="/rh-dashboard" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
          </Route>

          {/* RH Layout Routes */}
          <Route element={<RHLayout />}>
            <Route path="/rh-dashboard" element={<RHRoute><RHDashboard /></RHRoute>} />
            <Route path="/rh/controle-acesso" element={
              <RHRoute>
                <ControleAcessoPage />
              </RHRoute>
            } />
            <Route path="/rh-avancado" element={<RHRoute permissao="gerenciar_usuarios"><GestaoRHAvancado /></RHRoute>} />
            <Route path="/rh/colaboradores" element={<RHRoute><ColaboradoresPage /></RHRoute>} />
            <Route path="/rh/colaboradores/:id" element={<RHRoute><ColaboradorPerfilPage /></RHRoute>} />
            <Route path="/rh/terceirizados" element={<RHRoute><TerceirizadosPage /></RHRoute>} />
            <Route path="/rh/equipes" element={<RHRoute><EquipesPage /></RHRoute>} />
            <Route path="/rh/organograma" element={<RHRoute><OrganogramaPage /></RHRoute>} />
            <Route path="/rh/cargos" element={<RHRoute><CargosPage /></RHRoute>} />
            <Route path="/rh/transferencias" element={<RHRoute><TransferenciasPage /></RHRoute>} />
            <Route path="/rh/historico-movimentacoes" element={<RHRoute><HistoricoPage /></RHRoute>} />
            <Route path="/rh/aniversariantes" element={<RHRoute><AniversariantesPage /></RHRoute>} />
            <Route path="/rh/vagas" element={<RHRoute><VagasPage /></RHRoute>} />
            <Route path="/rh/candidatos" element={<RHRoute><CandidatosPage /></RHRoute>} />
            <Route path="/rh/banco-talentos" element={<RHRoute><BancoTalentosPage /></RHRoute>} />
            <Route path="/rh/entrevistas" element={<RHRoute><EntrevistasPage /></RHRoute>} />
            <Route path="/rh/contratacoes" element={<RHRoute><UnderConstruction titulo="Contratações" /></RHRoute>} />
            <Route path="/rh/documentacao" element={<RHRoute><UnderConstruction titulo="Documentação" /></RHRoute>} />
            <Route path="/rh/assinaturas" element={<RHRoute><UnderConstruction titulo="Assinaturas" /></RHRoute>} />
            <Route path="/rh/integracao" element={<RHRoute><UnderConstruction titulo="Integração" /></RHRoute>} />
            <Route path="/rh/ponto" element={<RHRoute><UnderConstruction titulo="Ponto" /></RHRoute>} />
            <Route path="/rh/escalas" element={<RHRoute><UnderConstruction titulo="Escalas" /></RHRoute>} />
            <Route path="/rh/banco-horas" element={<RHRoute><UnderConstruction titulo="Banco de Horas" /></RHRoute>} />
            <Route path="/rh/ocorrencias" element={<RHRoute><UnderConstruction titulo="Ocorrências" /></RHRoute>} />
            <Route path="/rh/treinamentos" element={<RHRoute><UnderConstruction titulo="Treinamentos" /></RHRoute>} />
            <Route path="/rh/certificacoes" element={<RHRoute><UnderConstruction titulo="Certificações" /></RHRoute>} />
            <Route path="/rh/avaliacoes" element={<RHRoute><UnderConstruction titulo="Avaliações" /></RHRoute>} />
            <Route path="/rh/carreira" element={<RHRoute><UnderConstruction titulo="Carreira" /></RHRoute>} />
            <Route path="/rh/aso" element={<RHRoute><UnderConstruction titulo="ASO" /></RHRoute>} />
            <Route path="/rh/exames" element={<RHRoute><UnderConstruction titulo="Exames" /></RHRoute>} />
            <Route path="/rh/epis" element={<RHRoute><UnderConstruction titulo="EPIs" /></RHRoute>} />
            <Route path="/rh/nr10" element={<RHRoute><UnderConstruction titulo="NR10" /></RHRoute>} />
            <Route path="/rh/nr35" element={<RHRoute><UnderConstruction titulo="NR35" /></RHRoute>} />
            <Route path="/rh/alertas" element={<RHRoute><UnderConstruction titulo="Alertas" /></RHRoute>} />
            <Route path="/rh/beneficios" element={<RHRoute><UnderConstruction titulo="Benefícios" /></RHRoute>} />
            <Route path="/rh/ferias" element={<RHRoute><UnderConstruction titulo="Férias" /></RHRoute>} />
            <Route path="/rh/licencas" element={<RHRoute><UnderConstruction titulo="Licenças" /></RHRoute>} />
            <Route path="/rh/afastamentos" element={<RHRoute><UnderConstruction titulo="Afastamentos" /></RHRoute>} />
            <Route path="/rh/folha-pagamento" element={<RHRoute><UnderConstruction titulo="Folha de Pagamento" /></RHRoute>} />
            <Route path="/rh/holerites" element={<RHRoute><UnderConstruction titulo="Holerites" /></RHRoute>} />
            <Route path="/rh/encargos" element={<RHRoute><UnderConstruction titulo="Encargos" /></RHRoute>} />
            <Route path="/rh/resumos" element={<RHRoute><UnderConstruction titulo="Resumos" /></RHRoute>} />
            <Route path="/rh/equipes-obra" element={<RHRoute><UnderConstruction titulo="Equipes por Obra" /></RHRoute>} />
            <Route path="/rh/movimentacoes" element={<RHRoute><UnderConstruction titulo="Movimentações" /></RHRoute>} />
            <Route path="/rh/custos" element={<RHRoute><UnderConstruction titulo="Custos" /></RHRoute>} />
            <Route path="/rh/historico" element={<RHRoute><UnderConstruction titulo="Histórico" /></RHRoute>} />
            <Route path="/rh/relatorios" element={<RHRoute><UnderConstruction titulo="Relatórios" /></RHRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>


        {/* Modais Globais (Apenas na Home) */}
        {isLoginModalOpen && (
          <LoginModal
            onLogin={(data, remember) => {
              login(data.token, data, remember);
              setLoginModalOpen(false);
            }}
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
            onRegisterSuccess={handleRegisterSuccess}
            onOpenLogin={() => {
              setRegisterModalOpen(false);
              setLoginModalOpen(true);
            }}
          />
        )}
      </Router>
    </AppWrapper>
  );
}

export default App;
