/**
 * GestaoRHAvancado.jsx
 * 
 * Módulo de Gestão de RH Avançado (Controle de Acesso, Ponto, Salários, Contas, Residenciais).
 * Renderizado dentro do RHLayout (usa o RHSidebar principal na lateral).
 * 
 * Sem emojis, usando ícones do Lucide React e layout de abas horizontais no topo.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import API_BASE_URL from '../../config/api.js';
import { 
  Users, Lock, DollarSign, MapPin, CreditCard, Clock, 
  Search, Plus, CheckCircle, XCircle, AlertTriangle, Eye, ShieldCheck
} from 'lucide-react';

export default function GestaoRHAvancado() {
  const { user, apiFetch, hasPermissao } = useAuth();
  const { toast } = useToast();
  
  // Controle de Abas Horizontais
  const [activeTab, setActiveTab] = useState('acesso');
  const [loading, setLoading] = useState(false);
  
  // Estados para dados da API
  const [funcionarios, setFuncionarios] = useState([]);
  const [salarios, setSalarios] = useState([]);
  const [residenciais, setResidenciais] = useState([]);
  const [contas, setContas] = useState([]);
  const [ponto, setPonto] = useState([]);
  
  // Estados de Modais
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [profileTab, setProfileTab] = useState('pessoais');

  // Filtros de Busca
  const [busca, setBusca] = useState('');

  // Funções de Fetch da API
  const fetchFuncionarios = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/equipe?page=1&limit=100`);
      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          setFuncionarios(response.data || []);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalarios = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh-avancado/salarios?page=1&limit=100`);
      if (res.ok) {
        const response = await res.json();
        if (response.success) setSalarios(response.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResidenciais = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh-avancado/residencial?page=1&limit=100`);
      if (res.ok) {
        const response = await res.json();
        if (response.success) setResidenciais(response.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContas = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh-avancado/contas-banco?page=1&limit=100`);
      if (res.ok) {
        const response = await res.json();
        if (response.success) setContas(response.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPonto = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh-avancado/ponto-diaria?page=1&limit=100&status=TODOS`);
      if (res.ok) {
        const response = await res.json();
        if (response.success) setPonto(response.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarAcesso = async (id_usuario, novoRole, novoStatus) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/usuarios/${id_usuario}`, {
        method: 'PUT',
        body: { role: novoRole, status: novoStatus }
      });
      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          toast.success('Acesso atualizado com sucesso!');
          fetchFuncionarios();
          setShowAccessModal(false);
          setSelectedColaborador(null);
        } else {
          toast.error(response.error || 'Erro ao atualizar acesso');
        }
      } else {
        toast.error('Erro ao atualizar acesso');
      }
    } catch (error) {
      toast.error('Erro ao conectar com a API');
      console.error(error);
    }
  };

  const handlePontoStatus = async (id, statusAction) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh-avancado/ponto-diaria/${id}/${statusAction}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        toast.success(`Ponto ${statusAction === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso!`);
        fetchPonto();
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar status do ponto');
    }
  };

  // Carregar dados conforme aba selecionada
  useEffect(() => {
    if (activeTab === 'acesso') fetchFuncionarios();
    else if (activeTab === 'salarios') fetchSalarios();
    else if (activeTab === 'residenciais') fetchResidenciais();
    else if (activeTab === 'contas') fetchContas();
    else if (activeTab === 'ponto') fetchPonto();
  }, [activeTab]);

  // Proteção de permissão
  if (!hasPermissao('gerenciar_usuarios')) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto bg-card border border-border rounded-xl shadow-lg mt-12">
        <Lock className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Acesso Restrito</h1>
        <p className="text-muted-foreground mt-2">Você não possui as permissões administrativas do RH necessárias para acessar esta página.</p>
      </div>
    );
  }

  // Filtros Locais
  const filteredFuncionarios = funcionarios.filter(f => 
    busca ? f.nome.toLowerCase().includes(busca.toLowerCase()) || (f.cpf && f.cpf.includes(busca)) : true
  );

  const filteredSalarios = salarios.filter(s => 
    busca ? s.tb_usuario?.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );

  const filteredResidenciais = residenciais.filter(r => 
    busca ? r.tb_usuario?.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );

  const filteredContas = contas.filter(c => 
    busca ? c.tb_usuario?.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );

  const filteredPonto = ponto.filter(p => 
    busca ? p.tb_usuario?.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );

  return (
    <div className="p-6 space-y-6">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Acesso e RH Avançado</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de permissões, salários, dados residenciais, contas bancárias e folha de ponto em conformidade com a LGPD.
          </p>
        </div>
      </div>

      {/* Tabs Horizontais no Topo (Estilo Padrão do Sistema, Sem Emojis) */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto bg-muted/20">
          {[
            { id: 'acesso', label: 'Gestão de Acesso', icon: Lock },
            { id: 'ponto', label: 'Folha de Ponto', icon: Clock },
            { id: 'salarios', label: 'Salários e Proventos', icon: DollarSign },
            { id: 'contas', label: 'Contas Bancárias', icon: CreditCard },
            { id: 'residenciais', label: 'Dados Residenciais', icon: MapPin },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setBusca('');
                }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Área de Filtro Rápido */}
        <div className="p-4 border-b border-border flex justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou documento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6">

          {/* ==================== TAB: GESTÃO DE ACESSO ==================== */}
          {activeTab === 'acesso' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando dados...</div>
              ) : filteredFuncionarios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum funcionário encontrado.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Nome</th>
                        <th className="px-6 py-3 text-left font-semibold">Email</th>
                        <th className="px-6 py-3 text-left font-semibold">Regra (Role)</th>
                        <th className="px-6 py-3 text-center font-semibold">Status</th>
                        <th className="px-6 py-3 text-right font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredFuncionarios.map(func => (
                        <tr key={func.id_usuario} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-3 font-semibold text-foreground">{func.nome}</td>
                          <td className="px-6 py-3 text-muted-foreground">{func.email || 'N/D'}</td>
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                              {func.role}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              func.status === 'ATIVO' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                            }`}>
                              {func.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedColaborador(func);
                                setShowAccessModal(true);
                              }}
                              className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors font-semibold"
                            >
                              Configurar Acesso
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: FOLHA DE PONTO ==================== */}
          {activeTab === 'ponto' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Pendentes de Aprovação</p>
                  <p className="text-2xl font-bold mt-2 text-warning-foreground">
                    {filteredPonto.filter(p => p.status === 'PENDENTE').length}
                  </p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Horas Extras Registradas</p>
                  <p className="text-2xl font-bold mt-2 text-primary-foreground">
                    {filteredPonto.reduce((acc, p) => acc + (parseFloat(p.horas_extras) || 0), 0).toFixed(1)}h
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Total Pago em Diárias</p>
                  <p className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400">
                    R$ {filteredPonto.reduce((acc, p) => acc + (parseFloat(p.valor_diaria) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando dados...</div>
              ) : filteredPonto.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum registro de ponto encontrado.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Nome</th>
                        <th className="px-6 py-3 text-left font-semibold">Data</th>
                        <th className="px-6 py-3 text-center">Entrada</th>
                        <th className="px-6 py-3 text-center">Saída</th>
                        <th className="px-6 py-3 text-right">Extras</th>
                        <th className="px-6 py-3 text-right">Diária</th>
                        <th className="px-6 py-3 text-center font-semibold">Status</th>
                        <th className="px-6 py-3 text-right font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredPonto.map(p => (
                        <tr key={p.id_ponto_diaria} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-3 font-semibold text-foreground">{p.tb_usuario?.nome || 'N/D'}</td>
                          <td className="px-6 py-3 text-muted-foreground">{new Date(p.data_ponto).toLocaleDateString('pt-BR')}</td>
                          <td className="px-6 py-3 text-center">{p.hora_entrada ? new Date(p.hora_entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                          <td className="px-6 py-3 text-center">{p.hora_saida ? new Date(p.hora_saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                          <td className="px-6 py-3 text-right">{(parseFloat(p.horas_extras) || 0).toFixed(1)}h</td>
                          <td className="px-6 py-3 text-right">R$ {parseFloat(p.valor_diaria).toFixed(2)}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              p.status === 'APROVADO' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                : p.status === 'REJEITADO' 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            {p.status === 'PENDENTE' && (
                              <div className="flex justify-end gap-1.5">
                                <button 
                                  onClick={() => handlePontoStatus(p.id_ponto_diaria, 'aprovar')}
                                  className="p-1 text-success hover:bg-success/15 rounded-md transition-colors"
                                  title="Aprovar Ponto"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handlePontoStatus(p.id_ponto_diaria, 'rejeitar')}
                                  className="p-1 text-destructive hover:bg-destructive/15 rounded-md transition-colors"
                                  title="Rejeitar Ponto"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: SALÁRIOS ==================== */}
          {activeTab === 'salarios' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando dados...</div>
              ) : filteredSalarios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum salário cadastrado.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Nome</th>
                        <th className="px-6 py-3 text-right font-semibold">Salário Base</th>
                        <th className="px-6 py-3 text-right font-semibold">Bônus</th>
                        <th className="px-6 py-3 text-right font-semibold">Vale Refeição</th>
                        <th className="px-6 py-3 text-right font-semibold">Vale Transporte</th>
                        <th className="px-6 py-3 text-center font-semibold">Início de Vigência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredSalarios.map(sal => (
                        <tr key={sal.id_salario} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-3 font-semibold text-foreground">{sal.tb_usuario?.nome || 'N/D'}</td>
                          <td className="px-6 py-3 text-right font-semibold">R$ {parseFloat(sal.salario_base).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-3 text-right text-muted-foreground">R$ {parseFloat(sal.bonus).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-3 text-right text-muted-foreground">R$ {parseFloat(sal.vale_refeicao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-3 text-right text-muted-foreground">R$ {parseFloat(sal.vale_transporte).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-3 text-center text-muted-foreground">{new Date(sal.data_inicio).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: CONTAS BANCÁRIAS ==================== */}
          {activeTab === 'contas' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando dados...</div>
              ) : filteredContas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma conta bancária registrada.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Nome</th>
                        <th className="px-6 py-3 text-left font-semibold">Banco</th>
                        <th className="px-6 py-3 text-left font-semibold">Agência / Conta</th>
                        <th className="px-6 py-3 text-left font-semibold">Chave PIX</th>
                        <th className="px-6 py-3 text-left font-semibold">Titular</th>
                        <th className="px-6 py-3 text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredContas.map(conta => (
                        <tr key={conta.id_conta_banco} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-3 font-semibold text-foreground">{conta.tb_usuario?.nome || 'N/D'}</td>
                          <td className="px-6 py-3 text-muted-foreground">{conta.banco} ({conta.tipo_conta})</td>
                          <td className="px-6 py-3 text-muted-foreground">{conta.agencia} / {conta.numero_conta}{conta.digito_conta ? `-${conta.digito_conta}` : ''}</td>
                          <td className="px-6 py-3 font-mono text-xs">{conta.chave_pix || '-'}</td>
                          <td className="px-6 py-3 text-xs text-muted-foreground">
                            <div>{conta.titular_conta}</div>
                            <div className="text-[10px]">{conta.cpf_titular}</div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              conta.ativo ? 'bg-success/20 text-success-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {conta.ativo ? 'Ativa' : 'Inativa'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: DADOS RESIDENCIAIS ==================== */}
          {activeTab === 'residenciais' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando dados...</div>
              ) : filteredResidenciais.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum endereço registrado.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResidenciais.map(res => (
                    <div key={res.id_residencial} className="border border-border rounded-xl p-5 bg-muted/10 space-y-3 shadow-sm">
                      <div className="border-b border-border pb-2">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Colaborador</p>
                        <p className="font-bold text-sm text-foreground mt-0.5">{res.tb_usuario?.nome || 'N/D'}</p>
                      </div>
                      <div className="text-xs space-y-2">
                        <div>
                          <p className="text-muted-foreground">Endereço</p>
                          <p className="font-semibold text-foreground mt-0.5">
                            {res.logradouro}, {res.numero} {res.complemento ? `- ${res.complemento}` : ''}
                          </p>
                          <p className="text-muted-foreground mt-0.5">{res.bairro} - {res.cidade} / {res.estado}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
                          <div>
                            <p className="text-muted-foreground">CEP</p>
                            <p className="font-semibold mt-0.5">{res.cep}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Telefone</p>
                            <p className="font-semibold mt-0.5">{res.telefone || '-'}</p>
                          </div>
                        </div>
                        {res.email_pessoal && (
                          <div className="border-t border-border pt-2">
                            <p className="text-muted-foreground">E-mail Pessoal</p>
                            <p className="font-semibold text-foreground truncate mt-0.5">{res.email_pessoal}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* =========================================================================
          MODAL: EDITAR CONTROLE DE ACESSO DO USUÁRIO
         ========================================================================= */}
      {showAccessModal && selectedColaborador && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <h3 className="text-lg font-bold mb-4">Editar Permissão & Acesso</h3>
            <p className="text-xs text-muted-foreground mb-4">Atualize as permissões de role e o status operacional de {selectedColaborador.nome} no banco de dados.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Role Atual</label>
                <p className="text-sm font-semibold text-foreground bg-accent/50 p-2.5 rounded border border-border">{selectedColaborador.role}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Novo Cargo Organizativo / Role</label>
                <select
                  id="modalNewRole"
                  defaultValue={selectedColaborador.role || 'USER'}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ADMIN">ADMIN (Controle Geral Construtora)</option>
                  <option value="RH">RH (Gestão Recursos Humanos)</option>
                  <option value="PROPRIETARIO">PROPRIETARIO (Dono do Tenant)</option>
                  <option value="RESPONSAVEL">RESPONSAVEL (Mestre/Engenheiro de Obra)</option>
                  <option value="TRABALHADOR">TRABALHADOR (Operário CLT/PJ)</option>
                  <option value="EMPREITEIRA">EMPREITEIRA (Parceiro Terceirizado)</option>
                  <option value="USER">USER (Padrão de Sistema)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Situação Operacional</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="radio" name="modalStatus" value="ATIVO" defaultChecked={selectedColaborador.status === 'ATIVO'} />
                    <span>Ativo</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="radio" name="modalStatus" value="INATIVO" defaultChecked={selectedColaborador.status === 'INATIVO'} />
                    <span>Inativo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAccessModal(false);
                    setSelectedColaborador(null);
                  }}
                  className="flex-1 px-4 py-2 text-xs border border-border rounded-lg hover:bg-accent font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const r = document.getElementById('modalNewRole').value;
                    const s = document.querySelector('input[name="modalStatus"]:checked')?.value || 'ATIVO';
                    atualizarAcesso(selectedColaborador.id_usuario, r, s);
                  }}
                  className="flex-1 px-4 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-bold transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
