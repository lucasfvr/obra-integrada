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
<<<<<<< HEAD
=======
import VagasPage from "../pages/RH/Recrutamento/VagasPage.jsx";
import CandidatosPage from "../pages/RH/Recrutamento/CandidatosPage.jsx";
import BancoTalentosPage from "../pages/RH/Recrutamento/BancoTalentosPage.jsx";
import EntrevistasPage from "../pages/RH/Recrutamento/EntrevistasPage.jsx";
>>>>>>> de3e7b597ac8942d033682c7a44bce614241ef4f

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
              path="/profile"
              element={
                <ProtectedRoute>
                  <PermissaoGuard permissao="ver_perfil" redirectToRestricted>
                    <MeuPerfilCV />
                  </PermissaoGuard>
                </ProtectedRoute>
              }
            />
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
            <Route path="/rh-dashboard" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh" redirectToRestricted><RHDashboard /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh-avancado" element={<ProtectedRoute><PermissaoGuard permissao="gerenciar_usuarios" redirectToRestricted><GestaoRHAvancado /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/colaboradores" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><ColaboradoresPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/colaboradores/:id" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><ColaboradorPerfilPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/terceirizados" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><TerceirizadosPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/equipes" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><EquipesPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/organograma" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><OrganogramaPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/cargos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><CargosPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/transferencias" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><TransferenciasPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/historico-movimentacoes" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><HistoricoPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/aniversariantes" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><AniversariantesPage /></PermissaoGuard></ProtectedRoute>} />
<<<<<<< HEAD
            <Route path="/rh/vagas" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Vagas" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/candidatos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Candidatos" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/banco-talentos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Banco de Talentos" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/entrevistas" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Entrevistas" /></PermissaoGuard></ProtectedRoute>} />
=======
            <Route path="/rh/vagas" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><VagasPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/candidatos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><CandidatosPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/banco-talentos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><BancoTalentosPage /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/entrevistas" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><EntrevistasPage /></PermissaoGuard></ProtectedRoute>} />
>>>>>>> de3e7b597ac8942d033682c7a44bce614241ef4f
            <Route path="/rh/contratacoes" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Contratações" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/documentacao" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Documentação" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/assinaturas" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Assinaturas" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/integracao" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Integração" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/ponto" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Ponto" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/escalas" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Escalas" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/banco-horas" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Banco de Horas" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/ocorrencias" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Ocorrências" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/treinamentos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Treinamentos" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/certificacoes" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Certificações" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/avaliacoes" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Avaliações" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/carreira" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Carreira" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/aso" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="ASO" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/exames" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Exames" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/epis" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="EPIs" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/nr10" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="NR10" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/nr35" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="NR35" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/alertas" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Alertas" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/beneficios" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Benefícios" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/ferias" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Férias" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/licencas" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Licenças" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/afastamentos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Afastamentos" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/folha-pagamento" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Folha de Pagamento" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/holerites" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Holerites" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/encargos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Encargos" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/resumos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Resumos" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/equipes-obra" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Equipes por Obra" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/movimentacoes" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Movimentações" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/custos" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Custos" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/historico" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Histórico" /></PermissaoGuard></ProtectedRoute>} />
            <Route path="/rh/relatorios" element={<ProtectedRoute><PermissaoGuard permissao="ver_rh"><UnderConstruction titulo="Relatórios" /></PermissaoGuard></ProtectedRoute>} />
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
