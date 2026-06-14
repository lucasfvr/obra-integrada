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
import MaterialCalculator from "./MaterialCalculator.jsx";
import { EquipeOrganograma } from "../pages/Operational/EquipeOrganograma.jsx";
import { MeuPerfilCV } from "../pages/Operational/MeuPerfilCV.jsx";
import { UnderConstruction } from "../components/common/UnderConstruction.jsx";
import { PermissaoGuard } from "../components/Guards/PermissaoGuard.jsx";
import MinhasObrasPage from "../pages/Obras/MinhasObrasPage.jsx";
import GestaoRH from "../pages/Operational/GestaoRH.jsx";

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
                <Navigate to="/dashboard" replace />
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
                  <DashboardDinamico
                    currentUser={user}
                    onLogout={logout}
                  />
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
                    <UnderConstruction titulo="Equipe e Organograma" />
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
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />
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
