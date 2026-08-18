import React, { useState } from "react";
import { FiMail, FiLoader, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // `infoMessage` e alimentado por setInfoMessage em 8 pontos deste arquivo, mas
  // nunca chega a ser renderizado — as mensagens sao definidas e nao aparecem
  // para o usuario. Fica anotado; corrigir exige decidir ONDE mostrar.
  // eslint-disable-next-line no-unused-vars
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

        {stage === "email" && (
          <>
            <div className="flex flex-col items-center mb-6 mt-8">
              <div className="mb-3">
                <img src={logoObraIntegrada} alt="Logo" className="w-20 h-20 object-contain" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Recuperar Senha</h2>
              <p className="text-gray-600 text-sm text-center mt-2">
                Digite seu e-mail para receber o código de recuperação.
              </p>
            </div>

            <form onSubmit={handleSubmitEmail} className="flex flex-col gap-4">
              <div>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {loading && <FiLoader className="animate-spin" />}
                {loading ? "Enviando..." : "Enviar código"}
              </button>
            </form>
          </>
        )}

        {stage === "verify" && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <FiMail className="h-7 w-7 text-indigo-600" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Etapa 1 de 3</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Insira o código</h3>
              <p className="mt-2 text-sm text-slate-600 text-center">
                Enviamos um código de 6 dígitos para{' '}
                <span className="font-medium text-slate-900">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Digite o código"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  className="w-full border rounded-lg px-4 py-3 text-base text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {loading ? 'Verificando...' : 'Verificar código'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStage("email");
                  resetForm();
                }}
                className="w-full rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Voltar
              </button>
            </form>
          </>
        )}

        {stage === "reset" && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <FiMail className="h-7 w-7 text-indigo-600" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Etapa 2 de 3</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Escolha sua nova senha</h3>
              <p className="mt-2 text-sm text-slate-600 text-center">
                Crie uma senha forte e segura para sua conta.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova senha</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 pr-10 border rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar nova senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 pr-10 border rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStage("verify");
                  setError("");
                  setInfoMessage("");
                }}
                className="w-full rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Voltar
              </button>
            </form>
          </>
        )}

        {stage === "done" && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <FiMail className="h-7 w-7 text-green-600" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-600">Concluído</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Senha redefinida!</h3>
              <p className="mt-2 text-sm text-slate-600 text-center">
                Sua senha foi atualizada com sucesso. Você pode fazer login com a nova senha.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold transition hover:bg-indigo-700"
            >
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
