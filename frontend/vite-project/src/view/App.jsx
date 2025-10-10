import React, { useState } from "react";
import HomePage from './Home.jsx';
import LoginModal from "./Login.jsx";
import RegisterModal from "./RegisterModal.jsx";
import Dashboard from "./Dashboard.jsx";
import PlansPage from "./PlansPage.jsx";

function App() {
  const [screen, setScreen] = useState("home");
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setLoginModalOpen(false);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen("home");
  };

  let currentPage;
  if (screen === "dashboard" && currentUser) {
    currentPage = <Dashboard 
      onLogout={handleLogout}
      currentUser={currentUser}
      onNavigate={setScreen}
    />;
  } 
  else {
    currentPage = <HomePage 
      onNavigate={setScreen} 
      onLoginClick={() => setLoginModalOpen(true)}
      onRegisterClick={() => setRegisterModalOpen(true)}
      currentUser={currentUser}
      onLogout={handleLogout}
    />;
  }

  return (
    <>
      {currentPage}
      {isLoginModalOpen && <LoginModal onLogin={handleLogin} onClose={() => setLoginModalOpen(false)} />}
      {isRegisterModalOpen && <RegisterModal onClose={() => setRegisterModalOpen(false)} onRegisterSuccess={() => setRegisterModalOpen(false)} />}
    </>
  );
}

export default App;