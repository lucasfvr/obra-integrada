import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLE_NAMES = ['Membro', 'Mestre', 'Engenheiro', 'Pedreiro', 'Ajudante', 'Eletricista', 'Encanador'];
const STATUS_NAMES = ['Planejamento', 'Em Andamento', 'Pausada', 'Concluída'];

const NOMES = ['Ricardo', 'Sandra', 'Marcos', 'Fernanda', 'Luiz', 'Patrícia', 'Fábio', 'Renata', 'Marcelo', 'Juliana', 'André', 'Letícia', 'Gustavo', 'Camila', 'Thiago', 'Vanessa', 'Bruno', 'Beatriz', 'Lucas', 'Aline', 'Caio', 'Daniela', 'Eduardo', 'Flávia', 'Gabriel', 'Helena', 'Ítalo', 'Jéssica', 'Kauan', 'Lara', 'Murilo', 'Nicole', 'Otávio', 'Priscila', 'Quirino', 'Raquel', 'Samuel', 'Tatiane', 'Uriel', 'Vitória'];
const SOBRENOMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Mendes', 'Batista', 'Garcia', 'Machado', 'Nunes', 'Duarte', 'Moraes', 'Lemos', 'Teixeira', 'Cardoso'];

const OBRAS_REALISTAS = [
  {
    nome: 'Condomínio Terraço Verde',
    tipo_obra: 'Residencial',
    logradouro: 'Rua das Bromélias', numero: '120', bairro: 'Jardim Botânico', cidade: 'Curitiba', estado: 'PR', cep: '80210-000',
    data_inicio: new Date('2024-01-15'), previsao_termino: new Date('2025-06-30'),
    valor_orcado: 2800000.00, custo_atual: 950000.00,
    objetivo: 'Construção de condomínio sustentável com 12 casas de alto padrão.',
    observacoes: 'Foco em certificação LEED e reuso de água.'
  },
  {
    nome: 'Data Center Serverbras',
    tipo_obra: 'Comercial',
    logradouro: 'Av. das Nações', numero: '5500', bairro: 'Distrito Industrial', cidade: 'Campinas', estado: 'SP', cep: '13069-000',
    data_inicio: new Date('2025-02-01'), previsao_termino: new Date('2026-12-15'),
    valor_orcado: 18000000.00, custo_atual: 500000.00,
    objetivo: 'Implementação de infraestrutura crítica Tier III.',
    observacoes: 'Piso elevado e sistema de refrigeração redundante.'
  },
  {
    nome: 'Reforma Sede Administrativa',
    tipo_obra: 'Reforma',
    logradouro: 'Rua XV de Novembro', numero: '88', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01013-000',
    data_inicio: new Date('2024-11-10'), previsao_termino: new Date('2025-03-20'),
    valor_orcado: 650000.00, custo_atual: 640000.00,
    objetivo: 'Modernização do layout e infraestrutura elétrica/dados.',
    observacoes: 'Obra noturna para não impactar operação.'
  },
  {
    nome: 'Escola Municipal Porto Seguro',
    tipo_obra: 'Institucional',
    logradouro: 'Av. Beira Mar', numero: 'S/N', bairro: 'Meireles', cidade: 'Fortaleza', estado: 'CE', cep: '60165-121',
    data_inicio: new Date('2024-05-20'), previsao_termino: new Date('2025-04-30'),
    valor_orcado: 3200000.00, custo_atual: 1800000.00,
    objetivo: 'Construção de 10 salas de aula, quadra poliesportiva e refeitório.',
    observacoes: 'Uso de pré-moldados para agilizar entrega.'
  },
  {
    nome: 'Hospital Samaritano Expansão',
    tipo_obra: 'Hospitalar',
    logradouro: 'Rua Conselheiro Brotero', numero: '1502', bairro: 'Higienópolis', cidade: 'São Paulo', estado: 'SP', cep: '01232-010',
    data_inicio: new Date('2024-08-01'), previsao_termino: new Date('2026-01-31'),
    valor_orcado: 12500000.00, custo_atual: 4500000.00,
    objetivo: 'Nova ala de UTI e Centro Cirúrgico avançado.',
    observacoes: 'Normas RDC-50 rigorosas.'
  },
  {
    nome: 'Ponto Comercial Bom Gosto',
    tipo_obra: 'Comercial',
    logradouro: 'Rua dos Inconfidentes', numero: '400', bairro: 'Savassi', cidade: 'Belo Horizonte', estado: 'MG', cep: '30140-120',
    data_inicio: new Date('2024-02-15'), previsao_termino: new Date('2024-08-20'),
    valor_orcado: 450000.00, custo_atual: 452000.00,
    objetivo: 'Reforma e adequação para restaurante de luxo.',
    observacoes: 'Finalizada com pequena variação de orçamento.'
  },
  {
    nome: 'Ponte Rio das Almas',
    tipo_obra: 'Infraestrutura',
    logradouro: 'Rodovia BR-153', numero: 'km 220', bairro: 'Zona Rural', cidade: 'Jaraguá', estado: 'GO', cep: '75400-000',
    data_inicio: new Date('2023-12-01'), previsao_termino: new Date('2025-11-15'),
    valor_orcado: 45000000.00, custo_atual: 12000000.00,
    objetivo: 'Construção de ponte estaiada de 180 metros.',
    observacoes: 'Desafio logístico de transporte de vigas.'
  },
  {
    nome: 'Residencial Dom Victor',
    tipo_obra: 'Residencial',
    logradouro: 'Rua Major Gote', numero: '2000', bairro: 'Centro', cidade: 'Patos de Minas', estado: 'MG', cep: '38700-001',
    data_inicio: new Date('2025-01-10'), previsao_termino: new Date('2027-06-30'),
    valor_orcado: 5600000.00, custo_atual: 120000.00,
    objetivo: 'Torre única com 40 apartamentos compactos.',
    observacoes: 'Público universitário.'
  },
  {
    nome: 'Shopping Metrô Tatuapé Revitalização',
    tipo_obra: 'Comercial',
    logradouro: 'Rua Melo Freire', numero: 'S/N', bairro: 'Tatuapé', cidade: 'São Paulo', estado: 'SP', cep: '03314-030',
    data_inicio: new Date('2024-10-01'), previsao_termino: new Date('2025-10-01'),
    valor_orcado: 9800000.00, custo_atual: 2300000.00,
    objetivo: 'Troca de piso, iluminação LED e nova fachada.',
    observacoes: 'Trabalho em etapas para manter shopping aberto.'
  },
  {
    nome: 'Aeroporto Regional de Sorocaba',
    tipo_obra: 'Infraestrutura',
    logradouro: 'Av. Santos Dumont', numero: 'S/N', bairro: 'Vila Santana', cidade: 'Sorocaba', estado: 'SP', cep: '18095-200',
    data_inicio: new Date('2024-03-20'), previsao_termino: new Date('2025-12-15'),
    valor_orcado: 25000000.00, custo_atual: 8900000.00,
    objetivo: 'Ampliação da pista e novo terminal de passageiros.',
    observacoes: 'Foco em aviação executiva.'
  },
  {
    nome: 'Solar das Águas Thermas',
    tipo_obra: 'Hotelaria',
    logradouro: 'Rua das Thermas', numero: '500', bairro: 'Residencial Solar', cidade: 'Olímpia', estado: 'SP', cep: '15400-000',
    data_inicio: new Date('2024-06-01'), previsao_termino: new Date('2026-06-01'),
    valor_orcado: 35000000.00, custo_atual: 15400000.00,
    objetivo: 'Resort com 400 apartamentos e complexo aquático.',
    observacoes: 'Fundação profunda em solo argiloso.'
  },
  {
    nome: 'Centro de Pesquisa Biotech',
    tipo_obra: 'Laboratórios',
    logradouro: 'Av. Professor Lineu Prestes', numero: '2242', bairro: 'Butantã', cidade: 'São Paulo', estado: 'SP', cep: '05508-000',
    data_inicio: new Date('2025-01-05'), previsao_termino: new Date('2025-12-30'),
    valor_orcado: 6700000.00, custo_atual: 450000.00,
    objetivo: 'Laboratórios nível de segurança NB-3.',
    observacoes: 'Controle de pressão negativa e filtragem HEPA.'
  },
  {
    nome: 'Edifício Infinity Tower',
    tipo_obra: 'Comercial',
    logradouro: 'Rua Funchal', numero: '418', bairro: 'Vila Olímpia', cidade: 'São Paulo', estado: 'SP', cep: '04551-060',
    data_inicio: new Date('2024-01-10'), previsao_termino: new Date('2026-12-20'),
    valor_orcado: 52000000.00, custo_atual: 21000000.00,
    objetivo: 'Lajes corporativas Triple A.',
    observacoes: 'Fachada unitizada em vidro refletivo.'
  },
  {
    nome: 'Reforma Teatro Municipal',
    tipo_obra: 'Cultura',
    logradouro: 'Praça Ramos de Azevedo', numero: 'S/N', bairro: 'República', cidade: 'São Paulo', estado: 'SP', cep: '01037-010',
    data_inicio: new Date('2024-07-01'), previsao_termino: new Date('2025-07-01'),
    valor_orcado: 4800000.00, custo_atual: 1200000.00,
    objetivo: 'Restauração de patrimônio histórico e modernização cênica.',
    observacoes: 'Acompanhamento rigoroso do CONPRESP/CONDEPHAAT.'
  },
  {
    nome: 'Parque Eólico Ventos do Nordeste',
    tipo_obra: 'Energia',
    logradouro: 'Estrada da Costa', numero: 'km 45', bairro: 'Zona Litorânea', cidade: 'Caetité', estado: 'BA', cep: '46400-000',
    data_inicio: new Date('2024-04-15'), previsao_termino: new Date('2026-04-15'),
    valor_orcado: 85000000.00, custo_atual: 32000000.00,
    objetivo: 'Instalação de 24 aerogeradores e subestação.',
    observacoes: 'Logística complexa para transporte de pás.'
  }
];

