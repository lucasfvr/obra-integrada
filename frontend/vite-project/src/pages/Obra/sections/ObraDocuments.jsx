import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { ReadOnlyGuard } from '../../../components/Guards/PermissaoGuard.jsx';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import Button from '../../../components/ui/button/Button.tsx';

/**
 * COFRE DIGITAL / GED - Gerenciamento Eletrônico de Documentos
 */

export function ObraDocuments({ initialDocs = [], idObra: propIdObra }) {
  const { apiFetch, isImpersonating, user } = useAuth();
  const podeExcluir = ['ADMIN', 'ADMIN_MASTER', 'PROPRIETARIO', 'RESPONSAVEL'].includes(user?.role);
  const [docs, setDocs] = useState(initialDocs);
  const [idObra, setIdObra] = useState(propIdObra);
  const [filter, setFilter] = useState('TODOS');
  const [loading, setLoading] = useState(false);
  
  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({ nome: '', tipo: 'ADMIN' });
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const handleDeleteDoc = async (idDoc) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/documentos/${idDoc}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Documento excluído com sucesso!");
        setDocs(prev => prev.filter(d => d.id_documento !== idDoc));
      } else {
        const err = await res.json();
        toast.error(err.erro || "Erro ao excluir documento");
      }
    } catch (e) {
      toast.error("Erro de conexão");
    }
  };
  
  const categorias = [
    { id: 'TODOS', label: 'Tudo', icone: '📂' },
    { id: 'PROJETOS', label: 'Projetos', icone: '📐', extensions: ['dwg', 'dxf', 'rvt', 'pdf'] },
    { id: 'SEGURANCA', label: 'Segurança', icone: '🛡️', extensions: ['pdf', 'doc', 'docx'] },
    { id: 'ADMIN', label: 'Administrativo', icone: '📄', extensions: ['pdf', 'xlsx', 'csv'] }
  ];

  useEffect(() => {
    const fetchDocs = async () => {
      if (!idObra) return;
      setLoading(true);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/documentos`);
        const data = await res.json();
        setDocs(data);
      } catch (e) {
        console.error("Erro ao carregar cofre digital:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [idObra, apiFetch]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('documento', selectedFile);
      formData.append('nome', uploadData.nome || selectedFile.name);
      formData.append('tipo', uploadData.tipo);

      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/documentos`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        setDocs([result.documento, ...docs]);
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadData({ nome: '', tipo: 'ADMIN' });
      }
    } catch (e) {
      console.error("Erro no upload:", e);
    } finally {
      setUploading(false);
    }
  };

  const renderIcon = (type = '', name = '') => {
    const t = type.toLowerCase();
    const n = name.toLowerCase();
    if (t.includes('pdf') || n.endsWith('.pdf')) return '📕';
    if (t.includes('dwg') || t.includes('cad') || n.endsWith('.dwg') || n.endsWith('.dxf') || n.endsWith('.rvt')) return '🏗️';
    if (t.includes('image') || t.includes('jpg') || t.includes('png') || n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.png')) return '🖼️';
    if (t === 'projetos') return '📐';
    if (t === 'seguranca') return '🛡️';
    if (t === 'admin') return '📄';
    return '📄';
  };

  const filteredDocs = filter === 'TODOS' 
    ? docs 
    : docs.filter(d => {
        const knownCategories = ['ADMIN', 'PROJETOS', 'SEGURANCA'];
        if (knownCategories.includes(d.tipo)) {
          return d.tipo === filter;
        }
        const cat = categorias.find(c => c.id === filter);
        const fileName = d.nome.toLowerCase();
        const fileType = (d.tipo || '').toLowerCase();
        return cat?.extensions.some(ext => fileName.endsWith(ext) || fileType.includes(ext));
      });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-slide-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Cofre Digital GED</h2>
          <p className="text-xs text-muted-foreground mt-1">Central de inteligência documental</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 bg-muted p-1 rounded-lg border border-border">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                ${filter === cat.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              <span className="text-sm">{cat.icone}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
           <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xl mx-auto mb-4 grayscale opacity-65">📂</div>
           <p className="text-muted-foreground font-semibold text-xs">Nenhum documento encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id_documento} className="group bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
              <div className="space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xl border border-border group-hover:bg-primary group-hover:text-white transition-colors">
                      {renderIcon(doc.tipo, doc.nome)}
                    </div>
                    <div className="flex items-center gap-1.5">
                       <a href={`${API_BASE_URL}${doc.url}`} target="_blank" rel="noreferrer" className="p-1 text-muted-foreground hover:text-primary transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                       </a>
                        {!isImpersonating && podeExcluir && (
                          <button 
                            onClick={() => setDeleteConfirm({ show: true, id: doc.id_documento })}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            title="Excluir Documento"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                    </div>
                 </div>
                 <div>
                    <h4 className="text-sm font-semibold text-foreground truncate">{doc.nome}</h4>
                    <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Sincronizado em {new Date(doc.data_upload).toLocaleDateString()}</p>
                 </div>
                 <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-md text-[10px] font-semibold">
                      {doc.tipo === 'ADMIN' ? 'ADMIN' : doc.tipo === 'PROJETOS' ? 'PROJETO' : doc.tipo === 'SEGURANCA' ? 'SEGURANÇA' : doc.tipo?.split('/')[1] || 'DOC'}
                    </span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isImpersonating && (
        <button 
          onClick={() => setShowUploadModal(true)}
          className="fixed bottom-10 right-10 w-12 h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </button>
      )}

      {showUploadModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
           <div className="bg-card rounded-xl w-full max-w-lg shadow-lg overflow-hidden border border-border animate-slide-up">
              <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                 <h3 className="text-base font-semibold text-foreground tracking-tight">Arquivar Novo Documento</h3>
                 <button onClick={() => setShowUploadModal(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
              </div>
              <div className="p-5 space-y-4">
                 <div>
                   <label className="block text-xs font-medium text-muted-foreground mb-1">Nome do Documento</label>
                   <input 
                     type="text" 
                     placeholder="Ex: ART de Fundação"
                     className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                     value={uploadData.nome}
                     onChange={e => setUploadData({...uploadData, nome: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria</label>
                   <select 
                     className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                     value={uploadData.tipo}
                     onChange={e => setUploadData({...uploadData, tipo: e.target.value})}
                   >
                     <option value="ADMIN">Administrativo / Financeiro</option>
                     <option value="PROJETOS">Projeto / Engenharia</option>
                     <option value="SEGURANCA">Segurança / NRs</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-muted-foreground mb-1">Arquivo</label>
                   <div onClick={() => document.getElementById('file-input').click()} className={`p-8 border border-dashed rounded-lg text-center cursor-pointer transition-all ${selectedFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:bg-muted/50'}`}>
                      <input id="file-input" type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                      <p className="text-xs font-semibold text-muted-foreground">{selectedFile ? selectedFile.name : 'Clique para selecionar arquivo'}</p>
                   </div>
                 </div>
                 <div className="pt-4 flex gap-3 justify-end border-t border-border">
                    <button 
                      type="button" 
                      onClick={() => setShowUploadModal(false)} 
                      className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleUpload} 
                      disabled={!selectedFile || uploading} 
                      className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Enviando...' : 'Fazer Upload'}
                    </button>
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}

      {deleteConfirm.show && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-sm shadow-lg border border-border p-6 text-center space-y-4 animate-slide-up">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center text-xl mx-auto">⚠️</div>
            <div>
              <h3 className="text-base font-semibold text-foreground tracking-tight">Confirmar Exclusão</h3>
              <p className="text-xs text-muted-foreground mt-1">Esta ação é irreversível.</p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button 
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  handleDeleteDoc(deleteConfirm.id);
                  setDeleteConfirm({ show: false, id: null });
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
