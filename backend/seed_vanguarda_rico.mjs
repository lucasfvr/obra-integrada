import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const TIPOS_OBRA = ["Residencial", "Comercial", "Industrial", "Infraestrutura", "Reforma Hospitalar"];
const CIDADES = ["São Paulo", "Campinas", "Rio de Janeiro", "Belo Horizonte", "Curitiba"];
const ESTADOS = ["SP", "SP", "RJ", "MG", "PR"];

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const PROPRIETARIOS_FINAIS = [
  "João Carlos Silva", "Incorporadora Alpha S/A", "Prefeitura Municipal", 
  "Hospital São Luiz", "Clínica Vida Brasil", "Sr. Marcos Souza", 
  "Construtora Elite Parceira", "Rede de Fast-Food Y"
];

const OBJETIVOS = [
  "Construção de edifício residencial de alto padrão com 20 pavimentos, visando certificação LEED de sustentabilidade. Inclui reaproveitamento de águas cinzas e painéis fotovoltaicos.",
  "Reforma estrutural e modernização de fachada de prédio comercial histórico, preservando elementos originais e integrando eficiência energética.",
  "Implantação de centro logístico automatizado com 15.000m², focado em operações de e-commerce com docas de alta performance.",
  "Expansão de ala oncológica hospitalar, seguindo rigorosas normas técnicas de saúde (RDC 50) e isolamento acústico especializado.",
  "Urbanização e infraestrutura de condomínio industrial com 50 lotes, incluindo pavimentação asfáltica pesada e rede de drenagem pluvial."
];

// Dados realistas de engenharia
const TAREFAS_REALISTAS = [
  { titulo: "Instalação de Canteiro", desc: "Montagem de alojamentos, refeitório e instalação de tapumes conforme NR-18." },
  { titulo: "Escavação de Sapatas", desc: "Escavação mecânica conforme projeto de fundações, profundidade média de 1.5m." },
  { titulo: "Armação de Pilares", desc: "Corte e dobra de aço CA-50 conforme projeto estrutural do 1º pavimento." },
  { titulo: "Concretagem de Laje", desc: "Lançamento de concreto usinado fck 30 MPa com uso de bomba lance." },
  { titulo: "Alvenaria de Vedação", desc: "Elevação de paredes com blocos cerâmicos 14x19x29, junta de 1cm." },
  { titulo: "Reboco Externo", desc: "Aplicação de argamassa industrializada com aditivo impermeabilizante." },
  { titulo: "Instalações Hidráulicas", desc: "Passagem de tubulação de esgoto e água fria em PVC série reforçada." },
  { titulo: "Pintura em Látex", desc: "Aplicação de selador e duas demãos de tinta acrílica semi-brilho em áreas internas." }
];

const MATERIAIS_ESTOQUE = [
  { nome: "Cimento CP-II 50kg (Votoran)", und: "Saco", preco: 38.5 },
  { nome: "Areia Média Lavada", und: "m³", preco: 120.0 },
  { nome: "Aço CA-50 10mm", und: "Barra 12m", preco: 85.0 },
  { nome: "Brita nº 1", und: "m³", preco: 95.0 },
  { nome: "Tijolo Baiano 9 Furos", und: "Milheiro", preco: 950.0 },
  { nome: "Concreto fck 30 MPa", und: "m³", preco: 350.0 },
  { nome: "Argamassa AC-III", und: "Saco 20kg", preco: 45.0 }
];

const DIARIOS_TEXTOS = [
  "Tempo instável pela manhã, mas permitiu a concretagem dos baldrames. Equipe de armadores finalizou a zona A.",
  "Entrega de material (cimento e areia) realizada e conferida. Início da alvenaria no 2º pavimento.",
  "Vistoria do engenheiro calculista aprovou a armação dos pilares do hall. Pessoal de elétrica passando conduítes.",
  "Pancadas de chuva à tarde paralisaram as atividades externas. Equipe remanejada para reboco interno.",
  "Visita técnica do fiscal do cliente. Nenhuma não-conformidade relatada. Obra segue o cronograma."
];