async function main() {
  console.log('Iniciando Carga de Dados (15 Obras, 100 Funcionários)...');

  const senhaHash = await bcrypt.hash('Senha123!', 10);

  // 1. Status
  const statusMap = {};
  for (const nome of STATUS_NAMES) {
    const s = await prisma.tb_status.upsert({
      where: { id_status: STATUS_NAMES.indexOf(nome) + 1 },
      update: { nome },
      create: { id_status: STATUS_NAMES.indexOf(nome) + 1, nome }
    });
    statusMap[nome] = s.id_status;
  }

  // 2. Papéis profissionais
  const papelMap = {};
  for (let i = 0; i < ROLE_NAMES.length; i++) {
    const p = await prisma.tb_papel.upsert({
      where: { id_papel: i + 1 },
      update: { nome: ROLE_NAMES[i] },
      create: { id_papel: i + 1, nome: ROLE_NAMES[i] }
    });
    papelMap[ROLE_NAMES[i]] = p.id_papel;
  }

  // 3. Cliente Principal
  const cliente = await prisma.tb_cliente.upsert({
    where: { cpf_cnpj: '22.222.222/0001-22' },
    update: { nome_razao: 'Vanguarda Empreendimentos S.A.' },
    create: {
      nome_razao: 'Vanguarda Empreendimentos S.A.',
      cpf_cnpj: '22.222.222/0001-22',
      telefone: '1133445566',
      email: 'contato@vanguarda.com.br'
    }
  });
  const id_cliente = cliente.id_cliente;

  // 4. Proprietário
  const proprietario = await prisma.tb_usuario.upsert({
    where: { email: 'diretoria@vanguarda.com.br' },
    update: { id_cliente, senha: senhaHash, status: 'ATIVO', acesso_rh: true },
    create: {
      nome: 'Dr. Ricardo Vanguarda',
      email: 'diretoria@vanguarda.com.br',
      username: 'diretoria',
      senha: senhaHash,
      role: 'PROPRIETARIO',
      tipo_usuario: 'PROPRIETARIO',
      id_cliente,
      status: 'ATIVO',
      acesso_rh: true
    }
  });

  // 4.1. Estagiário (perfil de teste para o RBAC)
  const estagiario = await prisma.tb_usuario.upsert({
    where: { email: 'estagiario@vanguarda.com.br' },
    update: { id_cliente, senha: senhaHash, role: 'ESTAGIARIO', status: 'ATIVO' },
    create: {
      nome: 'Bruno Silva (Estagiário)',
      email: 'estagiario@vanguarda.com.br',
      username: 'estagiario',
      senha: senhaHash,
      role: 'ESTAGIARIO',
      tipo_usuario: 'ESTAGIARIO',
      cargo_base: 'Estagiário de Engenharia',
      id_cliente,
      status: 'ATIVO',
      cpf: '000.000.000-101',
      matricula: 'VANG-2025-0101'
    }
  });

  // 4.2. Gerente de RH (perfil com acesso a módulo avançado de RH)
  const rh = await prisma.tb_usuario.upsert({
    where: { email: 'rh@vanguarda.com.br' },
    update: { id_cliente, senha: senhaHash, role: 'RH', status: 'ATIVO', acesso_rh: true },
    create: {
      nome: 'Gerente de RH',
      email: 'rh@vanguarda.com.br',
      username: 'rh_manager',
      senha: senhaHash,
      role: 'RH',
      tipo_usuario: 'RH',
      cargo_base: 'Gerente de RH',
      id_cliente,
      status: 'ATIVO',
      cpf: '000.000.000-999',
      matricula: 'VANG-2025-RH00',
      acesso_rh: true
    }
  });

  // 4.3. Usuário wh (Administrador de Permissões)
  const wh = await prisma.tb_usuario.upsert({
    where: { email: 'wh@vanguarda.com.br' },
    update: { id_cliente, senha: senhaHash, role: 'RH', status: 'ATIVO', acesso_rh: true },
    create: {
      nome: 'Administrador de Acesso (wh)',
      email: 'wh@vanguarda.com.br',
      username: 'wh',
      senha: senhaHash,
      role: 'RH',
      tipo_usuario: 'RH',
      cargo_base: 'Controle de Acesso',
      id_cliente,
      status: 'ATIVO',
      cpf: '000.000.000-888',
      matricula: 'VANG-2025-WH00',
      acesso_rh: true
    }
  });

  // 5. Funcionários (Pool de 100)
  const usuariosGerados = [];
  for (let i = 1; i <= 100; i++) {
    const nome = `${NOMES[Math.floor(Math.random() * NOMES.length)]} ${SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)]}`;
    const email = `funcionario${i}@vanguarda.com.br`;
    const cargo = ROLE_NAMES[Math.floor(Math.random() * ROLE_NAMES.length)];
    
    const u = await prisma.tb_usuario.upsert({
      where: { email },
      update: { cargo_base: cargo, id_cliente },
      create: {
        nome,
        email,
        username: `user${i}`,
        senha: senhaHash,
        role: (cargo === 'Engenheiro' || cargo === 'Mestre') ? 'RESPONSAVEL' : 'TRABALHADOR',
        tipo_usuario: (cargo === 'Engenheiro' || cargo === 'Mestre') ? 'RESPONSAVEL' : 'TRABALHADOR',
        cargo_base: cargo,
        status: 'ATIVO',
        id_cliente,
        cpf: `000.000.000-${i.toString().padStart(3, '0')}`,
        matricula: `VANG-${2025}-${i.toString().padStart(4, '0')}`
      }
    });
    usuariosGerados.push(u);
  }

  // 6. Obras e Equipes
  const engenheiros = usuariosGerados.filter(u => u.cargo_base === 'Engenheiro');
  const outros = usuariosGerados.filter(u => u.cargo_base !== 'Engenheiro');

  for (let i = 0; i < OBRAS_REALISTAS.length; i++) {
    const data = OBRAS_REALISTAS[i];
    const responsavel = engenheiros[i % engenheiros.length];
    const statusNome = i < 2 ? 'Planejamento' : (i < 12 ? 'Em Andamento' : (i < 14 ? 'Concluída' : 'Pausada'));

    let obra = await prisma.tb_obra.findFirst({ where: { nome: data.nome } });
    if (obra) {
      obra = await prisma.tb_obra.update({
        where: { id_obra: obra.id_obra },
        data: { ...data, id_status: statusMap[statusNome], id_usuario_responsavel: responsavel.id_usuario }
      });
    } else {
      obra = await prisma.tb_obra.create({
        data: { ...data, id_status: statusMap[statusNome], id_usuario_responsavel: responsavel.id_usuario }
      });
    }

    await prisma.tb_obra_cliente.upsert({
      where: { id_obra_id_cliente: { id_obra: obra.id_obra, id_cliente } },
      update: {},
      create: { id_obra: obra.id_obra, id_cliente }
    });

    await prisma.tb_usuario_obra.upsert({
      where: { id_usuario_id_obra: { id_usuario: responsavel.id_usuario, id_obra: obra.id_obra } },
      update: { id_papel: papelMap['Engenheiro'] },
      create: { id_usuario: responsavel.id_usuario, id_obra: obra.id_obra, id_papel: papelMap['Engenheiro'] }
    });

    // Vincula o estagiário à primeira obra para fins de teste do RBAC
    if (i === 0 && estagiario) {
      await prisma.tb_usuario_obra.upsert({
        where: { id_usuario_id_obra: { id_usuario: estagiario.id_usuario, id_obra: obra.id_obra } },
        update: { id_papel: papelMap['Membro'] },
        create: { id_usuario: estagiario.id_usuario, id_obra: obra.id_obra, id_papel: papelMap['Membro'] }
      });
    }

    const equipeSize = 5 + Math.floor(Math.random() * 5);
    for (let j = 0; j < equipeSize; j++) {
      const funcionario = outros[Math.floor(Math.random() * outros.length)];
      await prisma.tb_usuario_obra.upsert({
        where: { id_usuario_id_obra: { id_usuario: funcionario.id_usuario, id_obra: obra.id_obra } },
        update: { id_papel: papelMap[funcionario.cargo_base] || papelMap['Membro'] },
        create: { id_usuario: funcionario.id_usuario, id_obra: obra.id_obra, id_papel: papelMap[funcionario.cargo_base] || papelMap['Membro'] }
      });
    }

    await prisma.tb_etapa.deleteMany({ where: { id_obra: obra.id_obra } });
    const etapasNomes = ['Fundação', 'Estrutura e Alvenaria', 'Instalações e Acabamento'];
    for (let k = 0; k < etapasNomes.length; k++) {
      const start = new Date(obra.data_inicio);
      start.setMonth(start.getMonth() + (k * 3));
      const end = new Date(start);
      end.setMonth(end.getMonth() + 2);

      await prisma.tb_etapa.create({
        data: { nome: etapasNomes[k], id_obra: obra.id_obra, id_status: statusMap[statusNome], previsao_inicio: start, previsao_fim: end }
      });
    }
  }

  console.log('✅ Finalizado: 15 Obras e 100 Funcionários carregados.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
