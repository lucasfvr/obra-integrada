import React, { useState } from 'react';
import {
  ArrowLeft, FileText, Shield, Clock, Palmtree, Gift, DollarSign,
  Star, Users, History, Briefcase, Building2, HardHat, Edit, X, Save
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api.js';
import { useColaboradorPerfil, formatDoc, calcIdade } from '../../hooks/useColaboradorPerfil.js';
import {
  StatusBadge, SectionCard, InfoGrid, DataTable, TimelineItem
} from './rhUi.jsx';

const TABS = [
  { id: 'pessoais', label: 'Dados Pessoais', icon: Users },
  { id: 'contrato', label: 'Contrato', icon: Briefcase },
  { id: 'obras', label: 'Obras', icon: Building2 },
  { id: 'documentos', label: 'Documentos', icon: FileText },
  { id: 'sst', label: 'Segurança do Trabalho', icon: Shield },
  { id: 'jornada', label: 'Jornada', icon: Clock },
  { id: 'ferias', label: 'Férias e Afastamentos', icon: Palmtree },
  { id: 'beneficios', label: 'Benefícios', icon: Gift },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign, restricted: true },
  { id: 'avaliacoes', label: 'Avaliações', icon: Star },
  { id: 'dependentes', label: 'Dependentes', icon: Users },
  { id: 'historico', label: 'Histórico Completo', icon: History },
];

const MOCK_DEPENDENTES = [
  { id: 1, nome: 'Maria Silva', cpf: '***.***.***-**', nascimento: '15/03/2010', parentesco: 'Filha', ir: true, convenio: true },
];

const MOCK_BENEFICIOS = [
  { id: 1, tipo: 'Vale Transporte', status: 'Ativo', valor: 'R$ 220,00', inicio: '01/02/2025' },
  { id: 2, tipo: 'Vale Alimentação', status: 'Ativo', valor: 'R$ 650,00', inicio: '01/02/2025' },
  { id: 3, tipo: 'Plano Saúde', status: 'Ativo', valor: 'Empresa', inicio: '01/02/2025' },
];

const MOCK_EPIS = [
  { id: 1, item: 'Capacete', entrega: '10/01/2025', validade: '10/01/2027', responsavel: 'SST', assinatura: true },
  { id: 2, item: 'Botina', entrega: '10/01/2025', validade: '10/07/2025', responsavel: 'SST', assinatura: true },
  { id: 3, item: 'Luva', entrega: '15/03/2025', validade: '15/09/2025', responsavel: 'SST', assinatura: true },
  { id: 4, item: 'Óculos', entrega: '15/03/2025', validade: '15/09/2025', responsavel: 'SST', assinatura: true },
];

const DOC_CATEGORIAS = {
  pessoais: ['CPF', 'RG', 'CNH', 'Título Eleitor', 'Reservista', 'Comprovante Residência'],
  trabalhistas: ['CTPS', 'Contrato', 'Ficha Registro', 'Termos Assinados', 'Acordos'],
  sst: ['ASO', 'PPRA', 'PCMSO', 'Exames'],
  certificados: ['NR10', 'NR18', 'NR35', 'Operador Equipamentos', 'Primeiros Socorros'],
};

