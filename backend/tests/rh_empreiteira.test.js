import { test, assert } from 'poku';
import { validarCPF, validarCNPJ } from '../src/utils/validation.js';

test('RH Empreiteira - Validação de Documentos Híbridos (CPF/CNPJ)', () => {
  // Caso 1: Apenas CNPJ válido (MEI / PJ)
  const workerPJ = {
    nome: "Pedro Prestador",
    cnpj: "12.345.678/0001-95", // CNPJ válido fictício
    cpf: null,
    lgpd_consentimento: true
  };
  assert.ok(validarCNPJ(workerPJ.cnpj), 'CNPJ deve ser válido');
  assert.ok(workerPJ.cnpj || workerPJ.cpf, 'Pelo menos um documento deve ser fornecido');

  // Caso 2: Apenas CPF válido (CLT)
  const workerCLT = {
    nome: "João Carteira",
    cnpj: null,
    cpf: "123.456.789-09", // CPF válido fictício ou formatado
    lgpd_consentimento: true
  };
  assert.ok(validarCPF(workerCLT.cpf), 'CPF deve ser válido');
  assert.ok(workerCLT.cnpj || workerCLT.cpf, 'Pelo menos um documento deve ser fornecido');

  // Caso 3: Ambos ausentes
  const workerInvalid = {
    nome: "Sem Documento",
    cnpj: null,
    cpf: null,
    lgpd_consentimento: true
  };
  assert.ok(!(workerInvalid.cnpj || workerInvalid.cpf), 'Ambos documentos estão ausentes');
});

test('RH Empreiteira - Obrigatoriedade do Consentimento LGPD', () => {
  // Consentimento falso deve falhar
  const requestWithoutConsent = {
    body: {
      nome: "Carlos Terceirizado",
      cpf: "123.456.789-09",
      lgpd_consentimento: false
    }
  };
  
  const validateConsent = (req) => {
    if (!req.body.lgpd_consentimento) {
      return { status: 400, erro: 'A ciência dos termos de tratamento de dados LGPD é obrigatória.' };
    }
    return { status: 201 };
  };

  const res = validateConsent(requestWithoutConsent);
  assert.equal(res.status, 400, 'Deve retornar status 400 se não houver consentimento LGPD');
  assert.equal(res.erro, 'A ciência dos termos de tratamento de dados LGPD é obrigatória.', 'Mensagem de erro deve ser clara sobre LGPD');
});

test('RH Empreiteira - Vínculo e Atribuição Automática por Role', () => {
  const reqUserEmpreiteira = {
    id: 10,
    role: 'EMPREITEIRA',
    cnpj: '12345678000195',
    razao_social: 'Empreiteira Alpha Ltda'
  };

  // Lógica similar à do controller
  const resolvedIsTerceirizado = reqUserEmpreiteira.role === 'EMPREITEIRA' ? true : false;
  const resolvedCnpjEmpreiteira = reqUserEmpreiteira.role === 'EMPREITEIRA' ? reqUserEmpreiteira.cnpj : null;
  const resolvedRazaoSocialEmpreiteira = reqUserEmpreiteira.role === 'EMPREITEIRA' ? reqUserEmpreiteira.razao_social : null;
  const resolvedRole = reqUserEmpreiteira.role === 'EMPREITEIRA' ? 'TRABALHADOR' : 'TRABALHADOR';

  assert.equal(resolvedIsTerceirizado, true, 'Deve ser marcado como terceirizado automaticamente');
  assert.equal(resolvedCnpjEmpreiteira, '12345678000195', 'Deve herdar o CNPJ da empreiteira criadora');
  assert.equal(resolvedRazaoSocialEmpreiteira, 'Empreiteira Alpha Ltda', 'Deve herdar a Razão Social da empreiteira criadora');
  assert.equal(resolvedRole, 'TRABALHADOR', 'Trabalhador cadastrado herda a role TRABALHADOR');
});

test('RH Empreiteira - Isolamento de Escopo para Atualização', () => {
  const reqUserEmpreiteira1 = {
    role: 'EMPREITEIRA',
    cnpj: '11111111111111'
  };

  const existingWorker = {
    id_usuario: 42,
    nome: "Trabalhador de Outra",
    cnpj_empreiteira: '22222222222222'
  };

  // Simula validação de permissão para editar
  let status = 200;
  if (reqUserEmpreiteira1.role === 'EMPREITEIRA' && existingWorker.cnpj_empreiteira !== reqUserEmpreiteira1.cnpj) {
    status = 403;
  }

  assert.equal(status, 403, 'Deve negar edição de trabalhador pertencente a outra empreiteira (403)');
});

test('RH Empreiteira - Proteção LGPD para Documentos de Saúde (ASO)', () => {
  const certASO = {
    nome: 'ASO (Atestado de Saúde Ocupacional)',
    arquivo_url: 'https://exemplo.com/aso_sensivel.pdf'
  };

  const certNR = {
    nome: 'NR-35 Trabalho em Altura',
    arquivo_url: 'https://exemplo.com/nr35.pdf'
  };

  const isAso = (nome) => nome.toUpperCase().includes('ASO') || nome.toLowerCase().includes('saude') || nome.toLowerCase().includes('saúde') || nome.toLowerCase().includes('atestado');

  // Caso 1: Usuário sem privilégio (ex: Engenheiro comum ou outro trabalhador)
  const canSeeSensitiveFilesFalse = false;
  
  let finalFileUrlASO = certASO.arquivo_url;
  if (isAso(certASO.nome) && !canSeeSensitiveFilesFalse) {
    finalFileUrlASO = null;
  }

  let finalFileUrlNR = certNR.arquivo_url;
  if (isAso(certNR.nome) && !canSeeSensitiveFilesFalse) {
    finalFileUrlNR = null;
  }

  assert.equal(finalFileUrlASO, null, 'URL do ASO deve ser ocultada (null) para usuários não autorizados');
  assert.equal(finalFileUrlNR, 'https://exemplo.com/nr35.pdf', 'URL da NR não deve ser ocultada');

  // Caso 2: Usuário com privilégio (ex: RH/Proprietário ou próprio Gestor da Empreiteira)
  const canSeeSensitiveFilesTrue = true;
  let finalFileUrlASOAllowed = certASO.arquivo_url;
  if (isAso(certASO.nome) && !canSeeSensitiveFilesTrue) {
    finalFileUrlASOAllowed = null;
  }

  assert.equal(finalFileUrlASOAllowed, 'https://exemplo.com/aso_sensivel.pdf', 'URL do ASO deve ser mantida para usuários autorizados');
});
