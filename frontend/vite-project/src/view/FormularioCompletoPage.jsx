import API_BASE_URL from "../config/api.js";
import React, { useState } from "react";
import { FiMail, FiUser, FiMapPin, FiPhone, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";
import { validateCelular, validateTelefone, formatCPF, formatCNPJ, formatCelular, formatTelefone } from "../utils/validation";

function FormularioCompletoPage({ tempId, preRegisterData, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    email: preRegisterData?.email || "",
    confirmarEmail: preRegisterData?.email || "",
    senha: "",
    confirmarSenha: "",
    tipoCadastro: preRegisterData?.tipo || "fisica",
    nome: preRegisterData?.nome || "",
    cpf: preRegisterData?.cpf || "",
    cnpj: preRegisterData?.cnpj || "",
    razaoSocial: preRegisterData?.razaoSocial || "",
    inscricaoEstadual: "",
    celular: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    referencia: "",
    bairro: "",
    estado: "",
    funcao: "",
    tipo_registro_profissional: "",
    numero_registro_profissional: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
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

      setFormData((prev) => ({
        ...prev,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Erro ao buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage("");

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
    const response = await fetch("${API_BASE_URL}/api/users/formulario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        cpf: preRegisterData?.cpf || "",
        cnpj: preRegisterData?.cnpj || "",
        funcao: formData.funcao,
        tipo_registro_profissional: formData.tipo_registro_profissional,
        numero_registro_profissional: formData.numero_registro_profissional,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.erro || "Erro no envio");
    }

    onSubmitSuccess?.();
  } catch (error) {
    setErrorMessage(error.message || "Erro ao enviar o formulário.");
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
                className="border rounded-lg w-full p-2"
                required
              />
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
                  className={`border rounded-lg w-full p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    formData.confirmarSenha && formData.senha !== formData.confirmarSenha ? 'border-red-500' : ''
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
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="tipoCadastro"
                value="fisica"
                checked={formData.tipoCadastro === "fisica"}
                onChange={handleChange}
              />
              Pessoa Física
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="tipoCadastro"
                value="juridica"
                checked={formData.tipoCadastro === "juridica"}
                onChange={handleChange}
              />
              Pessoa Jurídica
            </label>
          </div>
        </fieldset>

        {/* DADOS PESSOAIS */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiPhone /> Dados Pessoais
          </legend>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />

            {formData.tipoCadastro === "fisica" && (
              <input
                type="text"
                name="cpf"
                placeholder="CPF"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                className="border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                maxLength="14"
                required
              />
            )}

            {formData.tipoCadastro === "juridica" && (
              <>
                <input
                  type="text"
                  name="cnpj"
                  placeholder="CNPJ"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                  className="border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  maxLength="18"
                  required
                />

                <input
                  type="text"
                  name="razaoSocial"
                  placeholder="Razão Social"
                  value={formData.razaoSocial}
                  onChange={handleChange}
                  className="border rounded-lg p-2"
                  required
                />

                <input
                  type="text"
                  name="inscricaoEstadual"
                  placeholder="Inscrição Estadual"
                  value={formData.inscricaoEstadual}
                  onChange={handleChange}
                  className="border rounded-lg p-2"
                />
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
                  setFormData({ ...formData, telefone: val.replace(/\D/g,"").length > 10 ? formatCelular(val) : formatTelefone(val) })
                }}
                className="border rounded-lg p-2 w-full focus:outline-none flex-grow"
                maxLength="15"
              />
              <p className="text-xs text-gray-500 mt-1">Contato secundário ou fixo</p>
            </div>
          </div>
        </fieldset>

        {/* DADOS PROFISSIONAIS */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiUser /> Dados Profissionais
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Função/Cargo (Opcional)</label>
              <input
                type="text"
                name="funcao"
                placeholder="Ex: Engenheiro, Arquiteto"
                value={formData.funcao}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo de Registro (Opcional)</label>
              <select
                name="tipo_registro_profissional"
                value={formData.tipo_registro_profissional}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
              >
                <option value="">Selecione...</option>
                <option value="CREA">CREA</option>
                <option value="CAU">CAU</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Número do Registro (Opcional)</label>
              <input
                type="text"
                name="numero_registro_profissional"
                placeholder="Ex: 12345/D-SP"
                value={formData.numero_registro_profissional}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
              />
            </div>
          </div>
        </fieldset>

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
                onChange={handleChange}
                onBlur={handleCepBlur}
                className="border rounded-lg w-full p-2"
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
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
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