function TabPessoais({ colaborador, residencial }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Identificação">
        <InfoGrid fields={[
          { label: 'Nome Completo', value: colaborador.nome },
          { label: 'Nome Social', value: colaborador.nome_social || '—' },
          { label: 'CPF', value: formatDoc(colaborador) },
          { label: 'RG', value: colaborador.rg || '—' },
          { label: 'Órgão Emissor', value: colaborador.orgao_emissor || '—' },
          { label: 'Data Emissão', value: colaborador.data_emissao_rg || '—' },
          { label: 'PIS', value: colaborador.pis || '—' },
          { label: 'Título Eleitor', value: colaborador.titulo_eleitor || '—' },
          { label: 'Reservista', value: colaborador.reservista || '—' },
          { label: 'CNH', value: colaborador.cnh || '—' },
          { label: 'Categoria CNH', value: colaborador.categoria_cnh || '—' },
        ]} cols={3} />
      </SectionCard>
      <SectionCard title="Dados Civis">
        <InfoGrid fields={[
          { label: 'Data Nascimento', value: colaborador.data_nascimento ? new Date(colaborador.data_nascimento).toLocaleDateString('pt-BR') : '—' },
          { label: 'Idade', value: calcIdade(colaborador.data_nascimento) },
          { label: 'Sexo', value: colaborador.sexo || '—' },
          { label: 'Estado Civil', value: colaborador.estado_civil || '—' },
          { label: 'Nacionalidade', value: colaborador.nacionalidade || 'Brasileira' },
          { label: 'Naturalidade', value: colaborador.naturalidade || '—' },
          { label: 'Escolaridade', value: colaborador.escolaridade || '—' },
        ]} cols={3} />
      </SectionCard>
      <SectionCard title="Contatos">
        <InfoGrid fields={[
          { label: 'Telefone', value: colaborador.telefone || '—' },
          { label: 'Celular', value: colaborador.celular || colaborador.telefone || '—' },
          { label: 'WhatsApp', value: colaborador.whatsapp || '—' },
          { label: 'Email Corporativo', value: colaborador.email },
          { label: 'Email Pessoal', value: residencial?.email_pessoal || '—' },
        ]} cols={3} />
      </SectionCard>
      <SectionCard title="Emergência">
        <InfoGrid fields={[
          { label: 'Nome Contato', value: colaborador.contato_emergencia_nome || '—' },
          { label: 'Parentesco', value: colaborador.contato_emergencia_parentesco || '—' },
          { label: 'Telefone', value: colaborador.contato_emergencia_telefone || '—' },
        ]} />
      </SectionCard>
      <SectionCard title="Endereço">
        <InfoGrid fields={[
          { label: 'CEP', value: residencial?.cep || '—' },
          { label: 'Logradouro', value: residencial?.logradouro || '—' },
          { label: 'Número', value: residencial?.numero || '—' },
          { label: 'Complemento', value: residencial?.complemento || '—' },
          { label: 'Bairro', value: residencial?.bairro || '—' },
          { label: 'Cidade', value: residencial?.cidade || '—' },
          { label: 'Estado', value: residencial?.estado || '—' },
        ]} cols={3} />
      </SectionCard>
    </div>
  );
}