async function main() {
  console.log("Iniciando reconstrução de banco de dados (SEED REALISTA - VANGUARDA)...");

  console.log("Deletando histórico de obras...");
  await prisma.tb_usuario_obra.deleteMany({});
  await prisma.tb_tarefa.deleteMany({});
  await prisma.tb_diario_obra.deleteMany({});
  await prisma.tb_documento.deleteMany({});
  await prisma.tb_estoque_obra.deleteMany({});
  await prisma.tb_obra_cliente.deleteMany({});
  await prisma.$executeRaw`DELETE FROM tb_etapa_material`;
  await prisma.tb_etapa.deleteMany({});
  await prisma.tb_obra.deleteMany({});

  const vanguarda = await prisma.tb_cliente.findFirst({ where: { id_cliente: 2 } });
  const proprietarioVanguarda = await prisma.tb_usuario.findFirst({ where: { role: 'PROPRIETARIO' } });
  const engenheiros = await prisma.tb_usuario.findMany({ where: { role: 'RESPONSAVEL' } });
  const trabalhadores = await prisma.tb_usuario.findMany({ where: { role: 'TRABALHADOR' } });
  const statusList = await prisma.tb_status.findMany();

  const statusAndamento = statusList.find(s => s.nome === 'Em Andamento') || statusList[0];
  const statusPlanejamento = statusList.find(s => s.nome === 'Planejamento') || statusList[0];
  const statusConcluido = statusList.find(s => s.nome === 'Concluída') || statusList[0];

  for (let i = 0; i < 10; i++) {
    const isPequeno = i % 3 === 0;
    const orcado = (isPequeno ? randInt(150, 450) : randInt(2000, 15000)) * 1000;
    const idxLocal = randInt(0, CIDADES.length - 1);
    
    let statusObra = statusAndamento;
    if (i === 8) statusObra = statusPlanejamento;
    if (i === 9) statusObra = statusConcluido;

    const percentualGeral = statusObra.nome === 'Concluída' ? 1 : statusObra.nome === 'Planejamento' ? 0.02 : Math.random() * 0.8;

    // Etapas
    const etapasObj = [
      { nome: "INFRAESTRUTURA", id_status: percentualGeral > 0.3 ? statusConcluido.id_status : statusAndamento.id_status, previsao_inicio: new Date("2024-01-01"), previsao_fim: new Date("2024-03-30") },
      { nome: "MESOESTRUTURA", id_status: percentualGeral > 0.6 ? statusConcluido.id_status : (percentualGeral > 0.3 ? statusAndamento.id_status : statusPlanejamento.id_status), previsao_inicio: new Date("2024-04-01"), previsao_fim: new Date("2024-07-30") },
      { nome: "ACABAMENTOS", id_status: percentualGeral > 0.9 ? statusConcluido.id_status : statusPlanejamento.id_status, previsao_inicio: new Date("2024-08-01"), previsao_fim: new Date("2024-12-15") }
    ];

    // Tarefas ricas
    const tarefasObj = TAREFAS_REALISTAS.map((t, idx) => {
      const resp = randPick(trabalhadores) || proprietarioVanguarda;
      const tPercent = statusObra.nome === 'Concluída' ? 100 : (idx < (percentualGeral * 8) ? 100 : (idx === Math.floor(percentualGeral * 8) ? randInt(1, 99) : 0));
      const tStatus = tPercent === 100 ? "CONCLUIDA" : tPercent > 0 ? "EM_ANDAMENTO" : "PENDENTE";
      
      return {
        titulo: t.titulo,
        descricao: t.desc,
        status: tStatus,
        prioridade: idx < 2 ? "URGENTE" : "NORMAL",
        percentual_concluido: tPercent,
        id_usuario: resp.id_usuario,
        prazo: new Date()
      };
    });

    // Diarios Ricos
    const diariosObj = DIARIOS_TEXTOS.map(txt => {
      const resp = randPick(trabalhadores) || proprietarioVanguarda;
      return {
        id_usuario: resp.id_usuario,
        descricao: txt,
        status_auditoria: "AUTORIZADO",
        data_registro: new Date()
      };
    });

    // Estoque Rico
    const estoqueObj = MATERIAIS_ESTOQUE.map(mat => ({
      nome_material: mat.nome,
      unidade_medida: mat.und,
      quantidade: randInt(10, 500)
    }));

    // Documentos Ricos
    const docsObj = [
      { nome: "Alvará de Construção Nº 455/2024", tipo: "Legal/PDF", url: "/uploads/documentos/exemplo.pdf" },
      { nome: "Memorial Descritivo Técnico", tipo: "Técnico/PDF", url: "/uploads/documentos/exemplo.pdf" },
      { nome: "Projeto Hidráulico Revisão 02", tipo: "Projetos/PDF", url: "/uploads/documentos/exemplo.pdf" }
    ];

    const dataBase = {
      nome: `Obra ${TIPOS_OBRA[i % TIPOS_OBRA.length]} - Lote ${100 + i}`,
      tipo_obra: TIPOS_OBRA[i % TIPOS_OBRA.length],
      cidade: CIDADES[idxLocal],
      estado: ESTADOS[idxLocal],
      area_terreno: isPequeno ? 350 : 2500,
      area_construida: isPequeno ? 180 : 12000,
      objetivo: randPick(OBJETIVOS),
      nome_proprietario_obra: randPick(PROPRIETARIOS_FINAIS),
      
      data_inicio: new Date("2024-01-10"),
      previsao_termino: new Date("2024-12-25"),
      valor_orcado: orcado,
      custo_atual: orcado * percentualGeral * 0.9,
      id_usuario_responsavel: proprietarioVanguarda.id_usuario,
      id_status: statusObra.id_status,
      
      tb_obra_cliente: { create: { id_cliente: vanguarda.id_cliente } },
      tb_usuario_obra: { 
        create: [
          { id_usuario: engenheiros[0]?.id_usuario || proprietarioVanguarda.id_usuario, valor_dia: 650 },
          ...trabalhadores.slice(0, 3).map(t => ({ id_usuario: t.id_usuario, valor_dia: 180 }))
        ]
      },
      tb_etapa: { create: etapasObj },
      tb_tarefa: { create: tarefasObj },
      tb_diario_obra: { create: diariosObj },
      tb_documento: { create: docsObj },
      tb_estoque_obra: { create: estoqueObj }
    };

    console.log(`Gerando Obra Realista [${i + 1}/10]: ${dataBase.nome}...`);
    await prisma.tb_obra.create({ data: dataBase });
  }

  console.log("✅ SEED REALISTA (VANGUARDA) FINALIZADO!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
