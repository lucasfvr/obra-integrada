import React, { useState } from "react";
import { FiMail } from "react-icons/fi";
import logoObraIntegrada from "../assets/logo-obra-integrada.png";
import API_BASE_URL from "../config/api.js";
import { validateEmail } from "../utils/validation";

function RegisterModal({ onClose, onRegisterSuccess, onOpenLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailValue = email.trim();
    const emailValidation = validateEmail(emailValue);
    if (!emailValidation.valid) {
      setErrors({ email: emailValidation.message });
      setError("Por favor, corrija o email informado.");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });

      const data = await response.json();
      if (response.ok) {
        const returnedId =
          data.id ??
          data._id ??
          data.userId ??
          data.tempId ??
          (data.user && data.user.id) ??
          null;

        if (returnedId) {
          onRegisterSuccess(returnedId, {
            email: emailValue,
            preRegToken: data.preRegToken ?? null,
          });
        } else {
          setError("Pré-cadastro realizado, mas o ID não foi retornado.");
        }
      } else {
        const msg = data.erro || data.message || "Falha no pré-cadastro";
        setError(msg);
        if (msg.toLowerCase().includes("email")) setErrors({ email: msg });
      }
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="mb-3">
            <img src={logoObraIntegrada} alt="Logo da Obra Integrada" className="w-20 h-20 object-contain drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Pré-cadastro</h2>
          <p className="text-gray-500 text-sm">Digite o email que deseja cadastrar:</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className={`flex items-center border rounded-lg px-3 py-2 ${errors.email ? 'border-red-500' : ''}`}>
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); }}
                className="w-full outline-none"
                required
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="text-center text-sm text-gray-600 mt-2">
            Já possui conta?{' '}
            <button
              type="button"
              onClick={() => onOpenLogin?.()}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Entrar
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium mt-2 transition-all disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterModal;
