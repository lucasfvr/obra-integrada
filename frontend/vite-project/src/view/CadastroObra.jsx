import API_BASE_URL from "../config/api.js";
import React, { useState } from "react";
import { FiMapPin, FiInfo, FiDollarSign, FiUsers, FiFileText } from "react-icons/fi";

function CadastroObra({ currentUser, onVoltar }) {
  const [formData, setFormData] = useState({
    nome: "",
    tipo_obra: "Residencial",
    id_status: 1, // Planejamento
    data_inicio: "",
    previsao_termino: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    latitude: "",
    longitude: "",
    valor_orcado: "",
    custo_atual: "",
    observacoes: ""
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      setLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const buscarLatLong = async () => {
    const query = `${formData.logradouro}, ${formData.numero}, ${formData.cidade}, ${formData.estado}`;
    if (!formData.logradouro || !formData.cidade) {
      alert("Preencha o endereço completo primeiro.");
      return;
    }
    
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await resp.json();
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: data[0].lat,
          longitude: data[0].lon
        }));
      } else {
        alert("Não foi possível encontrar as coordenadas para este endereço.");
      }
    } catch (e) {
      alert("Erro ao buscar coordenadas.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("${API_BASE_URL}/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: currentUser.id }),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar a obra");
      }
      
      setSuccessMessage("Obra cadastrada com sucesso!");
      setTimeout(() => {
        onVoltar();
      }, 1500);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-5xl mx-auto text-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-700">Nova Obra</h2>
        <button onClick={onVoltar} className="text-sm font-medium text-blue-600 hover:text-blue-800">
          Voltar para Lista
        </button>
      </div>

      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{successMessage}</div>}
      {errorMessage && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{errorMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* INFORMAÇÕES BÁSICAS */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiInfo /> Informações Básicas
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Nome da Obra *</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo *</label>
              <select name="tipo_obra" value={formData.tipo_obra} onChange={handleChange} className="border p-2 rounded w-full">
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status *</label>
              <select name="id_status" value={formData.id_status} onChange={handleChange} className="border p-2 rounded w-full">
                <option value="1">Planejamento</option>
                <option value="2">Em Andamento</option>
                <option value="3">Pausada</option>
                <option value="4">Finalizada</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Data de Início</label>
              <input type="date" name="data_inicio" value={formData.data_inicio} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">Previsão de Término</label>
              <input type="date" name="previsao_termino" value={formData.previsao_termino} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
          </div>
        </fieldset>

        {/* ENDEREÇO */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiMapPin /> Localização
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">CEP</label>
              <input type="text" name="cep" placeholder="00000-000" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} className="border p-2 rounded w-full" />
              {loadingCep && <span className="text-xs text-gray-500">Buscando...</span>}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Endereço (Logradouro)</label>
              <input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">Número</label>
              <input type="text" name="numero" value={formData.numero} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">Bairro</label>
              <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">Cidade</label>
              <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">Estado (UF)</label>
              <input type="text" name="estado" maxLength="2" value={formData.estado} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
            <div className="flex flex-col justify-end">
               <button type="button" onClick={buscarLatLong} className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-medium py-2 px-3 rounded">
                 Buscar Coordenadas
               </button>
            </div>
            <div>
              <label className="text-sm font-medium">Latitude / Longitude</label>
              <div className="flex gap-2">
                <input type="text" name="latitude" placeholder="Lat" value={formData.latitude} onChange={handleChange} className="border p-2 rounded w-1/2" />
                <input type="text" name="longitude" placeholder="Lng" value={formData.longitude} onChange={handleChange} className="border p-2 rounded w-1/2" />
              </div>
            </div>
          </div>
        </fieldset>

        {/* FINANCEIRO */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiDollarSign /> Financeiro
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Orçamento Previsto (R$)</label>
              <input type="number" step="0.01" name="valor_orcado" value={formData.valor_orcado} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">Custo Atual (R$)</label>
              <input type="number" step="0.01" name="custo_atual" value={formData.custo_atual} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
          </div>
        </fieldset>

        {/* OBSERVAÇÕES */}
        <fieldset className="border rounded-lg p-5">
          <legend className="font-semibold text-lg flex items-center gap-2">
            <FiFileText /> Observações e Notas
          </legend>
          <div className="mt-4">
            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows="4" className="border p-2 rounded w-full" placeholder="Detalhes extras sobre a obra, licenciamento, etc."></textarea>
          </div>
        </fieldset>

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-8 rounded-lg shadow">
            Salvar Obra Completa
          </button>
        </div>

      </form>
    </div>
  );
}

export default CadastroObra;
