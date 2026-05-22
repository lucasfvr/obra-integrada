import React, { useState } from "react";
import { FiUser, FiMail, FiFileText, FiBriefcase, FiCheck, FiX } from "react-icons/fi";
import logoObraIntegrada from "../assets/logo-obra-integrada.png";
import API_BASE_URL from "../config/api.js";
import { 
  formatCPF, validateCPF, 
  formatCNPJ, validateCNPJ, 
  validateEmail, validateName, validateRazaoSocial 
} from "../utils/validation";

function RegisterModal({ onClose, onRegisterSuccess, onOpenLogin }) {
  const [tipoPessoa, setTipoPessoa] = useState("fisica");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Estado da validação do CNPJ via API
  const [cnpjStatus, setCnpjStatus] = useState("idle"); // 'idle' | 'loading' | 'found' | 'error'
  const [cnpjError, setCnpjError] = useState("");
  const [showCnpjError, setShowCnpjError] = useState(false); // só mostra erro após clicar Cadastrar

  const handleTipoPessoaChange = (tipo) => {
    setTipoPessoa(tipo);
    setNome("");
    setCpf("");
    setRazaoSocial("");
    setCnpj("");
    setEmail("");
    setError("");
    setErrors({});
    setCnpjStatus("idle");
    setCnpjError("");
    setShowCnpjError(false);
  };

  // Consulta CNPJ na Receita Federal ao sair do campo
  const handleCnpjBlur = async () => {
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length !== 14) return;

    const validation = validateCNPJ(cnpj);
    if (!validation.valid) {
      setCnpjStatus("error");
      setCnpjError("CNPJ inválido");
      return;
    }

    try {
      setCnpjStatus("loading");
      setCnpjError("");

      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);

      if (response.status === 404) {
        setCnpjStatus("error");
        setCnpjError("CNPJ não encontrado na Receita Federal");
        return;
      }

      if (!response.ok) {
        // API indisponível — não bloqueia
        setCnpjStatus("idle");
        return;
      }

      const data = await response.json();
      const situacao = (data.descricao_situacao_cadastral || "").toUpperCase();

      if (situacao !== "ATIVA") {
        setCnpjStatus("error");
        setCnpjError(`Empresa ${data.descricao_situacao_cadastral || "inativa"}. Apenas empresas ativas podem se cadastrar.`);
        return;
      }

      // ✅ Válido — auto-preenche Razão Social se vazio
      setCnpjStatus("found");
      setCnpjError("");
      setErrors(prev => ({ ...prev, cnpj: null }));
      if (!razaoSocial.trim()) {
        setRazaoSocial(data.razao_social || "");
      }

    } catch {
      // Erro de rede — não bloqueia
      setCnpjStatus("idle");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Revela erros de CNPJ ao tentar submeter
    if (tipoPessoa === "juridica") setShowCnpjError(true);
    const newErrors = {};

    if (tipoPessoa === "fisica") {
      const nameValidation = validateName(nome);
      if (!nameValidation.valid) newErrors.nome = nameValidation.message;

      const cpfValidation = validateCPF(cpf);
      if (!cpfValidation.valid) newErrors.cpf = cpfValidation.message;
    } else {
      const razaoSocialValidation = validateRazaoSocial(razaoSocial);
      if (!razaoSocialValidation.valid) {
        newErrors.razaoSocial = razaoSocialValidation.message;
      }
      if (cnpjStatus === "error") {
        newErrors.cnpj = cnpjError || "CNPJ inválido";
      } else {
        const cnpjValidation = validateCNPJ(cnpj);
        if (!cnpjValidation.valid) newErrors.cnpj = cnpjValidation.message;
      }
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) newErrors.email = emailValidation.message;

    if (Object.keys(newErrors).filter(k => newErrors[k]).length > 0) {
      setErrors(newErrors);
      setError("Por favor, corrija os erros nos campos");
      return;
    }

    setErrors({});
    setLoading(true);

    const payload =
      tipoPessoa === "fisica"
        ? { tipo: "fisica", nome, cpf: cpf.replace(/\D/g, ""), email }
        : { tipo: "juridica", razaoSocial, cnpj: cnpj.replace(/\D/g, ""), email };

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
            tipo: tipoPessoa,
            nome: nome.trim(),
            cpf: cpf.replace(/\D/g, ""),
            razaoSocial: razaoSocial.trim(),
            cnpj: cnpj.replace(/\D/g, ""),
            email: email.trim(),
            preRegToken: data.preRegToken ?? null,
          });
        } else {
          setError("Cadastro criado, mas o ID do usuário não foi retornado.");
        }
      } else {
        const msg = data.erro || data.message || "Falha no cadastro";
        setError(msg);
        if (msg.toLowerCase().includes("email")) setErrors(prev => ({ ...prev, email: msg }));
        if (msg.toLowerCase().includes("cpf")) setErrors(prev => ({ ...prev, cpf: msg }));
        if (msg.toLowerCase().includes("cnpj")) setErrors(prev => ({ ...prev, cnpj: msg }));
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
          <h2 className="text-2xl font-semibold text-gray-800">Cadastro Rápido</h2>
          <p className="text-gray-500 text-sm">Preencha alguns dados para começar</p>
        </div>

        <div className="flex justify-center gap-4 mb-4">
          <button type="button"
            className={`px-3 py-1 rounded-lg text-sm font-medium ${tipoPessoa === "fisica" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => handleTipoPessoaChange("fisica")}>
            Pessoa Física
          </button>
          <button type="button"
            className={`px-3 py-1 rounded-lg text-sm font-medium ${tipoPessoa === "juridica" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => handleTipoPessoaChange("juridica")}>
            Pessoa Jurídica
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tipoPessoa === "fisica" ? (
            <>
              <div>
                <div className={`flex items-center border rounded-lg px-3 py-2 ${errors.nome ? 'border-red-500' : ''}`}>
                  <FiUser className="text-gray-400 mr-2" />
                  <input type="text" placeholder="Nome completo" value={nome}
                    onChange={(e) => { setNome(e.target.value); if (errors.nome) setErrors({...errors, nome: null}); }}
                    className="w-full outline-none" required />
                </div>
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
              </div>
              <div>
                <div className={`flex items-center border rounded-lg px-3 py-2 ${errors.cpf ? 'border-red-500' : ''}`}>
                  <FiFileText className="text-gray-400 mr-2" />
                  <input type="text" placeholder="CPF" value={cpf}
                    onChange={(e) => { setCpf(formatCPF(e.target.value)); if (errors.cpf) setErrors({...errors, cpf: null}); }}
                    className="w-full outline-none" maxLength="14" required />
                </div>
                {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
              </div>
            </>
          ) : (
            <>
              <div>
                <div className={`flex items-center border rounded-lg px-3 py-2 ${errors.razaoSocial ? 'border-red-500' : ''}`}>
                  <FiBriefcase className="text-gray-400 mr-2" />
                  <input type="text" placeholder="Razão Social" value={razaoSocial}
                    onChange={(e) => { setRazaoSocial(e.target.value); if (errors.razaoSocial) setErrors({...errors, razaoSocial: null}); }}
                    className="w-full outline-none" required />
                </div>
                {errors.razaoSocial && <p className="text-red-500 text-xs mt-1">{errors.razaoSocial}</p>}
              </div>

              {/* CNPJ com validação inline */}
              <div>
                <div className={`flex items-center border rounded-lg px-3 py-2 transition-colors ${
                  cnpjStatus === 'found' ? 'border-green-500' :
                  (showCnpjError && cnpjStatus === 'error') || errors.cnpj ? 'border-red-500' : ''
                }`}>
                  <FiFileText className="text-gray-400 mr-2 flex-shrink-0" />
                  <input type="text" placeholder="CNPJ" value={cnpj}
                    onChange={(e) => { setCnpj(formatCNPJ(e.target.value)); setCnpjStatus("idle"); setCnpjError(""); setShowCnpjError(false); if (errors.cnpj) setErrors({...errors, cnpj: null}); }}

                    onBlur={handleCnpjBlur}
                    className="w-full outline-none" maxLength="18" required />
                  <div className="ml-2 flex-shrink-0">
                    {cnpjStatus === 'loading' && (
                      <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    )}
                    {cnpjStatus === 'found' && <FiCheck className="text-green-500 h-4 w-4" />}
                    {showCnpjError && cnpjStatus === 'error' && <FiX className="text-red-500 h-4 w-4" />}
                  </div>
                </div>
                {cnpjStatus === 'loading' && <p className="text-xs text-indigo-500 mt-1">🔍 Verificando CNPJ...</p>}
                {showCnpjError && cnpjStatus === 'error' && cnpjError && <p className="text-red-500 text-xs mt-1">{cnpjError}</p>}
                {errors.cnpj && cnpjStatus !== 'error' && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
              </div>
            </>
          )}

          <div>
            <div className={`flex items-center border rounded-lg px-3 py-2 ${errors.email ? 'border-red-500' : ''}`}>
              <FiMail className="text-gray-400 mr-2" />
              <input type="email" placeholder="Seu e-mail" value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({...errors, email: null}); }}
                className="w-full outline-none" required />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="text-center text-sm text-gray-600 mt-2">
            Já possui conta?{' '}
            <button type="button" onClick={() => { if (onOpenLogin) onOpenLogin(); }}
              className="font-semibold text-indigo-600 hover:text-indigo-700">
              Entrar
            </button>
          </div>

          <button type="submit"
            disabled={loading || cnpjStatus === 'loading'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium mt-2 transition-all disabled:opacity-60">
            {loading ? "Cadastrando..." : cnpjStatus === 'loading' ? "Verificando CNPJ..." : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterModal;
