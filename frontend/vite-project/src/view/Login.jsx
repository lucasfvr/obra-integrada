import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import logoObraIntegrada from "../assets/logo-obra-integrada.png";
import { validateEmail, validatePassword } from "../utils/validation";

function LoginModal({ onLogin, onClose, openRegister }) {
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

    // Validar email
    const emailValidation = validateEmail(usuario);
    if (!emailValidation.valid) {
      newErrors.usuario = emailValidation.message;
    }

    // Validar senha
    const passwordValidation = validatePassword(senha);
    if (!passwordValidation.valid) {
      newErrors.senha = passwordValidation.message;
    }

    // Se houver erros, mostrar e não prosseguir
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError("Por favor, corrija os erros nos campos");
      return;
    }

    setErrors({});

    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password: senha }),
      });

      const data = await response.json();
      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.erro || "Falha no login");
      }
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="mb-3">
            <img
              src={logoObraIntegrada}
              alt="Logo da Obra Integrada"
              className="w-20 h-20 object-contain drop-shadow-md"
            />
          </div>
          <p className="text-gray-600 mt-2 text-center">
            <span className="font-medium text-gray-800">Bem-vindo de volta!</span>
            <br />
            Entre pra gerenciar suas obras
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className={`relative ${errors.usuario ? 'border-red-500' : ''}`}>
              <FiMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type="email"
                placeholder="Seu@email.com"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  if (errors.usuario) setErrors({...errors, usuario: null});
                }}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.usuario ? 'border-red-500' : 'border-gray-300'
                }`}
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
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (errors.senha) setErrors({...errors, senha: null});
                }}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.senha ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha}</p>}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={() => setLembrar(!lembrar)}
                className="accent-indigo-600"
              />
              Lembrar de mim
            </label>
            <a href="#" className="hover:text-indigo-600">
              Esqueceu senha?
            </a>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Entrar
          </button>

          <p className="text-center text-sm text-gray-600 mt-3">
            Não tem uma conta?{" "}
            <span
              className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline cursor-pointer transition-colors duration-200 active:text-indigo-900"
              onClick={openRegister}
            >
              Cadastre-se
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
