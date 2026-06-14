import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { ReadOnlyGuard } from '../../../components/Guards/PermissaoGuard.jsx';
import Button from '../../../components/ui/button/Button.tsx';

/**
 * COFRE DIGITAL / GED - Gerenciamento Eletrônico de Documentos
 */

export function ObraDocuments({ initialDocs = [], idObra: propIdObra }) {
  const { apiFetch, isImpersonating } = useAuth();
  const [docs, setDocs] = useState(initialDocs);
  const [idObra, setIdObra] = useState(propIdObra);
  const [filter, setFilter] = useState('TODOS');
  const [loading, setLoading] = useState(false);
  
  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({ nome: '', tipo: 'ADMIN' });
  const [uploading, setUploading] = useState(false);
  
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

  const renderIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('pdf')) return '📕';
    if (t.includes('dwg') || t.includes('cad')) return '🏗️';
    if (t.includes('image') || t.includes('jpg') || t.includes('png')) return '🖼️';
    return '📄';
  };

  const filteredDocs = filter === 'TODOS' 
    ? docs 
    : docs.filter(d => {
        const cat = categorias.find(c => c.id === filter);
        const fileName = d.nome.toLowerCase();
        const fileType = (d.tipo || '').toLowerCase();
        return cat?.extensions.some(ext => fileName.endsWith(ext) || fileType.includes(ext));
      });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-slide-up">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Cofre Digital GED</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-1">Central de Inteligência Documental</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-950 p-2 rounded-[1.5rem] border border-slate-200 dark:border-gray-800 shadow-sm">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${filter === cat.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'}
              `}
            >
              <span>{cat.icone}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3].map(i => <div key={i} className="h-48 rounded-[2.5rem] bg-slate-100 dark:bg-gray-900 animate-pulse" />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-gray-950 border-2 border-dashed dark:border-gray-800 rounded-[3rem] p-32 text-center">
           <div className="w-16 h-16 bg-slate-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 grayscale opacity-20">📂</div>
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDocs.map((doc) => (
            <div key={doc.id_documento} className="group bg-white dark:bg-gray-950 rounded-[2.5rem] border border-slate-200 dark:border-gray-800 p-8 shadow-sm hover:shadow-xl transition-all overflow-hidden relative">
              <div className="relative z-10 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {renderIcon(doc.tipo)}
                    </div>
                    <a href={`${API_BASE_URL}${doc.url}`} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    </a>
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white truncate">{doc.nome}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Sincronizado em {new Date(doc.data_upload).toLocaleDateString()}</p>
                 </div>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-[9px] font-black text-slate-500 uppercase">{doc.tipo?.split('/')[1] || 'DOC'}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isImpersonating && (
        <button 
          onClick={() => setShowUploadModal(true)}
          className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </button>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-950 rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Arquivar Novo Documento</h3>
                 <button onClick={() => setShowUploadModal(false)} className="text-slate-400 font-bold hover:text-rose-500">✕</button>
              </div>
              <div className="p-8 space-y-6">
                 <input 
                   type="text" 
                   placeholder="Nome do Documento (Ex: ART de Fundação)"
                   className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl text-sm font-bold outline-none"
                   value={uploadData.nome}
                   onChange={e => setUploadData({...uploadData, nome: e.target.value})}
                 />
                 <select 
                   className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl text-sm font-bold outline-none"
                   value={uploadData.tipo}
                   onChange={e => setUploadData({...uploadData, tipo: e.target.value})}
                 >
                   <option value="ADMIN">Administrativo / Financeiro</option>
                   <option value="PROJETOS">Projeto / Engenharia</option>
                   <option value="SEGURANCA">Segurança / NRs</option>
                 </select>
                 <div onClick={() => document.getElementById('file-input').click()} className={`p-10 border-2 border-dashed rounded-[2rem] text-center cursor-pointer transition-all ${selectedFile ? 'border-emerald-500 bg-emerald-50/5' : 'border-slate-200 dark:border-gray-800 hover:bg-slate-50'}`}>
                    <input id="file-input" type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                    <p className="text-sm font-black text-slate-400">{selectedFile ? selectedFile.name : 'Selecionar Arquivo'}</p>
                 </div>
                 <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest">{uploading ? 'Enviando...' : 'Fazer Upload'}</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
