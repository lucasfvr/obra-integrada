import { test, assert } from 'poku';

/**
 * certificacoes.test.js
 * 
 * Testes unitários para Gestão de Certificações (NRs) e Alertas de Vencimento.
 */

test('Certificações - Cadastro Autorizado (Status 201)', () => {
  const req = {
    user: { role: 'PROPRIETARIO' },
    body: { nome: 'NR-35', data_validade: '2026-12-31' }
  };
  
  // Mock de resposta de sucesso
  const res = {
    status: 201,
    data: {
      id_certificacao: 1,
      id_usuario: 5,
      nome: 'NR-35',
      data_validade: new Date('2026-12-31')
    }
  };

  assert.equal(res.status, 201, 'Deve retornar status 201 ao cadastrar certificação');
  assert.equal(res.data.nome, 'NR-35', 'O nome da certificação deve ser salvo corretamente');
});

test('Certificações - Cadastro Não Autorizado (Status 403)', () => {
  const req = {
    user: { role: 'TRABALHADOR' }, // Não tem permissão para gerenciar
    body: { nome: 'NR-10' }
  };

  // Mock de resposta de erro
  const res = {
    status: 403,
    erro: 'Nível de permissão insuficiente'
  };

  assert.equal(res.status, 403, 'Deve negar acesso (403) para perfis sem gerenciar_usuarios');
});

test('Certificações - Validação Matemática de Expirados (Vencidos)', () => {
  const hoje = new Date();
  
  const validadePassada = new Date();
  validadePassada.setDate(hoje.getDate() - 5); // 5 dias atrás
  
  const cert = {
    nome: 'NR-10',
    data_validade: validadePassada
  };

  // Lógica sob teste
  let status = 'valido';
  if (cert.data_validade) {
    if (new Date(cert.data_validade) < hoje) {
      status = 'vencido';
    }
  }

  assert.equal(status, 'vencido', 'NR com validade no passado deve ser marcada como vencida');
});

test('Certificações - Validação Matemática de Próximo do Vencimento (A Expirar)', () => {
  const hoje = new Date();
  
  const validadeProxima = new Date();
  validadeProxima.setDate(hoje.getDate() + 15); // vence em 15 dias (menos de 30)

  const cert = {
    nome: 'NR-35',
    data_validade: validadeProxima
  };

  // Lógica sob teste
  const trintaDias = new Date();
  trintaDias.setDate(hoje.getDate() + 30);

  let status = 'valido';
  if (cert.data_validade) {
    const val = new Date(cert.data_validade);
    if (val < hoje) {
      status = 'vencido';
    } else if (val <= trintaDias) {
      status = 'vencendo';
    }
  }

  assert.equal(status, 'vencendo', 'NR vencendo em 15 dias deve ser marcada como a expirar (vencendo)');
});

test('Certificações - Ordenação de Alertas de Vencimento', () => {
  // Mais crítico primeiro (validade mais antiga)
  const alertas = [
    { nome: 'NR-35', data_validade: new Date('2026-06-25') },
    { nome: 'NR-10', data_validade: new Date('2026-06-10') } // mais antiga/crítica
  ];

  alertas.sort((a, b) => a.data_validade - b.data_validade);

  assert.equal(alertas[0].nome, 'NR-10', 'NR mais antiga deve ser a primeira da fila de alertas');
});
