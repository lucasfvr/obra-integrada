import API_BASE_URL from "../config/api.js";
import React, { useState } from "react";
import { FiMail, FiUser, FiMapPin, FiPhone, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";


import {
  validateCelular,
  validateTelefone,
  validateCPF,
  validateCNPJ,
  validateCEP,
  validateName,
  validateRazaoSocial,
  formatCPF,
  formatCNPJ,
  formatCEP,
  formatCelular,
  formatTelefone,
  formatInscricaoEstadual,
  validateInscricaoEstadual,
  getMaskForState,
} from "../utils/validation";

function FormularioCompletoPage({ tempId, preRegisterData, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    email: preRegisterData?.email || "",
    confirmarEmail: "",
    senha: "",
    confirmarSenha: "",
    tipoCadastro: preRegisterData?.tipo || "fisica",
    nome: preRegisterData?.nome || "",
    cpf: preRegisterData?.cpf ? formatCPF(preRegisterData.cpf) : "",
    cnpj: preRegisterData?.cnpj ? formatCNPJ(preRegisterData.cnpj) : "",
    razaoSocial: preRegisterData?.razaoSocial || "",
    ieUf: "",
    inscricaoEstadual: "",
    celular: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    referencia: "",
    bairro: "",
    cidade: "",
    estado: "",
    funcao: "",
    porteEmpresa: "",
    usoPlataforma: "",
    tipo_registro_profissional: "",
    numero_registro_profissional: "",
    preRegToken: preRegisterData?.preRegToken || "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [ieError, setIeError] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);



  // Calcula a força da senha
  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/(?=.*[a-z])/.test(password)) score += 1;
    if (/(?=.*[A-Z])/.test(password)) score += 1;
    if (/(?=.*\d)/.test(password)) score += 1;
    if (/(?=.*[@$!%*?&])/.test(password)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(formData.senha);

  const renderStrengthBar = () => {
    if (formData.senha.length === 0) return null;
    let color = "bg-red-500";
    let text = "Muito Fraca";
    let width = "w-1/4";

    if (strengthScore === 2) { color = "bg-orange-500"; text = "Fraca"; width = "w-2/4"; }
    else if (strengthScore === 3 || strengthScore === 4) { color = "bg-yellow-500"; text = "Boa"; width = "w-3/4"; }
    else if (strengthScore === 5) { color = "bg-green-500"; text = "Forte"; width = "w-full"; }

    const hasMinLength = formData.senha.length >= 6;
    const hasUpper = /(?=.*[A-Z])/.test(formData.senha);
    const hasLower = /(?=.*[a-z])/.test(formData.senha);
    const hasNumber = /(?=.*\d)/.test(formData.senha);

    return (
      <div className="mt-2">
        <ul className="text-xs text-gray-600 mb-2 space-y-1">
          <li className={`flex items-center gap-1 ${hasMinLength ? "text-green-600 font-medium" : "text-gray-500"}`}>
            {hasMinLength ? <FiCheck className="text-green-500" /> : <FiX className="text-red-400" />} Mínimo de 6 caracteres
          </li>
          <li className={`flex items-center gap-1 ${hasUpper && hasLower ? "text-green-600 font-medium" : "text-gray-500"}`}>
            {hasUpper && hasLower ? <FiCheck className="text-green-500" /> : <FiX className="text-red-400" />} Letra maiúscula e minúscula
          </li>
          <li className={`flex items-center gap-1 ${hasNumber ? "text-green-600 font-medium" : "text-gray-500"}`}>
            {hasNumber ? <FiCheck className="text-green-500" /> : <FiX className="text-red-400" />} Pelo menos 1 número
          </li>
        </ul>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-gray-500">Nível de Segurança:</span>
          <span className={`font-semibold ${color.replace('bg-', 'text-')}`}>{text}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className={`${color} h-1.5 rounded-full transition-all duration-300 ${width}`}></div>
        </div>
      </div>
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Consulta automática de CEP
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      setLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrorMessage("CEP não encontrado.");
        return;
      }

      setFormData((prev) => {
        const uf = data.uf || prev.estado;
        return {
          ...prev,
          endereco: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: uf,
        };
      });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Erro ao buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  };



  const showError = (msg) => {
    setErrorMessage(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validações básicas
    if (!formData.usoPlataforma) {
      setErrorMessage("Por favor, informe como utilizará a plataforma.");
      return;
    }

    // Validação de documento de registro profissional (CREA/CAU/etc) se for prestar serviços
    if (formData.usoPlataforma === "prestar") {
      if (!formData.funcao) {
        setErrorMessage(
          formData.tipoCadastro === "fisica" 
            ? "Por favor, selecione sua profissão para prestar serviços." 
            : "Por favor, selecione a área de atuação da empresa para prestar serviços."
        );
        return;
      }

      const isFisicaSubmit = formData.tipoCadastro === "fisica";
      const REGISTRO_POR_AREA_SUBMIT = {
        "Construtora":           "CREA",
        "Engenharia Civil":      "CREA",
        "Arquitetura":           "CAU",
        "Elétrica":              "CREA",
        "Hidráulica":            "CREA",
        "Terraplanagem":         "CREA",
        "Segurança do Trabalho": "CREA",
      };
      const REGISTRO_POR_PROFISSAO_SUBMIT = {
        "Engenheiro Civil": "CREA",
        "Arquiteto": "CAU",
        "Engenheiro Eletricista": "CREA",
        "Engenheiro Mecânico": "CREA",
        "Engenheiro de Segurança do Trabalho": "CREA",
        "Técnico em Edificações": "CREA",
        "Técnico em Segurança do Trabalho": "MTE",
        "Topógrafo": "CREA",
      };
      
      const registroNecessarioSubmit = isFisicaSubmit
        ? REGISTRO_POR_PROFISSAO_SUBMIT[formData.funcao] || null
        : REGISTRO_POR_AREA_SUBMIT[formData.funcao] || null;

      if (registroNecessarioSubmit && !formData.numero_registro_profissional) {
        setErrorMessage(
          isFisicaSubmit 
            ? `O número de registro no ${registroNecessarioSubmit} é obrigatório.`
            : `O número de registro no ${registroNecessarioSubmit} do responsável técnico é obrigatório.`
        );
        return;
      }
    }

    
    if (!formData.email) {
      setErrorMessage("Email é obrigatório");
      return;
    }
    if (!formData.confirmarEmail) {
      setErrorMessage("Confirmação de email é obrigatória");
      return;
    }
    if (formData.email.toLowerCase() !== formData.confirmarEmail.toLowerCase()) {
      setErrorMessage("Os emails informados não coincidem. Verifique e tente novamente.");
      return;
    }
    if (!formData.senha || !formData.confirmarSenha) {
      setErrorMessage("Senha e confirmação são obrigatórias");
      return;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setErrorMessage("As senhas não coincidem");
      return;
    }
    if (formData.senha.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.senha)) {
      setErrorMessage("A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número");
      return;
    }

    if (formData.tipoCadastro === 'fisica') {
      const nomeValidation = validateName(formData.nome);
      if (!nomeValidation.valid) {
        setErrorMessage(nomeValidation.message);
        return;
      }
      if (!formData.cpf || formData.cpf.replace(/\D/g, "").length !== 11) {
        setErrorMessage("CPF deve ter 11 dígitos");
        return;
      }
      const cpfValidation = validateCPF(formData.cpf);
      if (!cpfValidation.valid) {
        setErrorMessage(cpfValidation.message);
        return;
      }
      // Garante que o CPF não foi alterado em relação ao pré-cadastro
      if (preRegisterData?.cpf && formData.cpf.replace(/\D/g, '') !== preRegisterData.cpf.replace(/\D/g, '')) {
        setErrorMessage('O CPF informado deve ser o mesmo do pré-cadastro.');
        return;
      }
    } else if (formData.tipoCadastro === 'juridica') {
      // Valida nome do responsável (pessoa jurídica também tem campo nome)
      const nomeRespValidation = validateName(formData.nome);
      if (!nomeRespValidation.valid) {
        setErrorMessage(nomeRespValidation.message);
        return;
      }
      const razaoSocialValidation = validateRazaoSocial(formData.razaoSocial);
      if (!razaoSocialValidation.valid) {
        setErrorMessage(razaoSocialValidation.message);
        return;
      }
      if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) {
        setErrorMessage("CNPJ deve ter 14 dígitos");
        return;
      }
      const cnpjValidation = validateCNPJ(formData.cnpj);
      if (!cnpjValidation.valid) {
        setErrorMessage(cnpjValidation.message);
        return;
      }
      // Garante que o CNPJ não foi alterado em relação ao pré-cadastro
      if (preRegisterData?.cnpj && formData.cnpj.replace(/\D/g, '') !== preRegisterData.cnpj.replace(/\D/g, '')) {
        setErrorMessage('O CNPJ informado deve ser o mesmo do pré-cadastro.');
        return;
      }
      // Garante que a Razão Social não foi alterada em relação ao pré-cadastro
      if (preRegisterData?.razaoSocial && formData.razaoSocial.trim().toLowerCase() !== preRegisterData.razaoSocial.trim().toLowerCase()) {
        setErrorMessage('A Razão Social informada deve ser a mesma do pré-cadastro.');
        return;
      }

      if (formData.ieUf && formData.estado && formData.ieUf !== formData.estado) {
        setErrorMessage(`O estado da Inscrição Estadual (${formData.ieUf}) deve ser o mesmo do endereço (${formData.estado}).`);
        return;
      }

      // Valida a Inscrição Estadual e a divergência de estados
      const ieValidation = validateInscricaoEstadual(formData.inscricaoEstadual, formData.ieUf || formData.estado);
      if (!ieValidation.valid) {
        setErrorMessage(ieValidation.message);
        return;
      }

      try {
        const cnpjNumbers = formData.cnpj.replace(/\D/g, "");
        const cnpjRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjNumbers}`);
        if (cnpjRes.ok) {
          const cnpjData = await cnpjRes.json();
          const cnpjUfReal = cnpjData.uf;
          if (cnpjUfReal && formData.estado && cnpjUfReal.toUpperCase() !== formData.estado.toUpperCase()) {
            setErrorMessage(`O estado do endereço (CEP: ${formData.estado}) deve ser o mesmo do CNPJ na Receita Federal (${cnpjUfReal}).`);
            return;
          }
        }
      } catch (err) {
        // ignora se a api cair, para não bloquear cadastro
      }
    }

    const cepValidation = validateCEP(formData.cep);
    if (!cepValidation.valid) {
      setErrorMessage(cepValidation.message);
      return;
    }
    if (!formData.endereco.trim()) {
      setErrorMessage("Endereço é obrigatório");
      return;
    }
    if (!formData.numero.trim()) {
      setErrorMessage("Número é obrigatório");
      return;
    }
    if (!formData.bairro.trim()) {
      setErrorMessage("Bairro é obrigatório");
      return;
    }
    if (!formData.cidade.trim()) {
      setErrorMessage("Cidade é obrigatória");
      return;
    }
    if (!/^[A-Za-z]{2}$/.test(formData.estado.trim())) {
      setErrorMessage("Estado deve ser a sigla com 2 letras");
      return;
    }

    // Validar celular
    const celularValidation = validateCelular(formData.celular);
    if (!celularValidation.valid) {
      setErrorMessage(celularValidation.message);
      return;
    }

    // Validar telefone (se preenchido)
    if (formData.telefone && formData.telefone.trim()) {
      const telefoneValidation = validateTelefone(formData.telefone);
      if (!telefoneValidation.valid) {
        setErrorMessage(telefoneValidation.message);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/formulario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cpf: formData.cpf || preRegisterData?.cpf || "",
          cnpj: formData.cnpj || preRegisterData?.cnpj || "",
          funcao: formData.funcao,
          tipo_registro_profissional: formData.tipo_registro_profissional,
          numero_registro_profissional: formData.numero_registro_profissional,
          preRegToken: formData.preRegToken || preRegisterData?.preRegToken || "",
        }),
      });

      if (!response.ok) {
        let msg = "Erro no envio";
        try {
          const err = await response.json();
          msg = err?.erro || err?.message || msg;
        } catch {
          msg = `Erro no envio (${response.status})`;
        }
        setErrorMessage(msg);
        return;
      }

      onSubmitSuccess?.();
    } catch (error) {
      setErrorMessage(error.message || "Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl mx-auto text-gray-800">

      <h2 className="text-2xl font-semibold mb-6">
        Identificação{" "}
        <span className="text-gray-500 text-sm font-normal">
          Faça o seu login ou crie uma conta caso ainda não possua cadastro
        </span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* DADOS PARA ACESSO */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiMail /> Dados para acesso
          </legend>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Confirmar e-mail</label>
              <input
                type="email"
                name="confirmarEmail"
                value={formData.confirmarEmail}
                onChange={handleChange}
                className={`border rounded-lg w-full p-2 focus:outline-none focus:ring-1 ${formData.confirmarEmail && formData.email.toLowerCase() !== formData.confirmarEmail.toLowerCase()
                  ? 'border-red-500 ring-red-500'
                  : 'focus:ring-indigo-500'
                  }`}
                required
              />
              {formData.confirmarEmail && formData.email.toLowerCase() !== formData.confirmarEmail.toLowerCase() && (
                <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">Os e-mails não coincidem!</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Crie uma senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {renderStrengthBar()}
            </div>

            <div>
              <label className="text-sm font-medium">Confirmar senha</label>
              <div className="relative">
                <input
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className={`border rounded-lg w-full p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${formData.confirmarSenha && formData.senha !== formData.confirmarSenha ? 'border-red-500' : ''
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {mostrarConfirmarSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {formData.confirmarSenha && formData.senha !== formData.confirmarSenha && (
                <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>
              )}
            </div>
          </div>
        </fieldset>

        {/* TIPO DE CADASTRO */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiUser /> Tipo de cadastro
          </legend>

          <div className="flex gap-4 mt-2">
            <label className={`flex items-center gap-2 ${preRegisterData?.tipo ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <input
                type="radio"
                name="tipoCadastro"
                value="fisica"
                checked={formData.tipoCadastro === "fisica"}
                onChange={handleChange}
                disabled={!!preRegisterData?.tipo}
              />
              Pessoa Física
            </label>

            <label className={`flex items-center gap-2 ${preRegisterData?.tipo ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <input
                type="radio"
                name="tipoCadastro"
                value="juridica"
                checked={formData.tipoCadastro === "juridica"}
                onChange={handleChange}
                disabled={!!preRegisterData?.tipo}
              />
              Pessoa Jurídica
            </label>
          </div>

          {/* Uso da plataforma — só para física */}
          {formData.tipoCadastro === "fisica" && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">
                Como você utilizará a plataforma? *
              </label>
              <select
                name="usoPlataforma"
                value={formData.usoPlataforma}
                onChange={handleChange}
                className="border rounded-lg w-full p-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
              >
                <option value="">Selecione</option>
                <option value="contratar">Proprietário da obra</option>
                <option value="prestar">Prestar serviços</option>
              </select>
            </div>
          )}

          {/* Uso da plataforma — só para jurídica */}
          {formData.tipoCadastro === "juridica" && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">
                Como sua empresa utilizará a plataforma? *
              </label>
              <select
                name="usoPlataforma"
                value={formData.usoPlataforma}
                onChange={handleChange}
                className="border rounded-lg w-full p-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
              >
                <option value="">Selecione</option>
                <option value="contratar">Contratar profissionais</option>
                <option value="prestar">Prestar serviços</option>
              </select>
            </div>
          )}

          {preRegisterData?.tipo && (
            <p className="text-xs text-gray-400 mt-1">O tipo de cadastro foi definido no pré-cadastro e não pode ser alterado.</p>
          )}
        </fieldset>

        {/* DADOS PESSOAIS */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiPhone /> {formData.tipoCadastro === "juridica" ? "Dados da Empresa" : "Dados Pessoais"}
          </legend>

          <div className="grid grid-cols-2 gap-4 mt-4 items-start">

            {/* === PESSOA FÍSICA === */}
            {formData.tipoCadastro === "fisica" && (
              <>
                <div>
                  <input
                    type="text"
                    name="nome"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="cpf"
                    placeholder="CPF"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    className="border rounded-lg p-2 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    maxLength="14"
                    required
                  />
                </div>
              </>
            )}

            {/* === PESSOA JURÍDICA === */}
            {formData.tipoCadastro === "juridica" && (
              <>
                {/* Nome do responsável — col 1 */}
                <div>
                  <input
                    type="text"
                    name="nome"
                    placeholder="Nome completo do responsável"
                    value={formData.nome}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full"
                    required
                  />
                </div>

                {/* CNPJ — col 2 (já validado no pré-cadastro) */}
                <div>
                  <input
                    type="text"
                    name="cnpj"
                    placeholder="CNPJ"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                    className="border rounded-lg p-2 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    maxLength="18"
                    required
                  />
                </div>


                {/* Razão Social — col 1 */}
                <div>
                  <input
                    type="text"
                    name="razaoSocial"
                    placeholder="Razão Social"
                    value={formData.razaoSocial}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full"
                    required
                  />
                </div>

                {/* Inscrição Estadual — col 2 */}
                <div>
                  <div className="flex gap-2">
                    <select
                      className="border rounded-lg p-2 w-1/3 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.ieUf}
                      onChange={(e) => {
                        const newUf = e.target.value.toUpperCase();
                        setFormData({ 
                          ...formData, 
                          ieUf: newUf,
                          // Limpa o campo para a pessoa ter que digitar a IE certa do zero
                          inscricaoEstadual: ""
                        });
                      }}
                      required
                    >
                      <option value="">UF da IE</option>
                      {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="inscricaoEstadual"
                      placeholder={formData.ieUf ? getMaskForState(formData.ieUf).replace(/#/g, 'X') : "Inscrição Estadual"}
                      value={formData.inscricaoEstadual}
                      onChange={(e) => {
                        setIeError(""); // Limpa o erro ao digitar
                        setFormData({ ...formData, inscricaoEstadual: formatInscricaoEstadual(e.target.value, formData.ieUf) });
                      }}
                      onBlur={() => {
                        if (formData.inscricaoEstadual.length > 0) {
                          const validacao = validateInscricaoEstadual(formData.inscricaoEstadual, formData.ieUf);
                          if (!validacao.valid) {
                            setIeError(validacao.message);
                          } else {
                            setIeError("");
                          }
                        }
                      }}
                      className={`border rounded-lg p-2 w-2/3 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${!formData.ieUf ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''} ${ieError ? 'border-red-500' : ''}`}
                      maxLength="18"
                      disabled={!formData.ieUf}
                      required
                    />
                  </div>
                  {ieError && <p className="text-xs text-red-500 mt-1">{ieError}</p>}
                </div>
              </>
            )}

            <div>
              <input
                type="text"
                name="celular"
                placeholder="Celular Principal"
                value={formData.celular}
                onChange={(e) => setFormData({ ...formData, celular: formatCelular(e.target.value) })}
                className="border rounded-lg p-2 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                maxLength="15"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Sua forma primária de contato</p>
            </div>

            <div>
              <input
                type="text"
                name="telefone"
                placeholder="Celular 2 ou Telefone Fixo (Opcional)"
                value={formData.telefone}
                onChange={(e) => {
                  const val = e.target.value;
                  // Aplica mascara formata de celular ou telefone baseado no tamanho do que o usuario compilar
                  setFormData({ ...formData, telefone: val.replace(/\D/g, "").length > 10 ? formatCelular(val) : formatTelefone(val) })
                }}
                className="border rounded-lg p-2 w-full focus:outline-none flex-grow"
                maxLength="15"
              />
              <p className="text-xs text-gray-500 mt-1">Contato secundário ou fixo</p>
            </div>
          </div>
        </fieldset>

        {/* DADOS PROFISSIONAIS */}
        {(() => {
          // Se não tiver escolhido como vai utilizar a plataforma, oculta a seção de Dados Profissionais
          if (!formData.usoPlataforma) {
            return null;
          }

          // Oculta Dados Profissionais se não for prestar serviços (tanto física quanto jurídica)
          if (formData.usoPlataforma !== "prestar") {
            return null;
          }

          const isFisica = formData.tipoCadastro === "fisica";

          // Mapa de áreas que exigem registro técnico e qual conselho (Pessoa Jurídica)
          const REGISTRO_POR_AREA = {
            "Construtora":           "CREA",
            "Engenharia Civil":      "CREA",
            "Arquitetura":           "CAU",
            "Elétrica":              "CREA",
            "Hidráulica":            "CREA",
            "Terraplanagem":         "CREA",
            "Segurança do Trabalho": "CREA",
          };

          // Mapa de profissões que exigem registro técnico e qual conselho (Pessoa Física)
          const REGISTRO_POR_PROFISSAO = {
            "Engenheiro Civil": "CREA",
            "Arquiteto": "CAU",
            "Engenheiro Eletricista": "CREA",
            "Engenheiro Mecânico": "CREA",
            "Engenheiro de Segurança do Trabalho": "CREA",
            "Técnico em Edificações": "CREA",
            "Técnico em Segurança do Trabalho": "MTE",
            "Topógrafo": "CREA",
          };

          const registroNecessario = isFisica
            ? REGISTRO_POR_PROFISSAO[formData.funcao] || null
            : REGISTRO_POR_AREA[formData.funcao] || null;

          return (
            <fieldset className="border rounded-lg p-5">
              <legend className="font-semibold text-lg flex items-center gap-2">
                <FiUser /> Dados Profissionais
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                {/* Dropdown de profissão ou área de atuação */}
                <div>
                  <label className="text-sm font-medium">
                    {isFisica ? "Profissão" : "Área de atuação"}{" "}
                    {formData.usoPlataforma === "prestar" ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="text-gray-400 font-normal">(Opcional)</span>
                    )}
                  </label>
                  <select
                    name="funcao"
                    value={formData.funcao}
                    onChange={(e) => setFormData({
                      ...formData,
                      funcao: e.target.value,
                      tipo_registro_profissional: isFisica 
                        ? (REGISTRO_POR_PROFISSAO[e.target.value] || "") 
                        : (REGISTRO_POR_AREA[e.target.value] || ""),
                      numero_registro_profissional: "",
                    })}
                    className="border rounded-lg w-full p-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Selecione</option>
                    {isFisica ? (
                      <>
                        <option value="Engenheiro Civil">Engenheiro Civil</option>
                        <option value="Arquiteto">Arquiteto</option>
                        <option value="Engenheiro Eletricista">Engenheiro Eletricista</option>
                        <option value="Engenheiro Mecânico">Engenheiro Mecânico</option>
                        <option value="Engenheiro de Segurança do Trabalho">Engenheiro de Segurança do Trabalho</option>
                        <option value="Técnico em Edificações">Técnico em Edificações</option>
                        <option value="Técnico em Segurança do Trabalho">Técnico em Segurança do Trabalho</option>
                        <option value="Topógrafo">Topógrafo</option>
                        <option value="Mestre de Obras">Mestre de Obras</option>
                        <option value="Pedreiro">Pedreiro</option>
                        <option value="Servente / Ajudante">Servente / Ajudante</option>
                        <option value="Carpinteiro">Carpinteiro</option>
                        <option value="Eletricista">Eletricista</option>
                        <option value="Encanador / Bombeiro Hidráulico">Encanador / Bombeiro Hidráulico</option>
                        <option value="Pintor">Pintor</option>
                        <option value="Gesseiro">Gesseiro</option>
                        <option value="Serralheiro">Serralheiro</option>
                        <option value="Soldador">Soldador</option>
                        <option value="Vidraceiro">Vidraceiro</option>
                        <option value="Outra">Outra</option>
                      </>
                    ) : (
                      <>
                        <option value="Construtora">Construtora</option>
                        <option value="Engenharia Civil">Engenharia Civil</option>
                        <option value="Arquitetura">Arquitetura</option>
                        <option value="Elétrica">Elétrica</option>
                        <option value="Hidráulica">Hidráulica</option>
                        <option value="Pintura">Pintura</option>
                        <option value="Terraplanagem">Terraplanagem</option>
                        <option value="Acabamento">Acabamento</option>
                        <option value="Marcenaria">Marcenaria</option>
                        <option value="Vidraçaria">Vidraçaria</option>
                        <option value="Segurança do Trabalho">Segurança do Trabalho</option>
                        <option value="Locação de Equipamentos">Locação de Equipamentos</option>
                        <option value="Fornecedor de Materiais">Fornecedor de Materiais</option>
                        <option value="Outra">Outra</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Dropdown de porte da empresa (apenas para jurídica) */}
                {!isFisica && (
                  <div>
                    <label className="text-sm font-medium">
                      Porte da Empresa <span className="text-gray-400 font-normal">(Opcional)</span>
                    </label>
                    <select
                      name="porteEmpresa"
                      value={formData.porteEmpresa}
                      onChange={handleChange}
                      className="border rounded-lg w-full p-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Selecione</option>
                      <option value="MEI">MEI</option>
                      <option value="Microempresa">Microempresa</option>
                      <option value="Pequeno porte">Pequeno porte</option>
                      <option value="Médio porte">Médio porte</option>
                      <option value="Grande porte">Grande porte</option>
                    </select>
                  </div>
                )}

                {/* Campo de CREA/CAU/etc — aparece só quando a área/profissão exige */}
                {registroNecessario && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Número do {registroNecessario} {isFisica ? "" : "do Responsável Técnico"} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <span className="border rounded-lg px-3 py-2 bg-gray-100 text-sm font-semibold text-gray-600 whitespace-nowrap">
                        {registroNecessario}
                      </span>
                      <input
                        type="text"
                        name="numero_registro_profissional"
                        placeholder={registroNecessario === "CAU" ? "Ex: A12345-8" : "Ex: 12345/D-SP"}
                        value={formData.numero_registro_profissional}
                        onChange={handleChange}
                        className="border rounded-lg p-2 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

              </div>
            </fieldset>
          );
        })()}

        {/* ENDEREÇO */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiMapPin /> Endereço
          </legend>

          <div className="grid grid-cols-2 gap-4 mt-4">

            <div>
              <label className="text-sm font-medium">CEP *</label>
              <input
                type="text"
                name="cep"
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: formatCEP(e.target.value) })}
                onBlur={handleCepBlur}
                className="border rounded-lg w-full p-2"
                maxLength="9"
                required
              />
              {loadingCep && (
                <p className="text-sm text-gray-500 mt-1">
                  Buscando endereço...
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Endereço *</label>
              <input
                type="text"
                name="endereco"
                placeholder="Rua / Avenida"
                value={formData.endereco}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Número *</label>
              <input
                type="text"
                name="numero"
                placeholder="Número"
                value={formData.numero}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Complemento</label>
              <input
                type="text"
                name="complemento"
                placeholder="Apartamento, bloco, etc."
                value={formData.complemento}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Referência</label>
              <input
                type="text"
                name="referencia"
                placeholder="Ponto de referência"
                value={formData.referencia}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bairro *</label>
              <input
                type="text"
                name="bairro"
                placeholder="Bairro"
                value={formData.bairro}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Cidade *</label>
              <input
                type="text"
                name="cidade"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Estado *</label>
              <input
                type="text"
                name="estado"
                placeholder="UF"
                value={formData.estado}
                onChange={(e) => {
                  const uf = e.target.value.toUpperCase().slice(0, 2);
                  setFormData((prev) => ({ 
                    ...prev, 
                    estado: uf
                  }));
                }}
                className="border rounded-lg w-full p-2"
                maxLength="2"
                required
              />
            </div>

          </div>
        </fieldset>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-2 px-6 rounded-lg font-medium mt-3 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Salvar e continuar
        </button>

      </form>
    </div>
  );
}

export default FormularioCompletoPage;
