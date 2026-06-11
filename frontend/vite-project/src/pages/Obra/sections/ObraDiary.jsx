import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { ReadOnlyGuard } from '../../../components/Guards/PermissaoGuard.jsx';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Corrigindo ícone do Leaflet que some no build do Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export function ObraDiary({ initialEntries = [], idObra, team = [], manager, onRefresh }) {
  const { apiFetch, hasPermissao, user } = useAuth();
  
  // Verificar se o usuário faz parte da equipe, é o gestor técnico ou admin/proprietário
  const isManager = manager?.id_usuario === user?.id;
  const isMembroEquipe = team.some(m => m.id_usuario === user?.id);
  const isAdminOuProprietario = ['ADMIN', 'ADMIN_MASTER', 'PROPRIETARIO'].includes(user?.role);
  const podePostar = isManager || isMembroEquipe || isAdminOuProprietario;

  const [entries, setEntries] = useState(initialEntries);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Novos campos de auditoria
  const [newEntry, setNewEntry] = useState({ 
    descricao: '', 
    foto: null, 
    latitude: null, 
    longitude: null, 
    justificativa_gps: '' 
  });
  const [gpsFailed, setGpsFailed] = useState(false);

  const fetchAllEntries = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/diario`);
      if (res.ok) {
        const resData = await res.json();
        // REQUISITO B: Suporte a { data, meta } ou array simples
        const data = Array.isArray(resData) ? resData : (resData.data || []);
        setEntries(data);
      }
    } catch (e) {
      console.error("Erro ao carregar diário", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEntries();
  }, [idObra]);

  const captureLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setGpsFailed(true);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNewEntry(prev => ({ 
            ...prev, 
            latitude: pos.coords.latitude, 
            longitude: pos.coords.longitude 
          }));
          setGpsFailed(false);
          resolve(pos.coords);
        },
        (err) => {
          console.warn("GPS Fail:", err);
          setGpsFailed(true);
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  };

  const handleOpenModal = async () => {
    setEditingEntry(null);
    setNewEntry({ descricao: '', foto: null, latitude: null, longitude: null, justificativa_gps: '' });
    setShowModal(true);
    toast.loading("Capturando sua localização...", { id: 'gps-load' });
    await captureLocation();
    toast.dismiss('gps-load');
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setNewEntry({ 
      descricao: entry.descricao, 
      foto: null, 
      latitude: entry.latitude, 
      longitude: entry.longitude, 
      justificativa_gps: entry.justificativa_gps || '' 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingEntry) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/diario/${editingEntry.id_diario}`, {
        method: 'PUT',
        body: JSON.stringify({ descricao: newEntry.descricao })
      });

      if (res.ok) {
        toast.success("Descrição atualizada!");
        setShowModal(false);
        fetchAllEntries();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        toast.error(err.erro || "Erro ao atualizar");
      }
    } catch (e) {
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    // Validação de Prova de Trabalho
    if (!newEntry.foto) {
       toast.error("A foto é obrigatória para comprovação do trabalho.");
       return;
    }

    if (gpsFailed && !newEntry.justificativa_gps) {
       toast.error("O GPS falhou. Por favor, preencha a justificativa.");
       return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('descricao', newEntry.descricao);
      formData.append('latitude', newEntry.latitude || '');
      formData.append('longitude', newEntry.longitude || '');
      formData.append('justificativa_gps', newEntry.justificativa_gps || '');
      
      // Status de auditoria automático se GPS estiver OK
      const status = (!gpsFailed && newEntry.latitude) ? 'AUTOMATICO' : 'PENDENTE';
      formData.append('status_auditoria', status);

      if (newEntry.foto) formData.append('foto', newEntry.foto);

      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/diario`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        toast.success("Registro auditado e salvo com sucesso!");
        setShowModal(false);
        setNewEntry({ descricao: '', foto: null, latitude: null, longitude: null, justificativa_gps: '' });
        setGpsFailed(false);
        fetchAllEntries();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        toast.error(err.erro || "Erro ao salvar diário");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro crítico na conexão.");
    } finally {
      setSaving(false);
    }
  };

  const getDayLabel = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-slide-up">
      {/* Header do Feed */}
      <div className="flex items-center justify-between px-2">
        <div>
           <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Fluxo de Auditoria e Diário</h3>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Conformidade Geográfica e Visual</p>
        </div>
        
        {hasPermissao('criar_diario') && podePostar && (
          <ReadOnlyGuard>
            <button 
              onClick={handleOpenModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Novo Registro Auditado
            </button>
          </ReadOnlyGuard>
        )}
        {hasPermissao('criar_diario') && !podePostar && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 px-4 py-2 rounded-xl">
            <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Apenas membros da equipe da obra podem registrar.
            </p>
          </div>
        )}
      </div>

      {loading && entries.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sincronizando auditoria...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border-2 border-dashed dark:border-gray-800 rounded-[2.5rem] p-20 text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aguardando primeiro registro de campo</p>
        </div>
      ) : (
        <div className="space-y-12">
          {entries.map((entry) => (
            <div key={entry.id_diario} className="relative bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group">
              
              <div className="flex flex-col md:flex-row">
                 {/* Lado Visual (Foto) */}
                 <div className="md:w-1/2 h-80 overflow-hidden relative border-r dark:border-gray-800">
                    {entry.foto_url ? (
                      <img 
                        src={`${API_BASE_URL}${entry.foto_url}`} 
                        alt="Evidência" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center italic text-xs text-gray-400 uppercase font-black">Sem Comprovação Visual</div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${
                         entry.status_auditoria === 'AUTOMATICO' ? 'bg-emerald-500 text-white' : 
                         entry.status_auditoria === 'AUTORIZADO' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-gray-950'
                       }`}>
                         {entry.status_auditoria || 'PENDENTE'}
                       </span>
                    </div>
                 </div>

                 {/* Lado Geográfico (Mapa) */}
                 <div className="md:w-1/2 h-80 bg-slate-50 dark:bg-gray-950 relative">
                    {entry.latitude && entry.longitude ? (
                      <MapContainer center={[entry.latitude, entry.longitude]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[entry.latitude, entry.longitude]}>
                           <Popup>Captura: {new Date(entry.data_registro).toLocaleTimeString()}</Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-2">
                         <span className="text-2xl opacity-40">📍</span>
                         <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-relaxed">Localização Não Capturada</p>
                         <p className="text-[9px] text-gray-500 font-bold uppercase italic">{entry.justificativa_gps || 'Sem justificativa fornecida'}</p>
                      </div>
                    )}
                    
                    {hasPermissao('criar_diario') && (
                      <button 
                        onClick={() => handleOpenEdit(entry)}
                        className="absolute top-4 right-4 z-[1000] w-10 h-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-all shadow-xl opacity-0 group-hover:opacity-100"
                      >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    )}
                 </div>
              </div>

              <div className="p-8 md:p-10 space-y-6">
                <div className="flex justify-between items-start">
                  <p className="text-lg font-bold text-slate-800 dark:text-gray-200 leading-[1.6] tracking-tight flex-1">
                    {entry.descricao}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t dark:border-gray-800">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 border dark:border-transparent flex items-center justify-center font-black text-sm">
                         {entry.autor?.nome?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável</span>
                         <span className="text-xs font-extrabold text-slate-900 dark:text-white -mt-0.5">{entry.autor?.nome || 'Anônimo'}</span>
                      </div>
                   </div>

                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{getDayLabel(entry.data_registro)}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase">{new Date(entry.data_registro).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Reformulado para Auditoria / Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up border dark:border-gray-800">
            <div className="p-8 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
               <div>
                  <h3 className="text-xl font-black text-indigo-950 dark:text-white tracking-tight">
                    {editingEntry ? 'Corrigir Relato' : 'Auditando Atividade'}
                  </h3>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                    {editingEntry ? 'Ajuste de descrição da atividade' : 'Prova de Trabalho - Obra Ativa'}
                  </p>
               </div>
               <button onClick={() => { setShowModal(false); setGpsFailed(false); }} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-600 shadow-sm transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {!editingEntry && (
                <>
                  {gpsFailed ? (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-5 rounded-2xl flex gap-3 animate-pulse">
                        <span className="text-xl">⚠️</span>
                        <div>
                          <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">GPS Bloqueado ou Falhou</p>
                          <p className="text-[10px] text-rose-500/70 font-bold leading-relaxed">Você deve fornecer uma justificativa para continuar sem geolocalização.</p>
                        </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 p-4 rounded-2xl flex items-center gap-3">
                        <span className="text-lg">📍</span>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Localização captada com precisão</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Relato do Dia (Relatório)</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[120px]"
                  placeholder="Quais tarefas foram realizadas hoje?"
                  required
                  value={newEntry.descricao}
                  onChange={(e) => setNewEntry({...newEntry, descricao: e.target.value})}
                />
              </div>

              {!editingEntry && gpsFailed && (
                <div className="animate-slide-up">
                  <label className="block text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-3">Justificativa Falha GPS</label>
                  <input 
                    type="text"
                    className="w-full bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/40 rounded-xl p-4 text-xs font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-rose-500/10 outline-none"
                    placeholder="Ex: Local sem sinal de satélite / Equipamento antigo"
                    value={newEntry.justificativa_gps}
                    onChange={(e) => setNewEntry({...newEntry, justificativa_gps: e.target.value})}
                  />
                </div>
              )}

              {!editingEntry && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Comprovação Visual (Foto obrigatória)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer group ${newEntry.foto ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-900'}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {newEntry.foto ? `✅ ${newEntry.foto.name}` : "Toque para anexar comprovante"}
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => setNewEntry({...newEntry, foto: e.target.files[0]})}
                        />
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => { setShowModal(false); setGpsFailed(false); }}
                  className="flex-1 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Validando...' : editingEntry ? 'Atualizar Relato' : 'Assinar & Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
