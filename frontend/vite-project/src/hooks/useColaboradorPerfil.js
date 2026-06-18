import { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config/api.js';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function buildPagamentos(pontos, salario) {
  const grupos = {};
  pontos.forEach((p) => {
    const d = new Date(p.data_ponto);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grupos[key]) grupos[key] = { ano: d.getFullYear(), mesIndex: d.getMonth(), pontos: [] };
    grupos[key].pontos.push(p);
  });

  return Object.values(grupos).map((g) => {
    const aprovados = g.pontos.filter((p) => p.status === 'APROVADO');
    const pendentes = g.pontos.filter((p) => p.status === 'PENDENTE');
    const valorBruto = aprovados.reduce((s, p) => s + Number(p.valor_diaria || 0), 0);
    const descontos = salario ? Number(salario.desconto || 0) : 0;
    return {
      periodo: `${MESES[g.mesIndex]} de ${g.ano}`,
      valorBruto,
      valorLiquido: Math.max(0, valorBruto - descontos),
      status: pendentes.length > 0 ? 'Pendente' : 'Pago',
    };
  });
}

function buildTimeline(colaborador, certificacoes, pontos) {
  const events = [];
  if (colaborador?.data_admissao) {
    events.push({
      date: new Date(colaborador.data_admissao).toLocaleDateString('pt-BR'),
      title: 'Admitido',
      sort: new Date(colaborador.data_admissao).getTime(),
    });
  }
  certificacoes.forEach((c) => {
    if (c.data_emissao) {
      events.push({
        date: new Date(c.data_emissao).toLocaleDateString('pt-BR'),
        title: c.nome?.includes('Integração') ? 'Integração' : c.nome,
        sort: new Date(c.data_emissao).getTime(),
      });
    }
  });
  pontos.slice(0, 5).forEach((p) => {
    events.push({
      date: new Date(p.data_ponto).toLocaleDateString('pt-BR'),
      title: p.id_obra ? `Registro de ponto — Obra #${p.id_obra}` : 'Registro de ponto',
      sort: new Date(p.data_ponto).getTime(),
    });
  });
  return events.sort((a, b) => a.sort - b.sort);
}

export function useColaboradorPerfil(apiFetch, colaborador) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    salario: null,
    residencial: null,
    conta: null,
    pontos: [],
    certificacoes: [],
    pagamentos: [],
    timeline: [],
  });

  const load = useCallback(async () => {
    if (!colaborador?.id_usuario) return;
    setLoading(true);
    const userId = colaborador.id_usuario;

    try {
      const [salariosRes, residenciaisRes, contasRes, pontosRes, certsRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/api/rh-avancado/salarios?page=1&limit=200`).catch(() => null),
        apiFetch(`${API_BASE_URL}/api/rh-avancado/residencial?page=1&limit=200`).catch(() => null),
        apiFetch(`${API_BASE_URL}/api/rh-avancado/contas-banco?page=1&limit=200`).catch(() => null),
        apiFetch(`${API_BASE_URL}/api/rh-avancado/ponto-diaria?page=1&limit=200`).catch(() => null),
        apiFetch(`${API_BASE_URL}/api/rh/usuarios/${userId}/certificacoes`).catch(() => null),
      ]);

      const salData = salariosRes?.ok ? await salariosRes.json() : null;
      const resData = residenciaisRes?.ok ? await residenciaisRes.json() : null;
      const conData = contasRes?.ok ? await contasRes.json() : null;
      const ponData = pontosRes?.ok ? await pontosRes.json() : null;
      const certData = certsRes?.ok ? await certsRes.json() : [];

      const salario = salData?.success ? salData.data.find((s) => s.id_usuario === userId) : null;
      const residencial = resData?.success ? resData.data.find((r) => r.id_usuario === userId) : null;
      const conta = conData?.success ? conData.data.find((c) => c.id_usuario === userId) : null;
      const pontos = ponData?.success ? ponData.data.filter((p) => p.id_usuario === userId) : [];
      const certificacoes = Array.isArray(certData) ? certData : [];

      setDetails({
        salario,
        residencial,
        conta,
        pontos,
        certificacoes,
        pagamentos: buildPagamentos(pontos, salario),
        timeline: buildTimeline(colaborador, certificacoes, pontos),
      });
    } catch (err) {
      console.error('[RH] Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, colaborador]);

  useEffect(() => {
    load();
  }, [load]);

  const horasTrabalhadas = details.pontos.reduce((s, p) => s + Number(p.horas_trabalhadas || 0), 0);
  const horasExtras = details.pontos.reduce((s, p) => s + Number(p.horas_extras || 0), 0);
  const asoCert = details.certificacoes.find((c) => c.nome?.toUpperCase().includes('ASO'));
  const docsValidos = details.certificacoes.filter((c) => c.status !== 'vencido').length;
  const docsTotal = details.certificacoes.length;

  const indicadores = {
    documentacao: docsTotal ? `${docsValidos}/${docsTotal} válidos` : 'Sem docs',
    aso: asoCert
      ? asoCert.status === 'vencido' ? 'Vencido' : asoCert.status === 'vencendo' ? 'A vencer' : 'Válido'
      : 'Pendente',
    treinamentos: `${details.certificacoes.filter((c) => c.nome?.includes('NR')).length} NRs`,
    ferias: 'Saldo: 30 dias',
    bancoHoras: `${horasExtras.toFixed(1)}h`,
    horasTrabalhadas: horasTrabalhadas.toFixed(1),
    horasExtras: horasExtras.toFixed(1),
    faltas: 0,
    atrasos: 0,
  };

  return { loading, details, indicadores, reload: load };
}

export function formatDoc(colaborador) {
  if (colaborador?.cpf) {
    const c = colaborador.cpf.replace(/\D/g, '');
    return c.length === 11 ? c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : colaborador.cpf;
  }
  if (colaborador?.cnpj) {
    const c = colaborador.cnpj.replace(/\D/g, '');
    return c.length === 14 ? c.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : colaborador.cnpj;
  }
  return '—';
}

export function calcIdade(dataNascimento) {
  if (!dataNascimento) return '—';
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return `${idade} anos`;
}
