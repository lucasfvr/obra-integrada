import React, { useState } from 'react';
import { Users, Plus, Filter, TrendingUp, ClipboardCheck, FileCheck, Edit2, Trash2, X, UserPlus } from 'lucide-react';
import { PageHeader, StatusBadge, SectionCard, InfoGrid, DataTable, SideIndicatorCard } from '../../../components/RH/rhUi.jsx';
import { Modal } from '../../../components/ui/modal/index.tsx';

const INITIAL_EQUIPES = [
  {
    id: 1,
    nome: 'Equipe Elétrica',
    tipo: 'Própria',
    lider: 'João Silva',
    obra: 'Residencial Alpha',
    membros: 3,
    presenca: 95,
    produtividade: 92,
    treinamentos: 88,
    documentacao: 100,
    integrantes: [
      { id: 1, nome: 'João Silva', cargo: 'Eletricista', funcao: 'Líder', status: 'ATIVO' },
      { id: 2, nome: 'Marcos Pereira', cargo: 'Eletricista', funcao: 'Instalações', status: 'ATIVO' },
      { id: 3, nome: 'Ricardo Alves', cargo: 'Ajudante', funcao: 'Apoio', status: 'ATIVO' },
    ],
  },
  {
    id: 2,
    nome: 'Equipe Hidráulica',
    tipo: 'Própria',
    lider: 'Maria Santos',
    obra: 'Condomínio Beta',
    membros: 2,
    presenca: 90,
    produtividade: 88,
    treinamentos: 75,
    documentacao: 92,
    integrantes: [
      { id: 4, nome: 'Maria Santos', cargo: 'Encanadora', funcao: 'Líder', status: 'ATIVO' },
      { id: 5, nome: 'Lucas Ferreira', cargo: 'Soldador', funcao: 'Tubulação', status: 'ATIVO' },
    ],
  },
  {
    id: 3,
    nome: 'Equipe Estrutural',
    tipo: 'Própria',
    lider: 'Pedro Costa',
    obra: 'Hospital Gamma',
    membros: 0,
    presenca: 97,
    produtividade: 94,
    treinamentos: 95,
    documentacao: 98,
    integrantes: [],
  },
];

const OBRAS_DISPONIVEIS = [
  'Residencial Alpha',
  'Condomínio Beta',
  'Hospital Gamma',
  'Shopping Delta',
  'Edifício Horizonte',
  'Parque das Águas'
];

