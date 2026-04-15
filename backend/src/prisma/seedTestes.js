// =============================================================================
// OBRA INTEGRADA — Script de Seed para Homologação do RBAC
// =============================================================================
// Arquivo:  backend/src/prisma/seedTestes.js
//
// Executar:
//   node --env-file=.env src/prisma/seedTestes.js
//
// Ou via npm (adicionar em backend/package.json > scripts):
//   "seed:testes": "node --env-file=.env src/prisma/seedTestes.js"
// =============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Utilitários de log ───────────────────────────────────────────────────────
const log = {
  ok:      (msg) => console.log(`  ✅ ${msg}`),
  warn:    (msg) => console.log(`  ⚠️  ${msg}`),
  section: (msg) => console.log(`\n${'─'.repeat(60)}\n  🔷 ${msg}\n${'─'.repeat(60)}`),
};

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  log.section('OBRA INTEGRADA — Seed de Dados para Testes RBAC');

  const senhaHash = await bcrypt.hash('Teste123!', 10);

  // ── 1. STATUS (tb_status) ──────────────────────────────────────────────────
  log.section('1. Criando Status (tb_status)');

  const statusNomes = ['Planejamento', 'Em Andamento', 'Pausada', 'Finalizada'];
  const statusMap = {};
  for (const nome of statusNomes) {
    const s = await prisma.tb_status.upsert({
      where:  { id_status: statusNomes.indexOf(nome) + 1 },
      update: { nome },
      create: { nome },
    });
    statusMap[nome] = s.id_status;
    log.ok(`Status "${s.nome}" (id: ${s.id_status})`);
  }

  // ── 2. PAPÉIS (tb_papel) ───────────────────────────────────────────────────
  log.section('2. Criando Papéis (tb_papel)');

  const papelNomes = ['Responsável', 'Trabalhador', 'Visualizador'];
  const papelMap = {};
  for (const nome of papelNomes) {
    const p = await prisma.tb_papel.upsert({
      where:  { id_papel: papelNomes.indexOf(nome) + 1 },
      update: { nome },
      create: { nome },
    });
    papelMap[nome] = p.id_papel;
    log.ok(`Papel "${p.nome}" (id: ${p.id_papel})`);
  }

  // ── 3. USUÁRIOS (tb_usuario) ───────────────────────────────────────────────
  log.section('3. Criando Usuários (tb_usuario)');

  const usuariosData = [
    // ── Admins da plataforma
    { nome: 'Admin Master',       email: 'master@obras.com',      username: 'master',      role: 'ADMIN_MASTER', tipo_usuario: 'ADMIN',       funcao: 'Administrador' },
    { nome: 'Dev Suporte',        email: 'dev@obras.com',          username: 'dev',         role: 'ADMIN_DEV',    tipo_usuario: 'ADMIN',       funcao: 'Desenvolvedor' },
    { nome: 'Gestor Financeiro',  email: 'financeiro@obras.com',   username: 'financeiro',  role: 'ADMIN_FIN',    tipo_usuario: 'ADMIN',       funcao: 'Financeiro' },
    { nome: 'Gestor de Pessoas',  email: 'rh@obras.com',           username: 'rh',          role: 'ADMIN_RH',     tipo_usuario: 'ADMIN',       funcao: 'RH' },
    // ── Nível 2: Dono da Construtora (Proprietário)
    { 
      nome: 'Proprietário Vanguarda', 
      email: 'proprietario@vanguarda.com', 
      username: 'proprietario', 
      role: 'PROPRIETARIO', 
      tipo_usuario: 'PROPRIETARIO', 
      funcao: 'Proprietário',
      // No seed vincularemos este usuario ao id_cliente da Construtora Vanguarda após a criação do cliente
    },
    // ── Responsáveis técnicos
    { nome: 'Eng. Carlos Mendes', email: 'carlos@obras.com',       username: 'carlos',      role: 'RESPONSAVEL',  tipo_usuario: 'RESPONSAVEL', funcao: 'Engenheiro Civil', tipo_registro_profissional: 'CREA', numero_registro_profissional: 'SP-123456', telefone: '11999990010' },
    { nome: 'Arq. Ana Beatriz',   email: 'ana@obras.com',          username: 'ana',         role: 'RESPONSAVEL',  tipo_usuario: 'RESPONSAVEL', funcao: 'Arquiteta',        tipo_registro_profissional: 'CAU',  numero_registro_profissional: 'SP-654321', telefone: '11999990011' },
    // ── Trabalhadores (Operacional)
    { 
      nome: 'Mestre Gilberto',    
      email: 'mestre@obras.com',       
      username: 'mestre',      
      role: 'TRABALHADOR',  
      tipo_usuario: 'TRABALHADOR', 
      funcao: 'Mestre',      
      telefone: '11999990040',
      experiencias: '20 anos de experiência em obras de grande porte. Especialista em fundações e estrutural.',
      certificacoes: [
        { nome: 'NR10 - Segurança em Eletricidade', validade: '2025-12-01' },
        { nome: 'NR35 - Trabalho em Altura', validade: '2026-03-15' }
      ]
    },
    { 
      nome: 'José Pedreiro',      
      email: 'jose@obras.com',         
      username: 'jose',        
      role: 'TRABALHADOR',  
      tipo_usuario: 'TRABALHADOR', 
      funcao: 'Pedreiro',    
      telefone: '11999990030',
      experiencias: 'Especialista em alvenaria estrutural e acabamento fino.',
      certificacoes: [
        { nome: 'NR35 - Trabalho em Altura', validade: '2025-06-20' }
      ]
    },
    { 
      nome: 'Ajudante Tiago',     
      email: 'ajudante@obras.com',      
      username: 'tiago',       
      role: 'TRABALHADOR',  
      tipo_usuario: 'TRABALHADOR', 
      funcao: 'Ajudante',    
      telefone: '11999990041',
      experiencias: 'Auxílio geral em canteiro, focado em organização e limpeza.',
      certificacoes: []
    },
    { 
      nome: 'Maria Azulejista',   
      email: 'maria@obras.com',        
      username: 'maria',       
      role: 'TRABALHADOR',  
      tipo_usuario: 'TRABALHADOR', 
      funcao: 'Pedreiro',    
      telefone: '11999990031',
      experiencias: 'Especialista em assentamento de grandes formatos e pastilhas.',
      certificacoes: [
        { nome: 'NR35 - Trabalho em Altura', validade: '2025-11-10' }
      ]
    },
    { 
      nome: 'Pedro Eletricista',  
      email: 'pedro@obras.com',        
      username: 'pedro',       
      role: 'TRABALHADOR',  
      tipo_usuario: 'TRABALHADOR', 
      funcao: 'Pedreiro',    
      telefone: '11999990032',
      experiencias: 'Eletricista predial com foco em baixa tensão.',
      certificacoes: [
        { nome: 'NR10 - Segurança em Eletricidade', validade: '2026-01-30' }
      ]
    },
  ];

  const usuarioMap = {}; // email → id_usuario

  for (const u of usuariosData) {
    const existe = await prisma.tb_usuario.findFirst({ where: { email: u.email } });
    let criado;
    if (existe) {
      criado = existe;
      log.warn(`Já existe — pulando: ${u.email}`);
    } else {
      criado = await prisma.tb_usuario.create({ data: { ...u, senha: senhaHash } });
      log.ok(`[${String(criado.role).padEnd(12)}] ${criado.nome} — ${criado.email}`);
    }
    usuarioMap[u.email] = criado.id_usuario;
  }

  // ── 4. CLIENTES (tb_cliente) ───────────────────────────────────────────────
  log.section('4. Criando Clientes (tb_cliente)');

  const clientesData = [
    { nome_razao: 'João Silva',             cpf_cnpj: '222.222.222-20',      telefone: '11999990020', email: 'joao@email.com' },
    { nome_razao: 'Construtora Vanguarda',  cpf_cnpj: '22.222.222/0001-22',  telefone: '11999990021', email: 'vanguarda@email.com' },
    { nome_razao: 'Família Rodrigues',      cpf_cnpj: '333.444.555-66',      telefone: '11999990022', email: 'rodrigues@email.com' },
  ];

  const clienteMap = {}; // cpf_cnpj → id_cliente

  for (const c of clientesData) {
    const cliente = await prisma.tb_cliente.upsert({
      where:  { cpf_cnpj: c.cpf_cnpj },
      update: {},
      create: c,
    });
    clienteMap[c.cpf_cnpj] = cliente.id_cliente;
    log.ok(`Cliente: ${cliente.nome_razao} (id: ${cliente.id_cliente})`);
  }

  // ── 4.1 VÍNCULO PROPRIETÁRIO → CLIENTE (NOVO) ──────────────────────────────
  log.section('4.1 Vinculando Proprietário à Empresa');
  
  const idVanguardaEmpresa = clienteMap['22.222.222/0001-22'];
  const idProprietario = usuarioMap['proprietario@vanguarda.com'];

  if (idVanguardaEmpresa && idProprietario) {
    await prisma.tb_usuario.update({
      where: { id_usuario: idProprietario },
      data: { id_cliente: idVanguardaEmpresa }
    });
    log.ok(`Proprietário id:${idProprietario} vinculado à Vanguarda id:${idVanguardaEmpresa}`);
  }

  // ── 5. OBRAS (tb_obra) ─────────────────────────────────────────────────────
  log.section('5. Criando Obras (tb_obra)');

  const obrasData = [
    {
      nome:                   'Residencial Aurora — Bloco B',
      tipo_obra:              'Residencial',
      logradouro:             'Rua das Palmeiras, 450',
      numero:                 '450',
      bairro:                 'Jardim Europa',
      cidade:                 'São Paulo',
      estado:                 'SP',
      cep:                    '01310-100',
      latitude:               -23.5505,
      longitude:              -46.6333,
      data_inicio:            new Date('2024-03-01'),
      previsao_termino:       new Date('2025-12-31'),
      valor_orcado:           1500000.00,
      custo_atual:            420000.00,
      observacoes:            'Condomínio residencial com 8 andares e 32 unidades.',
      id_status:              statusMap['Em Andamento'],
      id_usuario_responsavel: usuarioMap['carlos@obras.com'],
      contato_emergencia_nome: 'Pronto Socorro Central',
      contato_emergencia_fone: '192',
    },
    {
      nome:                   'Centro Comercial Vanguarda',
      tipo_obra:              'Comercial',
      logradouro:             'Av. Paulista',
      numero:                 '1000',
      bairro:                 'Bela Vista',
      cidade:                 'São Paulo',
      estado:                 'SP',
      cep:                    '01310-200',
      latitude:               -23.5630,
      longitude:              -46.6543,
      data_inicio:            new Date('2025-01-15'),
      previsao_termino:       new Date('2026-06-30'),
      valor_orcado:           4200000.00,
      custo_atual:            85000.00,
      observacoes:            'Centro comercial com galeria, 3 anchors e área de alimentação.',
      id_status:              statusMap['Planejamento'],
      id_usuario_responsavel: usuarioMap['ana@obras.com'],
    },
    {
      nome:                   'Galpão Industrial Norte',
      tipo_obra:              'Industrial',
      logradouro:             'Rod. Anhanguera',
      numero:                 'km 40',
      bairro:                 'Distrito Industrial',
      cidade:                 'Campinas',
      estado:                 'SP',
      cep:                    '13069-901',
      latitude:               -22.9099,
      longitude:              -47.0626,
      data_inicio:            new Date('2023-11-01'),
      previsao_termino:       new Date('2024-10-01'),
      valor_orcado:           800000.00,
      custo_atual:            610000.00,
      observacoes:            'Galpão logístico 5.000m² com docas e área administrativa.',
      id_status:              statusMap['Pausada'],
      id_usuario_responsavel: usuarioMap['carlos@obras.com'],
    },
  ];

  const obraIds = [];
  for (const o of obrasData) {
    const existe = await prisma.tb_obra.findFirst({ where: { nome: o.nome } });
    let obra;
    if (existe) {
      obra = existe;
      log.warn(`Já existe — pulando: ${o.nome}`);
    } else {
      obra = await prisma.tb_obra.create({ data: o });
      log.ok(`Obra: "${obra.nome}" (id: ${obra.id_obra})`);
    }
    obraIds.push(obra.id_obra);
  }

  const [idAurora, idVanguarda, idGalpao] = obraIds;

  // ── 6. CLIENTES → OBRAS (tb_obra_cliente) ─────────────────────────────────
  log.section('6. Vinculando Clientes às Obras (tb_obra_cliente)');

  const vinculosCliente = [
    { id_obra: idAurora,    id_cliente: clienteMap['222.222.222-20'] },
    { id_obra: idVanguarda, id_cliente: clienteMap['22.222.222/0001-22'] },
    { id_obra: idGalpao,    id_cliente: clienteMap['333.444.555-66'] },
  ];

  for (const v of vinculosCliente) {
    await prisma.tb_obra_cliente.upsert({
      where:  { id_obra_id_cliente: { id_obra: v.id_obra, id_cliente: v.id_cliente } },
      update: {},
      create: v,
    });
    log.ok(`Cliente id:${v.id_cliente} → Obra id:${v.id_obra}`);
  }

  // ── 7. EQUIPE → OBRAS (tb_usuario_obra) ───────────────────────────────────
  log.section('7. Vinculando Equipe às Obras (tb_usuario_obra)');

  const vinculos = [
    // Aurora — equipe completa
    { id_obra: idAurora,    id_usuario: usuarioMap['carlos@obras.com'], id_papel: papelMap['Responsável'], valor_dia: 0 },
    { id_obra: idAurora,    id_usuario: usuarioMap['jose@obras.com'],   id_papel: papelMap['Trabalhador'],  valor_dia: 180.00 },
    { id_obra: idAurora,    id_usuario: usuarioMap['maria@obras.com'],  id_papel: papelMap['Trabalhador'],  valor_dia: 220.00 },
    { id_obra: idAurora,    id_usuario: usuarioMap['pedro@obras.com'],  id_papel: papelMap['Trabalhador'],  valor_dia: 200.00 },
    { id_obra: idAurora,    id_usuario: usuarioMap['ajudante@obras.com'],id_papel: papelMap['Trabalhador'], valor_dia: 120.00 },
    { id_obra: idAurora,    id_usuario: usuarioMap['mestre@obras.com'],  id_papel: papelMap['Trabalhador'], valor_dia: 350.00 },
    // Vanguarda — só Ana (testa isolamento)
    { id_obra: idVanguarda, id_usuario: usuarioMap['ana@obras.com'],    id_papel: papelMap['Responsável'], valor_dia: 0 },
    // Galpão — Carlos + José
    { id_obra: idGalpao,    id_usuario: usuarioMap['carlos@obras.com'], id_papel: papelMap['Responsável'], valor_dia: 0 },
    { id_obra: idGalpao,    id_usuario: usuarioMap['jose@obras.com'],   id_papel: papelMap['Trabalhador'], valor_dia: 180.00 },
  ];

  for (const v of vinculos) {
    await prisma.tb_usuario_obra.upsert({
      where:  { id_usuario_id_obra: { id_usuario: v.id_usuario, id_obra: v.id_obra } },
      update: { id_papel: v.id_papel },
      create: v,
    });
    log.ok(`Usuário id:${v.id_usuario} (papel id:${v.id_papel}) → Obra id:${v.id_obra}`);
  }

  // ── 8. TAREFAS (tb_tarefa) ─────────────────────────────────────────────────
  log.section('8. Criando Tarefas na Obra Aurora (tb_tarefa)');

  const tarefas = [
    { titulo: 'Concretar laje do 3º andar',          descricao: 'Concretagem fck 25 MPa. Consumo previsto: 18m³.',                         status: 'CONCLUIDA',   prioridade: 'ALTA',    prazo: new Date('2025-01-10'), id_usuario: usuarioMap['jose@obras.com'], percentual_concluido: 100  },
    { titulo: 'Instalação elétrica — 2º andar',      descricao: 'Passar fiação e instalar quadros de distribuição no 2º andar.',           status: 'EM_ANDAMENTO',prioridade: 'ALTA',    prazo: new Date('2025-06-15'), id_usuario: usuarioMap['pedro@obras.com'], percentual_concluido: 45   },
    { titulo: 'Revestimento cerâmico — banheiros',   descricao: 'Aplicação de revestimento em todos os banheiros do Bloco B.',             status: 'PENDENTE',    prioridade: 'NORMAL',  prazo: new Date('2025-08-01'), id_usuario: usuarioMap['maria@obras.com'], percentual_concluido: 0    },
    { titulo: 'Limpeza de canteiro — diária',        descricao: 'Remover entulho e organizar ferramentas no final do turno.',              status: 'PENDENTE',    prioridade: 'BAIXA',   prazo: new Date('2025-10-01'), id_usuario: usuarioMap['ajudante@obras.com'], percentual_concluido: 0  },
    { titulo: 'Vistoria estrutural — urgente',       descricao: 'Vistoria solicitada pelo fiscal da prefeitura após chuvas fortes.',       status: 'PENDENTE',    prioridade: 'URGENTE', prazo: new Date('2025-05-05'), id_usuario: usuarioMap['mestre@obras.com'], percentual_concluido: 0   },
  ];

  for (const t of tarefas) {
    const { id_usuario, ...taskData } = t;
    const criada = await prisma.tb_tarefa.create({ 
      data: { 
        ...taskData, 
        id_obra: idAurora,
        tb_tarefa_usuario: {
          create: { id_usuario }
        }
      } 
    });
    log.ok(`[${String(criada.status).padEnd(12)}][${criada.percentual_concluido}%] ${criada.titulo}`);
  }

  // ── 9. DIÁRIO DE OBRA (tb_diario_obra) ────────────────────────────────────
  log.section('9. Criando Entradas no Diário da Obra Aurora (tb_diario_obra)');

  const diarios = [
    { descricao: 'Concretagem da laje iniciada às 07h. Clima favorável. 12 trabalhadores presentes. Consumo: 18m³. Sem intercorrências.', data_registro: new Date('2025-01-08T08:00:00'), id_usuario: usuarioMap['carlos@obras.com'] },
    { descricao: 'Visita do engenheiro fiscal da prefeitura. Sem pendências. Laudos protocolados sob nº 2025/0042.',                      data_registro: new Date('2025-01-20T14:30:00'), id_usuario: usuarioMap['carlos@obras.com'] },
    { descricao: 'Pedro Eletricista iniciou mapeamento da fiação no 2º andar. Materiais recebidos — NF 004521.',                         data_registro: new Date('2025-02-03T09:15:00'), id_usuario: usuarioMap['pedro@obras.com']  },
    { descricao: 'Assentamento cerâmico nos banheiros do 1º andar. Maria + 2 ajudantes. Rendimento do dia: 38m².',                       data_registro: new Date('2025-03-12T07:30:00'), id_usuario: usuarioMap['maria@obras.com']  },
    { 
      descricao: 'Verificação de armaduras no 4º andar. Tudo conforme projeto.', 
      data_registro: new Date('2025-04-02T10:00:00'), 
      id_usuario: usuarioMap['jose@obras.com'],
      status_auditoria: 'PENDENTE',
      justificativa_gps: 'Bateria do celular acabou no momento do registro, impedindo a captura do GPS.'
    },
  ];

  for (const d of diarios) {
    const criado = await prisma.tb_diario_obra.create({ data: { ...d, id_obra: idAurora } });
    log.ok(`Diário id:${criado.id_diario} — ${criado.data_registro.toLocaleDateString('pt-BR')}`);
  }

  // ── RESUMO FINAL ───────────────────────────────────────────────────────────
  log.section('✅ SEED CONCLUÍDO — CHEAT SHEET');

  console.log(`
  Senha de todos os usuários: Teste123!

  ╔══════════════════════════════════════╦════════════════╦═══════════════════════════════════════════════════════╗
  ║ E-mail                               ║ Role           ║ O que deve ver / testar                               ║
  ╠══════════════════════════════════════╬════════════════╬═══════════════════════════════════════════════════════╣
  ║ master@obras.com                     ║ ADMIN_MASTER   ║ Tudo + botão "Ver Como" + painel de auditoria         ║
  ║ dev@obras.com                        ║ ADMIN_DEV      ║ Igual ao master, foco técnico                         ║
  ║ financeiro@obras.com                 ║ ADMIN_FIN      ║ Módulo financeiro completo                            ║
  ║ rh@obras.com                         ║ ADMIN_RH       ║ Gestão de usuários                                    ║
  ╠══════════════════════════════════════╬════════════════╬═══════════════════════════════════════════════════════╣
  ║ carlos@obras.com                     ║ RESPONSAVEL    ║ Visão Engenheiro: Gestão total, Orçamentos           ║
  ╠══════════════════════════════════════╬════════════════╬═══════════════════════════════════════════════════════╣
  ║ mestre@obras.com                     ║ TRABALHADOR    ║ Visão Mestre: Gerir Equipe e Diário de Obra           ║
  ║ jose@obras.com                       ║ TRABALHADOR    ║ Visão Pedreiro: Atualizar % Progresso das Tarefas     ║
  ║ ajudante@obras.com                   ║ TRABALHADOR    ║ Visão Ajudante: Botões Grandes para celular ("Feito") ║
  ╚══════════════════════════════════════╩════════════════╩═══════════════════════════════════════════════════════╝

  Clientes (acessados via impersonação pelo Admin):
    João Silva             cpf:  222.222.222-20      → Obra Aurora
    Construtora Vanguarda  cnpj: 22.222.222/0001-22  → Obra Vanguarda
    Família Rodrigues      cpf:  333.444.555-66      → Galpão Industrial

  Roteiro de homologação RBAC:
    1. master@obras.com   → "Ver Como" cada perfil abaixo e validar o que aparece
    2. carlos@obras.com   → criar tarefa, adicionar diário, ver financeiro
    3. ana@obras.com      → confirmar que Aurora NÃO aparece na lista de obras
    4. jose@obras.com     → mover tarefa PENDENTE → EM_ANDAMENTO (deve funcionar)
    5. pedro@obras.com    → tentar criar tarefa (deve ser bloqueado)
    6. maria@obras.com    → confirmar ausência dos botões de criar/editar/excluir
  `);
}

// =============================================================================
main()
  .catch((e) => {
    console.error('\n❌ Erro fatal:\n', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
