import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header do Feed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Fluxo de Auditoria e Diário</h3>
          <p className="text-xs text-muted-foreground mt-1">Conformidade geográfica e de evidência visual</p>
        </div>

        {hasPermissao('criar_diario') && podePostar && (
          <ReadOnlyGuard>
            <button
              onClick={handleOpenModal}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Novo Registro Auditado
            </button>
          </ReadOnlyGuard>
        )}
        {hasPermissao('criar_diario') && !podePostar && (
          <div className="bg-muted border border-border px-3 py-1.5 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground">
              Apenas membros da equipe podem registrar.
            </p>
          </div>
        )}
      </div>

      {loading && entries.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-muted-foreground">Sincronizando auditoria...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-muted-foreground font-semibold text-xs">Aguardando primeiro registro de campo.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id_diario} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">

              <div className="flex flex-col md:flex-row">
                {/* Lado Visual (Foto) */}
                <div className="md:w-1/2 h-80 overflow-hidden relative border-r border-border">
                  {entry.foto_url ? (
                    <img
                      src={`${API_BASE_URL}${entry.foto_url}`}
                      alt="Evidência"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center italic text-xs text-muted-foreground font-semibold">Sem Comprovação Visual</div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider shadow-md backdrop-blur-md ${entry.status_auditoria === 'AUTOMATICO' ? 'bg-emerald-500 text-white' :
                      entry.status_auditoria === 'AUTORIZADO' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-gray-950'
                      }`}>
                      {entry.status_auditoria || 'PENDENTE'}
                    </span>
                  </div>
                </div>

                {/* Lado Geográfico (Mapa) */}
                <div className="md:w-1/2 h-80 bg-muted/30 relative">
                  {entry.latitude && entry.longitude ? (
                    <MapContainer center={[entry.latitude, entry.longitude]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[entry.latitude, entry.longitude]}>
                        <Popup>Captura: {new Date(entry.data_registro).toLocaleTimeString()}</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-2">
                      <span className="text-xl opacity-60">📍</span>
                      <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Localização Não Capturada</p>
                      <p className="text-[10px] text-muted-foreground italic">{entry.justificativa_gps || 'Sem justificativa fornecida'}</p>
                    </div>
                  )}

                  {hasPermissao('criar_diario') && (
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="absolute top-4 right-4 z-[1000] w-8 h-8 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-md opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    {entry.descricao}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-semibold text-xs border border-border">
                      {entry.autor?.nome?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-muted-foreground">Responsável</span>
                      <span className="text-xs font-semibold text-foreground leading-none mt-0.5">{entry.autor?.nome || 'Anônimo'}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <p className="text-[10px] font-medium text-muted-foreground">{getDayLabel(entry.data_registro)}</p>
                    <p className="text-[10px] font-semibold text-primary mt-0.5">{new Date(entry.data_registro).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Reformulado para Auditoria / Edição */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-border">
            <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  {editingEntry ? 'Corrigir Relato' : 'Auditando Atividade'}
                </h3>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">
                  {editingEntry ? 'Ajuste de descrição da atividade' : 'Prova de Trabalho - Obra Ativa'}
                </p>
              </div>
              <button onClick={() => { setShowModal(false); setGpsFailed(false); }} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {!editingEntry && (
                <>
                  {gpsFailed ? (
                    <div className="bg-destructive/10 border border-destructive/20 p-3.5 rounded-lg flex gap-2.5">
                      <span className="text-sm">⚠️</span>
                      <div>
                        <p className="text-xs font-semibold text-destructive uppercase">GPS Bloqueado ou Falhou</p>
                        <p className="text-[10px] text-destructive/80 font-medium leading-normal mt-0.5">Você deve fornecer uma justificativa para continuar sem geolocalização.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-2">
                      <span className="text-sm">📍</span>
                      <p className="text-xs font-semibold text-emerald-600">Localização captada com precisão</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Relato do Dia (Relatório)</label>
                <textarea
                  className="w-full bg-card border border-border rounded-lg p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
                  placeholder="Quais tarefas foram realizadas hoje?"
                  required
                  value={newEntry.descricao}
                  onChange={(e) => setNewEntry({ ...newEntry, descricao: e.target.value })}
                />
              </div>

              {!editingEntry && gpsFailed && (
                <div className="animate-slide-up">
                  <label className="block text-xs font-medium text-destructive mb-1">Justificativa Falha GPS</label>
                  <input
                    type="text"
                    className="w-full bg-card border border-destructive/30 rounded-lg p-2.5 text-xs text-foreground focus:ring-2 focus:ring-destructive/20 outline-none"
                    placeholder="Ex: Local sem sinal de satélite / Equipamento antigo"
                    value={newEntry.justificativa_gps}
                    onChange={(e) => setNewEntry({ ...newEntry, justificativa_gps: e.target.value })}
                  />
                </div>
              )}

              {!editingEntry && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Comprovação Visual (Foto obrigatória)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-lg transition-all cursor-pointer ${newEntry.foto ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:bg-muted/50'}`}>
                      <div className="flex flex-col items-center justify-center text-center px-4">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {newEntry.foto ? `✅ ${newEntry.foto.name}` : "Toque para anexar comprovante"}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => setNewEntry({ ...newEntry, foto: e.target.files[0] })}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end border-t border-border">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setGpsFailed(false); }}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Validando...' : editingEntry ? 'Atualizar Relato' : 'Assinar & Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