export default function EquipesPage() {
  const [equipes, setEquipes] = useState(INITIAL_EQUIPES);
  const [equipeSelecionada, setEquipeSelecionada] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  
  // Estados para Modal de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipeEmEdicao, setEquipeEmEdicao] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Própria',
    lider: '',
    obra: '',
    integrantes: []
  });

  const filtros = [
    { id: 'todas', label: 'Todas' },
    { id: 'por-obra', label: 'Por Obra' },
    { id: 'proprias', label: 'Próprias' },
    { id: 'terceirizadas', label: 'Terceirizadas' },
  ];

  const handleEdit = (equipe) => {
    setEquipeEmEdicao(equipe);
    setFormData({
      nome: equipe.nome,
      tipo: equipe.tipo,
      lider: equipe.lider,
      obra: equipe.obra,
      integrantes: [...equipe.integrantes]
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEquipeEmEdicao(null);
    setFormData({
      nome: '',
      tipo: 'Própria',
      lider: '',
      obra: OBRAS_DISPONIVEIS[0],
      integrantes: []
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (equipeEmEdicao) {
      setEquipes(prev => prev.map(eq => eq.id === equipeEmEdicao.id ? {
        ...eq,
        ...formData,
        membros: formData.integrantes.length
      } : eq));
      if (equipeSelecionada?.id === equipeEmEdicao.id) {
        setEquipeSelecionada({ ...equipeSelecionada, ...formData, membros: formData.integrantes.length });
      }
    } else {
      const newId = Math.max(...equipes.map(e => e.id)) + 1;
      const newEquipe = {
        id: newId,
        ...formData,
        membros: formData.integrantes.length,
        presenca: 100,
        produtividade: 100,
        treinamentos: 100,
        documentacao: 100
      };
      setEquipes(prev => [...prev, newEquipe]);
    }
    setIsModalOpen(false);
  };

  const handleRemoveMember = (id) => {
    setFormData(prev => ({
      ...prev,
      integrantes: prev.integrantes.filter(m => m.id !== id)
    }));
  };

  const [newMember, setNewMember] = useState({ nome: '', cargo: '', funcao: '' });
  const handleAddMember = () => {
    if (!newMember.nome) return;
    const id = Date.now();
    setFormData(prev => ({
      ...prev,
      integrantes: [...prev.integrantes, { id, ...newMember, status: 'ATIVO' }]
    }));
    setNewMember({ nome: '', cargo: '', funcao: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta equipe?')) {
      setEquipes(prev => prev.filter(eq => eq.id !== id));
      if (equipeSelecionada?.id === id) setEquipeSelecionada(null);
    }
  };

  if (equipeSelecionada) {
    const eq = equipes.find(e => e.id === equipeSelecionada.id) || equipeSelecionada;
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setEquipeSelecionada(null)} className="text-sm text-primary hover:underline flex items-center gap-1">
            ← Voltar para equipes
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => handleEdit(eq)}
              className="p-2 bg-accent hover:bg-accent/80 rounded-lg text-primary transition-colors"
              title="Editar Equipe"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={() => handleDelete(eq.id)}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-600 transition-colors"
              title="Excluir Equipe"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <PageHeader icon={Users} title={eq.nome} subtitle={`Líder: ${eq.lider} · Obra: ${eq.obra}`} />

        <SectionCard title="Dados da Equipe" className="mb-6">
          <InfoGrid fields={[
            { label: 'Nome', value: eq.nome },
            { label: 'Tipo', value: eq.tipo },
            { label: 'Líder', value: eq.lider },
            { label: 'Obra', value: eq.obra },
            { label: 'Quantidade Membros', value: eq.membros },
          ]} cols={3} />
        </SectionCard>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SideIndicatorCard icon={TrendingUp} label="Presença" value={`${eq.presenca}%`} variant="success" />
          <SideIndicatorCard icon={ClipboardCheck} label="Produtividade" value={`${eq.produtividade}%`} />
          <SideIndicatorCard icon={Users} label="Treinamentos" value={`${eq.treinamentos}%`} variant={eq.treinamentos < 80 ? 'warning' : 'success'} />
          <SideIndicatorCard icon={FileCheck} label="Documentação" value={`${eq.documentacao}%`} variant="success" />
        </div>

        <SectionCard title="Integrantes">
          <DataTable
            columns={[
              { key: 'nome', label: 'Nome' },
              { key: 'cargo', label: 'Cargo' },
              { key: 'funcao', label: 'Função' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={eq.integrantes.length ? eq.integrantes : []}
            emptyMessage="Nenhum integrante cadastrado"
          />
        </SectionCard>

        {/* Modal de Edição */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 text-foreground">
              {equipeEmEdicao ? 'Editar Equipe' : 'Nova Equipe'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome da Equipe</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ex: Equipe Elétrica"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo</label>
                <select 
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="Própria">Própria</option>
                  <option value="Terceirizada">Terceirizada</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Líder</label>
                <input 
                  type="text" 
                  value={formData.lider}
                  onChange={(e) => setFormData({...formData, lider: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Nome do líder"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Obra</label>
                <select 
                  value={formData.obra}
                  onChange={(e) => setFormData({...formData, obra: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {OBRAS_DISPONIVEIS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Gerenciar Integrantes</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-4 scrollbar-elegant">
                {formData.integrantes.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border group">
                    <div>
                      <p className="text-sm font-bold text-foreground">{m.nome}</p>
                      <p className="text-xs text-muted-foreground">{m.cargo} · {m.funcao}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {formData.integrantes.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-4 italic">Nenhum integrante adicionado</p>
                )}
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Adicionar Novo Integrante</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <input 
                    type="text" 
                    placeholder="Nome"
                    value={newMember.nome}
                    onChange={(e) => setNewMember({...newMember, nome: e.target.value})}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Cargo"
                    value={newMember.cargo}
                    onChange={(e) => setNewMember({...newMember, cargo: e.target.value})}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Função"
                    value={newMember.funcao}
                    onChange={(e) => setNewMember({...newMember, funcao: e.target.value})}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
                <button 
                  onClick={handleAddMember}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all"
                >
                  <UserPlus size={14} /> Adicionar à Lista
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <PageHeader
        icon={Users}
        title="Equipes"
        subtitle="Controle das equipes operacionais por obra"
        actions={
          <button 
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 text-sm font-semibold shadow-lg shadow-primary/10"
          >
            <Plus size={18} /> Nova Equipe
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filtro === f.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border hover:border-primary/40'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent ml-auto transition-colors">
          <Filter size={16} /> Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipes
          .filter(eq => {
            if (filtro === 'proprias') return eq.tipo === 'Própria';
            if (filtro === 'terceirizadas') return eq.tipo === 'Terceirizada';
            return true;
          })
          .map((equipe) => (
          <div key={equipe.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-foreground truncate mr-2">{equipe.nome}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">{equipe.tipo}</span>
              </div>
              <p className="text-sm text-muted-foreground">Líder: {equipe.lider}</p>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-border text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Integrantes</span>
                <span className="font-semibold">{equipe.membros}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Obra</span>
                <span className="font-semibold text-primary/80">{equipe.obra}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: 'Presença', value: equipe.presenca, color: 'bg-emerald-500' },
                { label: 'Produtividade', value: equipe.produtividade, color: 'bg-primary' },
                { label: 'Treinamentos', value: equipe.treinamentos, color: 'bg-blue-500' },
                { label: 'Documentação', value: equipe.documentacao, color: 'bg-violet-500' },
              ].map((ind) => (
                <div key={ind.label}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground font-medium">{ind.label}</span>
                    <span className="font-bold">{ind.value}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div className={`${ind.color} rounded-full h-1 transition-all duration-500`} style={{ width: `${ind.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEquipeSelecionada(equipe)}
                className="flex-1 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-sm font-semibold transition"
              >
                Ver Detalhes
              </button>
              <button
                onClick={() => handleEdit(equipe)}
                className="p-2 bg-card border border-border hover:border-primary/40 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(equipe.id)}
                className="p-2 bg-card border border-border hover:border-rose-500/40 rounded-lg text-muted-foreground hover:text-rose-600 transition-colors"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição (Global para a listagem também) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {equipeEmEdicao ? `Editar: ${equipeEmEdicao.nome}` : 'Nova Equipe Operacional'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nome da Equipe</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ex: Equipe de Alvenaria"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tipo de Contratação</label>
                <select 
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="Própria">Própria</option>
                  <option value="Terceirizada">Terceirizada (Empreiteira)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Líder / Encarregado</label>
                <input 
                  type="text" 
                  value={formData.lider}
                  onChange={(e) => setFormData({...formData, lider: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Obra Designada</label>
                <select 
                  value={formData.obra}
                  onChange={(e) => setFormData({...formData, obra: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-primary font-bold"
                >
                  {OBRAS_DISPONIVEIS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Users size={14} /> Integrantes do Time ({formData.integrantes.length})
              </h3>
              
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 mb-4 scrollbar-elegant">
                {formData.integrantes.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                        {m.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">{m.nome}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">{m.cargo} · {m.funcao}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remover integrante"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {formData.integrantes.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                    <Users size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">Nenhum integrante adicionado a esta equipe ainda.</p>
                  </div>
                )}
              </div>

              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3">Adicionar Integrante</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      placeholder="Nome Completo"
                      value={newMember.nome}
                      onChange={(e) => setNewMember({...newMember, nome: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      placeholder="Cargo (ex: Pedreiro)"
                      value={newMember.cargo}
                      onChange={(e) => setNewMember({...newMember, cargo: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      placeholder="Função (ex: Alvenaria)"
                      value={newMember.funcao}
                      onChange={(e) => setNewMember({...newMember, funcao: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddMember}
                  disabled={!newMember.nome}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus size={14} /> Adicionar Integrante
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-xs font-bold text-muted-foreground hover:bg-accent rounded-xl transition-colors uppercase tracking-widest"
              >
                Descartar
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.nome || !formData.lider}
                className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                Finalizar e Salvar
              </button>
            </div>
          </div>
      </Modal>
    </div>
  );
}
