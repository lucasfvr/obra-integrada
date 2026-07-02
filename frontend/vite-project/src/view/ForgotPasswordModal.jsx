import React, { useState } from "react";
import { FiMail, FiLoader, FiArrowLeft } from "react-icons/fi";
import logoObraIntegrada from "../assets/logo-obra-integrada.png";
import { validateEmail } from "../utils/validation";
import API_BASE_URL from "../config/api.js";

function ForgotPasswordModal({ onBack, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("email");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const resetForm = () => {
    setError("");
    setLoading(false);
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setInfoMessage("");
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setStage("verify");
        setInfoMessage("O código de recuperação foi enviado para o seu e-mail.");
      } else if (response.status === 404) {
        setError(data.erro || "E-mail não cadastrado.");
      } else {
        setError(data.erro || "Erro ao enviar o código de recuperação.");
      }
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!code) {
      setError("Código é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (response.ok) {
        setStage("reset");
        setInfoMessage("Código validado. Agora escolha sua nova senha.");
      } else {
        setError(data.erro || "Código inválido ou expirado");
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!code) {
      setError("Código é obrigatório");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Senha inválida (mínimo 6 caracteres)");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/reset-password-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setStage("done");
        setInfoMessage("Senha atualizada com sucesso!");
      } else {
        setError(data.erro || "Código inválido ou erro ao redefinir senha");
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 flex items-center gap-1 text-sm font-medium"
        >
          <FiArrowLeft /> Voltar
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        <div className="flex flex-col items-center mb-6 mt-8">
          <div className="mb-3">
            <img src={logoObraIntegrada} alt="Logo" className="w-20 h-20 object-contain" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Recuperar Senha</h2>
          <p className="text-gray-600 text-sm text-center mt-2">
            {stage === "email"
              ? "Digite seu e-mail para receber o código de recuperação."
              : stage === "verify"
              ? "Insira o código que você recebeu por e-mail."
              : stage === "reset"
              ? "Escolha uma nova senha para sua conta."
              : "Sua senha foi redefinida com sucesso."}
          </p>
        </div>

        {infoMessage && (
          <p className="text-green-600 text-sm mb-4 text-center">{infoMessage}</p>
        )}

        {stage === "email" && (
          <form onSubmit={handleSubmitEmail} className="flex flex-col gap-4">
            <div>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:border-indigo-500"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              {loading && <FiLoader className="animate-spin" />}
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        )}

        {stage === "verify" && (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
              <input
                type="text"
                placeholder="Código de 6 dígitos"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg flex-1"
              >
                {loading ? "Verificando..." : "Verificar código"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage("email");
                  resetForm();
                }}
                className="py-2 px-3 border rounded-lg"
              >
                Voltar
              </button>
            </div>
          </form>
        )}

        {stage === "reset" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
              <input
                type="text"
                value={code}
                readOnly
                className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nova senha</label>
              <input
                type="password"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar nova senha</label>
              <input
                type="password"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg flex-1"
              >
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage("verify");
                  setError("");
                  setInfoMessage("");
                }}
                className="py-2 px-3 border rounded-lg"
              >
                Voltar
              </button>
            </div>
          </form>
        )}

        {stage === "done" && (
          <div className="flex flex-col gap-4">
            <p className="text-green-700 text-center font-medium">Senha atualizada com sucesso!</p>
            <button
              type="button"
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
