import API_BASE_URL from "../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';
import { PermissaoGuard } from '../../components/Guards/PermissaoGuard.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function GestaoRH() {
  const { apiFetch, user } = useAuth();
  const { toast, showConfirm } = useToast();
  const navigate = useNavigate();
  
  const isEmpreiteira = user?.role === 'EMPREITEIRA';

  const [funcionarios, setFuncionarios] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFunc, setEditingFunc] = useState(null);
  
  // Tabs no modal
  const [modalTab, setModalTab] = useState('dados'); // 'dados' | 'nrs'
  
  // Certificações (NRs) do usuário em edição
  const [certificacoes, setCertificacoes] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  
  const DEFAULT_DOC_SELECTION = "NR-35 (Trabalho em Altura)";
  const [docSelection, setDocSelection] = useState(DEFAULT_DOC_SELECTION);
  const [newCertData, setNewCertData] = useState({
    nome: DEFAULT_DOC_SELECTION,
    data_emissao: '',
    data_validade: ''
  });

  // Alertas gerais de NRs vencidas/a vencer
  const [nrAlerts, setNrAlerts] = useState([]);

  // Filtros e Ordenação
  const [filtros, setFiltros] = useState({
    status: 'ATIVO',
    cargo: '',
    sortBy: 'nome',
    sortOrder: 'asc',
    is_terceirizado: '',
    cnpj_empreiteira: ''
  });
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    cnpj: '',
    email: '',
    cargo_base: '',
    data_admissao: '',
    role: 'TRABALHADOR',
    status: 'ATIVO',
    is_terceirizado: isEmpreiteira ? true : false,
    cnpj_empreiteira: isEmpreiteira ? (user?.cnpj || '') : '',
    razao_social_empreiteira: isEmpreiteira ? (user?.razao_social || '') : '',
    tipo_vinculo: 'CLT',
    lgpd_consentimento: false
  });

  const [errors, setErrors] = useState({});

  // Estados do Perfil do Funcionário
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileTab, setProfileTab] = useState('pessoais');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileDetails, setProfileDetails] = useState({
    salario: null,
    residencial: null,
    conta: null,
    pontos: [],
    epis: [
      { id: 1, nome: 'Capacete de Segurança Classe B', entregueEm: '2026-01-10', validade: '2027-01-10', status: 'entregue' },
      { id: 2, nome: 'Bota de Segurança com Biqueira de Aço', entregueEm: '2026-01-10', validade: '2026-07-10', status: 'trocar' },
      { id: 3, nome: 'Óculos de Proteção Incolor', entregueEm: '2026-03-15', validade: '2026-09-15', status: 'entregue' },
      { id: 4, nome: 'Protetor Auricular Plug de Silicone', entregueEm: '2026-05-20', validade: '2026-11-20', status: 'entregue' }
    ]
  });

  const obterMesesCLT = (dataAdmissao, salario) => {
    if (!dataAdmissao || !salario) return [];
    
    const admissao = new Date(dataAdmissao);
    const hoje = new Date();
    
    const meses = [];
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    let temp = new Date(admissao.getFullYear(), admissao.getMonth(), 1);
    
    while (temp <= hoje) {
      const mesIndex = temp.getMonth();
      const ano = temp.getFullYear();
      
      // Simular datas de pagamento
      const pagamentoData = new Date(ano, mesIndex + 1, 5);
      // Ajusta para dia útil se cair no fim de semana
      if (pagamentoData.getDay() === 0) pagamentoData.setDate(pagamentoData.getDate() + 1);
      else if (pagamentoData.getDay() === 6) pagamentoData.setDate(pagamentoData.getDate() - 1);
      
      const salarioBase = Number(salario.salario_base || 0);
      const bonus = Number(salario.bonus || 0);
      const valeRef = Number(salario.vale_refeicao || 0);
      const valeTrans = Number(salario.vale_transporte || 0);
      
      let inss = salarioBase * 0.09;
      if (salarioBase > 3000) inss = salarioBase * 0.11;
      if (salarioBase > 5000) inss = salarioBase * 0.14;
      inss = Math.min(inss, 900);
      
      const descontosFixos = Number(salario.desconto || 0);
      const totalDescontos = inss + descontosFixos;
      
      const valorBruto = salarioBase + bonus;
      const valorLiquido = valorBruto - totalDescontos;
      
      const isFuturo = new Date(ano, mesIndex, 1) > hoje;
      
      if (!isFuturo) {
        meses.unshift({
          periodo: `${nomesMeses[mesIndex]} de ${ano}`,
          mesAno: `${String(mesIndex + 1).padStart(2, '0')}/${ano}`,
          dataPagamento: pagamentoData.toLocaleDateString('pt-BR'),
          valorBruto,
          descontos: totalDescontos,
          beneficios: valeRef + valeTrans,
          valorLiquido,
          status: new Date(ano, mesIndex + 1, 5) < hoje ? 'Pago' : 'A Processar'
        });
      }
      
      temp.setMonth(temp.getMonth() + 1);
    }
    
    return meses;
  };

  const obterPagamentosPJ = (pontos, salario) => {
    if (!pontos || pontos.length === 0) return [];
    
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const grupos = {};
    
    pontos.forEach(p => {
      const data = new Date(p.data_ponto);
      const mesIndex = data.getMonth();
      const ano = data.getFullYear();
      const chave = `${mesIndex}-${ano}`;
      
      if (!grupos[chave]) {
        grupos[chave] = {
          mesIndex,
          ano,
          pontos: []
        };
      }
      grupos[chave].pontos.push(p);
    });
    
    const pagamentos = Object.values(grupos).map(g => {
      const pontosAprovados = g.pontos.filter(p => p.status === 'APROVADO');
      const pontosPendentes = g.pontos.filter(p => p.status === 'PENDENTE');
      
      const totalDiariasAprovadas = pontosAprovados.reduce((acc, p) => acc + Number(p.valor_diaria || 0), 0);
      const totalDiariasPendentes = pontosPendentes.reduce((acc, p) => acc + Number(p.valor_diaria || 0), 0);
      
      const quantidadeAprovada = pontosAprovados.length;
      const quantidadePendente = pontosPendentes.length;
      
      const descontos = salario ? Number(salario.desconto || 0) : 0;
      
      const valorBruto = totalDiariasAprovadas;
      const valorLiquido = Math.max(0, valorBruto - descontos);
      
      return {
        periodo: `${nomesMeses[g.mesIndex]} de ${g.ano}`,
        mesAno: `${String(g.mesIndex + 1).padStart(2, '0')}/${g.ano}`,
        quantidadeAprovada,
        quantidadePendente,
        valorBruto,
        descontos,
        valorLiquido,
        valorPendente: totalDiariasPendentes,
        status: quantidadePendente > 0 ? 'Pendente' : 'Pago'
      };
    });
    
    return pagamentos.sort((a, b) => {
      const [mesA, anoA] = a.mesAno.split('/').map(Number);
      const [mesB, anoB] = b.mesAno.split('/').map(Number);
      return anoB !== anoA ? anoB - anoA : mesB - mesA;
    });
  };

  const abrirPerfil = async (funcionario) => {
    setProfileUser(funcionario);
    setProfileTab('pessoais');
    setProfileLoading(true);
    setShowProfileModal(true);
    
    try {
      const userId = funcionario.id_usuario;

      const [salariosRes, residenciaisRes, contasRes, pontosRes, certsRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/api/rh-avancado/salarios?page=1&limit=100`),
        apiFetch(`${API_BASE_URL}/api/rh-avancado/residencial?page=1&limit=100`),
        apiFetch(`${API_BASE_URL}/api/rh-avancado/contas-banco?page=1&limit=100`),
        apiFetch(`${API_BASE_URL}/api/rh-avancado/ponto-diaria?page=1&limit=100`),
        apiFetch(`${API_BASE_URL}/api/rh/usuarios/${userId}/certificacoes`),
      ]);
      
      const salData = salariosRes.ok ? await salariosRes.json() : null;
      const resData = residenciaisRes.ok ? await residenciaisRes.json() : null;
      const conData = contasRes.ok ? await contasRes.json() : null;
      const ponData = pontosRes.ok ? await pontosRes.json() : null;
      const certData = certsRes.ok ? await certsRes.json() : [];
      
      const userSalario = salData?.success 
        ? salData.data.find(s => s.id_usuario === userId) 
        : null;
      const userResidencial = resData?.success 
        ? resData.data.find(r => r.id_usuario === userId) 
        : null;
      const userConta = conData?.success 
        ? conData.data.find(c => c.id_usuario === userId) 
        : null;
      const userPontos = ponData?.success 
        ? ponData.data.filter(p => p.id_usuario === userId) 
        : [];

      setProfileDetails(prev => ({
        ...prev,
        salario: userSalario,
        residencial: userResidencial,
        conta: userConta,
        pontos: userPontos,
        certificacoes: certData
      }));
    } catch (err) {
      console.error('Erro ao carregar detalhes do perfil:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Buscar funcionários
  const fetchFuncionarios = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        busca,
        status: filtros.status,
        cargo: filtros.cargo,
        sortBy: filtros.sortBy,
        sortOrder: filtros.sortOrder
      };

      if (filtros.is_terceirizado) {
        params.is_terceirizado = filtros.is_terceirizado;
      }
      if (filtros.cnpj_empreiteira) {
        params.cnpj_empreiteira = filtros.cnpj_empreiteira;
      }

      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${API_BASE_URL}/api/rh?${query}`);
      if (res.ok) {
        const result = await res.json();
        setFuncionarios(result.data);
        setMeta(result.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Buscar alertas globais de NRs
  const fetchAlertasNR = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/alertas-nr`);
      if (res.ok) {
        const data = await res.json();
        setNrAlerts(data);
      }
    } catch (error) {
      console.error('[RH] Erro ao buscar alertas de NRs:', error);
    }
  };

  useEffect(() => {
    fetchAlertasNR();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFuncionarios(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [busca, filtros]);

  // Certificações (NRs)
  const fetchCertificacoes = async (userId) => {
    try {
      setLoadingCerts(true);
      const res = await apiFetch(`${API_BASE_URL}/api/rh/usuarios/${userId}/certificacoes`);
      if (res.ok) {
        const data = await res.json();
        setCertificacoes(data);
      }
    } catch (e) {
      console.error('[RH] Erro ao buscar certificações:', e);
    } finally {
      setLoadingCerts(false);
    }
  };

  useEffect(() => {
    if (showModal && editingFunc && modalTab === 'nrs') {
      fetchCertificacoes(editingFunc.id_usuario);
    }
  }, [showModal, editingFunc, modalTab]);

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!newCertData.nome) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/usuarios/${editingFunc.id_usuario}/certificacoes`, {
        method: 'POST',
        body: JSON.stringify(newCertData)
      });
      if (res.ok) {
        toast.success('Documento/Certificação adicionada com sucesso!', 'Sucesso');
        setNewCertData({ nome: DEFAULT_DOC_SELECTION, data_emissao: '', data_validade: '' });
        setDocSelection(DEFAULT_DOC_SELECTION);
        fetchCertificacoes(editingFunc.id_usuario);
        fetchAlertasNR(); // Atualiza os alertas do dashboard
      } else {
        const err = await res.json();
        toast.error(err.erro || 'Erro ao adicionar documento', 'Erro');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de conexão ao adicionar documento', 'Erro');
    }
  };

  const handleDeleteCert = async (certId) => {
    const confirmed = await showConfirm({
      title: 'Excluir Documentação',
      message: 'Deseja realmente remover este documento do cadastro do colaborador?',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/usuarios/${editingFunc.id_usuario}/certificacoes/${certId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Documento removido com sucesso.', 'Sucesso');
        fetchCertificacoes(editingFunc.id_usuario);
        fetchAlertasNR();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nome || formData.nome.length < 3) newErrors.nome = "Nome muito curto";
    
    // Validação de e-mail opcional
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    const cleanCpf = formData.cpf ? formData.cpf.replace(/\D/g, '') : '';
    const cleanCnpj = formData.cnpj ? formData.cnpj.replace(/\D/g, '') : '';

    if (!cleanCpf && !cleanCnpj) {
      newErrors.documento = "Pelo menos um documento (CPF ou CNPJ) é obrigatório.";
    } else {
      if (cleanCpf && cleanCpf.length !== 11) {
        newErrors.cpf = "CPF deve ter 11 dígitos.";
      }
      if (cleanCnpj && cleanCnpj.length !== 14) {
        newErrors.cnpj = "CNPJ deve ter 14 dígitos.";
      }
    }

    if (!editingFunc && !formData.lgpd_consentimento) {
      newErrors.lgpd = "A ciência e consentimento LGPD são obrigatórios para novos cadastros.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const method = editingFunc ? 'PUT' : 'POST';
    const url = editingFunc 
      ? `${API_BASE_URL}/api/rh/${editingFunc.id_usuario}`
      : `${API_BASE_URL}/api/rh`;

    const bodyPayload = {
      ...formData,
      cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : null,
      cnpj: formData.cnpj ? formData.cnpj.replace(/\D/g, '') : null,
      is_terceirizado: isEmpreiteira ? true : (formData.is_terceirizado === true || formData.is_terceirizado === 'true'),
      cnpj_empreiteira: isEmpreiteira ? user.cnpj : (formData.is_terceirizado ? formData.cnpj_empreiteira : null),
      razao_social_empreiteira: isEmpreiteira ? user.razao_social : (formData.is_terceirizado ? formData.razao_social_empreiteira : null)
    };

    try {
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        toast.success(editingFunc ? 'Cadastro atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!', editingFunc ? 'Atualizado' : 'Cadastrado');
        setShowModal(false);
        setEditingFunc(null);
        setFormData({
          nome: '',
          cpf: '',
          cnpj: '',
          email: '',
          cargo_base: '',
          data_admissao: '',
          role: 'TRABALHADOR',
          status: 'ATIVO',
          is_terceirizado: isEmpreiteira ? true : false,
          cnpj_empreiteira: isEmpreiteira ? (user?.cnpj || '') : '',
          razao_social_empreiteira: isEmpreiteira ? (user?.razao_social || '') : '',
          tipo_vinculo: 'CLT',
          lgpd_consentimento: false
        });
        setErrors({});
        fetchFuncionarios(meta.page);
      } else {
        const err = await res.json();
        toast.error(err.erro || 'Erro ao salvar cadastro.', 'Erro');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInativar = async (id) => {
    const confirmed = await showConfirm({
      title: 'Inativar Colaborador',
      message: 'Deseja realmente inativar este funcionário? Esta ação pode ser revertida depois.',
      confirmLabel: 'Sim, inativar',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/${id}/inativar`, { method: 'PATCH' });
      if (res.ok) {
        toast.success('Funcionário inativado com sucesso.', 'Inativado');
        fetchFuncionarios(meta.page);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSort = (field) => {
    setFiltros(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // LGPD: Mascara para exibição legível mas oculta na tabela geral
  const formatMaskedDoc = (item) => {
    if (item.cnpj && item.cpf) {
      const cpfClean = item.cpf.replace(/\D/g, '');
      const cnpjClean = item.cnpj.replace(/\D/g, '');
      return `CPF: ***.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-** / CNPJ: **.***.${cnpjClean.slice(5, 8)}/${cnpjClean.slice(8, 12)}-**`;
    }
    if (item.cpf) {
      const clean = item.cpf.replace(/\D/g, '');
      return `CPF: ***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
    }
    if (item.cnpj) {
      const clean = item.cnpj.replace(/\D/g, '');
      return `CNPJ: **.***.${clean.slice(5, 8)}/${clean.slice(8, 12)}-**`;
    }
    return 'Sem Documento';
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isEmpreiteira ? `Gestão de RH — ${user?.razao_social || 'Empreiteira'}` : 'Gestão de RH'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEmpreiteira 
              ? 'Gerenciamento de trabalhadores terceirizados sob conformidade regulatória e proteção de dados LGPD.'
              : 'Controle de colaboradores com validação contratual, terceirizados e conformidade de NRs/Saúde.'}
          </p>
        </div>
        
        <PermissaoGuard permissao="gerenciar_usuarios">
          <button
            onClick={() => { 
              setEditingFunc(null); 
              setModalTab('dados');
              setFormData({
                nome: '',
                cpf: '',
                cnpj: '',
                email: '',
                cargo_base: '',
                data_admissao: '',
                role: 'TRABALHADOR',
                status: 'ATIVO',
                is_terceirizado: isEmpreiteira ? true : false,
                cnpj_empreiteira: isEmpreiteira ? (user?.cnpj || '') : '',
                razao_social_empreiteira: isEmpreiteira ? (user?.razao_social || '') : '',
                tipo_vinculo: 'CLT',
                lgpd_consentimento: false
              }); 
              setErrors({}); 
              setShowModal(true); 
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span> Novo Colaborador
          </button>
        </PermissaoGuard>
      </div>

      {/* Banner de Conformidade NR */}
      {nrAlerts.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <span>🚨</span>
            <span>Alertas de Conformidade: {nrAlerts.length} Documentos pendentes ou vencidos</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {nrAlerts.slice(0, 5).map(alert => (
              <div 
                key={alert.id_certificacao} 
                onClick={() => {
                  const func = funcionarios.find(f => f.id_usuario === alert.id_usuario);
                  if (func) {
                    setEditingFunc(func);
                    setFormData({
                      nome: func.nome || '',
                      cpf: func.cpf || '',
                      cnpj: func.cnpj || '',
                      email: func.email || '',
                      cargo_base: func.cargo_base || '',
                      data_admissao: func.data_admissao?.split('T')[0] || '',
                      role: func.role || 'TRABALHADOR',
                      status: func.status || 'ATIVO',
                      is_terceirizado: func.is_terceirizado || false,
                      cnpj_empreiteira: func.cnpj_empreiteira || '',
                      razao_social_empreiteira: func.razao_social_empreiteira || '',
                      tipo_vinculo: func.tipo_vinculo || 'CLT',
                      lgpd_consentimento: func.lgpd_consentimento || false
                    });
                    setErrors({});
                    setModalTab('nrs');
                    setShowModal(true);
                  } else {
                    toast.info(`Colaborador: ${alert.nome_usuario} - ${alert.nome_certificacao} vence em ${new Date(alert.data_validade).toLocaleDateString()}`);
                  }
                }}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer hover:scale-105 transition-all ${
                  alert.status === 'vencido' 
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }`}
              >
                <span>{alert.nome_usuario} - {alert.nome_certificacao}</span>
                <span className="opacity-60 ml-1">({alert.status === 'vencido' ? 'Vencida' : 'Vence em ' + new Date(alert.data_validade).toLocaleDateString()})</span>
              </div>
            ))}
            {nrAlerts.length > 5 && (
              <span className="text-[10px] text-muted-foreground font-semibold flex items-center px-1">
                + {nrAlerts.length - 5} alertas
              </span>
            )}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[250px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nome, matrícula, CPF ou CNPJ..."
              className="w-full bg-card border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <select 
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
            value={filtros.status}
            onChange={(e) => setFiltros({...filtros, status: e.target.value})}
          >
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
            <option value="TODOS">Todos</option>
          </select>

          <input 
            type="text"
            placeholder="Filtrar Profissão..."
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
            value={filtros.cargo}
            onChange={(e) => setFiltros({...filtros, cargo: e.target.value})}
          />

          {!isEmpreiteira && (
            <>
              <select
                className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                value={filtros.is_terceirizado}
                onChange={(e) => setFiltros({...filtros, is_terceirizado: e.target.value})}
              >
                <option value="">Todos (Interno/Terc.)</option>
                <option value="false">Internos CLT</option>
                <option value="true">Terceirizados (Empreiteiras)</option>
              </select>

              <input 
                type="text"
                placeholder="Filtrar por CNPJ Empreiteira..."
                className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                value={filtros.cnpj_empreiteira}
                onChange={(e) => setFiltros({...filtros, cnpj_empreiteira: e.target.value})}
              />
            </>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('matricula')}>
                   <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase">
                    Matrícula {filtros.sortBy === 'matricula' && (filtros.sortOrder === 'asc' ? '↑' : '↓')}
                   </div>
                </th>
                <th className="pb-3 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('nome')}>
                   <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase">
                    Colaborador {filtros.sortBy === 'nome' && (filtros.sortOrder === 'asc' ? '↑' : '↓')}
                   </div>
                </th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase">Documentos (LGPD)</th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase">Profissão / Cargo</th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase">Vínculo / Empreiteira</th>
                <th className="pb-3 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('data_admissao')}>
                   <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase">
                    Admissão {filtros.sortBy === 'data_admissao' && (filtros.sortOrder === 'asc' ? '↑' : '↓')}
                   </div>
                </th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase text-center">Status</th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="8" className="py-12 text-center text-muted-foreground font-semibold text-xs animate-pulse">Sincronizando dados...</td></tr>
              ) : funcionarios.length === 0 ? (
                <tr><td colSpan="8" className="py-12 text-center text-muted-foreground font-semibold text-xs">Nenhum funcionário encontrado.</td></tr>
              ) : funcionarios.map(f => (
                <tr key={f.id_usuario} className="group hover:bg-muted/30 transition-colors">
                  <td className="py-4 text-sm font-semibold text-primary">{f.matricula}</td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{f.nome}</span>
                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{f.email || 'Sem e-mail'}</span>
                    </div>
                  </td>
                  <td className="py-4 text-xs font-medium text-muted-foreground font-mono">{formatMaskedDoc(f)}</td>
                  <td className="py-4 text-sm text-muted-foreground font-semibold">{f.cargo_base || 'Não definido'}</td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit text-[10px] font-bold px-2 py-0.5 rounded-full border ${f.tipo_vinculo === 'CONTRATO' ? 'bg-indigo-500/10 text-indigo-600 border-transparent' : 'bg-teal-500/10 text-teal-600 border-transparent'}`}>
                        {f.tipo_vinculo === 'CONTRATO' ? 'Contrato PJ/Serviço' : 'CLT Carteira'}
                      </span>
                      {f.is_terceirizado ? (
                        <span className="text-[10px] text-amber-600 font-semibold" title={`CNPJ: ${f.cnpj_empreiteira || '-'}`}>
                          🏗️ Terc: {f.razao_social_empreiteira || 'Empreiteira'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">🏢 Interno</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {f.data_admissao ? new Date(f.data_admissao).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${f.status === 'ATIVO' ? 'bg-emerald-500/10 text-emerald-600 border-transparent' : 'bg-muted text-muted-foreground border-transparent'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/rh/colaboradores/${f.id_usuario}`)}
                        className="p-1.5 text-muted-foreground hover:text-indigo-600 transition-colors"
                        title="Ver Perfil Completo"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <PermissaoGuard permissao="gerenciar_usuarios">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => navigate(`/rh/colaboradores/${f.id_usuario}`)}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                            title="Editar Colaborador"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                          </button>

                          {f.role !== 'PROPRIETARIO' && (
                            <button
                              onClick={() => handleInativar(f.id_usuario)}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                              title="Inativar Colaborador"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </PermissaoGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
             {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
               <button 
                 key={p} 
                 onClick={() => fetchFuncionarios(p)}
                 className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${meta.page === p ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
               >
                 {p}
               </button>
             ))}
          </div>
        )}
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-2xl shadow-lg overflow-hidden border border-border animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  {editingFunc ? `Colaborador: ${editingFunc.nome}` : 'Novo Colaborador'}
                </h3>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Gestão e Qualificações de RH</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
            </div>
            
            {/* Abas do Modal */}
            {editingFunc && (
              <div className="flex bg-muted/20 border-b border-border shrink-0">
                <button 
                  onClick={() => setModalTab('dados')}
                  className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${modalTab === 'dados' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Dados Contratuais
                </button>
                <button 
                  onClick={() => setModalTab('nrs')}
                  className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${modalTab === 'nrs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Documentações e Conformidades
                </button>
              </div>
            )}

            <div className="p-5 overflow-y-auto flex-1">
              {modalTab === 'dados' ? (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Nome Completo</label>
                    <input required type="text" className={`w-full bg-card border ${errors.nome ? 'border-destructive' : 'border-border'} rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all`} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                    {errors.nome && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.nome}</span>}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">CPF (Apenas números)</label>
                    <input type="text" maxLength="11" className={`w-full bg-card border ${errors.cpf ? 'border-destructive' : 'border-border'} rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all`} value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                    {errors.cpf && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.cpf}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">CNPJ do Trabalhador (PJ/MEI)</label>
                    <input type="text" maxLength="14" className={`w-full bg-card border ${errors.cnpj ? 'border-destructive' : 'border-border'} rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all`} value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
                    {errors.cnpj && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.cnpj}</span>}
                  </div>
                  {errors.documento && <div className="md:col-span-2 text-[10px] text-destructive font-bold">{errors.documento}</div>}

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de Vínculo Contratual</label>
                    <select
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.tipo_vinculo}
                      onChange={e => setFormData({...formData, tipo_vinculo: e.target.value})}
                    >
                      <option value="CLT">Carteira Assinada (CLT)</option>
                      <option value="CONTRATO">Contrato de Prestação de Serviços (PJ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">E-mail de Contato</label>
                    <input type="email" className={`w-full bg-card border ${errors.email ? 'border-destructive' : 'border-border'} rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all`} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    {errors.email && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.email}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Profissão / Cargo</label>
                    <input type="text" className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ex: Pedreiro, Pintor, Ajudante..." value={formData.cargo_base} onChange={e => setFormData({...formData, cargo_base: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Data de Admissão / Associação</label>
                    <input type="date" className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={formData.data_admissao} onChange={e => setFormData({...formData, data_admissao: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Status do Colaborador</label>
                    <select 
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                    </select>
                  </div>

                  {!isEmpreiteira && (
                    <div className="md:col-span-2 border-t border-border pt-4 mt-2 space-y-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="is_terceirizado"
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                          checked={formData.is_terceirizado}
                          onChange={e => setFormData({...formData, is_terceirizado: e.target.checked})}
                        />
                        <label htmlFor="is_terceirizado" className="text-xs font-bold text-foreground">Trabalhador Terceirizado (Empreiteira)?</label>
                      </div>

                      {formData.is_terceirizado && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">CNPJ da Empreiteira</label>
                            <input required={formData.is_terceirizado} type="text" className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Apenas números" value={formData.cnpj_empreiteira} onChange={e => setFormData({...formData, cnpj_empreiteira: e.target.value})} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Razão Social da Empreiteira</label>
                            <input required={formData.is_terceirizado} type="text" className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Nome da empresa parceira" value={formData.razao_social_empreiteira} onChange={e => setFormData({...formData, razao_social_empreiteira: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!editingFunc && (
                    <div className="md:col-span-2 flex items-start gap-2.5 bg-muted/40 p-3.5 rounded-lg border border-border mt-2">
                      <input
                        type="checkbox"
                        id="lgpd_consentimento"
                        required
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                        checked={formData.lgpd_consentimento}
                        onChange={e => setFormData({...formData, lgpd_consentimento: e.target.checked})}
                      />
                      <label htmlFor="lgpd_consentimento" className="text-[10px] text-muted-foreground leading-normal font-medium">
                        Declaro ciência e autorizo que os dados informados (incluindo CPF/CNPJ, tipo de vínculo contratual e atestados médicos de aptidão de saúde/ASO) sejam processados e arquivados nesta plataforma para controle de acesso físico às obras da construtora, conformidade trabalhista, atribuição de tarefas operacionais e obrigações legais de SST (Saúde e Segurança do Trabalho), em estrito cumprimento com a LGPD (Lei nº 13.709/2018).
                      </label>
                    </div>
                  )}
                  {errors.lgpd && <span className="md:col-span-2 text-[10px] text-destructive font-semibold mt-1 block">{errors.lgpd}</span>}

                  <div className="md:col-span-2 pt-4 flex gap-3 justify-end border-t border-border">
                    <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors">Salvar Colaborador</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Listagem de certificações */}
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Documentações e Conformidades Ativas</h4>
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/40 border-b border-border">
                          <tr>
                            <th className="px-4 py-2 text-muted-foreground font-semibold">Documento / Qualificação</th>
                            <th className="px-4 py-2 text-muted-foreground font-semibold">Emissão</th>
                            <th className="px-4 py-2 text-muted-foreground font-semibold">Validade</th>
                            <th className="px-4 py-2 text-muted-foreground font-semibold text-center">Status</th>
                            <th className="px-4 py-2 text-muted-foreground font-semibold text-right">Ações / Arquivo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {loadingCerts ? (
                            <tr><td colSpan="5" className="py-6 text-center text-muted-foreground animate-pulse">Buscando qualificações...</td></tr>
                          ) : certificacoes.length === 0 ? (
                            <tr><td colSpan="5" className="py-6 text-center text-muted-foreground italic">Nenhum documento ou NR cadastrada para este colaborador.</td></tr>
                          ) : (
                            certificacoes.map(cert => (
                              <tr key={cert.id_certificacao} className="hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3 font-semibold text-foreground">
                                  <div className="flex flex-col">
                                    <span>{cert.nome}</span>
                                    {cert.nome.toUpperCase().includes('ASO') && (
                                      <span className="text-[9px] text-rose-500 font-semibold font-mono">🔒 Protegido LGPD (Saúde)</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{cert.data_emissao ? new Date(cert.data_emissao).toLocaleDateString() : '-'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{cert.data_validade ? new Date(cert.data_validade).toLocaleDateString() : '-'}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    cert.status === 'vencido' 
                                      ? 'bg-rose-500/10 text-rose-600' 
                                      : cert.status === 'vencendo' 
                                      ? 'bg-amber-500/10 text-amber-600' 
                                      : 'bg-emerald-500/10 text-emerald-600'
                                  }`}>
                                    {cert.status === 'vencido' ? 'Vencido' : cert.status === 'vencendo' ? 'A Expirar' : 'Válido'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end items-center gap-2">
                                    {cert.arquivo_url ? (
                                      <a 
                                        href={cert.arquivo_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-primary hover:underline text-[10px] font-bold"
                                      >
                                        Ver PDF
                                      </a>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground italic">Sem anexo</span>
                                    )}
                                    <button 
                                      onClick={() => handleDeleteCert(cert.id_certificacao)}
                                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                      title="Remover Documento"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Formulário de Nova Certificação */}
                  <form onSubmit={handleAddCert} className="pt-5 border-t border-border space-y-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Adicionar Novo Documento</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Tipo de Documento</label>
                        <select
                          className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          value={docSelection}
                          onChange={e => {
                            const val = e.target.value;
                            setDocSelection(val);
                            if (val !== 'Outro') {
                              setNewCertData({ ...newCertData, nome: val });
                            } else {
                              setNewCertData({ ...newCertData, nome: '' });
                            }
                          }}
                        >
                          <option value="NR-35 (Trabalho em Altura)">Curso NR-35 (Trabalho em Altura)</option>
                          <option value="NR-10 (Segurança em Eletricidade)">Curso NR-10 (Segurança em Eletricidade)</option>
                          <option value="NR-18 (Segurança na Construção)">Curso NR-18 (Segurança na Construção)</option>
                          <option value="ASO (Atestado de Saúde Ocupacional)">ASO (Saúde Ocupacional) 🔒 Dado Sensível</option>
                          <option value="Ficha de EPI">Ficha de EPI Entregue</option>
                          <option value="Contrato de Trabalho / Prestação de Serviço">Contrato de Trabalho / Contrato PJ</option>
                          <option value="Outro">Outro (Digitar Nome Abaixo)</option>
                        </select>
                      </div>

                      {docSelection === 'Outro' && (
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Nome do Documento / NR Especialidade</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Ex: NR-12 (Operação de Máquinas)"
                            className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={newCertData.nome}
                            onChange={e => setNewCertData({ ...newCertData, nome: e.target.value })}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Data de Emissão</label>
                        <input 
                          type="date"
                          className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          value={newCertData.data_emissao}
                          onChange={e => setNewCertData({ ...newCertData, data_emissao: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Data de Validade (Obrigatório se NR/ASO)</label>
                        <input 
                          type="date"
                          className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          value={newCertData.data_validade}
                          onChange={e => setNewCertData({ ...newCertData, data_validade: e.target.value })}
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Adicionar Documento
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE PERFIL COMPLETO DO COLABORADOR */}
      {showProfileModal && profileUser && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-4xl shadow-lg overflow-hidden border border-border animate-slide-up flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shadow-inner">
                  {profileUser.nome ? profileUser.nome[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                    {profileUser.nome}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${profileUser.status === 'ATIVO' ? 'bg-emerald-500/10 text-emerald-600 border-transparent' : 'bg-muted text-muted-foreground border-transparent'}`}>
                      {profileUser.status}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-medium">
                    <span>Matrícula: <strong className="text-primary font-semibold font-mono">#{profileUser.matricula || '---'}</strong></span>
                    <span>•</span>
                    <span>Cargo: <strong className="text-foreground">{profileUser.cargo_base || 'Não definido'}</strong></span>
                    <span>•</span>
                    <span>Vínculo: <strong className="text-foreground">{profileUser.tipo_vinculo === 'CONTRATO' ? 'PJ / Prestador' : 'CLT'}</strong></span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
            </div>

            {/* Profile Tabs */}
            <div className="flex bg-muted/20 border-b border-border shrink-0 overflow-x-auto">
              {[
                { id: 'pessoais', label: '👤 Dados Pessoais & Endereço' },
                { id: 'financeiro', label: '💰 Salário & Banco' },
                { id: 'pagamentos', label: '💳 Histórico de Pagamentos' },
                { id: 'ponto', label: '📅 Ponto & Horas' },
                { id: 'epis', label: '🛡️ EPIs & Equipamentos' },
                { id: 'nrs', label: '📜 NRs & Certificações' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id)}
                  className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${profileTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-card/50">
              {profileLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-xs text-muted-foreground font-semibold">Sincronizando perfil de RH...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tab: Pessoais */}
                  {profileTab === 'pessoais' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Identificação do Colaborador</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Nome Completo</span>
                            <span className="font-semibold text-foreground">{profileUser.nome}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5">E-mail de Contato</span>
                            <span className="font-semibold text-foreground">{profileUser.email || 'Não informado'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Documento Identificador</span>
                            <span className="font-semibold text-foreground font-mono">{formatMaskedDoc(profileUser)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Tipo de Contrato</span>
                            <span className="font-semibold text-foreground">{profileUser.tipo_vinculo === 'CONTRATO' ? 'PJ / Prestador de Serviços' : 'CLT / Carteira Assinada'}</span>
                          </div>
                          {profileUser.is_terceirizado && (
                            <div className="col-span-2 border-t border-border pt-3">
                              <span className="text-amber-600 block mb-0.5 font-bold">🏗️ Empreiteira Terceirizada</span>
                              <span className="font-semibold text-foreground">{profileUser.razao_social_empreiteira || '---'} (CNPJ: {profileUser.cnpj_empreiteira || '---'})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Endereço Residencial</h4>
                        {profileDetails.residencial ? (
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="col-span-2">
                              <span className="text-muted-foreground block mb-0.5">Logradouro</span>
                              <span className="font-semibold text-foreground">{profileDetails.residencial.logradouro}, {profileDetails.residencial.numero} {profileDetails.residencial.complemento ? `- ${profileDetails.residencial.complemento}` : ''}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Bairro</span>
                              <span className="font-semibold text-foreground">{profileDetails.residencial.bairro}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">CEP</span>
                              <span className="font-semibold text-foreground font-mono">{profileDetails.residencial.cep}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Cidade / Estado</span>
                              <span className="font-semibold text-foreground">{profileDetails.residencial.cidade} - {profileDetails.residencial.estado}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Telefone Residencial</span>
                              <span className="font-semibold text-foreground">{profileDetails.residencial.telefone || 'Não informado'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">E-mail Pessoal</span>
                              <span className="font-semibold text-foreground">{profileDetails.residencial.email_pessoal || 'Não informado'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground text-xs italic">
                            Dados residenciais não cadastrados no sistema de RH.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab: Financeiro */}
                  {profileTab === 'financeiro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Contrato & Salário</h4>
                        {profileDetails.salario ? (
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Salário Base</span>
                              <span className="font-bold text-foreground text-sm">R$ {profileDetails.salario.salario_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Bônus / Premiação</span>
                              <span className="font-semibold text-foreground">R$ {profileDetails.salario.bonus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Vale Refeição</span>
                              <span className="font-semibold text-foreground">R$ {profileDetails.salario.vale_refeicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Vale Transporte</span>
                              <span className="font-semibold text-foreground">R$ {profileDetails.salario.vale_transporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="col-span-2 border-t border-border pt-3">
                              <span className="text-muted-foreground block mb-0.5">Vigência do Contrato</span>
                              <span className="font-semibold text-foreground">A partir de {new Date(profileDetails.salario.data_inicio).toLocaleDateString()}</span>
                            </div>
                            {profileDetails.salario.observacoes && (
                              <div className="col-span-2 bg-muted/40 p-2.5 rounded-lg text-[10px] text-muted-foreground border border-border">
                                <strong>Obs:</strong> {profileDetails.salario.observacoes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground text-xs italic">
                            Nenhuma faixa salarial ativa cadastrada para este colaborador.
                          </div>
                        )}
                      </div>

                      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Conta Bancária de Pagamento</h4>
                        {profileDetails.conta ? (
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Instituição Bancária</span>
                              <span className="font-semibold text-foreground">{profileDetails.conta.banco}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Tipo de Conta</span>
                              <span className="font-semibold text-foreground">{profileDetails.conta.tipo_conta}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Agência</span>
                              <span className="font-semibold text-foreground">{profileDetails.conta.agencia}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">Conta com Dígito</span>
                              <span className="font-semibold text-foreground">{profileDetails.conta.numero_conta}-{profileDetails.conta.digito_conta || '0'}</span>
                            </div>
                            <div className="col-span-2 border-t border-border pt-3">
                              <span className="text-muted-foreground block mb-0.5">Titular da Conta</span>
                              <span className="font-semibold text-foreground">{profileDetails.conta.titular_conta} (CPF: {profileDetails.conta.cpf_titular})</span>
                            </div>
                            {profileDetails.conta.chave_pix && (
                              <div className="col-span-2">
                                <span className="text-primary block mb-0.5 font-bold">Chave PIX</span>
                                <span className="font-mono bg-muted border border-border text-[10px] font-semibold px-2 py-1 rounded-md block w-fit">{profileDetails.conta.chave_pix}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground text-xs italic">
                            Nenhum dado bancário cadastrado para este colaborador.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab: Pagamentos */}
                  {profileTab === 'pagamentos' && (
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Histórico de Pagamentos e Medições</h4>
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
                          Regime: {profileUser.tipo_vinculo === 'CONTRATO' ? 'Prestador de Serviço (PJ)' : 'CLT / Carteira Assinada'}
                        </span>
                      </div>

                      {profileUser.tipo_vinculo === 'CONTRATO' ? (
                        // Renderização PJ
                        <div className="space-y-4">
                          {obterPagamentosPJ(profileDetails.pontos, profileDetails.salario).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-xs italic">
                              Nenhuma medição ou diária aprovada para pagamento registrada.
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-border rounded-lg">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                  <tr>
                                    <th className="px-4 py-2 font-semibold">Período de Medição</th>
                                    <th className="px-4 py-2 font-semibold text-center">Diárias Aprovadas</th>
                                    <th className="px-4 py-2 font-semibold text-center">Diárias Pendentes</th>
                                    <th className="px-4 py-2 font-semibold text-right">Valor Bruto</th>
                                    <th className="px-4 py-2 font-semibold text-right">Retenções/Descontos</th>
                                    <th className="px-4 py-2 font-semibold text-right">Líquido a Pagar</th>
                                    <th className="px-4 py-2 font-semibold text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {obterPagamentosPJ(profileDetails.pontos, profileDetails.salario).map(pag => (
                                    <tr key={pag.mesAno} className="hover:bg-muted/10">
                                      <td className="px-4 py-3 font-semibold">{pag.periodo}</td>
                                      <td className="px-4 py-3 text-center">{pag.quantidadeAprovada} dias</td>
                                      <td className="px-4 py-3 text-center text-amber-600 font-semibold">{pag.quantidadePendente > 0 ? `${pag.quantidadePendente} dias` : '-'}</td>
                                      <td className="px-4 py-3 text-right">R$ {pag.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                      <td className="px-4 py-3 text-right text-rose-600">- R$ {pag.descontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                      <td className="px-4 py-3 text-right font-bold text-emerald-600">R$ {pag.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                      <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          pag.status === 'Pago' 
                                            ? 'bg-emerald-500/10 text-emerald-600'
                                            : 'bg-amber-500/10 text-amber-600'
                                        }`}>
                                          {pag.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Renderização CLT
                        <div className="space-y-4">
                          {!profileDetails.salario ? (
                            <div className="text-center py-8 text-muted-foreground text-xs italic">
                              Defina uma faixa salarial nas configurações de RH para gerar o histórico de holerites.
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-border rounded-lg">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                  <tr>
                                    <th className="px-4 py-2 font-semibold">Competência</th>
                                    <th className="px-4 py-2 font-semibold">Data de Pagamento</th>
                                    <th className="px-4 py-2 font-semibold text-right">Salário Bruto</th>
                                    <th className="px-4 py-2 font-semibold text-right">Benefícios (VR/VT)</th>
                                    <th className="px-4 py-2 font-semibold text-right">Descontos/Impostos</th>
                                    <th className="px-4 py-2 font-semibold text-right">Salário Líquido</th>
                                    <th className="px-4 py-2 font-semibold text-center">Status</th>
                                    <th className="px-4 py-2 font-semibold text-center">Ações</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {obterMesesCLT(profileUser.data_admissao || '2025-01-01', profileDetails.salario).map(pag => (
                                    <tr key={pag.mesAno} className="hover:bg-muted/10">
                                      <td className="px-4 py-3 font-semibold">{pag.periodo}</td>
                                      <td className="px-4 py-3">{pag.dataPagamento}</td>
                                      <td className="px-4 py-3 text-right">R$ {pag.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                      <td className="px-4 py-3 text-right text-emerald-600">+ R$ {pag.beneficios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                      <td className="px-4 py-3 text-right text-rose-600">- R$ {pag.descontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                      <td className="px-4 py-3 text-right font-bold text-primary">R$ {pag.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                      <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600`}>
                                          {pag.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <button 
                                          onClick={() => toast.success(`Holerite impresso para a competência ${pag.mesAno}`, 'Holerite')}
                                          className="text-primary hover:underline font-semibold"
                                        >
                                          Visualizar
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
                    </div>
                  )}

                  {/* Tab: Ponto */}
                  {profileTab === 'ponto' && (
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Folha de Ponto & Registros de Diária</h4>
                      {profileDetails.pontos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-xs italic">
                          Nenhum registro de folha de ponto encontrado para este colaborador.
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-border rounded-lg">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-muted/50 border-b border-border">
                              <tr>
                                <th className="px-4 py-2 font-semibold">Data</th>
                                <th className="px-4 py-2 font-semibold text-center">Entrada</th>
                                <th className="px-4 py-2 font-semibold text-center">Saída</th>
                                <th className="px-4 py-2 font-semibold text-right">Horas</th>
                                <th className="px-4 py-2 font-semibold text-right">Horas Extras</th>
                                <th className="px-4 py-2 font-semibold text-right">Valor Diária</th>
                                <th className="px-4 py-2 font-semibold text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {profileDetails.pontos.map(p => (
                                <tr key={p.id_ponto_diaria} className="hover:bg-muted/10">
                                  <td className="px-4 py-3 font-semibold">{new Date(p.data_ponto).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 text-center">{p.hora_entrada ? new Date(p.hora_entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                  <td className="px-4 py-3 text-center">{p.hora_saida ? new Date(p.hora_saida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                  <td className="px-4 py-3 text-right">{p.horas_trabalhadas ? `${p.horas_trabalhadas}h` : '-'}</td>
                                  <td className="px-4 py-3 text-right text-amber-600 font-bold">{p.horas_extras ? `+${p.horas_extras}h` : '-'}</td>
                                  <td className="px-4 py-3 text-right font-medium text-emerald-600 font-semibold">R$ {p.valor_diaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      p.status === 'APROVADO' 
                                        ? 'bg-emerald-500/10 text-emerald-600'
                                        : p.status === 'REJEITADO'
                                        ? 'bg-rose-500/10 text-rose-600'
                                        : 'bg-yellow-500/10 text-yellow-600'
                                    }`}>
                                      {p.status}
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

                  {/* Tab: EPIs */}
                  {profileTab === 'epis' && (
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Equipamentos de Proteção Individual (EPIs) Entregues</h4>
                        <span className="text-[10px] text-muted-foreground font-semibold">Norma de Segurança NR-6</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profileDetails.epis.map(epi => (
                          <div key={epi.id} className="border border-border rounded-lg p-4 flex justify-between items-center bg-muted/10">
                            <div>
                              <p className="font-semibold text-xs text-foreground">{epi.nome}</p>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                                <span>Entregue: <strong>{new Date(epi.entregueEm).toLocaleDateString()}</strong></span>
                                <span>•</span>
                                <span>Troca: <strong>{new Date(epi.validade).toLocaleDateString()}</strong></span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              epi.status === 'trocar' 
                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse' 
                                : 'bg-emerald-500/10 text-emerald-600'
                            }`}>
                              {epi.status === 'trocar' ? 'Requer Troca' : 'Válido'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab: NRs */}
                  {profileTab === 'nrs' && (
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider">NRs e Certificações Técnicas</h4>
                      <div className="bg-card rounded-lg overflow-hidden border border-border">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/50 border-b border-border">
                            <tr>
                              <th className="px-4 py-2 font-semibold">Documento / Qualificação</th>
                              <th className="px-4 py-2 font-semibold">Emissão</th>
                              <th className="px-4 py-2 font-semibold">Validade</th>
                              <th className="px-4 py-2 font-semibold text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {nrAlerts.filter(a => a.id_usuario === profileUser.id_usuario).map(cert => (
                              <tr key={cert.id_certificacao} className="hover:bg-muted/10">
                                <td className="px-4 py-3 font-semibold text-foreground flex flex-col">
                                  <span>{cert.nome_certificacao}</span>
                                  {cert.nome_certificacao.toUpperCase().includes('ASO') && (
                                    <span className="text-[9px] text-rose-500 font-semibold font-mono">🔒 Protegido LGPD (Saúde)</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{cert.data_emissao ? new Date(cert.data_emissao).toLocaleDateString() : '-'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{new Date(cert.data_validade).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    cert.status === 'vencido' 
                                      ? 'bg-rose-500/10 text-rose-600' 
                                      : 'bg-amber-500/10 text-amber-600'
                                  }`}>
                                    {cert.status === 'vencido' ? 'Vencido' : 'A Expirar'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {/* Fallback to normal certifications if no alerts */}
                            {profileDetails.certificacoes && profileDetails.certificacoes.length > 0 && profileDetails.certificacoes.map(cert => (
                              <tr key={cert.id_certificacao} className="hover:bg-muted/10">
                                <td className="px-4 py-3 font-semibold text-foreground flex flex-col">
                                  <span>{cert.nome}</span>
                                  {cert.nome.toUpperCase().includes('ASO') && (
                                    <span className="text-[9px] text-rose-500 font-semibold font-mono">🔒 Protegido LGPD (Saúde)</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{cert.data_emissao ? new Date(cert.data_emissao).toLocaleDateString() : '-'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{cert.data_validade ? new Date(cert.data_validade).toLocaleDateString() : '-'}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    cert.status === 'vencido' 
                                      ? 'bg-rose-500/10 text-rose-600' 
                                      : cert.status === 'vencendo' 
                                      ? 'bg-amber-500/10 text-amber-600' 
                                      : 'bg-emerald-500/10 text-emerald-600'
                                  }`}>
                                    {cert.status === 'vencido' ? 'Vencido' : cert.status === 'vencendo' ? 'A Expirar' : 'Válido'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {nrAlerts.filter(a => a.id_usuario === profileUser.id_usuario).length === 0 && (!profileDetails.certificacoes || profileDetails.certificacoes.length === 0) && (
                              <tr>
                                <td colSpan="4" className="py-6 text-center text-muted-foreground italic">Nenhum certificado NR ou ASO cadastrado.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20 shrink-0 flex justify-end">
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors">
                Fechar Perfil
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
