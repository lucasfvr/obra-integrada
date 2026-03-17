import React, { useState, useEffect } from "react";
import HomePage from "./Home.jsx";
import LoginModal from "./Login.jsx";
import RegisterModal from "./RegisterModal.jsx";
import FormularioCompletoPage from "./FormularioCompletoPage.jsx";
import PlansPage from "./PlansPage.jsx";
import Dashboard from "./Dashboard.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function App() {
  const [screen, setScreen] = useState("home");
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUserId, setNewUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("obra-token");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setCurrentUser(data.usuario || { username: data.usuario?.username || "" });
          setScreen("dashboard");
        } else {
          localStorage.removeItem("obra-token");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Não foi possível recuperar perfil:", err);
        localStorage.removeItem("obra-token");
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("obra-token", token);
    setCurrentUser(userData);
    setLoginModalOpen(false);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("obra-token");
    setCurrentUser(null);
    setScreen("home");
  };

  const handleRegisterSuccess = (userId) => {
    setRegisterModalOpen(false);
    setNewUserId(userId);
    setScreen("formulario");
  };

  const handleFormCompleteSuccess = () => {
    setScreen("dashboard");
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-700 text-center">Carregando...</div>
      </div>
    );
  }

  let currentPage;

  if (screen === "formulario") {
    currentPage = (
      <>
        <Header
          onNavigate={setScreen}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <div className="flex justify-center items-start min-h-screen bg-gray-100 py-10">
          <FormularioCompletoPage userId={newUserId} onSubmitSuccess={handleFormCompleteSuccess} />
        </div>
        <Footer />
      </>
    );
  } else if (screen === "dashboard" && currentUser) {
    currentPage = <Dashboard onLogout={handleLogout} currentUser={currentUser} onNavigate={setScreen} />;
  } else if (screen === "plans") {
    currentPage = <PlansPage onNavigate={setScreen} currentUser={currentUser} onLogout={handleLogout} />;
  } else if (["integracoes", "recursos", "sobre-nos", "contato"].includes(screen)) {
    const titleMap = {
      integracoes: "Integrações",
      recursos: "Recursos",
      "sobre-nos": "Sobre Nós",
      contato: "Contato",
    };

    currentPage = (
      <>
        <Header onNavigate={setScreen} currentUser={currentUser} onLogout={handleLogout} />
        <main className="min-h-screen bg-slate-50 p-10">
          <div className="container mx-auto bg-white p-6 rounded-xl shadow">
            <h1 className="text-3xl font-bold mb-3">{titleMap[screen]}</h1>
            <p className="text-slate-600">Esta é a página de {titleMap[screen].toLowerCase()}. Você pode personalizar o conteúdo aqui.</p>
          </div>
        </main>
        <Footer />
      </>
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
      {isLoginModalOpen && <LoginModal onLogin={handleLogin} onClose={() => setLoginModalOpen(false)} />}
      {isRegisterModalOpen && <RegisterModal onClose={() => setRegisterModalOpen(false)} onRegisterSuccess={handleRegisterSuccess} />}
    </>
  );
}

export default App;
