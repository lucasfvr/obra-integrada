import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const TIPOS_OBRA = ["Residencial", "Comercial", "Industrial", "Infraestrutura", "Reforma"];
const CIDADES = ["São Paulo", "Campinas", "Rio de Janeiro", "Curitiba", "Belo Horizonte", "Brasília", "Salvador"];
const ESTADOS = ["SP", "SP", "RJ", "PR", "MG", "DF", "BA"];
const NOMES_BAIXA = ["Casa de Campo", "Piscina Integrada", "Reforma Prédio B", "Clínica Odontológica", "Praça Central"];
const NOMES_MEDIA = ["Condomínio Jardim", "Escola Municipal", "Galpão Médio", "Supermercado Bairro", "Centro Esportivo"];
const NOMES_ALTA = ["Shopping Metropolitan", "Usina Solar", "Hospital Regional", "Rodovia Anel Viário", "Torre Empresarial"];

function randBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(randBetween(min, max + 1));
}

function randomObra(index, responsavel, engenheiro, trabalhadores, statusList) {
  const isPequena = index % 3 === 0;
  const isMedia = index % 3 === 1;
  
  const nomeLista = isPequena ? NOMES_BAIXA : isMedia ? NOMES_MEDIA : NOMES_ALTA;
  const multiplicadorOrcamento = isPequena ? 1 : isMedia ? 10 : 100;
  
  const orcado = randBetween(50000, 300000) * multiplicadorOrcamento;
  const gasto = orcado * randBetween(0.1, 0.95);
  
  const idxCidade = randInt(0, CIDADES.length - 1);
  const dataHoje = new Date();
  
  const dataInicio = new Date(dataHoje);
  dataInicio.setMonth(dataInicio.getMonth() - randInt(1, 12));
  
  const previsao = new Date(dataHoje);
  previsao.setMonth(previsao.getMonth() + randInt(-2, 18));
  
  const status = statusList[randInt(0, statusList.length - 1)];
  
  // Aleatorizar a equipe usando os trabalhadores fornecidos
  const equipe = [];
  if (engenheiro) equipe.push({ id_usuario: engenheiro.id_usuario, valor_dia: randInt(400, 1500) });
  
  const qtdTrabalhadores = isPequena ? 1 : isMedia ? 2 : Math.min(trabalhadores.length, 5);
  for (let i = 0; i < qtdTrabalhadores; i++) {
    if (trabalhadores[i]) {
      equipe.push({ id_usuario: trabalhadores[i].id_usuario, valor_dia: randInt(100, 350) });
    }
  }

  // Aleatorizar parte do estoque
  const estoque = [
    { nome_material: "Cimento CP-II 50kg", unidade_medida: "Saco", quantidade: randInt(50, 1000) },
    { nome_material: "Areia Grossa", unidade_medida: "m³", quantidade: randInt(10, 200) },
    { nome_material: "Tijolo Baiano", unidade_medida: "Unidade", quantidade: randInt(1000, 20000) },
  ];

  return {
    nome: `${nomeLista[randInt(0, nomeLista.length - 1)]} - ${index + 1}X`,
    tipo_obra: TIPOS_OBRA[randInt(0, TIPOS_OBRA.length - 1)],
    cep: `0${randInt(1000000, 9999999)}`,
    logradouro: `Avenida Principal ${index + 1}`,
    numero: String(randInt(10, 9000)),
    bairro: "Centro",
    cidade: CIDADES[idxCidade],
    estado: ESTADOS[idxCidade],
    area_terreno: randBetween(300, 15000),
    area_construida: randBetween(100, 10000),
    numero_alvara: `ALV-${2024}-${randInt(1000, 9999)}`,
    art_rrt: `ART-${ESTADOS[idxCidade]}-${randInt(100000, 999999)}`,
    data_inicio: dataInicio,
    previsao_termino: previsao,
    valor_orcado: orcado,
    custo_atual: gasto,
    orcamento_material: orcado * 0.5,
    orcamento_mao_obra: orcado * 0.4,
    orcamento_taxas: orcado * 0.1,
    id_usuario_responsavel: responsavel.id_usuario,
    id_status: status?.id_status || 1,
    equipe,
    estoque
  };
}

async function main() {
  console.log("Iniciando o seeding de 10 obras detalhadas geradas proceduralmente...");

  const proprietario = await prisma.tb_usuario.findFirst({ where: { role: 'PROPRIETARIO' } });
  const adminMaster = await prisma.tb_usuario.findFirst({ where: { role: 'ADMIN_MASTER' } });
  
  const responsavel = proprietario || adminMaster;
  if (!responsavel) {
    throw new Error("Nenhum usuário apto para ser responsável encontrado.");
  }

  const engenheiros = await prisma.tb_usuario.findMany({ where: { role: 'RESPONSAVEL' } });
  let engenheiro = engenheiros.length > 0 ? engenheiros[0] : responsavel;

  const trabalhadores = await prisma.tb_usuario.findMany({ where: { role: 'TRABALHADOR' } });
  const statusList = await prisma.tb_status.findMany();
  
  const clienteData = responsavel.id_cliente ? { id_cliente: responsavel.id_cliente } : null;

  for (let index = 0; index < 10; index++) {
    const o = randomObra(index, responsavel, engenheiro, trabalhadores, statusList);
    const { equipe, estoque, ...dadosBase } = o;
    
    await prisma.$transaction(async (tx) => {
      // Cria a obra base
      const novaObra = await tx.tb_obra.create({
        data: dadosBase
      });

      // Vincula multi-tenant (empresa)
      if (clienteData) {
        await tx.tb_obra_cliente.create({
          data: {
            id_obra: novaObra.id_obra,
            id_cliente: clienteData.id_cliente
          }
        });
      }

      // Adiciona Equipe
      if (equipe.length > 0) {
        await tx.tb_usuario_obra.createMany({
          data: equipe.map(e => ({
            id_obra: novaObra.id_obra,
            id_usuario: e.id_usuario,
            valor_dia: e.valor_dia
          })),
          skipDuplicates: true
        });
      }

      // Adiciona Estoque
      if (estoque.length > 0) {
        await tx.tb_estoque_obra.createMany({
          data: estoque.map(item => ({
            id_obra: novaObra.id_obra,
            nome_material: item.nome_material,
            unidade_medida: item.unidade_medida,
            quantidade: item.quantidade
          }))
        });
      }

      console.log(`[${index + 1}/10] ✓ Obra '${novaObra.nome}' de porte (${novaObra.valor_orcado.toLocaleString()}) populada!`);
    });
  }

  console.log("Seeding das 10 novas obras detalhadas DE DIFERENTES PORTES finalizado!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
