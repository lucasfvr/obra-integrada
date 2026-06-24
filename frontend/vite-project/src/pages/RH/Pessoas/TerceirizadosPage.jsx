import React, { useState } from 'react';
import { Building2, Plus, Download, Users, FileText, Phone, Mail, Calendar, X } from 'lucide-react';
import { PageHeader, StatusBadge, SectionCard, InfoGrid, DataTable } from '../../../components/RH/rhUi.jsx';
import RHPessoasNav from '../../../components/RH/RHPessoasNav.jsx';
import { Modal } from '../../../components/ui/modal/index.tsx';

const INITIAL_EMPRESAS = [
  {
    id: 1,
    razaoSocial: 'TecniEletra Serviços Ltda',
    cnpj: '12.345.678/0001-90',
    responsavel: 'Roberto Silva',
    telefone: '(11) 3456-7890',
    email: 'contato@tecnieletra.com.br',
    contrato: 'CT-2025/014',
    vigencia: '01/01/2025 — 31/12/2025',
    status: 'Ativa',
    colaboradores: [
      { id: 1, nome: 'Carlos Souza', cargo: 'Eletricista', funcao: 'Instalações', status: 'ATIVO' },
      { id: 2, nome: 'Paulo Mendes', cargo: 'Ajudante', funcao: 'Apoio', status: 'ATIVO' },
    ],
    documentos: [
      { id: 1, tipo: 'Contrato', validade: '31/12/2025', status: 'Válido' },
      { id: 2, tipo: 'Seguro', validade: '30/06/2025', status: 'Válido' },
      { id: 3, tipo: 'Certidão Negativa', validade: '15/04/2025', status: 'A Expirar' },
      { id: 4, tipo: 'PCMSO', validade: '01/01/2026', status: 'Válido' },
    ],
  },
  {
    id: 2,
    razaoSocial: 'Engenharia & Construção Ltda',
    cnpj: '98.765.432/0001-10',
    responsavel: 'Ana Costa',
    telefone: '(11) 9876-5432',
    email: 'rh@engconstrucao.com.br',
    contrato: 'CT-2025/008',
    vigencia: '15/03/2025 — 15/03/2026',
    status: 'Ativa',
    colaboradores: [
      { id: 3, nome: 'Fernando Lima', cargo: 'Soldador', funcao: 'Estrutura Metálica', status: 'ATIVO' },
    ],
    documentos: [
      { id: 1, tipo: 'Contrato', validade: '15/03/2026', status: 'Válido' },
      { id: 2, tipo: 'Seguro', validade: '—', status: 'Pendente' },
    ],
  },
];