function TabContrato({ colaborador, salario }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Informações Contratuais">
        <InfoGrid fields={[
          { label: 'Matrícula', value: colaborador.matricula },
          { label: 'Tipo Contrato', value: colaborador.tipo_vinculo === 'CONTRATO' ? 'PJ / Prestação de Serviços' : 'CLT' },
          { label: 'Cargo', value: colaborador.cargo_base },
          { label: 'Função', value: colaborador.funcao || colaborador.cargo_base },
          { label: 'Departamento', value: colaborador.departamento || 'Obras' },
          { label: 'Centro de Custo', value: colaborador.centro_custo || '—' },
          { label: 'Gestor', value: colaborador.gestor || '—' },
          { label: 'Sindicato', value: colaborador.sindicato || '—' },
          { label: 'Escala Trabalho', value: colaborador.escala || '6x1' },
          { label: 'Carga Horária', value: colaborador.carga_horaria || '44h/semana' },
        ]} cols={3} />
      </SectionCard>
      <SectionCard title="Datas">
        <InfoGrid fields={[
          { label: 'Admissão', value: colaborador.data_admissao ? new Date(colaborador.data_admissao).toLocaleDateString('pt-BR') : '—' },
          { label: 'Experiência Início', value: colaborador.experiencia_inicio || '—' },
          { label: 'Experiência Fim', value: colaborador.experiencia_fim || '—' },
          { label: 'Efetivação', value: colaborador.efetivacao || '—' },
          { label: 'Última Promoção', value: colaborador.ultima_promocao || '—' },
          { label: 'Próxima Avaliação', value: colaborador.proxima_avaliacao || '—' },
        ]} cols={3} />
      </SectionCard>
      <SectionCard title="Salário">
        <InfoGrid fields={[
          { label: 'Salário Base', value: salario ? `R$ ${Number(salario.salario_base).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—' },
          { label: 'Periculosidade', value: colaborador.periculosidade || '—' },
          { label: 'Insalubridade', value: colaborador.insalubridade || '—' },
          { label: 'Gratificação', value: salario?.bonus ? `R$ ${Number(salario.bonus).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—' },
          { label: 'Comissão', value: colaborador.comissao || '—' },
          { label: 'Bonificações', value: colaborador.bonificacoes || '—' },
        ]} cols={3} />
      </SectionCard>
    </div>
  );
}

function TabObras({ colaborador }) {
  const historico = colaborador.obra_atual ? [
    { id: 1, obra: colaborador.obra_atual, cargo: colaborador.cargo_base, entrada: colaborador.data_admissao ? new Date(colaborador.data_admissao).toLocaleDateString('pt-BR') : '—', saida: '—', motivo: 'Alocação atual' },
  ] : [];

  return (
    <div className="space-y-6">
      <SectionCard title="Obra Atual">
        <InfoGrid fields={[
          { label: 'Nome Obra', value: colaborador.obra_atual || 'Não alocado' },
          { label: 'Função', value: colaborador.funcao || colaborador.cargo_base },
          { label: 'Líder', value: colaborador.lider_obra || '—' },
          { label: 'Data Entrada', value: colaborador.data_entrada_obra || '—' },
          { label: 'Localização', value: colaborador.localizacao_obra || '—' },
        ]} cols={3} />
      </SectionCard>
      <SectionCard title="Histórico de Obras">
        <DataTable
          columns={[
            { key: 'obra', label: 'Obra' },
            { key: 'cargo', label: 'Cargo' },
            { key: 'entrada', label: 'Entrada' },
            { key: 'saida', label: 'Saída' },
            { key: 'motivo', label: 'Motivo Transferência' },
          ]}
          rows={historico}
          emptyMessage="Nenhuma movimentação de obra registrada"
        />
      </SectionCard>
      <SectionCard title="Movimentações">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Transferências', 'Promoções', 'Mudança Cargo', 'Mudança Equipe'].map((m) => (
            <div key={m} className="p-4 rounded-lg bg-muted/30 border border-border text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground mt-1">{m}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function TabDocumentos({ certificacoes }) {
  const findDoc = (nome) => certificacoes.find((c) => c.nome?.toUpperCase().includes(nome.toUpperCase()));

  const renderCategoria = (titulo, docs) => (
    <SectionCard key={titulo} title={titulo}>
      <DataTable
        columns={[
          { key: 'nome', label: 'Documento' },
          { key: 'arquivo', label: 'Arquivo', render: (r) => r.arquivo_url ? '📎 Anexo' : '—' },
          { key: 'upload', label: 'Data Upload', render: (r) => r.data_emissao ? new Date(r.data_emissao).toLocaleDateString('pt-BR') : '—' },
          { key: 'validade', label: 'Validade', render: (r) => r.data_validade ? new Date(r.data_validade).toLocaleDateString('pt-BR') : '—' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'vencido' ? 'Vencido' : r.status === 'vencendo' ? 'A Expirar' : 'Válido'} /> },
          { key: 'resp', label: 'Responsável', render: () => 'RH' },
        ]}
        rows={docs.map((nome, i) => {
          const cert = findDoc(nome);
          return cert ? { id: cert.id_certificacao, ...cert, nome: cert.nome } : { id: `mock-${i}`, nome, status: 'pendente' };
        })}
      />
    </SectionCard>
  );

  return (
    <div className="space-y-6">
      {renderCategoria('Documentos Pessoais', DOC_CATEGORIAS.pessoais)}
      {renderCategoria('Documentos Trabalhistas', DOC_CATEGORIAS.trabalhistas)}
      {renderCategoria('Documentos SST', DOC_CATEGORIAS.sst)}
      {renderCategoria('Certificados', DOC_CATEGORIAS.certificados)}
    </div>
  );
}

function TabSST({ certificacoes }) {
  const exames = ['Admissional', 'Periódico', 'Mudança Função', 'Retorno Trabalho', 'Demissional'];
  const treinamentos = ['Integração', 'NR10', 'NR18', 'NR35', 'Brigada Incêndio', 'Primeiros Socorros'];

  return (
    <div className="space-y-6">
      <SectionCard title="Exames">
        <DataTable
          columns={[
            { key: 'tipo', label: 'Tipo' },
            { key: 'data', label: 'Data', render: () => '—' },
            { key: 'validade', label: 'Validade', render: () => '—' },
            { key: 'status', label: 'Status', render: () => <StatusBadge status="Pendente" /> },
          ]}
          rows={exames.map((tipo, i) => ({ id: i, tipo }))}
        />
      </SectionCard>
      <SectionCard title="Treinamentos">
        <DataTable
          columns={[
            { key: 'nome', label: 'Treinamento' },
            { key: 'data', label: 'Conclusão', render: (r) => {
              const cert = certificacoes.find((c) => c.nome?.includes(r.nome));
              return cert?.data_emissao ? new Date(cert.data_emissao).toLocaleDateString('pt-BR') : '—';
            }},
            { key: 'validade', label: 'Validade', render: (r) => {
              const cert = certificacoes.find((c) => c.nome?.includes(r.nome));
              return cert?.data_validade ? new Date(cert.data_validade).toLocaleDateString('pt-BR') : '—';
            }},
            { key: 'status', label: 'Status', render: (r) => {
              const cert = certificacoes.find((c) => c.nome?.includes(r.nome));
              if (!cert) return <StatusBadge status="Pendente" />;
              return <StatusBadge status={cert.status === 'vencido' ? 'Vencido' : 'Válido'} />;
            }},
          ]}
          rows={treinamentos.map((nome, i) => ({ id: i, nome }))}
        />
      </SectionCard>
      <SectionCard title="EPIs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {['Capacete', 'Botina', 'Luva', 'Óculos', 'Protetor Auricular', 'Cinto Segurança', 'Uniformes'].map((epi) => (
            <span key={epi} className="px-3 py-2 rounded-lg bg-muted/40 text-xs font-medium text-center">{epi}</span>
          ))}
        </div>
        <DataTable
          columns={[
            { key: 'item', label: 'Item' },
            { key: 'entrega', label: 'Data Entrega' },
            { key: 'validade', label: 'Validade' },
            { key: 'responsavel', label: 'Responsável' },
            { key: 'assinatura', label: 'Assinatura', render: (r) => r.assinatura ? '✓' : '—' },
          ]}
          rows={MOCK_EPIS}
        />
      </SectionCard>
    </div>
  );
}

