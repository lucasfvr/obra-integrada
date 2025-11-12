import React, { useState } from "react";
import { FiMail, FiLock, FiUser, FiMapPin, FiPhone } from "react-icons/fi";

function FormularioCompletoPage({ userId, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    confirmarEmail: "",
    senha: "",
    confirmarSenha: "",
    tipoCadastro: "fisica",
    nome: "",
    cnpj: "",
    razaoSocial: "",
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
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Consulta automática do CEP via API do ViaCEP
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
      console.error("Erro ao buscar CEP:", error);
      setErrorMessage("Erro ao buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId }),
      });

      if (!response.ok) throw new Error("Erro no envio");

      onSubmitSuccess?.();
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao enviar o formulário. Tente novamente.");
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
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Confirmar senha</label>
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
                required
              />
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
            {formData.tipoCadastro === "juridica" && (
              <>
                <input
                  type="text"
                  name="cnpj"
                  placeholder="CNPJ"
                  value={formData.cnpj}
                  onChange={handleChange}
                  className="border rounded-lg p-2"
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
            <input
              type="text"
              name="celular"
              placeholder="Celular"
              value={formData.celular}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="telefone"
              placeholder="Telefone fixo"
              value={formData.telefone}
              onChange={handleChange}
              className="border rounded-lg p-2"
            />
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
        <p className="text-sm text-gray-500 mt-1">Buscando endereço...</p>
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg font-medium mt-3 transition-all"
        >
          Salvar e continuar
        </button>
      </form>
    </div>
  );
}

export default FormularioCompletoPage;
