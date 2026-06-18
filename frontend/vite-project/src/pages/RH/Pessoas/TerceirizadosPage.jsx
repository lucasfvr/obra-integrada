import React, { useState } from 'react';
import { Building2, Plus, Filter, Download, Users, FileText, Phone, Mail, Calendar } from 'lucide-react';
import { PageHeader, StatusBadge, SectionCard, InfoGrid, DataTable } from '../../../components/RH/rhUi.jsx';

const EMPRESAS = [
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
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [busca, setBusca] = useState('');

  const empresasFiltradas = EMPRESAS.filter((e) =>
    !busca || e.razaoSocial.toLowerCase().includes(busca.toLowerCase()) || e.cnpj.includes(busca)
  );

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
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <PageHeader
        icon={Building2}
        title="Terceirizados"
        subtitle="Gestão de empresas contratadas e profissionais alocados"
        actions={
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 text-sm font-semibold">
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
          className="flex-1 min-w-[200px] px-4 py-2 bg-card border border-border rounded-lg text-sm"
        />
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent">
          <Filter size={16} /> Filtros
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent">
          <Download size={16} /> Exportar
        </button>
      </div>

      <div className="grid gap-4">
        {empresasFiltradas.map((empresa) => (
          <div key={empresa.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{empresa.razaoSocial}</h3>
                <p className="text-sm text-muted-foreground font-mono">{empresa.cnpj}</p>
              </div>
              <StatusBadge status={empresa.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Colaboradores</p>
                  <p className="font-bold">{empresa.colaboradores.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Responsável</p>
                  <p className="text-sm font-medium">{empresa.responsavel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Vigência</p>
                  <p className="text-sm font-medium">{empresa.vigencia.split(' — ')[1]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Documentação</p>
                  <p className="text-sm font-medium">
                    {empresa.documentos.every((d) => d.status === 'Válido') ? 'Completa' : 'Parcial'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail size={12} /> {empresa.email}
              </div>
              <button
                onClick={() => setEmpresaSelecionada(empresa)}
                className="text-sm font-semibold text-primary hover:opacity-80"
              >
                Ver Detalhes →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
