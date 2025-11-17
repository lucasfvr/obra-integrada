import React, { useState } from "react";
import HomePage from "./Home.jsx";
import LoginModal from "./Login.jsx";
import RegisterModal from "./RegisterModal.jsx";
import FormularioCompletoPage from "./FormularioCompletoPage.jsx";
import Dashboard from "./Dashboard.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

function App() {
  const [screen, setScreen] = useState("home");
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUserId, setNewUserId] = useState(null);

  // LOGIN OK
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setLoginModalOpen(false);
    setScreen("dashboard");
  };

  // LOGOUT
  const handleLogout = () => {
    setCurrentUser(null);
    setScreen("home");
  };

  // CADASTRO SUCESSO — Abre o formulário completo
  const handleRegisterSuccess = (userId) => {
    setRegisterModalOpen(false);
    setNewUserId(userId);
    setScreen("formulario"); // 👉 mostra o formulário completo
  };

  // Após enviar o formulário completo
  const handleFormCompleteSuccess = () => {
    setScreen("dashboard");
  };

  // Controle de telas
  let currentPage;

  if (screen === "formulario") {
    currentPage = (
      <>
        <Header />
        <div className="flex justify-center items-start min-h-screen bg-gray-100 py-10">
          <FormularioCompletoPage
            userId={newUserId}
            onSubmitSuccess={handleFormCompleteSuccess}
          />
        </div>
        <Footer />
      </>
    );
  } else if (screen === "dashboard" && currentUser) {
    currentPage = (
      <Dashboard
        onLogout={handleLogout}
        currentUser={currentUser}
        onNavigate={setScreen}
      />
    );
  } else {
    currentPage = (
      <HomePage
        onNavigate={setScreen}
        onLoginClick={() => setLoginModalOpen(true)}
        onRegisterClick={() => setRegisterModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <>
      {currentPage}

      {isLoginModalOpen && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setLoginModalOpen(false)}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          onClose={() => setRegisterModalOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </>
  );
}

export default App;
