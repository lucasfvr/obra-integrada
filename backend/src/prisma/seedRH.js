import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NOMES = [
  'Ricardo', 'Sandra', 'Marcos', 'Fernanda', 'Luiz', 'Patrícia', 'Fábio', 'Renata', 'Marcelo', 'Juliana',
  'André', 'Letícia', 'Gustavo', 'Camila', 'Thiago', 'Vanessa', 'Bruno', 'Beatriz', 'Lucas', 'Aline'
];

const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'
];

const CARGOS = [
  'Pedreiro', 'Ajudante de Pedreiro', 'Mestre de Obras', 'Eletricista', 'Encanador', 
  'Carpinteiro', 'Pintor', 'Engenheiro Civil', 'Técnico de Segurança', 'Almoxarife'
];

async function main() {
  console.log('🚀 Iniciando Seed de 100 Funcionários...');

  // 1. Localizar Cliente (Empresa) principal
  const cliente = await prisma.tb_cliente.findFirst({
    where: { nome_razao: { contains: 'Vanguarda' } }
  });

  if (!cliente) {
    console.error('❌ Erro: Cliente "Construtora Vanguarda" não encontrado. Execute o seedTestes.js primeiro.');
    return;
  }

  const id_cliente = cliente.id_cliente;
  const anoAtual = new Date().getFullYear();

  // 2. Gerar 100 registros
  for (let i = 1; i <= 100; i++) {
    const nome = `${NOMES[Math.floor(Math.random() * NOMES.length)]} ${SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)]} ${SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)]}`;
    
    // CPF fictício sequencial para evitar duplicatas
    const cpf = `100.200.300-${i.toString().padStart(2, '0')}`;
    const email = `funcionario${i}@vanguarda.com.br`;
    const cargo = CARGOS[Math.floor(Math.random() * CARGOS.length)];
    
    // Data de admissão aleatória nos últimos 2 anos
    const dataAdmissao = new Date();
    dataAdmissao.setMonth(dataAdmissao.getMonth() - Math.floor(Math.random() * 24));

    // Matrícula única para seed
    const matricula = `SEED-${anoAtual}-${i.toString().padStart(4, '0')}`;

    await prisma.tb_usuario.upsert({
      where: { email },
      update: {},
      create: {
        nome,
        cpf,
        email,
        cargo_base: cargo,
        data_admissao: dataAdmissao,
        matricula,
        role: 'TRABALHADOR',
        status: 'ATIVO',
        id_cliente
      }
    });

    if (i % 20 === 0) console.log(`✅ ${i} funcionários processados...`);
  }

  console.log('✨ Seed Finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
