import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import logoObraIntegrada from "../assets/logo-obra-integrada.png";
import { validateEmail, validatePasswordLogin } from "../utils/validation";
import API_BASE_URL from "../config/api.js";

function LoginModal({ onLogin, onClose, onForgotPassword, openRegister }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const newErrors = {};

    const emailValidation = validateEmail(usuario);
    if (!emailValidation.valid) newErrors.usuario = emailValidation.message;

    const passwordValidation = validatePasswordLogin(senha);
    if (!passwordValidation.valid) newErrors.senha = passwordValidation.message;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError("Por favor, corrija os erros nos campos");
      return;
    }

    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password: senha }),
      });

      const data = await response.json();
      if (response.ok) {
        onLogin({ ...data.user, token: data.token }, lembrar);
      } else {
        setError(data.erro || "E-mail ou senha incorretos");
      }
    } catch {
      setError("Não foi possível conectar ao servidor.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="mb-3">
            <img src={logoObraIntegrada} alt="Logo" className="w-20 h-20 object-contain" />
          </div>
          <p className="text-gray-600 mt-2 text-center">
            <span className="font-medium text-gray-800">Bem-vindo de volta!</span>
            <br />
            Entre pra gerenciar suas obras
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2 justify-center mb-1">
            <button
              type="button"
              id="dev-login-rh"
              onClick={() => {
                setUsuario("rh@vanguarda.com.br");
                setSenha("Senha123!");
              }}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold py-1 px-2 rounded transition-colors"
            >
              Dev: RH User
            </button>
            <button
              type="button"
              id="dev-login-admin"
              onClick={() => {
                setUsuario("admin@obras.com");
                setSenha("Admin123!");
              }}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold py-1 px-2 rounded transition-colors"
            >
              Dev: Admin User
            </button>
          </div>

          <div>
            <div className={`relative ${errors.usuario ? 'border-red-500' : ''}`}>
              <FiMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type="email"
                placeholder="Seu@email.com"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none"
                required
              />
            </div>
            {errors.usuario && <p className="text-red-500 text-xs mt-1">{errors.usuario}</p>}
          </div>

          <div>
            <div className={`relative ${errors.senha ? 'border-red-500' : ''}`}>
              <FiLock className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-3.5 text-gray-400"
              >
                {mostrarSenha ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha}</p>}
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span>Lembrar-me</span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Esqueci minha senha
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" className="bg-indigo-600 text-white font-medium py-2.5 rounded-lg">
            Entrar
          </button>

          <div className="text-center text-sm text-gray-600 mt-3">
            Ainda não tem conta?{' '}
            <button
              type="button"
              onClick={openRegister}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Cadastre-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
