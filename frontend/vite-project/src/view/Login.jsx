import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
<<<<<<< HEAD
import logoObraIntegrada from "../assets/logo-obra-integrada.png";
import { validateEmail, validatePassword } from "../utils/validation";
=======
import logoObraIntegrada from "../assets/logo-obra-integrada.png"; 
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22

function LoginModal({ onLogin, onClose, openRegister }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [errors, setErrors] = useState({});
=======

  const validateEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
<<<<<<< HEAD
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

=======

    if (!usuario.trim() || !senha.trim()) {
      setError("Email e senha são obrigatórios.");
      return;
    }

    if (!validateEmail(usuario.trim())) {
      setError("Por favor, informe um email válido.");
      return;
    }

    setIsSubmitting(true);
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22
    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
        body: JSON.stringify({ username: usuario, password: senha }),
=======
        body: JSON.stringify({ username: usuario.trim(), password: senha }),
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22
      });

      const data = await response.json();
      if (response.ok) {
<<<<<<< HEAD
        onLogin(data.user);
=======
        onLogin(data.user, data.token);
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22
      } else {
        setError(data.erro || "Falha no login");
      }
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
<<<<<<< HEAD
=======
    } finally {
      setIsSubmitting(false);
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22
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
<<<<<<< HEAD
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
=======
          <div className="relative">
            <FiMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
            <input
              type="email"
              placeholder="Seu@email.com"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-3.5 text-gray-400 text-lg" />
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {mostrarSenha ? <FiEyeOff /> : <FiEye />}
            </button>
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22
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
<<<<<<< HEAD
            <a href="#" className="hover:text-indigo-600">
              Esqueceu senha?
            </a>
=======
            <button type="button" className="hover:text-indigo-600 text-indigo-600 font-medium text-xs">
              Esqueceu senha?
            </button>
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22
          </div>

          <button
            type="submit"
<<<<<<< HEAD
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Entrar
=======
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"} text-white font-medium py-2.5 rounded-lg transition-colors mt-2`}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22
          </button>

          <p className="text-center text-sm text-gray-600 mt-3">
            Não tem uma conta?{" "}
            <span
<<<<<<< HEAD
              className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline cursor-pointer transition-colors duration-200 active:text-indigo-900"
=======
              className="text-indigo-600 font-medium hover:underline cursor-pointer"
>>>>>>> bc85cfa1072947480c4a0c6232f4ebe60a188d22
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
