  import React, { useState } from "react";
  import { FiUser, FiMail, FiFileText, FiBriefcase } from "react-icons/fi";
  import logoObraIntegrada from "../assets/logo-obra-integrada.png";


  function RegisterModal({ onClose, onRegisterSuccess }) {
    const [tipoPessoa, setTipoPessoa] = useState("fisica");
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [razaoSocial, setRazaoSocial] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      // Monta o corpo da requisição conforme o tipo de pessoa
      const payload =
        tipoPessoa === "fisica"
          ? { tipo: "fisica", nome, cpf, email }
          : { tipo: "juridica", razaoSocial, cnpj, email };

      try {
        const response = await fetch("http://localhost:3000/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("🔵 Resposta do backend:", data);

        if (response.ok) {
          // tenta pegar o id retornado em diferentes formatos possíveis
          const returnedId =
            data.id ??
            data._id ??
            data.userId ??
            (data.user && data.user.id) ??
            null;

          console.log("🟩 Usuário cadastrado, ID:", returnedId);

          if (returnedId) {
            onRegisterSuccess(returnedId);
          } else {
            setError("Cadastro criado, mas o ID do usuário não foi retornado.");
          }
        } else {
          setError(data.erro || data.message || "Falha no cadastro");
        }
      } catch (err) {
        console.error("❌ Erro no cadastro:", err);
        setError("Não foi possível conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative"
        >
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>

          {/* Cabeçalho */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-3">
                        <img
                          src={logoObraIntegrada}
                          alt="Logo da Obra Integrada"
                          className="w-20 h-20 object-contain drop-shadow-md"
                        />
                      </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Cadastro Rápido
            </h2>
            <p className="text-gray-500 text-sm">
              Preencha alguns dados para começar
            </p>
          </div>

          {/* Alternância entre Física / Jurídica */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              type="button"
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                tipoPessoa === "fisica"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTipoPessoa("fisica")}
            >
              Pessoa Física
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                tipoPessoa === "juridica"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTipoPessoa("juridica")}
            >
              Pessoa Jurídica
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tipoPessoa === "fisica" ? (
              <>
                <div className="flex items-center border rounded-lg px-3 py-2">
                  <FiUser className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full outline-none"
                    required
                  />
                </div>
                <div className="flex items-center border rounded-lg px-3 py-2">
                  <FiFileText className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="CPF"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full outline-none"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center border rounded-lg px-3 py-2">
                  <FiBriefcase className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Razão Social"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    className="w-full outline-none"
                    required
                  />
                </div>
                <div className="flex items-center border rounded-lg px-3 py-2">
                  <FiFileText className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="CNPJ"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full outline-none"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex items-center border rounded-lg px-3 py-2">
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium mt-2 transition-all disabled:opacity-60"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  export default RegisterModal;
