import React, { useState } from "react";
import { FiMail, FiLoader, FiArrowLeft } from "react-icons/fi";
import logoObraIntegrada from "../assets/logo-obra-integrada.png";
import { validateEmail } from "../utils/validation";
import API_BASE_URL from "../config/api.js";

function ForgotPasswordModal({ onBack, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
        setSuccess(true);
        setEmail("");
      } else {
        setError(data.erro || "Erro ao enviar link de recuperação");
      }
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
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
            Digite seu e-mail para receber um link de recuperação
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              {loading ? "Enviando..." : "Enviar Link"}
            </button>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <p className="text-gray-800 font-medium mb-2">E-mail enviado com sucesso!</p>
            <p className="text-gray-600 text-sm mb-4">
              Verifique sua caixa de entrada para as instruções de recuperação de senha.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Voltar ao login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