function TabJornada({ pontos, indicadores }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Horas Trabalhadas', value: `${indicadores.horasTrabalhadas}h` },
          { label: 'Horas Extras', value: `${indicadores.horasExtras}h` },
          { label: 'Banco Horas', value: indicadores.bancoHoras },
          { label: 'Faltas', value: indicadores.faltas },
          { label: 'Atrasos', value: indicadores.atrasos },
          { label: 'DSR', value: '—' },
        ].map((k) => (
          <div key={k.label} className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{k.value}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Registros de Ponto">
        <DataTable
          columns={[
            { key: 'data', label: 'Data', render: (r) => new Date(r.data_ponto).toLocaleDateString('pt-BR') },
            { key: 'entrada', label: 'Entrada', render: (r) => r.hora_entrada ? new Date(r.hora_entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—' },
            { key: 'saida', label: 'Saída', render: (r) => r.hora_saida ? new Date(r.hora_saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—' },
            { key: 'horas', label: 'Horas', render: (r) => `${Number(r.horas_trabalhadas || 0).toFixed(1)}h` },
            { key: 'extras', label: 'Extras', render: (r) => `${Number(r.horas_extras || 0).toFixed(1)}h` },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={pontos}
          emptyMessage="Nenhum registro de ponto"
        />
      </SectionCard>
      <SectionCard title="Calendário">
        <div className="flex flex-wrap gap-2">
          {[
            { l: 'Presença', c: 'bg-emerald-500/20 text-emerald-700' },
            { l: 'Falta', c: 'bg-red-500/20 text-red-700' },
            { l: 'Atestado', c: 'bg-amber-500/20 text-amber-700' },
            { l: 'Férias', c: 'bg-blue-500/20 text-blue-700' },
            { l: 'Folga', c: 'bg-muted text-muted-foreground' },
          ].map((item) => (
            <span key={item.l} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${item.c}`}>{item.l}</span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">Visualização mensal em desenvolvimento.</p>
      </SectionCard>
    </div>
  );
}

function TabFerias() {
  return (
    <div className="space-y-6">
      <SectionCard title="Férias">
        <InfoGrid fields={[
          { label: 'Período Aquisitivo', value: '01/02/2024 — 01/02/2025' },
          { label: 'Período Concessivo', value: '01/02/2025 — 01/02/2026' },
          { label: 'Saldo', value: '30 dias' },
          { label: 'Próximas Férias', value: 'A definir' },
        ]} cols={2} />
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-muted-foreground mb-2">Histórico Férias</h5>
          <DataTable
            columns={[
              { key: 'periodo', label: 'Período' },
              { key: 'dias', label: 'Dias' },
              { key: 'status', label: 'Status' },
            ]}
            rows={[]}
            emptyMessage="Nenhum período de férias registrado"
          />
        </div>
      </SectionCard>
      <SectionCard title="Afastamentos">
        <DataTable
          columns={[
            { key: 'tipo', label: 'Tipo' },
            { key: 'inicio', label: 'Início' },
            { key: 'fim', label: 'Fim' },
            { key: 'status', label: 'Status' },
          ]}
          rows={[
            { id: 1, tipo: 'Licença Médica', inicio: '—', fim: '—', status: '—' },
            { id: 2, tipo: 'Licença Maternidade', inicio: '—', fim: '—', status: '—' },
            { id: 3, tipo: 'Licença Paternidade', inicio: '—', fim: '—', status: '—' },
            { id: 4, tipo: 'INSS', inicio: '—', fim: '—', status: '—' },
            { id: 5, tipo: 'Acidente Trabalho', inicio: '—', fim: '—', status: '—' },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function TabBeneficios() {
  return (
    <div className="space-y-6">
      <SectionCard title="Benefícios Ativos">
        <DataTable
          columns={[
            { key: 'tipo', label: 'Benefício' },
            { key: 'valor', label: 'Valor' },
            { key: 'inicio', label: 'Início' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={MOCK_BENEFICIOS}
        />
      </SectionCard>
      <SectionCard title="Histórico">
        <DataTable
          columns={[
            { key: 'evento', label: 'Evento' },
            { key: 'beneficio', label: 'Benefício' },
            { key: 'data', label: 'Data' },
          ]}
          rows={[]}
          emptyMessage="Nenhuma alteração registrada"
        />
      </SectionCard>
    </div>
  );
}

function TabFinanceiro({ salario, conta, pagamentos }) {
  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300">
        🔒 Área restrita — dados financeiros sensíveis
      </div>
      <SectionCard title="Dados">
        <InfoGrid fields={[
          { label: 'Salário Atual', value: salario ? `R$ ${Number(salario.salario_base).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—' },
          { label: 'Vale Refeição', value: salario ? `R$ ${Number(salario.vale_refeicao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—' },
          { label: 'Vale Transporte', value: salario ? `R$ ${Number(salario.vale_transporte || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—' },
          { label: 'Banco', value: conta?.banco || '—' },
          { label: 'Agência / Conta', value: conta ? `${conta.agencia} / ${conta.numero_conta}` : '—' },
          { label: 'PIX', value: conta?.chave_pix || '—' },
        ]} cols={3} />
      </SectionCard>
      <SectionCard title="Holerites">
        <DataTable
          columns={[
            { key: 'periodo', label: 'Período' },
            { key: 'bruto', label: 'Bruto', render: (r) => `R$ ${r.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
            { key: 'liquido', label: 'Líquido', render: (r) => `R$ ${r.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={pagamentos}
          emptyMessage="Nenhum holerite registrado"
        />
      </SectionCard>
    </div>
  );
}

function TabAvaliacoes() {
  return (
    <div className="space-y-6">
      <SectionCard title="Avaliações">
        <DataTable
          columns={[
            { key: 'tipo', label: 'Tipo' },
            { key: 'nota', label: 'Nota' },
            { key: 'data', label: 'Data' },
            { key: 'status', label: 'Status' },
          ]}
          rows={[
            { id: 1, tipo: 'Desempenho', nota: '—', data: '—', status: 'Pendente' },
            { id: 2, tipo: 'Competências', nota: '—', data: '—', status: 'Pendente' },
            { id: 3, tipo: 'Gestor', nota: '—', data: '—', status: 'Pendente' },
            { id: 4, tipo: 'Equipe', nota: '—', data: '—', status: 'Pendente' },
          ]}
        />
      </SectionCard>
      <SectionCard title="Feedbacks">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Positivos', 'Melhorias', 'Advertências', 'Reconhecimentos'].map((f) => (
            <div key={f} className="p-4 rounded-lg bg-muted/30 text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">{f}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function TabDependentes() {
  return (
    <SectionCard title="Dependentes">
      <DataTable
        columns={[
          { key: 'nome', label: 'Nome' },
          { key: 'cpf', label: 'CPF' },
          { key: 'nascimento', label: 'Data Nascimento' },
          { key: 'parentesco', label: 'Parentesco' },
          { key: 'ir', label: 'Dep. IR', render: (r) => r.ir ? 'Sim' : 'Não' },
          { key: 'convenio', label: 'Dep. Convênio', render: (r) => r.convenio ? 'Sim' : 'Não' },
        ]}
        rows={MOCK_DEPENDENTES}
        emptyMessage="Nenhum dependente cadastrado"
      />
    </SectionCard>
  );
}

function TabHistorico({ timeline }) {
  return (
    <SectionCard title="Timeline Completa">
      {timeline.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum evento registrado</p>
      ) : (
        <div className="pl-2">
          {timeline.map((ev, i) => (
            <TimelineItem key={i} date={ev.date} title={ev.title} description={ev.description} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export default function ColaboradorPerfil({ colaborador: colaboradorInicial, onBack }) {
  const navigate = useNavigate();
  const { apiFetch, hasPermissao } = useAuth();
  const [activeTab, setActiveTab] = useState('pessoais');
  const [colaborador, setColaborador] = useState(colaboradorInicial);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { loading, details, indicadores, reload } = useColaboradorPerfil(apiFetch, colaborador);

  const canSeeFinanceiro = hasPermissao('gerenciar_salario');
  const canEdit = hasPermissao('gerenciar_usuarios');
  const visibleTabs = TABS.filter((t) => !t.restricted || canSeeFinanceiro);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/rh/colaboradores');
  };

  const openEdit = () => {
    setEditForm({
      nome: colaborador.nome || '',
      email: colaborador.email || '',
      cargo_base: colaborador.cargo_base || '',
      cpf: colaborador.cpf || '',
      data_admissao: colaborador.data_admissao
        ? new Date(colaborador.data_admissao).toISOString().split('T')[0]
        : '',
      status: colaborador.status || 'ATIVO',
      tipo_vinculo: colaborador.tipo_vinculo || 'CLT',
    });
    setSaveError('');
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/${colaborador.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.erro || 'Erro ao salvar');
      }
      const updated = await res.json();
      setColaborador({ ...colaborador, ...updated });
      setShowEditModal(false);
      reload();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'pessoais': return <TabPessoais colaborador={colaborador} residencial={details.residencial} />;
      case 'contrato': return <TabContrato colaborador={colaborador} salario={details.salario} />;
      case 'obras': return <TabObras colaborador={colaborador} />;
      case 'documentos': return <TabDocumentos certificacoes={details.certificacoes} />;
      case 'sst': return <TabSST certificacoes={details.certificacoes} />;
      case 'jornada': return <TabJornada pontos={details.pontos} indicadores={indicadores} />;
      case 'ferias': return <TabFerias />;
      case 'beneficios': return <TabBeneficios />;
      case 'financeiro': return canSeeFinanceiro ? <TabFinanceiro salario={details.salario} conta={details.conta} pagamentos={details.pagamentos} /> : null;
      case 'avaliacoes': return <TabAvaliacoes />;
      case 'dependentes': return <TabDependentes />;
      case 'historico': return <TabHistorico timeline={details.timeline} />;
      default: return null;
    }
  };

  if (!colaborador) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho compacto fixo */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">

        {/* Linha única: voltar + identidade + badges + editar */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          {/* Voltar */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft size={14} /> Voltar
          </button>

          <div className="w-px h-5 bg-border shrink-0" />

          {/* Avatar pequeno */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {colaborador.nome?.[0]?.toUpperCase() || 'C'}
          </div>

          {/* Nome + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground truncate">{colaborador.nome}</span>
              <StatusBadge status={colaborador.status} />
              <span className="text-xs text-muted-foreground hidden sm:inline font-mono">{colaborador.matricula}</span>
              {colaborador.cargo_base && (
                <span className="text-xs text-muted-foreground hidden md:inline">· {colaborador.cargo_base}</span>
              )}
              {colaborador.data_admissao && (
                <span className="text-xs text-muted-foreground hidden lg:inline">
                  · Desde {new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            {/* Indicadores inline compactos */}
            <div className="flex flex-wrap items-center gap-3 mt-0.5">
              {[
                { icon: FileText, label: indicadores.documentacao, variant: indicadores.documentacao.includes('0/') ? 'text-amber-600' : 'text-emerald-600' },
                { icon: Shield, label: `ASO: ${indicadores.aso}`, variant: indicadores.aso === 'Vencido' ? 'text-red-600' : indicadores.aso === 'Pendente' ? 'text-amber-600' : 'text-emerald-600' },
                { icon: HardHat, label: indicadores.treinamentos, variant: 'text-muted-foreground' },
                { icon: Clock, label: `${indicadores.bancoHoras} extras`, variant: 'text-muted-foreground' },
              ].map(({ icon: Icon, label, variant }) => (
                <span key={label} className={`flex items-center gap-1 text-[11px] font-medium ${variant}`}>
                  <Icon size={11} />{label}
                </span>
              ))}
            </div>
          </div>

          {/* Botão editar */}
          {canEdit && (
            <button
              onClick={openEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition shrink-0"
            >
              <Edit size={13} /> Editar
            </button>
          )}
        </div>

        {/* Abas */}
        <div className="flex overflow-x-auto border-t border-border bg-muted/20 px-4 sm:px-6 scrollbar-elegant">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={13} />
                {tab.label}
                {tab.restricted && ' 🔒'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground mt-3">Carregando perfil...</p>
          </div>
        ) : (
          renderTab()
        )}
      </div>

      {/* Modal de Edição — padrão OB */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-lg w-full p-5 border border-border shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Edit size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Editar Colaborador</h2>
                  <p className="text-xs text-muted-foreground">{colaborador.matricula}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground transition">
                <X size={18} />
              </button>
            </div>

            {saveError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Nome Completo *</label>
                  <input type="text" required value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">CPF</label>
                  <input type="text" value={editForm.cpf} placeholder="000.000.000-00"
                    onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">E-mail</label>
                  <input type="email" value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Cargo</label>
                  <input type="text" value={editForm.cargo_base} placeholder="Ex: Pedreiro, Encarregado..."
                    onChange={(e) => setEditForm({ ...editForm, cargo_base: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Data de Admissão</label>
                  <input type="date" value={editForm.data_admissao}
                    onChange={(e) => setEditForm({ ...editForm, data_admissao: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                    <option value="ATIVO">Ativo</option>
                    <option value="AFASTADO">Afastado</option>
                    <option value="FERIAS">Férias</option>
                    <option value="DESLIGADO">Desligado</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de Contrato</label>
                  <select value={editForm.tipo_vinculo} onChange={(e) => setEditForm({ ...editForm, tipo_vinculo: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                    <option value="CLT">CLT</option>
                    <option value="CONTRATO">PJ / Contrato</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60">
                  {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Save size={14} /> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