export default function TerceirizadosPage() {
  const [empresas, setEmpresas] = useState(INITIAL_EMPRESAS);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [novaEmpresa, setNovaEmpresa] = useState({
    razaoSocial: '', cnpj: '', responsavel: '', telefone: '', email: '', contrato: '', vigencia: '',
  });

  const empresasFiltradas = empresas.filter((e) =>
    !busca || e.razaoSocial.toLowerCase().includes(busca.toLowerCase()) || e.cnpj.includes(busca)
  );

  const handleCriarEmpresa = (e) => {
    e.preventDefault();
    const newId = empresas.length ? Math.max(...empresas.map((emp) => emp.id)) + 1 : 1;
    setEmpresas((prev) => [
      ...prev,
      { id: newId, ...novaEmpresa, status: 'Ativa', colaboradores: [], documentos: [] },
    ]);
    setNovaEmpresa({ razaoSocial: '', cnpj: '', responsavel: '', telefone: '', email: '', contrato: '', vigencia: '' });
    setShowNovoModal(false);
  };

  const handleExportar = () => {
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const linhas = [
      ['Razão Social', 'CNPJ', 'Responsável', 'Telefone', 'Email', 'Contrato', 'Vigência', 'Status', 'Colaboradores'],
      ...empresasFiltradas.map((emp) => [
        emp.razaoSocial, emp.cnpj, emp.responsavel, emp.telefone, emp.email,
        emp.contrato, emp.vigencia, emp.status, emp.colaboradores.length,
      ]),
    ];
    const csv = linhas.map((r) => r.map(escape).join(';')).join('\r\n');
    // Prefixa BOM (U+FEFF) p/ o Excel abrir como UTF-8; ';' e o separador padrao do Excel pt-BR.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `terceirizados_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (empresaSelecionada) {
    const emp = empresaSelecionada;
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <button onClick={() => setEmpresaSelecionada(null)} className="text-sm text-primary hover:underline mb-4">
          ← Voltar para lista de empresas
        </button>

        <PageHeader icon={Building2} title={emp.razaoSocial} subtitle={`CNPJ: ${emp.cnpj}`} />

        <SectionCard title="Informações da Empresa" className="mb-6">
          <InfoGrid fields={[
            { label: 'Razão Social', value: emp.razaoSocial },
            { label: 'CNPJ', value: emp.cnpj },
            { label: 'Responsável', value: emp.responsavel },
            { label: 'Telefone', value: emp.telefone },
            { label: 'Email', value: emp.email },
            { label: 'Contrato', value: emp.contrato },
            { label: 'Data Vigência', value: emp.vigencia },
          ]} cols={3} />
        </SectionCard>

        <SectionCard title="Colaboradores Vinculados" className="mb-6">
          <DataTable
            columns={[
              { key: 'nome', label: 'Nome' },
              { key: 'cargo', label: 'Cargo' },
              { key: 'funcao', label: 'Função' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={emp.colaboradores}
          />
        </SectionCard>

        <SectionCard title="Documentação Obrigatória">
          <DataTable
            columns={[
              { key: 'tipo', label: 'Documento' },
              { key: 'validade', label: 'Validade' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={emp.documentos}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {['Contrato', 'Seguro', 'Certidões', 'Documentos SST'].map((d) => (
              <span key={d} className="px-3 py-1.5 rounded-full bg-muted/50 text-xs font-medium">{d}</span>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-6">
      <div className="mb-6"><RHPessoasNav /></div>
      <PageHeader
        icon={Building2}
        title="Terceirizados"
        subtitle="Gestão de empresas contratadas e profissionais alocados"
        actions={
          <button
            onClick={() => setShowNovoModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 text-sm font-semibold"
          >
            <Plus size={18} /> Nova Empresa
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="Buscar por razão social ou CNPJ..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleExportar}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent text-foreground transition-colors"
        >
          <Download size={16} /> Exportar
        </button>
      </div>

      <div className="grid gap-4">
        {empresasFiltradas.map((empresa) => (
          <div key={empresa.id} className="bg-card border border-border/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-2 border-b border-border/30">
              <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">{empresa.razaoSocial}</h3>
                <p className="text-xs text-muted-foreground/80 font-mono mt-0.5">CNPJ: {empresa.cnpj}</p>
              </div>
              <div className="flex items-center">
                <StatusBadge status={empresa.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Colaboradores</p>
                  <p className="text-base font-bold text-foreground mt-0.5">{empresa.colaboradores.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Responsável</p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">{empresa.responsavel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Vigência</p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">{empresa.vigencia.split(' — ')[1]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Documentação</p>
                  <p className="text-sm font-semibold text-foreground/90 mt-0.5">
                    {empresa.documentos.length === 0 ? (
                      <span className="text-muted-foreground font-bold">— Sem documentos</span>
                    ) : empresa.documentos.every((d) => d.status === 'Válido') ? (
                      <span className="text-emerald-600 font-bold">✓ Completa</span>
                    ) : (
                      <span className="text-amber-600 font-bold">⚠ Parcial</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <Mail size={14} className="text-muted-foreground/70" /> {empresa.email}
              </div>
              <button
                onClick={() => setEmpresaSelecionada(empresa)}
                className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                Ver Detalhes →
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showNovoModal} onClose={() => setShowNovoModal(false)} className="max-w-lg">
        <form onSubmit={handleCriarEmpresa} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Nova Empresa Terceirizada</h2>
            <button type="button" onClick={() => setShowNovoModal(false)} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { key: 'razaoSocial', label: 'Razão Social', required: true, full: true },
              { key: 'cnpj', label: 'CNPJ' },
              { key: 'responsavel', label: 'Responsável' },
              { key: 'telefone', label: 'Telefone' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'contrato', label: 'Contrato' },
              { key: 'vigencia', label: 'Vigência' },
            ].map((f) => (
              <div key={f.key} className={`space-y-1 ${f.full ? 'sm:col-span-2' : ''}`}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  required={f.required}
                  value={novaEmpresa[f.key]}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, [f.key]: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setShowNovoModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-all">
              Salvar Empresa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
